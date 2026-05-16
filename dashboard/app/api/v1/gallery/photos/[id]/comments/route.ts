import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/v1/gallery/photos/[id]/comments
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const comments = await prisma.formula_photo_comments.findMany({
      where: { photo_id: id },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.formula_photo_comments.count({ where: { photo_id: id } })

    return NextResponse.json({ items: comments, total, limit, offset })
  } catch (error) {
    console.error('Photo comments GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST /api/v1/gallery/photos/[id]/comments
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { authorId, authorType, content, tags, isAi } = await req.json()

    if (!authorId || !content) {
      return NextResponse.json({ error: 'authorId and content required' }, { status: 400 })
    }

    // Verify photo exists
    const photo = await prisma.formula_photos.findUnique({ where: { id } })
    if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

    const comment = await prisma.formula_photo_comments.create({
      data: {
        photo_id: id,
        author_id: authorId,
        author_type: authorType || 'stylist',
        content,
        tags: tags || [],
        is_ai: isAi || false,
      },
    })

    return NextResponse.json({ id: comment.id, createdAt: comment.created_at }, { status: 201 })
  } catch (error) {
    console.error('Photo comments POST error:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}