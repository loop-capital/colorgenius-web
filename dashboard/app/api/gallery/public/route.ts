/**
 * GET /api/gallery/public
 * Public consumer gallery — NO auth required
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow, galleryQuerySchema } from '@/lib/api/validation';
import { galleryItems } from '@/lib/api/mock-data';
import { GalleryItem, ApiResponse } from '@/lib/api/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = {
      cursor: searchParams.get('cursor') || undefined,
      limit: searchParams.get('limit') || undefined,
      season: searchParams.get('season') || undefined,
      color_family: searchParams.get('color_family') || undefined,
    };
    const query = validateOrThrow(galleryQuerySchema, raw);

    let items = [...galleryItems];

    // Apply filters
    if (query.season) {
      items = items.filter(i => i.season === query.season);
    }
    if (query.color_family) {
      items = items.filter(
        i => i.formulation_snapshot.color_family.toLowerCase() === query.color_family!.toLowerCase()
      );
    }

    // Sort by newest
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Cursor pagination
    let startIdx = 0;
    if (query.cursor) {
      const idx = items.findIndex(i => i.id === query.cursor);
      if (idx >= 0) startIdx = idx + 1;
    }

    const page = items.slice(startIdx, startIdx + query.limit);
    const nextCursor = page.length === query.limit && startIdx + query.limit < items.length
      ? page[page.length - 1].id
      : undefined;

    return NextResponse.json<ApiResponse<GalleryItem[]>>({
      success: true,
      data: page,
      meta: {
        cursor: nextCursor,
        total: items.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch gallery';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'GALLERY_FAILED', message },
    }, { status: 500 });
  }
}
