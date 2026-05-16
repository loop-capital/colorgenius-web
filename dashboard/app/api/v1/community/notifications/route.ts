import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/v1/community/notifications — pending comments on user's posts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Get all pending comments on the user's posts
    const pendingComments = await prisma.post_comments.findMany({
      where: {
        is_approved: false,
        post: { stylist_id: userId },
      },
      orderBy: { created_at: 'desc' },
      take: 50,
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
            first_name: true,
            last_name: true,
            instagram_handle: true,
            avatar_url: true,
            is_verified: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            type: true,
          },
        },
      },
    })

    // Also get recent approved comments (last 7 days) for notifications
    const recentComments = await prisma.post_comments.findMany({
      where: {
        is_approved: true,
        post: { stylist_id: userId },
        author_id: { not: userId }, // exclude own comments
        created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { created_at: 'desc' },
      take: 20,
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
            first_name: true,
            last_name: true,
            instagram_handle: true,
            avatar_url: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    })

    // Recent likes on user's posts
    const recentLikes = await prisma.post_likes.findMany({
      where: {
        post: { stylist_id: userId },
        user_id: { not: userId },
        created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { created_at: 'desc' },
      take: 20,
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            first_name: true,
            last_name: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    })

    return NextResponse.json({
      pending: pendingComments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.created_at,
        post: { id: c.post.id, preview: c.post.content?.substring(0, 80) },
        author: {
          id: c.author.id,
          name: c.author.display_name || `${c.author.first_name} ${c.author.last_name}`,
          handle: c.author.instagram_handle,
          avatar: c.author.avatar_url,
          isVerified: c.author.is_verified,
        },
      })),
      recentComments: recentComments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.created_at,
        post: { id: c.post.id, preview: c.post.content?.substring(0, 80) },
        author: {
          id: c.author.id,
          name: c.author.display_name || `${c.author.first_name} ${c.author.last_name}`,
          handle: c.author.instagram_handle,
        },
      })),
      recentLikes: recentLikes.map((l) => ({
        createdAt: l.created_at,
        post: { id: l.post.id, preview: l.post.content?.substring(0, 80) },
        user: {
          id: l.user.id,
          name: l.user.display_name || `${l.user.first_name} ${l.user.last_name}`,
        },
      })),
      counts: {
        pending: pendingComments.length,
        recentComments: recentComments.length,
        recentLikes: recentLikes.length,
      },
    })
  } catch (error: any) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json({ pending: [], error: error.message }, { status: 500 })
  }
}
