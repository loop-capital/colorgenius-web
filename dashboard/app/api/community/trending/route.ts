/**
 * GET /api/community/trending
 * Top 20 community posts by score
 */

import { NextRequest, NextResponse } from 'next/server';
import { communityPosts } from '@/lib/api/mock-data';
import { CommunityPost, ApiResponse } from '@/lib/api/types';
import { getCurrentUser } from '@/lib/api/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    const posts = [...communityPosts]
      .filter(p => p.is_public)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    // Attach user vote state if logged in
    if (user) {
      const { votes } = await import('@/lib/api/mock-data');
      posts.forEach(p => {
        p.user_liked = votes.some(v => v.post_id === p.id && v.user_id === user.id && v.action === 'like');
        p.user_saved = votes.some(v => v.post_id === p.id && v.user_id === user.id && v.action === 'save');
      });
    }

    return NextResponse.json<ApiResponse<CommunityPost[]>>({
      success: true,
      data: posts,
      meta: { total: posts.length },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch trending';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'TRENDING_FAILED', message },
    }, { status: 500 });
  }
}
