/**
 * POST /api/community/posts/[id]/like
 * Toggle like on a post
 */

import { NextRequest, NextResponse } from 'next/server';
import { communityPosts, votes, updatePostScore } from '@/lib/api/mock-data';
import { ApiResponse, CommunityPost } from '@/lib/api/types';
import { getCurrentUser } from '@/lib/api/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      }, { status: 401 });
    }

    const { id } = await params;
    const post = communityPosts.find(p => p.id === id);
    if (!post) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'POST_NOT_FOUND', message: 'Community post not found' },
      }, { status: 404 });
    }

    const existingIdx = votes.findIndex(
      v => v.post_id === id && v.user_id === user.id && v.action === 'like'
    );

    let liked: boolean;
    if (existingIdx >= 0) {
      // Unlike
      post.likes = Math.max(0, post.likes - 1);
      votes.splice(existingIdx, 1);
      liked = false;
    } else {
      // Like
      post.likes += 1;
      votes.push({
        post_id: id,
        user_id: user.id,
        action: 'like',
        created_at: new Date().toISOString(),
      });
      liked = true;
    }

    updatePostScore(post.id);

    return NextResponse.json<ApiResponse<{ liked: boolean; likes: number }>>({
      success: true,
      data: { liked, likes: post.likes },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to toggle like';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'LIKE_FAILED', message },
    }, { status: 500 });
  }
}
