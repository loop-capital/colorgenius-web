import { NextResponse } from 'next/server';
import { getAllBrands } from '@/lib/conversion/data-loader';

/**
 * GET /api/brands
 * Returns list of all available brands with display names.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const salonId = searchParams.get('salonId');

    const brands = await getAllBrands();
    const displayNames: Record<string, string> = {
      schwarzkopf: 'Schwarzkopf Professional',
      moroccanoil: 'MoroccanOil',
      lanza: "L'ANZA",
      davines: 'Davines',
      aveda: 'Aveda',
      oligo: 'Oligo Calura',
      lorealpro: "L'Oréal Professionnel",
      kevinmurphy: 'Kevin Murphy COLOR.ME',
      wella: 'Wella Professionals',
      redken: 'Redken',
      joico: 'Joico',
      matrix: 'Matrix',
      pravana: 'Pravana',
      kenra: 'Kenra Professional',
      alfaparf: 'Alfaparf',
      paulmitchell: 'Paul Mitchell',
      pulpriot: 'Pulp Riot',
      rcolor: 'R+Color',
      soho: 'SOHO',
      omcorcolor: 'Om Cor Color',
      chi: 'CHI',
    };
    let data = brands.map((b) => ({
      id: b,
      name: displayNames[b] || b,
    }));

    // If salonId provided, filter to salon's preferred_brands
    if (salonId) {
      try {
        const { prisma } = await import('@/lib/prisma');
        const salon = await prisma.salons.findUnique({
          where: { id: salonId },
          select: { preferred_brands: true, subscription_tier: true },
        });
        if (salon?.preferred_brands?.length) {
          // Map preferred brand names to their API ids
          const preferred = salon.preferred_brands;
          data = data.filter(b => preferred.some(p => 
            b.id.toLowerCase() === p.toLowerCase() || 
            b.name.toLowerCase() === p.toLowerCase()
          ));
        }
      } catch { /* fall through to all brands */ }
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load brands';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
