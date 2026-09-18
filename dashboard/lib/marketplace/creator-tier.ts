import { prisma } from '@/lib/prisma';

/**
 * Marketplace pricing tier — earned by a creator's total career formula
 * purchases across their WHOLE catalog, not any single formula's own
 * sales. Every formula a creator publishes shares the same tier and price;
 * a formula's individual popularity doesn't change its own price (that
 * would reward one-hit-wonders over prolific, consistently-used creators,
 * and made it too easy to game a single listing).
 *
 * "elite" is never earned automatically — it's admin-only, for a stylist
 * whose reputation predates the platform (see marketplace_tier_override).
 */
export type CreatorTier = 'community' | 'professional' | 'master' | 'signature' | 'elite';

export const ALL_CREATOR_TIERS: CreatorTier[] = ['community', 'professional', 'master', 'signature', 'elite'];

// Total career purchases (distinct salon licenses across all of a
// creator's formulas) needed to reach each algorithmic tier. Starting
// values — expected to be retuned once real purchase volume exists.
export const TIER_PURCHASE_THRESHOLDS: Record<Exclude<CreatorTier, 'elite'>, number> = {
  community: 0,
  professional: 250,
  master: 500,
  signature: 1000,
};

export const TIER_PER_USE_CENTS: Record<CreatorTier, number> = {
  community: 0,
  professional: 299,
  master: 499,
  signature: 799,
  elite: 999,
};

export function computeCreatorTier(totalPurchases: number, tierOverride: string | null | undefined): CreatorTier {
  if (tierOverride && ALL_CREATOR_TIERS.includes(tierOverride as CreatorTier)) {
    return tierOverride as CreatorTier;
  }
  if (totalPurchases >= TIER_PURCHASE_THRESHOLDS.signature) return 'signature';
  if (totalPurchases >= TIER_PURCHASE_THRESHOLDS.master) return 'master';
  if (totalPurchases >= TIER_PURCHASE_THRESHOLDS.professional) return 'professional';
  return 'community';
}

/**
 * Recompute a creator's effective tier and push it (and the matching
 * per-use price) onto every one of their published formula_listings.
 * Call after any purchase of one of their formulas, and after an admin
 * changes their tier override.
 */
export async function recomputeCreatorPricing(creatorId: string): Promise<{ tier: CreatorTier; perUseCents: number }> {
  const stylist = await prisma.stylists.findUnique({
    where: { id: creatorId },
    select: { formula_sales_count: true, marketplace_tier_override: true },
  });
  const totalPurchases = stylist?.formula_sales_count ?? 0;
  const tier = computeCreatorTier(totalPurchases, stylist?.marketplace_tier_override);
  const perUseCents = TIER_PER_USE_CENTS[tier];

  await prisma.formula_listings.updateMany({
    where: { creator_id: creatorId },
    data: { tier, per_use_cents: perUseCents, price_cents: perUseCents },
  });

  return { tier, perUseCents };
}
