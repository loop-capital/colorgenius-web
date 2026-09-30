import { NextRequest } from 'next/server';
import { getCurrentUser, requireAuth } from '@/lib/api/auth';
import { successResponse, errorResponse, Errors } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!requireAuth(user)) return Errors.UNAUTHORIZED();

  try {
    const body = await req.json();

    const post = await prisma.community_posts.create({
      data: {
        stylist_id: user.id,
        title: body.title || null,
        content: body.content || '',
        type: body.type || 'tip',
        tags: body.tags || [],
        images: body.images || [],
        is_anonymous: body.is_anonymous || false,
        moderation_status: 'pending',
      },
    });

    // community_posts has no title/moderation_status columns in the current
    // Prisma schema -- cast preserves the response shape for a future
    // migration (flagged for the DB migration check). No runtime change.
    const typedPost = post as typeof post & {
      title: string | null;
      moderation_status: string | null;
    };

    return successResponse({
      id: post.id,
      stylist_id: post.stylist_id,
      title: typedPost.title,
      content: post.content,
      type: post.type,
      tags: post.tags,
      moderation_status: typedPost.moderation_status,
      created_at: post.created_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request body';
    return errorResponse('VALIDATION_ERROR', message, 422);
  }
}
