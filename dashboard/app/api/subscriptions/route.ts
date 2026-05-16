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

// ── Subscription Plans ──

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_cents: number;
  price_display: string;
  features: string[];
  square_plan_id?: string; // Square subscription plan variation ID
}

export const PLANS: SubscriptionPlan[] = [
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

// ── In-memory subscription store ──

interface SalonSubscription {
  salon_id: string;
  plan_id: string;
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  started_at: string;
  trial_ends_at?: string;
  canceled_at?: string;
  square_subscription_id?: string;
}

const subscriptions = new Map<string, SalonSubscription>();

// Seed with a default trial for testing
subscriptions.set('buyer-1', {
  salon_id: 'buyer-1',
  plan_id: 'pro',
  status: 'trialing',
  started_at: '2026-05-10T00:00:00Z',
  trial_ends_at: '2026-05-24T00:00:00Z',
});

function getUserFromAuth(request: NextRequest): { id: string } | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const [id] = token.split(':');
  if (!id) return null;
  return { id };
}

export async function GET(request: NextRequest) {
  const user = getUserFromAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const sub = subscriptions.get(user.id);

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

  const plan = PLANS.find(p => p.id === sub.plan_id);

  return NextResponse.json({
    success: true,
    data: {
      subscribed: true,
      current_plan: plan,
      subscription: sub,
      plans: PLANS,
      trial_active: sub.status === 'trialing' && sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date(),
      trial_days_remaining: sub.trial_ends_at
        ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / 86400000))
        : 0,
    },
  });
}

const subscribeSchema = z.object({
  plan_id: z.enum(['starter', 'pro', 'salon']),
  payment_method_id: z.string().optional(), // Square payment source
});

export async function POST(request: NextRequest) {
  const user = getUserFromAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const data = subscribeSchema.parse(body);

    const plan = PLANS.find(p => p.id === data.plan_id);
    if (!plan) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_PLAN' } }, { status: 400 });
    }

    // TODO: Create Square subscription when payment_method_id is provided
    // For now, activate immediately with trial

    const sub: SalonSubscription = {
      salon_id: user.id,
      plan_id: data.plan_id,
      status: 'trialing',
      started_at: new Date().toISOString(),
      trial_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(), // 14-day trial
    };

    subscriptions.set(user.id, sub);

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
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = getUserFromAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const sub = subscriptions.get(user.id);
  if (!sub) {
    return NextResponse.json({ success: false, error: { code: 'NO_SUBSCRIPTION' } }, { status: 400 });
  }

  sub.status = 'canceled';
  sub.canceled_at = new Date().toISOString();

  // TODO: Cancel Square subscription if connected

  return NextResponse.json({
    success: true,
    data: {
      subscription: sub,
      message: 'Subscription canceled. You\'ll retain access until the end of your billing period.',
    },
  });
}
