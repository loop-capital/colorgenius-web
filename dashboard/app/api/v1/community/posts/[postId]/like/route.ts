import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/v1/community/posts/[postId]/like — toggle like
export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

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
