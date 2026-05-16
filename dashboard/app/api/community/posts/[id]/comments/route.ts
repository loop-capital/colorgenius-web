/**
 * POST /api/community/posts/[id]/comments
 * Add a comment to a post
 */

import { NextRequest, NextResponse } from 'next/server';
import { communityPosts, comments as commentsStore, generateId } from '@/lib/api/mock-data';
import { commentSchema, validateOrThrow } from '@/lib/api/validation';
import { ApiResponse, PostComment } from '@/lib/api/types';
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

    const body = await request.json().catch(() => ({}));
    const data = validateOrThrow(commentSchema, { ...body, post_id: id });

    const comment: PostComment = {
      id: generateId(),
      post_id: id,
      author_id: user.id,
      author_name: user.username || 'Anonymous',
      author_avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'U')}&background=9333EA&color=fff`,
      content: data.content,
      created_at: new Date().toISOString(),
    };

    commentsStore.push(comment);
    post.comments += 1;

    return NextResponse.json<ApiResponse<PostComment>>({
      success: true,
      data: comment,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add comment';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'COMMENT_FAILED', message },
    }, { status: 500 });
  }
}

/**
 * GET /api/community/posts/[id]/comments
 * Get comments for a post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { getCommentsForPost } = await import('@/lib/api/mock-data');
    const postComments = getCommentsForPost(id);

    return NextResponse.json<ApiResponse<PostComment[]>>({
      success: true,
      data: postComments,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch comments';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'COMMENTS_FETCH_FAILED', message },
    }, { status: 500 });
  }
}
