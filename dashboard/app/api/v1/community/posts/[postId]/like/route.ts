import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { getOrCreateStylistForUser } from '@/lib/stylist'

// POST /api/v1/community/posts/[postId]/like — toggle like
// Previously took userId straight from the request body — anyone could
// like/unlike as any user, repeatedly, with no auth at all.
export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const stylist = await getOrCreateStylistForUser(user.userId)
    if (!stylist) {
      return NextResponse.json({ error: 'Could not resolve your stylist profile' }, { status: 400 })
    }
    const userId = stylist.id

    const { postId } = await params

    // Check if already liked
    const existing = await prisma.post_likes.findUnique({
      where: { post_id_user_id: { post_id: postId, user_id: userId } },
    })

    if (existing) {
      // Unlike
      await prisma.$transaction([
        prisma.post_likes.delete({ where: { id: existing.id } }),
        prisma.community_posts.update({
          where: { id: postId },
          data: { like_count: { decrement: 1 } },
        }),
      ])
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.$transaction([
        prisma.post_likes.create({
          data: { post_id: postId, user_id: userId },
        }),
        prisma.community_posts.update({
          where: { id: postId },
          data: {
            like_count: { increment: 1 },
            // Update ranking score: likes boost recency-weighted score
            score: { increment: 1 },
          },
        }),
      ])
      return NextResponse.json({ liked: true })
    }
  } catch (error: any) {
    console.error('Like toggle error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
