import { NextResponse } from 'next/server';
import { getAllBrands } from '@/lib/conversion/data-loader';

/**
 * GET /api/brands
 * Returns list of all available brands with display names.
 */
export async function GET() {
  try {
    const brands = await getAllBrands();
    const displayNames: Record<string, string> = {
      schwarzkopf: 'Schwarzkopf Professional',
      moroccanoil: 'MoroccanOil',
      lanza: "L'ANZA",
      davines: 'Davines',
      aveda: 'Aveda',
    };
    const data = brands.map((b) => ({
      id: b,
      name: displayNames[b] || b,
    }));
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load brands';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
