/**
 * GET /api/community/trending
 * Top 20 community posts by score
 */

import { NextRequest, NextResponse } from 'next/server';
import { communityPosts } from '@/lib/api/mock-data';
import { CommunityPost, ApiResponse } from '@/lib/api/types';

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

    const posts = [...communityPosts]
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

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
