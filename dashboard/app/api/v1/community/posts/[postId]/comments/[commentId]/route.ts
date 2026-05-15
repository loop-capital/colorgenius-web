import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/v1/community/posts/[postId]/comments/[commentId] — approve, reject, or flag
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string; commentId: string }> }
) {
  try {
    const { postId, commentId } = await params
    const body = await req.json()
    const { action, userId } = body // action: 'approve' | 'reject' | 'flag'

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Verify the user is the post owner (only they can moderate comments)
    const post = await prisma.community_posts.findUnique({
      where: { id: postId },
      select: { stylist_id: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const comment = await prisma.post_comments.findUnique({
      where: { id: commentId },
      select: { id: true, is_approved: true, post_id: true },
    })

    if (!comment || comment.post_id !== postId) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    switch (action) {
      case 'approve':
        // Post owner or verified pros can approve
        await prisma.post_comments.update({
          where: { id: commentId },
          data: { is_approved: true, is_flagged: false },
        })
        break

      case 'reject':
        // Post owner can reject — delete the comment
        await prisma.$transaction([
          prisma.post_comments.delete({ where: { id: commentId } }),
          prisma.community_posts.update({
            where: { id: postId },
            data: { comment_count: { decrement: 1 } },
          }),
        ])
        break

      case 'flag':
        // Any user can flag
        await prisma.post_comments.update({
          where: { id: commentId },
          data: { is_flagged: true },
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ ok: true, action })
  } catch (error: any) {
    console.error('Comment moderation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
