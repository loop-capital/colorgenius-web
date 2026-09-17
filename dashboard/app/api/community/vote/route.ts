/**
 * POST /api/community/vote
 * Like/save/unlike/unsave a community post
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow, voteSchema } from '@/lib/api/validation';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api/types';
import { getUserFromRequest } from '@/lib/auth';
import { getOrCreateStylistForUser } from '@/lib/stylist';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      }, { status: 401 });
    }
    const stylist = await getOrCreateStylistForUser(authUser.userId);
    if (!stylist) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NO_PROFILE', message: 'No creator profile for this account' },
      }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const data = validateOrThrow(voteSchema, body);

    // 'save'/'unsave' have no real backing table (community_posts/post_likes only
    // model likes) — rather than keep faking it against an in-memory array, be
    // honest that it isn't built yet.
    if (data.action === 'save' || data.action === 'unsave') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Saving posts is not available yet' },
      }, { status: 501 });
    }

    const post = await prisma.community_posts.findUnique({ where: { id: data.post_id } });
    if (!post) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'POST_NOT_FOUND', message: 'Community post not found' },
      }, { status: 404 });
    }

    const existing = await prisma.post_likes.findUnique({
      where: { post_id_user_id: { post_id: data.post_id, user_id: stylist.id } },
    });

    let likeCount = post.like_count;
    if (data.action === 'like') {
      if (!existing) {
        await prisma.$transaction([
          prisma.post_likes.create({ data: { post_id: data.post_id, user_id: stylist.id } }),
          prisma.community_posts.update({ where: { id: data.post_id }, data: { like_count: { increment: 1 } } }),
        ]);
        likeCount += 1;
      }
    } else if (data.action === 'unlike') {
      if (existing) {
        await prisma.$transaction([
          prisma.post_likes.delete({ where: { id: existing.id } }),
          prisma.community_posts.update({ where: { id: data.post_id }, data: { like_count: { decrement: 1 } } }),
        ]);
        likeCount = Math.max(0, likeCount - 1);
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { post_id: data.post_id, action: data.action, likes: likeCount, saves: 0 },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process vote';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'VOTE_FAILED', message },
    }, { status: 500 });
  }
}
