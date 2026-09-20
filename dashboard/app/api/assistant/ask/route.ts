/**
 * POST /api/assistant/ask — answer a bowl-side voice question.
 * Gated on salons.features_enabled.voice_assistant (admin-toggled, see
 * /api/v1/admin/salons/:salonId/voice-assistant) since every question is a
 * real OpenAI cost. Logs each answered question to voice_assistant_usage
 * for per-salon cost tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getSalonIdForUser } from '@/lib/stylist';
import { askAssistant } from '@/lib/assistant/ask';

const askSchema = z.object({
  question: z.string().min(1).max(500),
  clientId: z.string().optional(),
  context: z
    .object({
      clientName: z.string().optional(),
      currentFormula: z.record(z.string(), z.unknown()).optional(),
      brands: z.record(z.string(), z.array(z.string())).optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  const authUser = await getUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const salonId = await getSalonIdForUser(authUser.userId);
  if (!salonId) {
    return NextResponse.json({ error: 'Your account isn’t linked to a salon yet.' }, { status: 400 });
  }

  const salon = await prisma.salons.findUnique({ where: { id: salonId }, select: { features_enabled: true } });
  const enabled = (salon?.features_enabled as Record<string, unknown> | null)?.voice_assistant === true;
  if (!enabled) {
    return NextResponse.json({ error: 'Voice assistant is not enabled for your salon.', code: 'VOICE_DISABLED' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = askSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
  }

  const result = await askAssistant(parsed.data.question, parsed.data.context);
  if (!result) {
    return NextResponse.json({ error: 'Sorry, I had trouble with that.' }, { status: 502 });
  }

  await prisma.voice_assistant_usage.create({
    data: {
      salon_id: salonId,
      question: parsed.data.question,
      cost_cents: result.costCents,
      est_minutes: result.estMinutes,
    },
  });

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const monthly = await prisma.voice_assistant_usage.aggregate({
    where: { salon_id: salonId, created_at: { gte: monthStart } },
    _sum: { est_minutes: true },
  });

  return NextResponse.json({
    answer: result.answer,
    billing: {
      billedMinutes: result.estMinutes,
      billedCents: result.costCents,
      monthlyTotal: Number(monthly._sum.est_minutes ?? 0),
    },
  });
}
