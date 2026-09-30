import { prisma } from '@/lib/prisma';

/**
 * Marketplace creator tier system — APPROVED SPEC v1.0 (2026-09-28).
 *
 * RANKING METRIC: a creator's total licensed formula USES in the trailing
 * 12 full calendar months, expressed as a MONTHLY AVERAGE, ranked by SALES
 * (uses) — never likes.
 *   - Tenure annualization: creators with <12 months since first listing are
 *     annualized: monthlyAverage = totalCountedUses / monthsActive
 *     (monthsActive capped at 12), i.e. (total / monthsActive) * 12 / 12.
 *     A newcomer with a hit formula climbs fast — as specified.
 *   - Counts: every licensed application of the creator's formulas,
 *     INCLUDING free Community uses (free distribution earns the tier that
 *     paid formulas then monetize at).
 *   - Excluded: the creator's own uses of their own formulas; refunded /
 *     chargebacked uses (usages on invoices in a refunded state).
 *   - Anti-gaming cap: max 31 uses/month per purchaser (salon) count toward
 *     the ranking total.
 *   - Recalculation: 1st of each month, on trailing 12 full calendar months
 *     (see monthlyRecalcCreatorTier + the admin recalc endpoint).
 *   - Hysteresis: upgrades apply immediately; demotions require 2
 *     consecutive months below threshold (tracked in stylists.preferences).
 *   - Tenure guardrail: Signature/Elite require >=90 days since first listing.
 *
 * 70/30 creator/platform revenue split — normative, DO NOT CHANGE.
 */

export type CreatorTier = 'community' | 'professional' | 'master' | 'signature' | 'elite';

export const ALL_CREATOR_TIERS: CreatorTier[] = ['community', 'professional', 'master', 'signature', 'elite'];

/** Phase 1 fixed thresholds: MONTHLY average licensed uses (trailing-12mo avg). */
export const TIER_MONTHLY_USE_THRESHOLDS: Record<Exclude<CreatorTier, 'community'>, number> = {
  professional: 10,
  master: 50,
  signature: 150,
  elite: 500,
};

export const TIER_PER_USE_CENTS: Record<CreatorTier, number> = {
  community: 0,
  professional: 299,
  master: 499,
  signature: 799,
  elite: 999,
};

/** 70% creator / 30% platform — normative, do not change. */
export const CREATOR_REVENUE_SHARE = 0.7;

/** Anti-gaming: max uses/month per PURCHASER (salon) counted toward ranking. */
export const MAX_RANKING_USES_PER_PURCHASER_PER_MONTH = 31;

/** Hysteresis: consecutive monthly evals below threshold before a demotion lands. */
export const TIER_DEMOTION_GRACE_MONTHS = 2;

/** Tenure guardrail: Signature/Elite require >=90 days since first listing. */
export const TENURE_GUARDRAIL_DAYS = 90;

/**
 * Billing invoice statuses treated as refunded/chargebacked — usages billed
 * on these invoices never count toward a creator's ranking. (The billing
 * invoices table currently has no refund writer; this exclusion is live the
 * moment one sets status to 'refunded' or 'chargebacked'.)
 */
const REFUNDED_INVOICE_STATUSES = new Set(['refunded', 'chargebacked']);

const TIER_RANK: Record<CreatorTier, number> = {
  community: 0,
  professional: 1,
  master: 2,
  signature: 3,
  elite: 4,
};

export function tierRank(tier: CreatorTier): number {
  return TIER_RANK[tier];
}

/**
 * Pure tier mapping: monthly-average uses -> tier, with the 90-day tenure
 * guardrail for Signature/Elite. Admin override always wins (it is how a
 * known-reputation stylist is seated at elite independent of platform sales).
 */
