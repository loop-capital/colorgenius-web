/**
 * POST /api/marketplace/billing
 * Process monthly per-use license billing for a salon — aggregates
 * unbilled usage events, creates an invoice, and actually charges the
 * salon's card on file via Square. Intended to be called by
 * GET /api/cron/formula-billing on the 1st of each month for every salon
 * with unbilled usage, but also callable directly (e.g. by an admin
 * retrying a specific salon).
 *
 * Previously this was scoped to stylist_id — written with users.id, which
 * doesn't match stylist_id's real FK to stylists.id, so it could never
 * have succeeded for a real user — and never actually charged anything;
 * the Square call was a commented-out TODO. Usage/licenses are salon-scoped
 * everywhere else in this system, so billing is now too.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow } from '@/lib/api/validation';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getSalonIdForUser } from '@/lib/stylist';
import { billSalonForPeriod } from '@/lib/billing';
import { ApiResponse } from '@/lib/api/types';
import { z } from 'zod';

const processBillingSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be YYYY-MM format'),
  salon_id: z.string().optional(), // admin/cron can bill a specific salon
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
    const targetSalonId = callingUser?.role === 'admin' && data.salon_id
      ? data.salon_id
      : await getSalonIdForUser(authUser.userId);

    if (!targetSalonId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NO_SALON', message: 'This account is not linked to a salon yet' },
      }, { status: 400 });
    }

    const result = await billSalonForPeriod(targetSalonId, data.period);
    if (!result.success) {
      return NextResponse.json<ApiResponse>({ success: false, error: result.error }, { status: result.status });
    }

    return NextResponse.json<ApiResponse>({ success: true, data: result.invoice });
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
 * List billing invoices for the authenticated user's salon.
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
    const salonId = await getSalonIdForUser(authUser.userId);
    if (!salonId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NO_SALON', message: 'This account is not linked to a salon yet' },
      }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');

    const invoices = await prisma.formula_billing_invoices.findMany({
      where: { salon_id: salonId, ...(period ? { billing_period: period } : {}) },
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
