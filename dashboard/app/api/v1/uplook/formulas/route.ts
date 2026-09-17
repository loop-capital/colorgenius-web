/**
 * GET /api/v1/uplook/formulas
 * Public formula search/browse for GetUpLook.com (and any other consumer
 * surface) — no auth required, matching the existing public design of
 * /api/marketplace/lookup/:code and /api/marketplace/client-requests.
 * This is the missing piece those two already assumed existed: a way for a
 * consumer to actually FIND a formula in the first place, not just look one
 * up once they already have its share code.
 *
 * Never returns the actual recipe (ingredients/steps) — same as lookup/:code,
 * that stays gated behind a real purchase. This only returns enough to
 * browse/search and then either deep-link to lookup/:code or submit a
 * client-request.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || undefined;
    const category = searchParams.get('category') || undefined;
    const priceMin = searchParams.get('price_min') ? parseInt(searchParams.get('price_min')!, 10) : undefined;
    const priceMax = searchParams.get('price_max') ? parseInt(searchParams.get('price_max')!, 10) : undefined;
    const cursor = searchParams.get('cursor') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 50);

    // share_code is always set on publish, but guard defensively — a
    // listing a consumer can't act on (no code to look up or request)
    // shouldn't show up in search results.
    const where: Prisma.formula_listingsWhereInput = { is_active: true, share_code: { not: null } };
    if (category) where.category = { equals: category, mode: 'insensitive' };
    if (priceMin !== undefined || priceMax !== undefined) {
      where.price_cents = {};
      if (priceMin !== undefined) where.price_cents.gte = priceMin;
      if (priceMax !== undefined) where.price_cents.lte = priceMax;
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ];
    }

    const results = await prisma.formula_listings.findMany({
      where,
      orderBy: { purchase_count: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        creator: { select: { display_name: true, first_name: true, avatar_url: true, is_verified: true } },
      },
    });

    const hasMore = results.length > limit;
    const page = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? page[page.length - 1].id : undefined;

    return NextResponse.json({
      success: true,
      data: page.map((listing) => ({
        share_code: listing.share_code,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        tags: listing.tags,
        price_cents: listing.price_cents,
        photo_url: listing.photo_url,
        rating: listing.rating,
        review_count: listing.review_count,
        purchase_count: listing.purchase_count,
        creator_name: listing.creator.display_name || listing.creator.first_name,
        creator_avatar: listing.creator.avatar_url,
        creator_verified: listing.creator.is_verified,
      })),
      meta: { cursor: nextCursor, hasMore },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    return NextResponse.json({ success: false, error: { code: 'SEARCH_FAILED', message } }, { status: 500 });
  }
}
