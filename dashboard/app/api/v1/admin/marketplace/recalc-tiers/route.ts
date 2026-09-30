/**
 * GET/POST /api/v1/admin/marketplace/recalc-tiers
 * Monthly creator-tier recalculation (approved spec: run on the 1st of each
 * month, on trailing 12 full calendar months).
 *
 * Walks every creator with >=1 published listing and runs
 * monthlyRecalcCreatorTier: upgrades apply immediately, demotions require 2
 * consecutive months below threshold (hysteresis).
 *
 * Auth: platform-admin JWT (requireAdmin) OR `Authorization: Bearer
 * <CRON_SECRET>` (constant-time compare) for Vercel Cron / local fallback.
 * GET exists because Vercel Cron can only issue GET requests; POST is the
 * admin manual-run path.
 *
 * Scheduling: Vercel Cron entry in dashboard/vercel.json ("0 0 1 * *", UTC)
 * plus a systemd-timer fallback documented in BUILD-NOTES.md. Runs on the 1st
 * of each month (UTC); pass ?force=1 to run off-schedule.
 *
 * Idempotency: the trailing window is the 12 full calendar months BEFORE the
 * current month, so any eval within the same calendar month computes the same
 * tier for every creator. The demotion streak is guarded by
 * stylists.preferences.marketplace.last_eval_month — a re-run in the same
 * month cannot double-count the streak. Re-running is safe; the only delta a
 * re-run can produce is reflecting licensed uses recorded since the last run.
 *
 * Logging: no cron_runs/admin_audit model exists in the prisma schema (adding
 * one needs a migration — deliberately left for the migration workstream), so
 * the durable record is console logging (captured in Vercel function logs)
 * plus the JSON response body.
 */

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { monthlyRecalcCreatorTier } from '@/lib/marketplace/creator-tier';

/** Constant-time bearer-token check for CRON_SECRET. */
function hasValidCronSecret(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const presented = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

type Trigger = 'admin' | 'cron';

async function authorize(
  request: NextRequest,
): Promise<{ ok: true; trigger: Trigger } | { ok: false }> {
  const admin = await requireAdmin(request);
  if (admin) return { ok: true, trigger: 'admin' };
  if (hasValidCronSecret(request)) return { ok: true, trigger: 'cron' };
  return { ok: false };
}

async function runRecalc(trigger: Trigger) {
  const startedAt = Date.now();
  const now = new Date();
  const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

  const creatorIds = await prisma.formula_listings.findMany({
    select: { creator_id: true },
    distinct: ['creator_id'],
  });

  console.log(
    `[tier-recalc] start period=${period} triggered_by=${trigger} creators=${creatorIds.length}`,
  );

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
      if (r.upgraded || r.demoted || r.demotionPending) {
        console.log(
          `[tier-recalc] creator=${r.creatorId} ${r.previousTier} -> ${r.tier}` +
            ` upgraded=${r.upgraded} demoted=${r.demoted}` +
            ` demotion_pending=${r.demotionPending} streak=${r.demotionStreak}` +
            ` avg_monthly_uses=${Number(r.stats.monthlyAverageUses.toFixed(2))}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ creatorId: creator_id, message });
      console.error(`[tier-recalc] creator=${creator_id} error: ${message}`);
    }
  }

  const upgraded = results.filter((r) => r.upgraded).length;
  const demoted = results.filter((r) => r.demoted).length;
  const durationMs = Date.now() - startedAt;

  console.log(
    `[tier-recalc] done period=${period} evaluated=${results.length}` +
      ` upgraded=${upgraded} demoted=${demoted} errors=${errors.length}` +
      ` duration_ms=${durationMs}`,
  );

  return NextResponse.json({
    success: true,
    data: {
      period,
      triggeredBy: trigger,
      evaluated: results.length,
      upgraded,
      demoted,
      errors: errors.length,
      results,
      errorDetails: errors,
    },
  });
}

async function handle(request: NextRequest) {
  const auth = await authorize(request);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED' } },
      { status: 401 },
    );
  }

  const now = new Date();
  const force = new URL(request.url).searchParams.get('force') === '1';
  if (now.getUTCDate() !== 1 && !force) {
    console.log(
      `[tier-recalc] skipped: not the 1st of the month (utc=${now.toISOString()}); use ?force=1 to run anyway`,
    );
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: 'Runs on the 1st of the month (UTC); pass ?force=1 to override',
      today: now.toISOString(),
    });
  }

  return runRecalc(auth.trigger);
}

/** Vercel Cron can only issue GET requests — this is the production path. */
export async function GET(request: NextRequest) {
  return handle(request);
}

/** Admin manual re-run path (and the original endpoint contract). */
export async function POST(request: NextRequest) {
  return handle(request);
}