export function computeCreatorTier(
  monthlyAverageUses: number,
  tenureDays: number,
  tierOverride?: string | null,
): CreatorTier {
  if (tierOverride && (ALL_CREATOR_TIERS as string[]).includes(tierOverride)) {
    return tierOverride as CreatorTier;
  }
  let tier: CreatorTier = 'community';
  if (monthlyAverageUses >= TIER_MONTHLY_USE_THRESHOLDS.elite) tier = 'elite';
  else if (monthlyAverageUses >= TIER_MONTHLY_USE_THRESHOLDS.signature) tier = 'signature';
  else if (monthlyAverageUses >= TIER_MONTHLY_USE_THRESHOLDS.master) tier = 'master';
  else if (monthlyAverageUses >= TIER_MONTHLY_USE_THRESHOLDS.professional) tier = 'professional';

  // Tenure guardrail: no Signature/Elite before 90 days since first listing
  // (blocks single-month coordinated bursts from minting top tiers).
  if ((tier === 'signature' || tier === 'elite') && tenureDays < TENURE_GUARDRAIL_DAYS) {
    return 'master';
  }
  return tier;
}

export interface CreatorRankingStats {
  creatorId: string;
  windowStart: Date;
  windowEnd: Date;
  /** Total uses counted toward ranking after exclusions + per-purchaser caps. */
  totalCountedUses: number;
  /** Months since first listing, 1..12 (tenure annualization divisor). */
  monthsActive: number;
  /** totalCountedUses / monthsActive — the ranking metric. */
  monthlyAverageUses: number;
  /** Days since first listing (tenure guardrail input). */
  tenureDays: number;
  firstListedAt: Date | null;
}

/**
 * Trailing-12-full-calendar-months window ending at the start of `asOf`'s
 * month: [windowStart, windowEnd).
 */
function trailing12MonthWindow(asOf: Date): { windowStart: Date; windowEnd: Date } {
  const windowEnd = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), 1));
  const windowStart = new Date(Date.UTC(windowEnd.getUTCFullYear(), windowEnd.getUTCMonth() - 12, 1));
  return { windowStart, windowEnd };
}

/**
 * Compute a creator's ranking stats per the approved spec:
 *   - trailing 12 full calendar months of formula_usage_log for the
 *     creator's listings,
 *   - own-use exclusion (usages by the creator's own user/salon),
 *   - refund exclusion (usages on refunded/chargebacked invoices),
 *   - 31 uses/month per-purchaser (salon) cap,
 *   - tenure annualization (divide by months since first listing, max 12).
 */
