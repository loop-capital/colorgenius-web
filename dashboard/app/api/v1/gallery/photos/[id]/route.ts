import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth'
import { getOrCreateStylistForUser } from '@/lib/stylist'
import { requireAdmin } from '@/lib/admin'

const prisma = new PrismaClient()

// GET /api/v1/gallery/photos/[id] — Get single photo with comments
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const photo = await prisma.formula_photos.findUnique({
      where: { id },
      include: {
        photo_tags: { select: { tag: true } },
        photo_comments: {
          orderBy: { created_at: 'desc' },
          take: 50,
        },
      },
    })

    if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Increment view count
    await prisma.formula_photos.update({ where: { id }, data: { view_count: { increment: 1 } } })

    return NextResponse.json({
      id: photo.id,
      formulaId: photo.formula_id,
      stylistId: photo.stylist_id,
      clientId: photo.client_id,
      beforeUrl: photo.before_url,
      afterUrl: photo.after_url,
      caption: photo.caption,
      hairType: photo.hair_type,
      porosity: photo.porosity,
      levelBefore: photo.level_before,
      levelAfter: photo.level_after,
      toneBefore: photo.tone_before,
      toneAfter: photo.tone_after,
      developerVol: photo.developer_vol,
      processingTime: photo.processing_time,
      isFeatured: photo.is_featured,
      upvotes: photo.upvotes,
      downvotes: photo.downvotes,
      score: photo.score,
      viewCount: photo.view_count,
      tags: photo.photo_tags.map(t => t.tag),
      comments: photo.photo_comments,
      createdAt: photo.created_at,
    })
  } catch (error) {
    console.error('Photo GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 })
  }
}

// PATCH /api/v1/gallery/photos/[id] — Update photo (caption, featured, etc.)
// Previously had no auth at all — anyone could edit any photo's caption, or
// flip is_featured/is_approved (a moderation control) on any post.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const photo = await prisma.formula_photos.findUnique({ where: { id }, select: { stylist_id: true } })
    if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const update: any = {}

    // isFeatured/isApproved are moderation controls — admin only.
    if (body.isFeatured !== undefined || body.isApproved !== undefined) {
      const admin = await requireAdmin(req)
      if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (body.isFeatured !== undefined) update.is_featured = body.isFeatured
      if (body.isApproved !== undefined) update.is_approved = body.isApproved
    }

    // caption may only be edited by the photo's own creator.
    if (body.caption !== undefined) {
      const stylist = await getOrCreateStylistForUser(user.userId)
      if (!stylist || stylist.id !== photo.stylist_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      update.caption = body.caption
    }

    const updated = await prisma.formula_photos.update({ where: { id }, data: update })
    return NextResponse.json({ id: updated.id, updated: true })
  } catch (error) {
    console.error('Photo PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 })
  }
}

// DELETE /api/v1/gallery/photos/[id] — the photo's own creator, or an admin.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const photo = await prisma.formula_photos.findUnique({ where: { id }, select: { stylist_id: true } })
    if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const stylist = await getOrCreateStylistForUser(user.userId)
    const isOwner = stylist && stylist.id === photo.stylist_id
    if (!isOwner && !(await requireAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.formula_photos.delete({ where: { id } })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Photo DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}