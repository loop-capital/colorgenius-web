import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/v1/gallery/feed — Trending/top gallery feed
// Query params: sort=score|recent|featured, tone=N|A|G|K|R|V|P|B|M|Ch|W|C, level=1-10, limit=20, offset=0
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sort = searchParams.get('sort') || 'recent'
    const tone = searchParams.get('tone')
    const level = searchParams.get('level')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = { is_approved: true }
    if (tone) where.tone_after = tone
    if (tone) where.tone_before = tone // Search both directions
    if (level) {
      where.OR = [
        { level_after: parseInt(level) },
        { level_before: parseInt(level) },
      ]
    }
    if (sort === 'featured') where.is_featured = true

    const orderBy: any =
      sort === 'score' ? { score: 'desc' as const } :
      sort === 'featured' ? { is_featured: 'desc' as const, score: 'desc' as const } :
      { created_at: 'desc' as const }

    const [photos, total] = await Promise.all([
      prisma.formula_photos.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          photo_tags: { select: { tag: true } },
          _count: { select: { photo_comments: true } },
        },
      }),
      prisma.formula_photos.count({ where }),
    ])

    return NextResponse.json({
      items: photos.map(p => ({
        id: p.id,
        formulaId: p.formula_id,
        stylistId: p.stylist_id,
        beforeUrl: p.before_url,
        afterUrl: p.after_url,
        caption: p.caption,
        hairType: p.hair_type,
        porosity: p.porosity,
        levelBefore: p.level_before,
        levelAfter: p.level_after,
        toneBefore: p.tone_before,
        toneAfter: p.tone_after,
        isFeatured: p.is_featured,
        upvotes: p.upvotes,
        downvotes: p.downvotes,
        score: p.score,
        tags: p.photo_tags.map(t => t.tag),
        commentCount: p._count.photo_comments,
        createdAt: p.created_at,
      })),
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Gallery feed GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 })
  }
}