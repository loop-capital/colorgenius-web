/**
 * POST /api/marketplace/purchase
 * Acquire access to a formula listing — free or licensed (per-use), no
 * flat one-time sale. Acquiring a license costs nothing at this step: it
 * just grants the salon standing access ("added to their library"). Money
 * only moves when the formula is actually USED (POST /marketplace/usage),
 * metered and billed monthly in arrears (see formula_billing_invoices).
 *
 * This previously created a real Square Checkout charge here and granted
 * unlimited use forever for the price of a single use — a flat-sale model
 * that doesn't fit a per-use license and isn't fair to a creator whose
 * formula gets used repeatedly. See docs discussion 2026-09-17.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow, purchaseSchema } from '@/lib/api/validation';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getSalonIdForUser } from '@/lib/stylist';
import { recomputeCreatorPricing } from '@/lib/marketplace/creator-tier';
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

    const existing = await prisma.formula_purchases.findFirst({
      where: { salonId, formulaId: listing.id, status: 'completed' },
    });
    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'ALREADY_LICENSED', message: 'Your salon already has this formula' },
      }, { status: 400 });
    }

    const license = await prisma.$transaction(async (tx) => {
      const l = await tx.formula_purchases.create({
        data: {
          salonId,
          formulaId: listing.id,
          totalUses: 0,
          remainingUses: null, // licensing isn't use-capped — every use is billed, not rationed
          perUseFee: listing.per_use_cents / 100,
          blockPrice: null,
          status: 'completed', // free to acquire; billing happens per use
        },
      });
      await tx.formula_listings.update({
        where: { id: listing.id },
        data: { purchase_count: { increment: 1 } },
      });
      // Career purchase count across the creator's WHOLE catalog — this is
      // what earns their marketplace tier, not this one formula's sales.
      await tx.stylists.update({
        where: { id: listing.creator_id },
        data: { formula_sales_count: { increment: 1 } },
      });
      return l;
    });

    // Push the creator's (possibly just-changed) tier and price onto every
    // formula they've published — outside the transaction since it's a
    // follow-up cascade, not part of the purchase itself.
    await recomputeCreatorPricing(listing.creator_id);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: license.id,
        template_id: listing.id,
        title: listing.title,
        is_free: listing.per_use_cents === 0,
        per_use_cents: listing.per_use_cents,
        status: 'completed',
      },
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add formula to your library';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'ACQUIRE_FAILED', message },
    }, { status: 500 });
  }
}
