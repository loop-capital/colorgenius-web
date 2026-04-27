/**
 * GET /api/gallery/trending
 * Trending colors — NO auth required
 */

import { NextResponse } from 'next/server';
import { trendingColors } from '@/lib/api/mock-data';
import { TrendingColor, ApiResponse } from '@/lib/api/types';

export async function GET() {
  try {
    const colors = [...trendingColors].sort((a, b) => b.trend_score - a.trend_score);

    return NextResponse.json<ApiResponse<TrendingColor[]>>({
      success: true,
      data: colors,
      meta: { total: colors.length },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch trending colors';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'TRENDING_COLORS_FAILED', message },
    }, { status: 500 });
  }
}