export async function getCreatorRankingStats(
  creatorId: string,
  asOf: Date = new Date(),
): Promise<CreatorRankingStats> {
  const empty: CreatorRankingStats = {
    creatorId,
    windowStart: trailing12MonthWindow(asOf).windowStart,
    windowEnd: trailing12MonthWindow(asOf).windowEnd,
    totalCountedUses: 0,
    monthsActive: 1,
    monthlyAverageUses: 0,
    tenureDays: 0,
    firstListedAt: null,
  };

  const listings = await prisma.formula_listings.findMany({
    where: { creator_id: creatorId },
    select: { id: true, created_at: true },
  });
  if (listings.length === 0) return empty;

  const firstListedAt = listings.reduce((min, l) => (l.created_at < min ? l.created_at : min), listings[0].created_at);
  const { windowStart, windowEnd } = trailing12MonthWindow(asOf);

  const creator = await prisma.stylists.findUnique({
    where: { id: creatorId },
    select: { user_id: true, salon_id: true },
  });
  const creatorUserId = creator?.user_id ?? null;
  const creatorSalonId = creator?.salon_id ?? null;

  const usages = await prisma.formula_usage_log.findMany({
    where: {
      formulaId: { in: listings.map((l) => l.id) },
      usedAt: { gte: windowStart, lt: windowEnd },
    },
    select: {
      salonId: true,
      stylistId: true,
      usedAt: true,
      billingInvoice: { select: { status: true } },
    },
  });

  // Per-purchaser (salon) monthly buckets, capped at 31 each.
  const bucketCounts = new Map<string, number>();
  for (const u of usages) {
    // Own-use exclusion: the creator's own salon or own user account.
    const isOwnUse =
      (creatorUserId != null && u.stylistId === creatorUserId) ||
      (creatorSalonId != null && u.salonId === creatorSalonId);
    if (isOwnUse) continue;
    // Refund exclusion: usages billed on refunded/chargebacked invoices.
    if (u.billingInvoice && REFUNDED_INVOICE_STATUSES.has(u.billingInvoice.status)) continue;

    const monthKey = `${u.usedAt.getUTCFullYear()}-${String(u.usedAt.getUTCMonth() + 1).padStart(2, '0')}`;
    const bucketKey = `${u.salonId}|${monthKey}`;
    bucketCounts.set(bucketKey, (bucketCounts.get(bucketKey) ?? 0) + 1);
  }

  let totalCountedUses = 0;
  for (const count of bucketCounts.values()) {
    totalCountedUses += Math.min(count, MAX_RANKING_USES_PER_PURCHASER_PER_MONTH);
  }

  // Tenure annualization: months since first listing, at least 1, capped at 12.
  const monthsSinceFirst =
    (asOf.getUTCFullYear() - firstListedAt.getUTCFullYear()) * 12 +
    (asOf.getUTCMonth() - firstListedAt.getUTCMonth()) +
    1;
  const monthsActive = Math.min(Math.max(monthsSinceFirst, 1), 12);
  const tenureDays = Math.max(0, Math.floor((asOf.getTime() - firstListedAt.getTime()) / 86_400_000));

  return {
    creatorId,
    windowStart,
    windowEnd,
    totalCountedUses,
    monthsActive,
    monthlyAverageUses: totalCountedUses / monthsActive,
    tenureDays,
    firstListedAt,
  };
}

/**
 * Persist a tier: write stylists.creator_tier and push the matching per-use
 * price onto every one of the creator's listings. Resets the demotion-streak
 * tracker (a real tier change restarts the hysteresis clock).
 */
async function applyCreatorTier(creatorId: string, tier: CreatorTier): Promise<void> {
  const perUseCents = TIER_PER_USE_CENTS[tier];
  const stylist = await prisma.stylists.findUnique({
    where: { id: creatorId },
    select: { preferences: true },
  });
  const prefs = (stylist?.preferences ?? {}) as Record<string, unknown>;
  const mp = (prefs['marketplace'] ?? {}) as Record<string, unknown>;

  await prisma.stylists.update({
    where: { id: creatorId },
    data: {
      creator_tier: tier,
      preferences: { ...prefs, marketplace: { ...mp, demotion_streak: 0 } },
    },
  });

  await prisma.formula_listings.updateMany({
    where: { creator_id: creatorId },
    data: { tier, per_use_cents: perUseCents, price_cents: perUseCents },
  });
}

/**
 * Fast-path recompute: call after events that can only RAISE a creator's
 * average (a license acquisition, an admin override change, publish). Applies
 * upgrades immediately per spec; DEMOTIONS are never applied here — they go
 * through the monthly recalc's 2-consecutive-months hysteresis.
 */
export async function recomputeCreatorPricing(
  creatorId: string,
): Promise<{ tier: CreatorTier; perUseCents: number; stats: CreatorRankingStats }> {
  const stats = await getCreatorRankingStats(creatorId);
  const stylist = await prisma.stylists.findUnique({
    where: { id: creatorId },
    select: { creator_tier: true, marketplace_tier_override: true },
  });
  if (!stylist) throw new Error(`Creator not found: ${creatorId}`);

  const rawTier = computeCreatorTier(stats.monthlyAverageUses, stats.tenureDays, stylist.marketplace_tier_override);
  const current = (stylist.creator_tier as CreatorTier | null) ?? 'community';

  const tier =
    stylist.marketplace_tier_override != null || tierRank(rawTier) > tierRank(current) ? rawTier : current;
  if (tier !== current) {
    await applyCreatorTier(creatorId, tier);
  }
  return { tier, perUseCents: TIER_PER_USE_CENTS[tier], stats };
}

