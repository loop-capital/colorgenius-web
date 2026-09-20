/**
 * POST /api/v1/formula-outcomes
 * Record real target-vs-actual grams for one ingredient, from the web
 * Formulate page's scale bowl — the web-side counterpart to Color Bar's
 * session-completion write (app/api/v1/color-bar/session/[id]/complete),
 * both feeding the same formula memory (see lib/formula-memory.ts).
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { recordFormulaOutcome } from '@/lib/formula-memory';

const bodySchema = z.object({
  clientId: z.string().min(1),
  ingredients: z
    .array(
      z.object({
        brand: z.string().min(1),
        shadeCode: z.string().min(1),
        targetGrams: z.number().positive(),
        actualGrams: z.number().positive(),
      })
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  const authUser = await getUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
  }

  await Promise.all(
    parsed.data.ingredients.map((ing) =>
      recordFormulaOutcome({
        clientId: parsed.data.clientId,
        brand: ing.brand,
        shadeCode: ing.shadeCode,
        targetGrams: ing.targetGrams,
        actualGrams: ing.actualGrams,
        source: 'web_formulate',
      })
    )
  );

  return NextResponse.json({ success: true });
}
