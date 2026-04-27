import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageBuffer, HairAnalysisResult } from '@/lib/photo-analysis-server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an image.' }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large. Max 10MB.' }, { status: 400 });
    }

    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Analyze using server-side sharp-based pipeline
    const result: HairAnalysisResult = await analyzeImageBuffer(buffer);

    // Return response matching the requested schema
    return NextResponse.json({
      success: true,
      data: {
        currentLevel: result.currentLevel,
        currentTone: result.currentTone,
        condition: {
          type: result.condition,
          porosity: result.damageIndicators.porosityEstimate,
          grayPercent: result.grayPercent,
        },
        confidence: result.confidence,
        notes: result.recommendations.join(' | '),
      },
      meta: {
        fileName: file.name,
        fileSize: file.size,
        analyzedAt: new Date().toISOString(),
        fullResult: result,
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    console.error('[Photo Analysis Error]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
