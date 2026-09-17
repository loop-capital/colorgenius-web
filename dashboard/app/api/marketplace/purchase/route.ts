/**
 * POST /api/marketplace/purchase
 * Purchase a formula listing — creates a pending purchase and a real Square
 * Checkout link. Access to the formula is granted only once the Square
 * webhook confirms payment (see app/api/square/webhook/route.ts), never
 * on this request alone.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow, purchaseSchema } from '@/lib/api/validation';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getSalonIdForUser } from '@/lib/stylist';
import { createPaymentLink } from '@/lib/square';
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

    // Check if already purchased (completed only — a stale pending/failed
    // attempt shouldn't block trying again).
    const existing = await prisma.formula_purchases.findFirst({
      where: { salonId, formulaId: listing.id, status: 'completed' },
    });
    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'ALREADY_PURCHASED', message: 'You have already purchased this template' },
      }, { status: 400 });
    }

    const purchase = await prisma.formula_purchases.create({
      data: {
        salonId,
        formulaId: listing.id,
        totalUses: 0,
        remainingUses: null, // one-time purchase = unlimited use, not metered
        perUseFee: 0,
        blockPrice: listing.price_cents / 100,
        status: 'pending',
      },
    });

    const appBaseUrl = process.env.APP_BASE_URL || 'https://colorgenius.co';
    const paymentLink = await createPaymentLink({
      referenceId: purchase.id,
      name: listing.title,
      amountCents: listing.price_cents,
      redirectUrl: `${appBaseUrl}/marketplace/purchase-complete?purchaseId=${purchase.id}`,
      note: `Marketplace formula purchase: ${listing.title}`,
    });

    if (!paymentLink?.url) {
      throw new Error('Square did not return a checkout URL');
    }

    await prisma.formula_purchases.update({
      where: { id: purchase.id },
      data: { squareCheckoutId: paymentLink.id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: purchase.id,
        template_id: listing.id,
        price_cents: listing.price_cents,
        status: 'pending',
        checkout_url: paymentLink.url,
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
