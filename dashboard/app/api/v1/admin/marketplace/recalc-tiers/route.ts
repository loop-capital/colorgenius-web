/**
 * POST /api/v1/admin/marketplace/recalc-tiers
 * Monthly creator-tier recalculation (approved spec: run on the 1st of each
 * month, on trailing 12 full calendar months).
 *
 * Walks every creator with >=1 published listing and runs
 * monthlyRecalcCreatorTier: upgrades apply immediately, demotions require 2
 * consecutive months below threshold (hysteresis). Idempotent within a
 * calendar month.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { monthlyRecalcCreatorTier } from '@/lib/marketplace/creator-tier';

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const creatorIds = await prisma.formula_listings.findMany({
    select: { creator_id: true },
    distinct: ['creator_id'],
  });

  const results: Array<Record<string, unknown>> = [];
  const errors: Array<{ creatorId: string; message: string }> = [];

  for (const { creator_id } of creatorIds) {
    try {
      const r = await monthlyRecalcCreatorTier(creator_id);
      results.push({
        creatorId: r.creatorId,
        tier: r.tier,
        previousTier: r.previousTier,
        upgraded: r.upgraded,
        demoted: r.demoted,
        demotionPending: r.demotionPending,
        demotionStreak: r.demotionStreak,
        monthlyAverageUses: Number(r.stats.monthlyAverageUses.toFixed(2)),
        totalCountedUses: r.stats.totalCountedUses,
        monthsActive: r.stats.monthsActive,
        tenureDays: r.stats.tenureDays,
      });
    } catch (error) {
      errors.push({ creatorId: creator_id, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  const upgraded = results.filter((r) => r.upgraded).length;
  const demoted = results.filter((r) => r.demoted).length;

  return NextResponse.json({
    success: true,
    data: {
      evaluated: results.length,
      upgraded,
      demoted,
      errors: errors.length,
      results,
      errorDetails: errors,
    },
  });
}
