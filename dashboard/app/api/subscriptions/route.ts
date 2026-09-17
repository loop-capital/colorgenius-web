/**
 * GET /api/subscriptions
 * Get current subscription for the authenticated salon
 * 
 * POST /api/subscriptions
 * Create a new subscription (upgrade/change plan)
 * 
 * DELETE /api/subscriptions
 * Cancel current subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getSalonIdForUser } from '@/lib/stylist';

// ── Subscription Plans ──

interface SubscriptionPlan {
  id: string;
  name: string;
  price_cents: number;
  price_display: string;
  features: string[];
  square_plan_id?: string; // Square subscription plan variation ID
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price_cents: 2900,
    price_display: '$29/month',
    features: [
      'Unlimited formulations',
      'Basic inventory tracking',
      'Client management (50 clients)',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price_cents: 7900,
    price_display: '$79/month',
    features: [
      'Everything in Starter',
      'Unlimited clients',
      'Scale integration',
      'Formula marketplace access',
      'Priority support',
      'Team sharing (3 seats)',
    ],
  },
  {
    id: 'salon',
    name: 'Salon',
    price_cents: 19900,
    price_display: '$199/month',
    features: [
      'Everything in Pro',
      'Unlimited team seats',
      'Advanced analytics',
      'White-label options',
      'API access',
      'Dedicated account manager',
    ],
  },
];

// ── Real, DB-backed subscription store (prisma.subscriptions) ──
// subscriber_type is always 'salon' here; subscriber_id is the salon's real id,
// resolved from the authenticated user via users.salon_id (see lib/stylist.ts).

async function requireSalonId(request: NextRequest): Promise<{ salonId: string } | { error: NextResponse }> {
  const authUser = await getUserFromRequest(request);
  if (!authUser) {
    return { error: NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 }) };
  }
  const salonId = await getSalonIdForUser(authUser.userId);
  if (!salonId) {
    return { error: NextResponse.json({ success: false, error: { code: 'NO_SALON', message: 'This account is not linked to a salon yet.' } }, { status: 400 }) };
  }
  return { salonId };
}

export async function GET(request: NextRequest) {
  const resolved = await requireSalonId(request);
  if ('error' in resolved) return resolved.error;
  const { salonId } = resolved;

  const sub = await prisma.subscriptions.findFirst({
    where: { subscriber_type: 'salon', subscriber_id: salonId },
    orderBy: { created_at: 'desc' },
  });

  if (!sub) {
    // No subscription — return available plans
    return NextResponse.json({
      success: true,
      data: {
        subscribed: false,
        current_plan: null,
        plans: PLANS,
      },
    });
  }

  const plan = PLANS.find(p => p.id === sub.tier);
  const trialEndsAt = sub.status === 'trialing' ? sub.current_period_end : null;

  return NextResponse.json({
    success: true,
    data: {
      subscribed: true,
      current_plan: plan,
      subscription: sub,
      plans: PLANS,
      trial_active: sub.status === 'trialing' && !!trialEndsAt && trialEndsAt > new Date(),
      trial_days_remaining: trialEndsAt
        ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
        : 0,
    },
  });
}

const subscribeSchema = z.object({
  plan_id: z.enum(['starter', 'pro', 'salon']),
  payment_method_id: z.string().optional(), // Square payment source
});

export async function POST(request: NextRequest) {
  const resolved = await requireSalonId(request);
  if ('error' in resolved) return resolved.error;
  const { salonId } = resolved;

  try {
    const body = await request.json().catch(() => ({}));
    const data = subscribeSchema.parse(body);

    const plan = PLANS.find(p => p.id === data.plan_id);
    if (!plan) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_PLAN' } }, { status: 400 });
    }

    // TODO: Create a real Square subscription when payment_method_id is provided —
    // needs a Square customer id + subscription plan variation id configured on the
    // Square side first (square_plan_id above is currently unpopulated for every
    // plan). Not something to fabricate here; activating on a trial in the meantime
    // so the rest of the flow (persistence, plan gating) is real and testable.
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 86400000); // 14-day trial

    // subscriptions has no unique constraint on (subscriber_type, subscriber_id),
    // so this is a plain find-then-write rather than a Prisma upsert.
    const existing = await prisma.subscriptions.findFirst({
      where: { subscriber_type: 'salon', subscriber_id: salonId },
    });

    const sub = existing
      ? await prisma.subscriptions.update({
          where: { id: existing.id },
          data: {
            tier: data.plan_id,
            monthly_price: plan.price_cents / 100,
            status: 'trialing',
            current_period_start: now,
            current_period_end: trialEnd,
            canceled_at: null,
            cancellation_reason: null,
            updated_at: now,
          },
        })
      : await prisma.subscriptions.create({
          data: {
            subscriber_type: 'salon',
            subscriber_id: salonId,
            tier: data.plan_id,
            monthly_price: plan.price_cents / 100,
            billing_interval: 'monthly',
            status: 'trialing',
            current_period_start: now,
            current_period_end: trialEnd,
          },
        });

    return NextResponse.json({
      success: true,
      data: {
        subscription: sub,
        plan,
        message: `Welcome to ${plan.name}! Your 14-day free trial starts now.`,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const resolved = await requireSalonId(request);
  if ('error' in resolved) return resolved.error;
  const { salonId } = resolved;

  const existing = await prisma.subscriptions.findFirst({
    where: { subscriber_type: 'salon', subscriber_id: salonId },
  });
  if (!existing) {
    return NextResponse.json({ success: false, error: { code: 'NO_SUBSCRIPTION' } }, { status: 400 });
  }

  const sub = await prisma.subscriptions.update({
    where: { id: existing.id },
    data: { status: 'canceled', canceled_at: new Date() },
  });

  // TODO: Cancel the real Square subscription too, once POST actually creates one.

  return NextResponse.json({
    success: true,
    data: {
      subscription: sub,
      message: 'Subscription canceled. You\'ll retain access until the end of your billing period.',
    },
  });
}
