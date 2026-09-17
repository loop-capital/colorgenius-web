/**
 * POST /api/marketplace/usage
 * Log a formula use event (stylist applied licensed formula to client)
 * 
 * This is the core of per-use licensing. Each call creates a usage record
 * that gets billed at month end.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow } from '@/lib/api/validation';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getSalonIdForUser } from '@/lib/stylist';
import { ApiResponse } from '@/lib/api/types';
import { z } from 'zod';

const CREATOR_SHARE_PCT = 70;

const logUsageSchema = z.object({
  formula_id: z.string().min(1),
  client_name: z.string().optional(),
  service_id: z.string().optional(),
});

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
    const data = validateOrThrow(logUsageSchema, body);

    const listing = await prisma.formula_listings.findUnique({ where: { id: data.formula_id } });
    if (!listing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'FORMULA_NOT_FOUND', message: 'Formula not found' },
      }, { status: 404 });
    }

    if (!listing.is_active) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'FORMULA_INACTIVE', message: 'This formula is no longer available' },
      }, { status: 400 });
    }

    // Previously this logged (and billed) usage against ANY active listing,
    // with no check the salon had ever actually acquired it — a real gap
    // for a "per-use licensing is the core paid model" system. A free
    // formula (per_use_cents === 0) needs no license and no card at all.
    if (listing.per_use_cents > 0) {
      const license = await prisma.formula_purchases.findFirst({
        where: { salonId, formulaId: listing.id, status: 'completed' },
      });
      if (!license) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: { code: 'NOT_LICENSED', message: 'Add this formula to your library before using it' },
        }, { status: 403 });
      }

      // Without this, a salon could rack up unbilled usage indefinitely —
      // monthly billing already refuses to run with no card on file
      // (formula_purchases stays licensed, but nothing would ever collect).
      const salon = await prisma.salons.findUnique({ where: { id: salonId }, select: { square_card_id: true } });
      if (!salon?.square_card_id) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: { code: 'NO_CARD_ON_FILE', message: 'Add a card on file in Settings before using licensed formulas' },
        }, { status: 402 });
      }
    }

    const feeCents = listing.per_use_cents;
    const creatorPayoutCents = Math.round(feeCents * (CREATOR_SHARE_PCT / 100));
    const platformFeeCents = feeCents - creatorPayoutCents;

    const event = await prisma.$transaction(async (tx) => {
      const e = await tx.formula_usage_log.create({
        data: {
          salonId,
          formulaId: listing.id,
          stylistId: authUser.userId,
          creatorId: listing.creator_id,
          feeAmount: feeCents / 100,
          creatorPayout: creatorPayoutCents / 100,
          platformFee: platformFeeCents / 100,
        },
      });
      await tx.formula_listings.update({
        where: { id: listing.id },
        data: { usage_count: { increment: 1 } },
      });
      return e;
    });

    return NextResponse.json<ApiResponse<{ event: typeof event; cost_cents: number }>>({
      success: true,
      data: { event, cost_cents: feeCents },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'INTERNAL_ERROR', message },
    }, { status: 500 });
  }
}

/**
 * GET /api/marketplace/usage
 * List usage events for the authenticated stylist
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period'); // "2026-05"
    const formulaId = searchParams.get('formula_id');

    const where: any = { stylistId: authUser.userId };
    if (formulaId) where.formulaId = formulaId;
    if (period) {
      const [year, month] = period.split('-').map(Number);
      where.usedAt = {
        gte: new Date(Date.UTC(year, month - 1, 1)),
        lt: new Date(Date.UTC(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1)),
      };
    }

    const userEvents = await prisma.formula_usage_log.findMany({
      where,
      orderBy: { usedAt: 'desc' },
    });

    const unbilledEvents = userEvents.filter(e => !e.billingInvoiceId);
    const totalUnbilledCents = unbilledEvents.reduce((sum, e) => sum + Math.round(Number(e.feeAmount) * 100), 0);

    return NextResponse.json<ApiResponse<{
      events: typeof userEvents;
      total_unbilled_cents: number;
      total_uses: number;
    }>>({
      success: true,
      data: {
        events: userEvents,
        total_unbilled_cents: totalUnbilledCents,
        total_uses: userEvents.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'INTERNAL_ERROR', message },
    }, { status: 500 });
  }
}
