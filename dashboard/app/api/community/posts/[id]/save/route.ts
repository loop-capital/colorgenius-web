/**
 * POST /api/community/posts/[id]/save
 * Toggle save/bookmark on a post
 */

import { NextRequest, NextResponse } from 'next/server';
import { communityPosts, votes, updatePostScore } from '@/lib/api/mock-data';
import { ApiResponse } from '@/lib/api/types';
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
      v => v.post_id === id && v.user_id === user.id && v.action === 'save'
    );

    let saved: boolean;
    if (existingIdx >= 0) {
      post.saves = Math.max(0, post.saves - 1);
      votes.splice(existingIdx, 1);
      saved = false;
    } else {
      post.saves += 1;
      votes.push({
        post_id: id,
        user_id: user.id,
        action: 'save',
        created_at: new Date().toISOString(),
      });
      saved = true;
    }

    updatePostScore(post.id);

    return NextResponse.json<ApiResponse<{ saved: boolean; saves: number }>>({
      success: true,
      data: { saved, saves: post.saves },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to toggle save';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'SAVE_FAILED', message },
    }, { status: 500 });
  }
}
