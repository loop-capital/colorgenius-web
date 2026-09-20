/**
 * Formula memory — Vish's real "reweigh the bowl, learn from it" behavior:
 * compare what a formula's recipe calls for against what a stylist
 * actually used, and shrink future suggested mix sizes for that client
 * accordingly. Sourced from formula_outcome_history, written by both
 * weighing surfaces (Color Bar iPad session completion, and the web
 * Formulate page) so a client's history follows them regardless of which
 * one they're mixed on.
 *
 * This replaced an earlier, broken, never-working "BowlRemainder" concept
 * that modeled leftover MIXED color as reusable stock with an expiry date
 * — that doesn't match how permanent/demi color actually behaves (it
 * starts oxidizing the moment it's mixed) or how Vish actually works
 * (Vish never re-uses leftover mixed product either — it only uses the
 * leftover amount to inform future target sizing, which is what this
 * does).
 */

import { prisma } from '@/lib/prisma';

const LOOKBACK_VISITS = 5;
// Require real signal before adjusting anything — one data point could be
// a fluke (spilled color, a different length of hair that visit, etc.).
const MIN_VISITS_TO_ADJUST = 2;
// Only adjust when the historical gap is large enough to matter — avoids
// nudging a target by half a gram over noise.
const MIN_ADJUSTMENT_PCT = 0.08;

export interface FormulaAdjustment {
  ratio: number; // actualGrams / targetGrams, averaged
  basedOnVisits: number;
}

export async function getFormulaAdjustment(
  clientId: string,
  brand: string,
  shadeCode: string
): Promise<FormulaAdjustment | null> {
  if (!brand || !shadeCode) return null;

  const history = await prisma.formula_outcome_history.findMany({
    where: { client_id: clientId, brand, shade_code: shadeCode, target_grams: { gt: 0 } },
    orderBy: { created_at: 'desc' },
    take: LOOKBACK_VISITS,
  });

  if (history.length < MIN_VISITS_TO_ADJUST) return null;

  const ratios = history.map((h) => Number(h.actual_grams) / Number(h.target_grams));
  const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;

  if (Math.abs(1 - avgRatio) < MIN_ADJUSTMENT_PCT) return null;

  // Never suggest more than the recipe calls for, and never suggest
  // mixing nothing — clamp to a sane band around the target.
  const clampedRatio = Math.min(Math.max(avgRatio, 0.5), 1);

  return { ratio: clampedRatio, basedOnVisits: history.length };
}

export async function recordFormulaOutcome(params: {
  clientId: string;
  brand: string;
  shadeCode: string;
  targetGrams: number;
  actualGrams: number;
  source: 'color_bar' | 'web_formulate';
}): Promise<void> {
  const { clientId, brand, shadeCode, targetGrams, actualGrams, source } = params;
  if (!clientId || !brand || !shadeCode || targetGrams <= 0 || actualGrams <= 0) return;

  await prisma.formula_outcome_history.create({
    data: {
      client_id: clientId,
      brand,
      shade_code: shadeCode,
      target_grams: targetGrams,
      actual_grams: actualGrams,
      source,
    },
  });
}
