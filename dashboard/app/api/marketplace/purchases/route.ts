/**
 * GET /api/marketplace/purchases
 * List every formula the caller's salon has acquired (free or licensed) —
 * the "Licensed" section of My Library. Previously no such list existed
 * anywhere in the app; a "successful" purchase had no way to be found again.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getSalonIdForUser } from '@/lib/stylist';
import { ApiResponse } from '@/lib/api/types';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      }, { status: 401 });
    }
    const salonId = await getSalonIdForUser(authUser.userId);
    if (!salonId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NO_SALON', message: 'This account is not linked to a salon yet' },
      }, { status: 400 });
    }

    const licenses = await prisma.formula_purchases.findMany({
      where: { salonId, status: 'completed' },
      orderBy: { purchasedAt: 'desc' },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            tags: true,
            tier: true,
            per_use_cents: true,
            photo_url: true,
            share_code: true,
            creator: { select: { display_name: true, first_name: true } },
          },
        },
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: licenses.map((l) => ({
        license_id: l.id,
        formula_id: l.listing.id,
        title: l.listing.title,
        description: l.listing.description,
        category: l.listing.category,
        tags: l.listing.tags,
        tier: l.listing.tier,
        per_use_cents: l.listing.per_use_cents,
        is_free: l.listing.per_use_cents === 0,
        photo_url: l.listing.photo_url,
        share_code: l.listing.share_code,
        creator_name: l.listing.creator.display_name || l.listing.creator.first_name,
        total_uses: l.totalUses,
        acquired_at: l.purchasedAt,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load your licensed formulas';
    return NextResponse.json<ApiResponse>({ success: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
