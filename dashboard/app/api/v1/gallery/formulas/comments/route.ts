import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/v1/gallery/formulas/comments?formulaId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const formulaId = searchParams.get('formulaId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!formulaId) {
      return NextResponse.json({ error: 'formulaId required' }, { status: 400 })
    }

    const [comments, total] = await Promise.all([
      prisma.formula_comments.findMany({
        where: { formula_id: formulaId, parent_id: null },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.formula_comments.count({ where: { formula_id: formulaId, parent_id: null } }),
    ])

    // Fetch replies for each top-level comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (c) => {
        const replies = await prisma.formula_comments.findMany({
          where: { parent_id: c.id },
          orderBy: { created_at: 'asc' },
        })
        return { ...c, replies }
      })
    )

    return NextResponse.json({ items: commentsWithReplies, total, limit, offset })
  } catch (error) {
    console.error('Formula comments GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST /api/v1/gallery/formulas/comments
export async function POST(req: NextRequest) {
  try {
    const { formulaId, authorId, authorType, content, rating, tags, parentId, isAi } = await req.json()

    if (!formulaId || !authorId || !content) {
      return NextResponse.json({ error: 'formulaId, authorId, and content required' }, { status: 400 })
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })
    }

    const comment = await prisma.formula_comments.create({
      data: {
        formula_id: formulaId,
        author_id: authorId,
        author_type: authorType || 'stylist',
        content,
        rating: rating || null,
        tags: tags || [],
        parent_id: parentId || null,
        is_ai: isAi || false,
      },
    })

    return NextResponse.json({ id: comment.id, createdAt: comment.created_at }, { status: 201 })
  } catch (error) {
    console.error('Formula comments POST error:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}