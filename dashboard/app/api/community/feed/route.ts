/**
 * GET /api/community/feed
 * Paginated community feed with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { feedQuerySchema, validateOrThrow } from '@/lib/api/validation';
import { communityPosts } from '@/lib/api/mock-data';
import { ApiResponse, CommunityPost } from '@/lib/api/types';
import { getCurrentUser } from '@/lib/api/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const filter = searchParams.get('filter') || 'newest';
    const search = searchParams.get('search') || '';

    let posts = [...communityPosts].filter(p => p.is_public);

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter(p =>
        p.content?.toLowerCase().includes(q) ||
        p.caption?.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.author_name.toLowerCase().includes(q) ||
        p.author_handle?.toLowerCase().includes(q) ||
        p.formulation_snapshot?.brand.toLowerCase().includes(q) ||
        p.formulation_snapshot?.shade_code.toLowerCase().includes(q)
      );
    }

    // Sort
    if (filter === 'trending') {
      posts.sort((a, b) => b.score - a.score);
    } else {
      posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Cursor pagination (skip N)
    const skip = cursor ? parseInt(cursor) : 0;
    const page = posts.slice(skip, skip + limit);

    // Attach user vote state if logged in
    if (user) {
      const { votes } = await import('@/lib/api/mock-data');
      page.forEach(p => {
        p.user_liked = votes.some(v => v.post_id === p.id && v.user_id === user.id && v.action === 'like');
        p.user_saved = votes.some(v => v.post_id === p.id && v.user_id === user.id && v.action === 'save');
      });
    }

    const nextCursor = skip + page.length < posts.length ? String(skip + limit) : undefined;

    return NextResponse.json<ApiResponse<CommunityPost[]>>({
      success: true,
      data: page,
      meta: {
        cursor: nextCursor,
        total: posts.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch feed';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'FEED_FAILED', message },
    }, { status: 500 });
  }
}
