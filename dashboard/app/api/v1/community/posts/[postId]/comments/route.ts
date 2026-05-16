import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/v1/community/posts/[postId]/comments — fetch comments
export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = (page - 1) * limit

    const comments = await prisma.post_comments.findMany({
      where: {
        post_id: postId,
        is_approved: true,
        parent_id: null, // top-level only
      },
      orderBy: { created_at: 'asc' },
      skip: offset,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
            first_name: true,
            last_name: true,
            instagram_handle: true,
            avatar_url: true,
            creator_tier: true,
            is_verified: true,
          },
        },
      },
    })

    const items = comments.map((c) => ({
      id: c.id,
      content: c.content,
      parentId: c.parent_id,
      isApproved: c.is_approved,
      isFlagged: c.is_flagged,
      createdAt: c.created_at,
      author: {
        id: c.author.id,
        name: c.author.display_name || `${c.author.first_name} ${c.author.last_name}`,
        handle: c.author.instagram_handle,
        avatar: c.author.avatar_url,
        tier: c.author.creator_tier,
        isVerified: c.author.is_verified,
      },
    }))

    return NextResponse.json({ items })
  } catch (error: any) {
    console.error('Comments fetch error:', error)
    return NextResponse.json({ items: [], error: error.message }, { status: 500 })
  }
}

// POST /api/v1/community/posts/[postId]/comments — add comment
export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params
    const body = await req.json()
    const { userId, content, parentId } = body

    if (!userId || !content?.trim()) {
      return NextResponse.json({ error: 'userId and content required' }, { status: 400 })
    }

    // Check if user is verified (auto-approve) or new (needs approval)
    const user = await prisma.stylists.findUnique({
      where: { id: userId },
      select: { is_verified: true, is_active: true },
    })

    if (!user?.is_active) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    const autoApprove = user.is_verified === true

    const comment = await prisma.$transaction([
      prisma.post_comments.create({
        data: {
          post_id: postId,
          author_id: userId,
          content: content.trim(),
          parent_id: parentId || null,
          is_approved: autoApprove,
        },
      }),
      prisma.community_posts.update({
        where: { id: postId },
        data: { comment_count: { increment: 1 } },
      }),
    ])

    return NextResponse.json({
      id: comment[0].id,
      isApproved: autoApprove,
      message: autoApprove ? 'Comment posted' : 'Comment submitted for review',
    })
  } catch (error: any) {
    console.error('Comment create error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
