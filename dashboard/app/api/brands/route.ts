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
