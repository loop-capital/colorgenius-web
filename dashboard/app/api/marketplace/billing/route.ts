/**
 * POST /api/marketplace/billing
 * Process monthly billing for a stylist
 * 
 * Aggregates unbilled usage events, creates invoice, charges via Square.
 * In production, this would be called by a cron job on the 1st of each month.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow } from '@/lib/api/validation';
import { formulas, useEvents, billingInvoices, generateId } from '@/lib/api/mock-data';
import {
  ApiResponse,
  MonthlyBillingInvoice,
  BillingLineItem,
  TIER_PRICING,
  Formula,
} from '@/lib/api/types';
import { z } from 'zod';

const processBillingSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be YYYY-MM format'),
  stylist_id: z.string().optional(), // Admin can bill a specific stylist
});

function getUserFromAuth(request: NextRequest): { id: string; role?: string } | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const [id, role] = token.split(':');
  if (!id) return null;
  return { id, role };
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromAuth(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Bearer token required' },
      }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const data = validateOrThrow(processBillingSchema, body);

    const targetStylistId = user.role === 'admin' && data.stylist_id
      ? data.stylist_id
      : user.id;

    // Check if already billed for this period
    const existing = billingInvoices.find(
      i => i.stylist_id === targetStylistId && i.billing_period === data.period
    );
    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'ALREADY_BILLED', message: `Already billed for ${data.period}` },
      }, { status: 400 });
    }

    // Get all unbilled usage events for this period
    const periodEvents = useEvents.filter(
      e => e.stylist_id === targetStylistId
        && !e.billed
        && e.used_at.startsWith(data.period)
    );

    if (periodEvents.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NO_USAGE', message: 'No unbilled usage found for this period' },
      }, { status: 400 });
    }

    // Aggregate by formula
    const formulaUsage = new Map<string, number>();
    for (const event of periodEvents) {
      formulaUsage.set(event.formula_id, (formulaUsage.get(event.formula_id) || 0) + 1);
    }

    // Build line items
    const lineItems: BillingLineItem[] = [];
    let totalCents = 0;

    for (const [formulaId, count] of formulaUsage) {
      const formula = formulas.find(f => f.id === formulaId);
      if (!formula) continue;

      const tierPricing = TIER_PRICING[formula.tier];
      if (tierPricing.per_use_cents === 0) continue; // Free tier, skip

      const lineTotal = tierPricing.per_use_cents * count;
      const creatorEarnings = Math.round(lineTotal * (tierPricing.creator_share_pct / 100));
      const platformFee = lineTotal - creatorEarnings;

      lineItems.push({
        formula_id: formulaId,
        formula_title: formula.title,
        creator_id: formula.creator_id,
        tier: formula.tier,
        use_count: count,
        per_use_cents: tierPricing.per_use_cents,
        total_cents: lineTotal,
        creator_earnings_cents: creatorEarnings,
        platform_fee_cents: platformFee,
      });

      totalCents += lineTotal;
    }

    if (totalCents === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'FREE_TIER_ONLY', message: 'Only free-tier formulas used this period' },
      }, { status: 400 });
    }

    const totalCreatorEarnings = lineItems.reduce((sum, l) => sum + l.creator_earnings_cents, 0);
    const totalPlatformFee = lineItems.reduce((sum, l) => sum + l.platform_fee_cents, 0);

    // Create invoice
    const invoice: MonthlyBillingInvoice = {
      id: generateId(),
      stylist_id: targetStylistId,
      billing_period: data.period,
      total_cents: totalCents,
      total_creator_earnings_cents: totalCreatorEarnings,
      total_platform_fee_cents: totalPlatformFee,
      line_items: lineItems,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Mark events as billed
    for (const event of periodEvents) {
      event.billed = true;
      event.billing_period = data.period;
    }

    billingInvoices.push(invoice);

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

    return NextResponse.json<ApiResponse<MonthlyBillingInvoice>>({
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
    const user = getUserFromAuth(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Bearer token required' },
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');

    let invoices = billingInvoices.filter(i => i.stylist_id === user.id);
    if (period) {
      invoices = invoices.filter(i => i.billing_period === period);
    }

    invoices.sort((a, b) => b.created_at.localeCompare(a.created_at));

    return NextResponse.json<ApiResponse<{ invoices: MonthlyBillingInvoice[] }>>({
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
