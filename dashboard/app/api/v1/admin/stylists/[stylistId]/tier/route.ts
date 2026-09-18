/**
 * POST /api/v1/admin/stylists/:stylistId/tier
 * Admin sets (or clears) a creator's marketplace_tier_override — e.g.
 * seating a known-reputation stylist at "elite" immediately, independent
 * of their career purchase count on the platform. Clearing it (tier: null)
 * returns them to their algorithmically-earned tier.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { ALL_CREATOR_TIERS, recomputeCreatorPricing } from '@/lib/marketplace/creator-tier';

const setTierSchema = z.object({
  tier: z.enum(ALL_CREATOR_TIERS as [string, ...string[]]).nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ stylistId: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { stylistId } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = setTierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_BODY', message: parsed.error.message } }, { status: 400 });
  }

  const stylist = await prisma.stylists.findUnique({ where: { id: stylistId } });
  if (!stylist) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Stylist not found' } }, { status: 404 });
  }

  await prisma.stylists.update({
    where: { id: stylistId },
    data: { marketplace_tier_override: parsed.data.tier },
  });

  const { tier, perUseCents } = await recomputeCreatorPricing(stylistId);

  return NextResponse.json({
    success: true,
    data: { stylistId, tier, per_use_cents: perUseCents, override: parsed.data.tier },
  });
}
