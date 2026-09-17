/**
 * GET /api/marketplace/purchases/:id
 * Reveal the full formula recipe for a completed purchase. Previously
 * nothing in the app ever did this — even a "successful" purchase had no
 * way to actually retrieve what was bought (the only route that used to
 * check formula_purchases at all, /api/formulas/use, was dead/unauthenticated
 * and has been removed).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getSalonIdForUser } from '@/lib/stylist';
import { ApiResponse } from '@/lib/api/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const purchase = await prisma.formula_purchases.findUnique({
      where: { id },
      include: {
        listing: {
          include: { source_formula: true, creator: { select: { display_name: true, first_name: true } } },
        },
      },
    });

    if (!purchase || purchase.salonId !== salonId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Purchase not found' },
      }, { status: 404 });
    }

    if (purchase.status !== 'completed') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NOT_PAID', message: `Payment is ${purchase.status}, not completed yet` },
      }, { status: 402 });
    }

    const formula = purchase.listing.source_formula;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        purchase_id: purchase.id,
        title: purchase.listing.title,
        creator_name: purchase.listing.creator.display_name || purchase.listing.creator.first_name,
        purchased_at: purchase.purchasedAt,
        recipe: formula
          ? {
              brand: formula.product_brand,
              line: formula.product_line,
              shade: formula.product_shade,
              developer_volume: formula.developer_vol,
              mixing_ratio: formula.mixing_ratio,
              processing_time: formula.processing_time,
              notes: formula.notes,
            }
          : null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load purchase';
    return NextResponse.json<ApiResponse>({ success: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
