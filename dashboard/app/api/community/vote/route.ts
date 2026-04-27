/**
 * POST /api/community/vote
 * Like/save/unlike/unsave a community post
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow, voteSchema } from '@/lib/api/validation';
import { communityPosts, votes, updatePostScore } from '@/lib/api/mock-data';
import { VoteRecord, ApiResponse } from '@/lib/api/types';

function getUserFromAuth(request: NextRequest): { id: string } | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const [id] = token.split(':');
  if (!id) return null;
  return { id };
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromAuth(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Bearer token required' },
      }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const data = validateOrThrow(voteSchema, body);

    const post = communityPosts.find(p => p.id === data.post_id);
    if (!post) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'POST_NOT_FOUND', message: 'Community post not found' },
      }, { status: 404 });
    }

    // Check for existing vote to toggle
    const existingIdx = votes.findIndex(
      v => v.post_id === data.post_id && v.user_id === user.id &&
        ((data.action === 'like' && v.action === 'like') ||
         (data.action === 'save' && v.action === 'save') ||
         (data.action === 'unlike' && v.action === 'like') ||
         (data.action === 'unsave' && v.action === 'save'))
    );

    if (data.action === 'like') {
      if (existingIdx >= 0) {
        // Already liked
        return NextResponse.json<ApiResponse>({
          success: true,
          data: { post_id: data.post_id, action: data.action, likes: post.likes, saves: post.saves },
        });
      }
      post.likes += 1;
      votes.push({ post_id: data.post_id, user_id: user.id, action: 'like', created_at: new Date().toISOString() });
    } else if (data.action === 'unlike') {
      if (existingIdx >= 0) {
        post.likes = Math.max(0, post.likes - 1);
        votes.splice(existingIdx, 1);
      }
    } else if (data.action === 'save') {
      if (existingIdx >= 0) {
        return NextResponse.json<ApiResponse>({
          success: true,
          data: { post_id: data.post_id, action: data.action, likes: post.likes, saves: post.saves },
        });
      }
      post.saves += 1;
      votes.push({ post_id: data.post_id, user_id: user.id, action: 'save', created_at: new Date().toISOString() });
    } else if (data.action === 'unsave') {
      if (existingIdx >= 0) {
        post.saves = Math.max(0, post.saves - 1);
        votes.splice(existingIdx, 1);
      }
    }

    updatePostScore(post.id);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { post_id: data.post_id, action: data.action, likes: post.likes, saves: post.saves },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process vote';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'VOTE_FAILED', message },
    }, { status: 500 });
  }
}
