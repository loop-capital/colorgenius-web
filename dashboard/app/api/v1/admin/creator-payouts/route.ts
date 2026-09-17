/**
 * GET /api/v1/admin/creator-payouts?period=YYYY-MM
 * What each formula creator is owed for a billing period, computed from
 * usage that's actually been billed AND collected (the linked invoice is
 * 'paid' — never usage sitting on a pending/failed invoice, since that
 * money hasn't actually come in from the salon yet).
 *
 * Square has no product for paying many independent third parties
 * automatically, so this is a real, accurate report for a human (Jason) to
 * act on manually — see creator_payouts (tracks status once he pays each
 * creator) and POST .../:id/mark-paid.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period');
  if (!period || !/^\d{4}-\d{2}$/.test(period)) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_PERIOD', message: 'period must be YYYY-MM' } }, { status: 400 });
  }

  const [year, month] = period.split('-').map(Number);
  const periodStart = new Date(Date.UTC(year, month - 1, 1));
  const periodEnd = new Date(Date.UTC(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1));

  const billedUsage = await prisma.formula_usage_log.findMany({
    where: {
      usedAt: { gte: periodStart, lt: periodEnd },
      creatorPayout: { gt: 0 },
      billingInvoiceId: { not: null },
      billingInvoice: { status: 'paid' },
    },
    select: { creatorId: true, creatorPayout: true, formulaId: true, listing: { select: { title: true } } },
  });

  const byCreator = new Map<string, { totalCents: number; breakdown: Map<string, { title: string; count: number; cents: number }> }>();
  for (const e of billedUsage) {
    if (!e.creatorId) continue;
    const cents = Math.round(Number(e.creatorPayout) * 100);
    let entry = byCreator.get(e.creatorId);
    if (!entry) {
      entry = { totalCents: 0, breakdown: new Map() };
      byCreator.set(e.creatorId, entry);
    }
    entry.totalCents += cents;
    const b = entry.breakdown.get(e.formulaId) || { title: e.listing.title, count: 0, cents: 0 };
    b.count += 1;
    b.cents += cents;
    entry.breakdown.set(e.formulaId, b);
  }

  const creatorIds = Array.from(byCreator.keys());
  const creators = await prisma.stylists.findMany({
    where: { id: { in: creatorIds } },
    select: { id: true, email: true, display_name: true, first_name: true, last_name: true },
  });
  const creatorById = new Map(creators.map((c) => [c.id, c]));

  const existingPayouts = await prisma.creator_payouts.findMany({
    where: { creator_id: { in: creatorIds }, billing_period: period },
  });
  const payoutByCreator = new Map(existingPayouts.map((p) => [p.creator_id, p]));

  const results = [];
  for (const [creatorId, entry] of byCreator) {
    const creator = creatorById.get(creatorId);
    const existingPayout = payoutByCreator.get(creatorId);

    // Keep the tracked amount in sync with what's actually owed — usage
    // billed after the report was first generated (e.g. a late-paid
    // invoice) should update the total, but never overwrite a payout
    // that's already marked paid.
    const payout = existingPayout && existingPayout.status !== 'paid'
      ? await prisma.creator_payouts.update({ where: { id: existingPayout.id }, data: { total_cents: entry.totalCents } })
      : existingPayout || await prisma.creator_payouts.create({
          data: { creator_id: creatorId, billing_period: period, total_cents: entry.totalCents },
        });

    results.push({
      payout_id: payout.id,
      creator_id: creatorId,
      creator_name: creator?.display_name || [creator?.first_name, creator?.last_name].filter(Boolean).join(' ') || 'Unknown',
      creator_email: creator?.email || null,
      total_cents: payout.status === 'paid' ? payout.total_cents : entry.totalCents,
      status: payout.status,
      paid_at: payout.paid_at,
      payout_method: payout.payout_method,
      payout_reference: payout.payout_reference,
      breakdown: Array.from(entry.breakdown.entries()).map(([formulaId, b]) => ({
        formula_id: formulaId,
        title: b.title,
        use_count: b.count,
        total_cents: b.cents,
      })),
    });
  }

  results.sort((a, b) => b.total_cents - a.total_cents);

  return NextResponse.json({
    success: true,
    data: {
      period,
      total_owed_cents: results.reduce((sum, r) => sum + r.total_cents, 0),
      total_pending_cents: results.filter((r) => r.status !== 'paid').reduce((sum, r) => sum + r.total_cents, 0),
      creators: results,
    },
  });
}
