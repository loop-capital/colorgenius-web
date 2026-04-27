/**
 * GET /api/marketplace/browse
 * Browse marketplace templates with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow, browseQuerySchema } from '@/lib/api/validation';
import { templates } from '@/lib/api/mock-data';
import { Template, ApiResponse } from '@/lib/api/types';

function getUserFromAuth(request: NextRequest): { id: string } | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const [id] = token.split(':');
  if (!id) return null;
  return { id };
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromAuth(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Bearer token required' },
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const raw = {
      category: searchParams.get('category') || undefined,
      price_min: searchParams.get('price_min') || undefined,
      price_max: searchParams.get('price_max') || undefined,
      rating: searchParams.get('rating') || undefined,
      sort: searchParams.get('sort') || undefined,
      cursor: searchParams.get('cursor') || undefined,
      limit: searchParams.get('limit') || undefined,
    };
    const query = validateOrThrow(browseQuerySchema, raw);

    let results = [...templates].filter(t => t.is_active);

    // Apply filters
    if (query.category) {
      results = results.filter(t => t.category.toLowerCase() === query.category!.toLowerCase());
    }
    if (query.price_min !== undefined) {
      results = results.filter(t => t.price_cents >= query.price_min!);
    }
    if (query.price_max !== undefined) {
      results = results.filter(t => t.price_cents <= query.price_max!);
    }
    if (query.rating !== undefined) {
      results = results.filter(t => (t.rating / 10) >= query.rating!);
    }

    // Sort
    if (query.sort === 'newest') {
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (query.sort === 'price') {
      results.sort((a, b) => a.price_cents - b.price_cents);
    } else {
      // popular: by purchase count descending
      results.sort((a, b) => b.purchase_count - a.purchase_count);
    }

    // Cursor pagination
    let startIdx = 0;
    if (query.cursor) {
      const idx = results.findIndex(t => t.id === query.cursor);
      if (idx >= 0) startIdx = idx + 1;
    }

    const page = results.slice(startIdx, startIdx + query.limit);
    const nextCursor = page.length === query.limit && startIdx + query.limit < results.length
      ? page[page.length - 1].id
      : undefined;

    return NextResponse.json<ApiResponse<Template[]>>({
      success: true,
      data: page,
      meta: {
        cursor: nextCursor,
        total: results.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to browse marketplace';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'BROWSE_FAILED', message },
    }, { status: 500 });
  }
}
