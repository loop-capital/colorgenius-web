/**
 * GET /api/gallery/seasonal
 * Seasonal color collections — NO auth required
 */

import { NextRequest, NextResponse } from 'next/server';
import { seasonalCollections } from '@/lib/api/mock-data';
import { SeasonalCollection, ApiResponse } from '@/lib/api/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');

    let collections = [...seasonalCollections];

    if (season) {
      collections = collections.filter(
        c => c.season.toLowerCase() === season.toLowerCase()
      );
    }

    // Sort by newest first
    collections.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json<ApiResponse<SeasonalCollection[]>>({
      success: true,
      data: collections,
      meta: { total: collections.length },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch seasonal collections';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'SEASONAL_FAILED', message },
    }, { status: 500 });
  }
}
