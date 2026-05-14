import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

// ─── Validation Schema ───────────────────────────────────────────────────────

const useFormulaSchema = z.object({
  salonId: z.string().uuid('salonId must be a valid UUID'),
  formulaId: z.string().uuid('formulaId must be a valid UUID'),
  stylistId: z.string().uuid('stylistId must be a valid UUID').optional(),
  clientId: z.string().uuid('clientId must be a valid UUID').optional(),
});

// ─── Constants ───────────────────────────────────────────────────────────────

const CREATOR_SHARE = 0.7; // 70% to formula creator
const PLATFORM_SHARE = 0.3; // 30% platform fee

// ─── POST: Log a formula use ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Rate limiting: 30 requests per minute
  const clientIdentifier = getClientIdentifier(request);
  const rateLimitResult = rateLimit(clientIdentifier, 60000, 30);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Please try again later.',
        rateLimit: {
          limit: 30,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = useFormulaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { salonId, formulaId, stylistId, clientId } = parsed.data;

    // Check if salon has purchased this formula
    const purchase = await prisma.formula_purchases.findFirst({
      where: { salonId, formulaId },
      orderBy: { purchasedAt: 'desc' },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Formula not purchased. Please purchase this formula before using it.' },
        { status: 403 }
      );
    }

    // Check remaining uses (null = unlimited)
    if (purchase.remainingUses !== null && purchase.remainingUses <= 0) {
      return NextResponse.json(
        {
          error: 'No remaining uses for this formula. Please purchase additional uses.',
          remainingUses: 0,
        },
        { status: 403 }
      );
    }

    // Calculate fee split
    const perUseFee = Number(purchase.perUseFee);
    const creatorPayout = +(perUseFee * CREATOR_SHARE).toFixed(2);
    const platformFee = +(perUseFee * PLATFORM_SHARE).toFixed(2);

    // Run the usage log and remaining uses decrement in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Log the usage
      const usageLog = await tx.formula_usage_log.create({
        data: {
          salonId,
          formulaId,
          stylistId: stylistId || null,
          clientId: clientId || null,
          feeAmount: perUseFee,
          creatorPayout,
          platformFee,
        },
      });

      // Decrement remaining uses if not unlimited
      let updatedRemainingUses: number | null = null;
      if (purchase.remainingUses !== null) {
        const updated = await tx.formula_purchases.update({
          where: { id: purchase.id },
          data: {
            remainingUses: { decrement: 1 },
            totalUses: { increment: 1 },
          },
        });
        updatedRemainingUses = updated.remainingUses;
      } else {
        // Unlimited — just increment totalUses
        await tx.formula_purchases.update({
          where: { id: purchase.id },
          data: { totalUses: { increment: 1 } },
        });
        updatedRemainingUses = null; // still unlimited
      }

      return { usageLog, updatedRemainingUses };
    });

    return NextResponse.json(
      {
        success: true,
        feeAmount: perUseFee,
        creatorPayout,
        platformFee,
        remainingUses: result.updatedRemainingUses,
        usageLogId: result.usageLog.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/formulas/use error:', error);
    const message = error instanceof Error ? error.message : 'Failed to log formula use';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
