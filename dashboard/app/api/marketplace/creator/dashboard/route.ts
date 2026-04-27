/**
 * GET /api/marketplace/creator/dashboard
 * Creator earnings dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { templates, purchases } from '@/lib/api/mock-data';
import { CreatorEarnings, ApiResponse } from '@/lib/api/types';

function getUserFromAuth(request: NextRequest): { id: string } | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const [id] = token.split(':');
  if (!id) return null;
  return { id };
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromAuth(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Bearer token required' },
      }, { status: 401 });
    }

    const creatorTemplates = templates.filter(t => t.creator_id === user.id);
    const creatorPurchases = purchases.filter(
      p => p.status === 'completed' && creatorTemplates.some(t => t.id === p.template_id)
    );

    const totalEarnings = creatorPurchases.reduce((sum, p) => sum + p.creator_earnings_cents, 0);
    const pendingPayout = creatorPurchases
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.creator_earnings_cents, 0);

    // Aggregate by template
    const templateStats = new Map<string, { title: string; sales: number; earnings: number }>();
    for (const purchase of creatorPurchases) {
      const tmpl = creatorTemplates.find(t => t.id === purchase.template_id);
      if (!tmpl) continue;
      const existing = templateStats.get(tmpl.id);
      if (existing) {
        existing.sales += 1;
        existing.earnings += purchase.creator_earnings_cents;
      } else {
        templateStats.set(tmpl.id, {
          title: tmpl.title,
          sales: 1,
          earnings: purchase.creator_earnings_cents,
        });
      }
    }

    const topTemplates = Array.from(templateStats.entries())
      .map(([template_id, stats]) => ({ template_id, title: stats.title, sales: stats.sales, earnings_cents: stats.earnings }))
      .sort((a, b) => b.earnings_cents - a.earnings_cents)
      .slice(0, 5);

    const dashboard: CreatorEarnings = {
      creator_id: user.id,
      total_sales: creatorPurchases.length,
      total_earnings_cents: totalEarnings,
      pending_payout_cents: pendingPayout,
      templates_count: creatorTemplates.length,
      top_templates: topTemplates,
    };

    return NextResponse.json<ApiResponse<CreatorEarnings>>({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch creator dashboard';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'DASHBOARD_FAILED', message },
    }, { status: 500 });
  }
}
