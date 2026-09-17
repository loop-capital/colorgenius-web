/**
 * GET /api/marketplace/lookup/[code]
 * Look up a formula by share code (PUBLIC — no auth required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const normalized = code.toUpperCase().replace(/^CG-/, '');
    const fullCode = `CG-${normalized}`;

    const listing = await prisma.formula_listings.findUnique({
      where: { share_code: fullCode },
      include: { creator: { select: { display_name: true, first_name: true, avatar_url: true } } },
    });

    if (!listing || !listing.is_active) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `No formula found for code ${fullCode}` },
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        share_code: fullCode,
        formula: {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          creator_name: listing.creator.display_name || listing.creator.first_name,
          creator_avatar: listing.creator.avatar_url,
          category: listing.category,
          tier: listing.tier,
          score: listing.score,
          per_use_cents: listing.per_use_cents,
          rating: listing.rating,
          usage_count: listing.usage_count,
          tags: listing.tags,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lookup failed';
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message },
    }, { status: 500 });
  }
}
