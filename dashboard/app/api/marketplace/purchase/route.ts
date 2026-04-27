/**
 * POST /api/marketplace/purchase
 * Purchase a template
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow, purchaseSchema } from '@/lib/api/validation';
import { templates, purchases, generateId } from '@/lib/api/mock-data';
import { Purchase, ApiResponse } from '@/lib/api/types';

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
    const data = validateOrThrow(purchaseSchema, body);

    const template = templates.find(t => t.id === data.template_id);
    if (!template) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'TEMPLATE_NOT_FOUND', message: 'Template not found' },
      }, { status: 404 });
    }

    if (!template.is_active) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'TEMPLATE_INACTIVE', message: 'Template is no longer available' },
      }, { status: 400 });
    }

    // Check if already purchased
    const existing = purchases.find(
      p => p.buyer_id === user.id && p.template_id === data.template_id && p.status === 'completed'
    );
    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'ALREADY_PURCHASED', message: 'You have already purchased this template' },
      }, { status: 400 });
    }

    const platformFee = Math.round(template.price_cents * 0.20); // 20% platform fee
    const creatorEarnings = template.price_cents - platformFee;

    const purchase: Purchase = {
      id: generateId(),
      buyer_id: user.id,
      template_id: data.template_id,
      price_paid_cents: template.price_cents,
      creator_earnings_cents: creatorEarnings,
      platform_fee_cents: platformFee,
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    purchases.push(purchase);

    // Update template stats
    template.purchase_count += 1;
    template.updated_at = new Date().toISOString();

    return NextResponse.json<ApiResponse<Purchase>>({
      success: true,
      data: purchase,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process purchase';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'PURCHASE_FAILED', message },
    }, { status: 500 });
  }
}
