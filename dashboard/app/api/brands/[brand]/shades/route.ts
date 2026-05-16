import { NextResponse } from 'next/server';
import { loadBrandShades } from '@/lib/conversion/data-loader';

interface RouteParams {
  params: Promise<{
    brand: string;
  }>;
}

/**
 * GET /api/brands/[brand]/shades
 * Returns all normalized shades for a given brand.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { brand } = await params;

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand parameter is required' },
        { status: 400 }
      );
    }

    const shades = await loadBrandShades(brand);

    return NextResponse.json({
      success: true,
      data: shades,
      meta: {
        brand: brand.toLowerCase(),
        count: shades.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load shades';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
