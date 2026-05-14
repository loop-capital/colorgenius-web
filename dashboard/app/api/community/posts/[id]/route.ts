/**
 * GET /api/community/posts/[id]
 * Single post with comments
 */

import { NextRequest, NextResponse } from 'next/server';
import { communityPosts, getCommentsForPost } from '@/lib/api/mock-data';
import { ApiResponse, CommunityPost, PostComment } from '@/lib/api/types';
import { getCurrentUser } from '@/lib/api/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    const { id } = await params;

    const post = communityPosts.find(p => p.id === id);
    if (!post) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'POST_NOT_FOUND', message: 'Community post not found' },
      }, { status: 404 });
    }

    const postComments = getCommentsForPost(id);

    // Attach user vote state
    if (user) {
      const { votes } = await import('@/lib/api/mock-data');
      post.user_liked = votes.some(v => v.post_id === id && v.user_id === user.id && v.action === 'like');
      post.user_saved = votes.some(v => v.post_id === id && v.user_id === user.id && v.action === 'save');
    }

    return NextResponse.json<ApiResponse<{ post: CommunityPost; comments: PostComment[] }>>({
      success: true,
      data: { post, comments: postComments },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch post';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'POST_FETCH_FAILED', message },
    }, { status: 500 });
  }
}
