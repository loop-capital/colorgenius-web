/**
 * POST /api/marketplace/usage
 * Log a formula use event (stylist applied licensed formula to client)
 * 
 * This is the core of per-use licensing. Each call creates a usage record
 * that gets billed at month end.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow } from '@/lib/api/validation';
import { formulas, useEvents, generateId } from '@/lib/api/mock-data';
import { ApiResponse, FormulaUseEvent, TIER_PRICING, Formula } from '@/lib/api/types';
import { z } from 'zod';

const logUsageSchema = z.object({
  formula_id: z.string().min(1),
  client_name: z.string().optional(),
  service_id: z.string().optional(),
});

function getUserFromAuth(request: NextRequest): { id: string } | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const [id] = token.split(':');
  if (!id) return null;
  return { id };
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
    const data = validateOrThrow(logUsageSchema, body);

    const formula = formulas.find(f => f.id === data.formula_id);
    if (!formula) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'FORMULA_NOT_FOUND', message: 'Formula not found' },
      }, { status: 404 });
    }

    if (!formula.is_active) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'FORMULA_INACTIVE', message: 'This formula is no longer available' },
      }, { status: 400 });
    }

    // Don't charge for community (free) formulas
    const tierPricing = TIER_PRICING[formula.tier];
    if (tierPricing.per_use_cents === 0) {
      // Still log the use for analytics, just no billing
      const event: FormulaUseEvent = {
        id: generateId(),
        formula_id: data.formula_id,
        stylist_id: user.id,
        client_name: data.client_name,
        service_id: data.service_id,
        used_at: new Date().toISOString(),
        billed: false,
      };
      useEvents.push(event);

      return NextResponse.json<ApiResponse<{ event: FormulaUseEvent; cost_cents: number }>>({
        success: true,
        data: { event, cost_cents: 0 },
      });
    }

    // Log the usage event
    const event: FormulaUseEvent = {
      id: generateId(),
      formula_id: data.formula_id,
      stylist_id: user.id,
      client_name: data.client_name,
      service_id: data.service_id,
      used_at: new Date().toISOString(),
      billed: false,
    };
    useEvents.push(event);

    // Increment formula usage count
    formula.usage_count++;

    return NextResponse.json<ApiResponse<{ event: FormulaUseEvent; cost_cents: number }>>({
      success: true,
      data: {
        event,
        cost_cents: tierPricing.per_use_cents,
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

/**
 * GET /api/marketplace/usage
 * List usage events for the authenticated stylist
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
    const period = searchParams.get('period'); // "2026-05"
    const formulaId = searchParams.get('formula_id');

    let userEvents = useEvents.filter(e => e.stylist_id === user.id);

    if (period) {
      userEvents = userEvents.filter(e => e.used_at.startsWith(period));
    }
    if (formulaId) {
      userEvents = userEvents.filter(e => e.formula_id === formulaId);
    }

    // Sort newest first
    userEvents.sort((a, b) => new Date(b.used_at).getTime() - new Date(a.used_at).getTime());

    // Calculate total unbilled cost
    const unbilledEvents = userEvents.filter(e => !e.billed);
    const totalUnbilledCents = unbilledEvents.reduce((sum, e) => {
      const formula = formulas.find(f => f.id === e.formula_id);
      return sum + (formula ? TIER_PRICING[formula.tier].per_use_cents : 0);
    }, 0);

    return NextResponse.json<ApiResponse<{
      events: FormulaUseEvent[];
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
