import { NextRequest, NextResponse } from 'next/server';
import { convertFormula } from '@/lib/conversion/engine';
import type { ConversionRequest } from '@/lib/conversion/types';

/**
 * POST /api/formulate/convert
 * Convert a formula from one brand to another.
 * Body: ConversionRequest
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.shades || !Array.isArray(body.shades) || body.shades.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid "shades" array' },
        { status: 400 }
      );
    }

    if (!body.targetBrand || typeof body.targetBrand !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "targetBrand"' },
        { status: 400 }
      );
    }

    if (body.developerVolume === undefined || typeof body.developerVolume !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid "developerVolume"' },
        { status: 400 }
      );
    }

    const conversionRequest: ConversionRequest = {
      shades: body.shades.map((s: any) => ({
        shadeCode: String(s.shadeCode),
        brand: String(s.brand),
        line: String(s.line),
        grams: Number(s.grams),
      })),
      targetBrand: String(body.targetBrand),
      targetLine: body.targetLine ? String(body.targetLine) : undefined,
      developerVolume: Number(body.developerVolume),
    };

    const result = await convertFormula(conversionRequest);

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        convertedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Conversion failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
