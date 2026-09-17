/**
 * GET /api/cron/formula-billing
 * Runs daily (Vercel Cron — see vercel.json). Only actually does anything
 * on the 1st of the month: finds every salon with unbilled per-use license
 * usage from the previous month and bills each one via billSalonForPeriod
 * (real Square charge against their card on file). Daily-with-a-date-check
 * is the standard workaround for platforms without native monthly cron
 * granularity.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { billSalonForPeriod } from '@/lib/billing';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  if (now.getUTCDate() !== 1) {
    return NextResponse.json({ skipped: true, reason: 'Not the 1st of the month', today: now.toISOString() });
  }

  // Bill for the month that just ended.
  const priorMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const period = `${priorMonth.getUTCFullYear()}-${String(priorMonth.getUTCMonth() + 1).padStart(2, '0')}`;
  const periodStart = priorMonth;
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const salonsWithUsage = await prisma.formula_usage_log.findMany({
    where: { billingInvoiceId: null, usedAt: { gte: periodStart, lt: periodEnd }, feeAmount: { gt: 0 } },
    select: { salonId: true },
    distinct: ['salonId'],
  });

  const results: { salonId: string; success: boolean; error?: string }[] = [];
  for (const { salonId } of salonsWithUsage) {
    try {
      const result = await billSalonForPeriod(salonId, period);
      results.push({ salonId, success: result.success, error: result.success ? undefined : result.error.message });
    } catch (err) {
      results.push({ salonId, success: false, error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  return NextResponse.json({ period, salons_processed: results.length, results });
}
