/**
 * POST /api/marketplace/billing
 * Process monthly billing for a stylist
 * 
 * Aggregates unbilled usage events, creates invoice, charges via Square.
 * In production, this would be called by a cron job on the 1st of each month.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow } from '@/lib/api/validation';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse, BillingLineItem } from '@/lib/api/types';
import { z } from 'zod';

const CREATOR_SHARE_PCT = 70;

const processBillingSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be YYYY-MM format'),
  stylist_id: z.string().optional(), // Admin can bill a specific stylist
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

    const body = await request.json().catch(() => ({}));
    const data = validateOrThrow(processBillingSchema, body);

    const callingUser = await prisma.users.findUnique({ where: { id: authUser.userId }, select: { role: true } });
    const targetStylistId = callingUser?.role === 'admin' && data.stylist_id
      ? data.stylist_id
      : authUser.userId;

    // Check if already billed for this period
    const existing = await prisma.formula_billing_invoices.findUnique({
      where: { stylist_id_billing_period: { stylist_id: targetStylistId, billing_period: data.period } },
    });
    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'ALREADY_BILLED', message: `Already billed for ${data.period}` },
      }, { status: 400 });
    }

    const [year, month] = data.period.split('-').map(Number);
    const periodStart = new Date(Date.UTC(year, month - 1, 1));
    const periodEnd = new Date(Date.UTC(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1));

    // Get all unbilled usage events for this period
    const periodEvents = await prisma.formula_usage_log.findMany({
      where: {
        stylistId: targetStylistId,
        billingInvoiceId: null,
        usedAt: { gte: periodStart, lt: periodEnd },
      },
      include: { listing: { select: { id: true, title: true, tier: true, creator_id: true } } },
    });

    const billable = periodEvents.filter(e => Number(e.feeAmount) > 0);
    if (billable.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NO_USAGE', message: 'No unbilled usage found for this period' },
      }, { status: 400 });
    }

    // Aggregate by formula listing
    const byFormula = new Map<string, { title: string; tier: string; creator_id: string; count: number; feeCents: number }>();
    for (const e of billable) {
      const key = e.formulaId;
      const feeCents = Math.round(Number(e.feeAmount) * 100);
      const existing2 = byFormula.get(key);
      if (existing2) {
        existing2.count += 1;
      } else {
        byFormula.set(key, {
          title: e.listing.title,
          tier: e.listing.tier,
          creator_id: e.listing.creator_id,
          count: 1,
          feeCents,
        });
      }
    }

    const lineItems: BillingLineItem[] = [];
    let totalCents = 0;
    for (const [formulaId, agg] of byFormula) {
      const lineTotal = agg.feeCents * agg.count;
      const creatorEarnings = Math.round(lineTotal * (CREATOR_SHARE_PCT / 100));
      const platformFee = lineTotal - creatorEarnings;
      lineItems.push({
        formula_id: formulaId,
        formula_title: agg.title,
        creator_id: agg.creator_id,
        tier: agg.tier,
        use_count: agg.count,
        per_use_cents: agg.feeCents,
        total_cents: lineTotal,
        creator_earnings_cents: creatorEarnings,
        platform_fee_cents: platformFee,
      });
      totalCents += lineTotal;
    }

    const totalCreatorEarnings = lineItems.reduce((sum, l) => sum + l.creator_earnings_cents, 0);
    const totalPlatformFee = lineItems.reduce((sum, l) => sum + l.platform_fee_cents, 0);

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.formula_billing_invoices.create({
        data: {
          stylist_id: targetStylistId,
          billing_period: data.period,
          total_cents: totalCents,
          total_creator_earnings_cents: totalCreatorEarnings,
          total_platform_fee_cents: totalPlatformFee,
          line_items: lineItems as any,
          status: 'pending',
        },
      });
      await tx.formula_usage_log.updateMany({
        where: { id: { in: billable.map(e => e.id) } },
        data: { billingInvoiceId: inv.id },
      });
      return inv;
    });

    // TODO: In production, call Square to charge the stylist's card on file
    // const payment = await createSquarePayment({
    //   sourceId: stylist.card_on_file_id,
    //   amountCents: totalCents,
    //   customerId: stylist.square_customer_id,
    //   note: `COLORgenius formula licenses - ${data.period}`,
    // });

    // TODO: In production, create creator payouts
    // for (const line of lineItems) {
    //   await createCreatorPayout(line.creator_id, line.creator_earnings_cents);
    // }

    return NextResponse.json<ApiResponse<typeof invoice>>({
      success: true,
      data: invoice,
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
 * GET /api/marketplace/billing
 * List billing invoices for the authenticated stylist
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
    const period = searchParams.get('period');

    const invoices = await prisma.formula_billing_invoices.findMany({
      where: { stylist_id: authUser.userId, ...(period ? { billing_period: period } : {}) },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json<ApiResponse<{ invoices: typeof invoices }>>({
      success: true,
      data: { invoices },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'INTERNAL_ERROR', message },
    }, { status: 500 });
  }
}
