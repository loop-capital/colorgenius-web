import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { analyzeImageBuffer } from '@/lib/photo-analysis-server';
import type { HairAnalysisResult } from '@/lib/photo-analysis-server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/vision-analyze
 *
 * Accepts a base64 image (from the formulate page photo upload)
 * and returns AI-powered hair analysis results.
 *
 * Request Body:
 *   - image: string (base64 encoded JPEG/PNG, data URI prefix optional)
 *   - clientId?: string (UUID — when present, the analysis record is linked to this client)
 *   - photoType?: string (optional photo_type tag for photo_analyses; defaults to 'consultation')
 *
 * Response:
 *   200: { success: true, analysis: HairAnalysisResult, autoPopulate: {...}, photoAnalysisId: string | null }
 *   400: { error: string }
 *   500: { error: string }
 *
 * Backward compatibility: `success` and `analysis` are unchanged. `autoPopulate`
 * and `photoAnalysisId` are additive. Persistence failures never fail the analysis
 * response — they are logged and photoAnalysisId is returned as null.
 */

// Analyzer ToneFamily -> formulate page fd single-char tone codes
// (mirrors the TONES option values in dashboard/app/formulate/page.tsx)
const TONE_TO_FD: Record<string, string> = {
  neutral: 'N', ash: 'A', golden: 'G', copper: 'K', red: 'R',
  violet: 'V', pearl: 'P', beige: 'B', mahogany: 'M',
  chocolate: 'Ch', warm: 'W', cool: 'C',
};

/**
 * Widened auto-population mapping: analyzer outputs -> formulate fd field names.
 * Field names below were verified against the fd state in
 * dashboard/app/formulate/page.tsx (CONDITION_TYPES, POROSITY, TEXTURES, TONES).
 */
export function buildAutoPopulate(a: HairAnalysisResult) {
  const ind = a.damageIndicators;

  // fd POROSITY options are low/normal/high; analyzer emits low/medium/high
  const porosity: 'low' | 'normal' | 'high' =
    ind.porosityEstimate === 'medium' ? 'normal' : ind.porosityEstimate;

  // fd CONDITION_TYPES values: virgin | bleached | gray_coverage | oily_scalp |
  // previously_colored | damaged | dry_brittle | highly_damaged.
  // Only map when the analyzer gives a confident damaged read; otherwise leave
  // the key out so the consumer keeps the stylist's current value.
  let conditionType: string | undefined;
  if (a.condition === 'severely_damaged') conditionType = 'highly_damaged';
  else if (a.condition === 'damaged') conditionType = 'damaged';
  else if (ind.texture === 'brittle' || ind.drynessScore >= 70) conditionType = 'dry_brittle';

  return {
    currentLevel: a.currentLevel,
    currentTone: TONE_TO_FD[a.currentTone] ?? 'N',
    toneFamily: a.currentTone,
    condition: {
      grayPercent: a.grayPercent,
      porosity,
      ...(conditionType ? { type: conditionType } : {}),
      hollowEnds: ind.splitEndDetected,
    },
  };
}

function parseImageInput(image: string): { base64: string; mime: string | null } {
  const m = image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,([\s\S]*)$/);
  if (m) return { base64: m[2], mime: m[1] };
  return { base64: image.includes(',') ? image.split(',')[1] : image, mime: null };
}

async function persistAnalysis(opts: {
  buffer: Buffer;
  mime: string | null;
  result: HairAnalysisResult;
  clientId: string | null;
  photoType: string;
  elapsedMs: number;
}): Promise<string | null> {
  try {
    let dims: { width: number; height: number } = { width: 0, height: 0 };
    try {
      const meta = await sharp(opts.buffer).metadata();
      dims = { width: meta.width ?? 0, height: meta.height ?? 0 };
    } catch {
      // Non-fatal: dimensions are best-effort
    }

    const dataUri = 'data:' + (opts.mime ?? 'image/jpeg') + ';base64,' + opts.buffer.toString('base64');
    const now = new Date();

    const record = await prisma.photo_analyses.create({
      data: {
        client_id: opts.clientId,
        photo_type: opts.photoType,
        original_url: dataUri,
        original_size: [dims.width, dims.height],
        file_size_bytes: opts.buffer.length,
        format: opts.mime ? opts.mime.replace('image/', '').slice(0, 10) : null,
        processing_status: 'completed',
        processing_started_at: new Date(now.getTime() - opts.elapsedMs),
        processing_completed_at: now,
        processing_time_ms: opts.elapsedMs,
        results: opts.result as any,
        model_versions: { source: 'vision-analyze', analyzer: 'photo-analysis-server' },
        created_at: now,
      },
      select: { id: true },
    });

    return record.id;
  } catch (err: any) {
    console.warn('[Vision Analyze] photo_analyses persistence skipped:', err?.message || err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const startMs = Date.now();
  try {
    const body = await request.json();

    if (!body.image || typeof body.image !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: image (base64 string)' },
        { status: 400 }
      );
    }

    const { base64, mime } = parseImageInput(body.image);

    // Convert base64 to buffer
    const buffer = Buffer.from(base64, 'base64');

    if (buffer.length < 100) {
      return NextResponse.json(
        { error: 'Invalid image data' },
        { status: 400 }
      );
    }

    // Optional linkage inputs (backward-compatible: both may be absent)
    const clientId =
      typeof body.clientId === 'string' && body.clientId.trim().length > 0
        ? body.clientId.trim()
        : null;
    const photoType =
      typeof body.photoType === 'string' && body.photoType.trim().length > 0
        ? body.photoType.trim().slice(0, 20)
        : 'consultation';

    // Run the analysis
    const result = await analyzeImageBuffer(buffer);

    const elapsedMs = Date.now() - startMs;

    // Persist the full analysis result. Never breaks the response on failure.
    const photoAnalysisId = await persistAnalysis({
      buffer,
      mime,
      result,
      clientId,
      photoType,
      elapsedMs,
    });

    return NextResponse.json({
      success: true,
      analysis: result,
      autoPopulate: buildAutoPopulate(result),
      photoAnalysisId,
    });

  } catch (error: any) {
    console.error('[Vision Analyze Error]', error);
    return NextResponse.json(
      { error: error.message || 'Vision analysis failed' },
      { status: 500 }
    );
  }
}
