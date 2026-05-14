/**
 * POST /api/community/posts
 * Create a new community post
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPostSchema, validateOrThrow } from '@/lib/api/validation';
import { communityPosts, generateId } from '@/lib/api/mock-data';
import { ApiResponse, CommunityPost } from '@/lib/api/types';
import { getCurrentUser } from '@/lib/api/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const data = validateOrThrow(createPostSchema, body);

    const post: CommunityPost = {
      id: generateId(),
      author_id: user.id,
      author_name: user.username || 'Anonymous',
      author_avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'U')}&background=9333EA&color=fff`,
      author_handle: `@${(user.username || 'user').toLowerCase().replace(/\s+/g, '.')}`,
      author_is_educator: false,
      type: data.type,
      formulation_id: data.formulation_id,
      image_urls: data.image_urls,
      caption: data.caption,
      content: data.content,
      tags: data.tags || [],
      likes: 0,
      saves: 0,
      comments: 0,
      score: 0,
      is_public: data.is_public ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    communityPosts.unshift(post);

    return NextResponse.json<ApiResponse<CommunityPost>>({
      success: true,
      data: post,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create post';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'CREATE_POST_FAILED', message },
    }, { status: 500 });
  }
}
