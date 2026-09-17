/**
 * POST /api/marketplace/purchase
 * Purchase a template
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow, purchaseSchema } from '@/lib/api/validation';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getSalonIdForUser } from '@/lib/stylist';
import { ApiResponse } from '@/lib/api/types';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      }, { status: 401 });
    }
    const salonId = await getSalonIdForUser(authUser.userId);
    if (!salonId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NO_SALON', message: 'This account is not linked to a salon yet' },
      }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const data = validateOrThrow(purchaseSchema, body);

    const listing = await prisma.formula_listings.findUnique({ where: { id: data.template_id } });
    if (!listing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'TEMPLATE_NOT_FOUND', message: 'Template not found' },
      }, { status: 404 });
    }

    if (!listing.is_active) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'TEMPLATE_INACTIVE', message: 'Template is no longer available' },
      }, { status: 400 });
    }

    // Check if already purchased
    const existing = await prisma.formula_purchases.findFirst({
      where: { salonId, formulaId: listing.id },
    });
    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'ALREADY_PURCHASED', message: 'You have already purchased this template' },
      }, { status: 400 });
    }

    const platformFeeCents = Math.round(listing.price_cents * 0.20); // 20% platform fee
    const creatorEarningsCents = listing.price_cents - platformFeeCents;

    const purchase = await prisma.$transaction(async (tx) => {
      const p = await tx.formula_purchases.create({
        data: {
          salonId,
          formulaId: listing.id,
          totalUses: 0,
          remainingUses: null, // one-time purchase = unlimited use, not metered
          perUseFee: 0,
          blockPrice: listing.price_cents / 100,
        },
      });
      await tx.formula_listings.update({
        where: { id: listing.id },
        data: { purchase_count: { increment: 1 } },
      });
      return p;
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: purchase.id,
        buyer_id: salonId,
        template_id: listing.id,
        price_paid_cents: listing.price_cents,
        creator_earnings_cents: creatorEarningsCents,
        platform_fee_cents: platformFeeCents,
        status: 'completed',
        created_at: purchase.purchasedAt,
      },
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process purchase';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'PURCHASE_FAILED', message },
    }, { status: 500 });
  }
}
