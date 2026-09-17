/**
 * Fallback "grams per container" used to prefill the Receive Stock form when
 * a product has no salon-saved typical_container_grams yet. Matches Vish's
 * own onboarding approach — a manual stock count/entry to establish a real
 * gram-native baseline, since neither Square's catalog nor a distributor
 * order exposes container weight.
 */
export const CATEGORY_CONTAINER_DEFAULTS: Record<string, number> = {
  color: 60, // standard 2oz professional color tube
  developer: 1000, // standard 1L/33.8oz developer bottle
  treatment: 200,
  other: 100,
};

export function defaultContainerGrams(category?: string | null): number {
  return CATEGORY_CONTAINER_DEFAULTS[category || 'other'] ?? CATEGORY_CONTAINER_DEFAULTS.other;
}
