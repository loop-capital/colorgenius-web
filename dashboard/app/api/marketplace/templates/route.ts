/**
 * POST /api/marketplace/templates
 * List a template for sale
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow, listTemplateSchema } from '@/lib/api/validation';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getOrCreateStylistForUser } from '@/lib/stylist';
import { ApiResponse } from '@/lib/api/types';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      }, { status: 401 });
    }
    const stylist = await getOrCreateStylistForUser(authUser.userId);
    if (!stylist) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NO_PROFILE', message: 'No creator profile for this account' },
      }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const data = validateOrThrow(listTemplateSchema, body);

    // NOTE: community_post_id is accepted but not verified against a real table —
    // community is still on mock data as of this pass (see lib/api/mock-data.ts).

    const listing = await prisma.formula_listings.create({
      data: {
        creator_id: stylist.id,
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags || [],
        tier: 'community', // directly-priced listing, not auto-scored like /publish
        price_cents: data.price_cents,
        per_use_cents: 0,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: listing,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list template';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'LIST_TEMPLATE_FAILED', message },
    }, { status: 500 });
  }
}
