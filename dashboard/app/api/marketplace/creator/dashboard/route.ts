/**
 * GET /api/marketplace/creator/dashboard
 * Creator earnings dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getOrCreateStylistForUser } from '@/lib/stylist';
import { CreatorEarnings, ApiResponse } from '@/lib/api/types';

const PLATFORM_FEE_PCT = 0.20; // matches /api/marketplace/purchase's one-time-purchase split

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      }, { status: 401 });
    }
    const stylist = await getOrCreateStylistForUser(authUser.userId);
    if (!stylist) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NO_PROFILE', message: 'No creator profile for this account' },
      }, { status: 400 });
    }

    const listings = await prisma.formula_listings.findMany({
      where: { creator_id: stylist.id },
      include: {
        purchases: true, // one-time purchases (price_cents, 80/20 split)
        usage_log: true, // metered per-use (per_use_cents, 70/30 split, already stored)
      },
    });

    let totalSales = 0;
    let totalEarningsCents = 0;
    const templateStats = new Map<string, { title: string; sales: number; earnings: number }>();

    for (const listing of listings) {
      let listingSales = 0;
      let listingEarnings = 0;

      for (const purchase of listing.purchases) {
        const earnings = Math.round(listing.price_cents * (1 - PLATFORM_FEE_PCT));
        listingSales += 1;
        listingEarnings += earnings;
      }
      for (const usage of listing.usage_log) {
        listingSales += 1;
        listingEarnings += Math.round(Number(usage.creatorPayout) * 100);
      }

      if (listingSales > 0) {
        templateStats.set(listing.id, { title: listing.title, sales: listingSales, earnings: listingEarnings });
      }
      totalSales += listingSales;
      totalEarningsCents += listingEarnings;
    }

    // Pending payout = earnings from usage not yet billed (one-time purchases are
    // already "settled" at purchase time; metered usage waits for the monthly invoice)
    const unbilledUsage = await prisma.formula_usage_log.findMany({
      where: { creatorId: stylist.id, billingInvoiceId: null },
      select: { creatorPayout: true },
    });
    const pendingPayoutCents = unbilledUsage.reduce((sum, u) => sum + Math.round(Number(u.creatorPayout) * 100), 0);

    const topTemplates = Array.from(templateStats.entries())
      .map(([template_id, stats]) => ({ template_id, title: stats.title, sales: stats.sales, earnings_cents: stats.earnings }))
      .sort((a, b) => b.earnings_cents - a.earnings_cents)
      .slice(0, 5);

    const dashboard: CreatorEarnings = {
      creator_id: stylist.id,
      total_sales: totalSales,
      total_earnings_cents: totalEarningsCents,
      pending_payout_cents: pendingPayoutCents,
      templates_count: listings.length,
      top_templates: topTemplates,
    };

    return NextResponse.json<ApiResponse<CreatorEarnings>>({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch creator dashboard';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'DASHBOARD_FAILED', message },
    }, { status: 500 });
  }
}
