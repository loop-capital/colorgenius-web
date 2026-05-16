import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

// ─── Validation Schema ───────────────────────────────────────────────────────

const purchaseSchema = z.object({
  salonId: z.string().uuid('salonId must be a valid UUID'),
  formulaId: z.string().uuid('formulaId must be a valid UUID'),
  perUseFee: z.number().positive('perUseFee must be a positive number'),
  blockUses: z.number().int().positive('blockUses must be a positive integer').optional(),
  blockPrice: z.number().positive('blockPrice must be a positive number').optional(),
});

// ─── POST: Purchase a formula or block of uses ───────────────────────────────

export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests per minute
  const clientIdentifier = getClientIdentifier(request);
  const rateLimitResult = rateLimit(clientIdentifier, 60000, 10);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Please try again later.',
        rateLimit: {
          limit: 10,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = purchaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { salonId, formulaId, perUseFee, blockUses, blockPrice } = parsed.data;

    // Verify the salon exists
    const salon = await prisma.salons.findUnique({
      where: { id: salonId },
      select: { id: true },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Create the purchase record
    const purchase = await prisma.formula_purchases.create({
      data: {
        salonId,
        formulaId,
        perUseFee,
        remainingUses: blockUses ?? null, // null = unlimited
        blockPrice: blockPrice ?? null,
        totalUses: 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        purchaseId: purchase.id,
        remainingUses: purchase.remainingUses,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/formulas/purchase error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create formula purchase';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
