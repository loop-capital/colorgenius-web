/**
 * POST /api/v1/admin/creator-payouts/:id/mark-paid
 * Admin confirms a creator has actually been paid out-of-band (Venmo,
 * check, bank transfer, whatever) — Square can't send this money, so the
 * payout itself happens outside the platform; this just records that it
 * happened. See GET /api/v1/admin/creator-payouts for how the amount is
 * computed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { z } from 'zod';

const markPaidSchema = z.object({
  payout_method: z.string().max(50).optional(),
  payout_reference: z.string().max(255).optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = markPaidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_BODY', message: parsed.error.message } }, { status: 400 });
  }

  const existing = await prisma.creator_payouts.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
  }
  if (existing.status === 'paid') {
    return NextResponse.json({ success: false, error: { code: 'ALREADY_PAID', message: 'This payout is already marked paid' } }, { status: 400 });
  }

  const updated = await prisma.creator_payouts.update({
    where: { id },
    data: {
      status: 'paid',
      paid_at: new Date(),
      payout_method: parsed.data.payout_method,
      payout_reference: parsed.data.payout_reference,
      notes: parsed.data.notes,
      updated_at: new Date(),
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
