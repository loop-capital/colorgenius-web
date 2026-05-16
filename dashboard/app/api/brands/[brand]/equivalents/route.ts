import { NextResponse } from 'next/server';
import { findEquivalents } from '@/lib/conversion/engine';
import { loadBrandShades, getAllBrands } from '@/lib/conversion/data-loader';

interface RouteParams {
  params: Promise<{
    brand: string;
  }>;
}

/**
 * GET /api/brands/[brand]/equivalents?level=7&tone=ash
 * Returns equivalent shades across all OTHER brands for a given level + tone family.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { brand } = await params;
    const { searchParams } = new URL(request.url);

    const levelParam = searchParams.get('level');
    const toneParam = searchParams.get('tone');

    if (!levelParam || !toneParam) {
      return NextResponse.json(
        { error: 'Missing required query params: level, tone' },
        { status: 400 }
      );
    }

    const level = Number(levelParam);
    if (isNaN(level) || level < 1 || level > 12) {
      return NextResponse.json(
        { error: 'Invalid level. Must be between 1 and 12.' },
        { status: 400 }
      );
    }

    // Verify source brand exists
    await loadBrandShades(brand);

    const equivalents = await findEquivalents(level, toneParam.toLowerCase(), brand);

    return NextResponse.json({
      success: true,
      data: equivalents,
      meta: {
        sourceBrand: brand.toLowerCase(),
        level,
        toneFamily: toneParam.toLowerCase(),
        matchCount: Object.values(equivalents).reduce(
          (sum, arr) => sum + arr.length,
          0
        ),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to find equivalents';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