export interface MonthlyRecalcResult {
  creatorId: string;
  tier: CreatorTier;
  previousTier: CreatorTier;
  upgraded: boolean;
  demoted: boolean;
  /** True when below threshold but the 2-month grace hasn't elapsed yet. */
  demotionPending: boolean;
  demotionStreak: number;
  stats: CreatorRankingStats;
}

/**
 * Monthly recalc (run on the 1st of each month for every creator): full
 * hysteresis per spec — upgrades apply immediately, demotions require 2
 * consecutive monthly evals below threshold. The consecutive-months streak
 * is tracked in stylists.preferences.marketplace.demotion_streak and the
 * eval is idempotent within a calendar month.
 */
export async function monthlyRecalcCreatorTier(
  creatorId: string,
  now: Date = new Date(),
): Promise<MonthlyRecalcResult> {
  const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const stats = await getCreatorRankingStats(creatorId, now);
  const stylist = await prisma.stylists.findUnique({
    where: { id: creatorId },
    select: { creator_tier: true, marketplace_tier_override: true, preferences: true },
  });
  if (!stylist) throw new Error(`Creator not found: ${creatorId}`);

  const rawTier = computeCreatorTier(stats.monthlyAverageUses, stats.tenureDays, stylist.marketplace_tier_override);
  const previousTier = (stylist.creator_tier as CreatorTier | null) ?? 'community';
  const prefs = (stylist.preferences ?? {}) as Record<string, unknown>;
  const mp = (prefs['marketplace'] ?? {}) as { demotion_streak?: number; last_eval_month?: string };

  const persistStreak = (streak: number) =>
    prisma.stylists.update({
      where: { id: creatorId },
      data: {
        preferences: { ...prefs, marketplace: { ...mp, demotion_streak: streak, last_eval_month: period } },
      },
    });

  const base = { creatorId, previousTier, stats };

  // Admin override: always apply, reset streak.
  if (stylist.marketplace_tier_override != null) {
    if (rawTier !== previousTier) await applyCreatorTier(creatorId, rawTier);
    else await persistStreak(0);
    return { ...base, tier: rawTier, upgraded: tierRank(rawTier) > tierRank(previousTier), demoted: false, demotionPending: false, demotionStreak: 0 };
  }

  // Upgrade: immediate.
  if (tierRank(rawTier) > tierRank(previousTier)) {
    await applyCreatorTier(creatorId, rawTier);
    return { ...base, tier: rawTier, upgraded: true, demoted: false, demotionPending: false, demotionStreak: 0 };
  }

  // Same tier: reset the demotion streak.
  if (rawTier === previousTier) {
    if (mp.last_eval_month !== period || (mp.demotion_streak ?? 0) !== 0) await persistStreak(0);
    return { ...base, tier: previousTier, upgraded: false, demoted: false, demotionPending: false, demotionStreak: 0 };
  }

  // Below threshold: hysteresis — 2 consecutive months below before demoting.
  if (mp.last_eval_month === period) {
    const streak = mp.demotion_streak ?? 1;
    return { ...base, tier: previousTier, upgraded: false, demoted: false, demotionPending: true, demotionStreak: streak };
  }
  const streak = (mp.demotion_streak ?? 0) + 1;
  if (streak >= TIER_DEMOTION_GRACE_MONTHS) {
    await applyCreatorTier(creatorId, rawTier);
    return { ...base, tier: rawTier, upgraded: false, demoted: true, demotionPending: false, demotionStreak: 0 };
  }
  await persistStreak(streak);
  return { ...base, tier: previousTier, upgraded: false, demoted: false, demotionPending: true, demotionStreak: streak };
}
