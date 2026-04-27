/**
 * GET /api/gallery/stylist/[id]
 * Stylist portfolio — NO auth required
 * NOTE: Next.js App Router uses [id] param. This file handles /api/gallery/stylist/:id
 */

import { NextRequest, NextResponse } from 'next/server';
import { stylistPortfolios } from '@/lib/api/mock-data';
import { StylistPortfolio, ApiResponse } from '@/lib/api/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await params;

    const portfolio = stylistPortfolios.find(p => p.stylist_id === id);
    if (!portfolio) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'STYLIST_NOT_FOUND', message: 'Stylist portfolio not found' },
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<StylistPortfolio>>({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stylist portfolio';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'STYLIST_FAILED', message },
    }, { status: 500 });
  }
}
