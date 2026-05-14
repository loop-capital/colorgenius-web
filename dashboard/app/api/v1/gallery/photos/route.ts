import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/v1/gallery/photos?formulaId=...&stylistId=...&sort=score|recent&limit=20&offset=0
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const formulaId = searchParams.get('formulaId')
    const stylistId = searchParams.get('stylistId')
    const sort = searchParams.get('sort') || 'recent' // 'score' | 'recent' | 'featured'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = { is_approved: true }
    if (formulaId) where.formula_id = formulaId
    if (stylistId) where.stylist_id = stylistId
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
        clientId: p.client_id,
        beforeUrl: p.before_url,
        afterUrl: p.after_url,
        caption: p.caption,
        hairType: p.hair_type,
        porosity: p.porosity,
        levelBefore: p.level_before,
        levelAfter: p.level_after,
        toneBefore: p.tone_before,
        toneAfter: p.tone_after,
        developerVol: p.developer_vol,
        processingTime: p.processing_time,
        isFeatured: p.is_featured,
        upvotes: p.upvotes,
        downvotes: p.downvotes,
        score: p.score,
        viewCount: p.view_count,
        tags: p.photo_tags.map(t => t.tag),
        commentCount: p._count.photo_comments,
        createdAt: p.created_at,
      })),
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Gallery photos GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
}

// POST /api/v1/gallery/photos — Create a new photo post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      formulaId, stylistId, clientId, beforeUrl, afterUrl,
      caption, hairType, porosity, levelBefore, levelAfter,
      toneBefore, toneAfter, developerVol, processingTime, tags,
    } = body

    if (!formulaId || !stylistId || !afterUrl) {
      return NextResponse.json({ error: 'formulaId, stylistId, and afterUrl are required' }, { status: 400 })
    }

    const photo = await prisma.formula_photos.create({
      data: {
        formula_id: formulaId,
        stylist_id: stylistId,
        client_id: clientId || null,
        before_url: beforeUrl || null,
        after_url: afterUrl,
        caption: caption || null,
        hair_type: hairType || null,
        porosity: porosity || null,
        level_before: levelBefore || null,
        level_after: levelAfter || null,
        tone_before: toneBefore || null,
        tone_after: toneAfter || null,
        developer_vol: developerVol || null,
        processing_time: processingTime || null,
      },
    })

    // Create tags if provided
    if (Array.isArray(tags) && tags.length > 0) {
      await prisma.formula_photo_tags.createMany({
        data: tags.map((tag: string) => ({ photo_id: photo.id, tag })),
      })
    }

    // Increment view count on the formula
    await prisma.formula_photos.update({ where: { id: photo.id }, data: { view_count: 1 } })

    return NextResponse.json({ id: photo.id, createdAt: photo.created_at }, { status: 201 })
  } catch (error) {
    console.error('Gallery photos POST error:', error)
    return NextResponse.json({ error: 'Failed to create photo' }, { status: 500 })
  }
}