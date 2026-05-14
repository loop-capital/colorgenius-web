import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/v1/gallery/photos/[id]/tags
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const tags = await prisma.formula_photo_tags.findMany({ where: { photo_id: id } })
    return NextResponse.json({ tags: tags.map(t => t.tag) })
  } catch (error) {
    console.error('Photo tags GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

// POST /api/v1/gallery/photos/[id]/tags — Add tags to a photo
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { tags } = await req.json() as { tags: string[] }

    if (!Array.isArray(tags)) {
      return NextResponse.json({ error: 'tags must be an array' }, { status: 400 })
    }

    const photo = await prisma.formula_photos.findUnique({ where: { id } })
    if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

    // Only create tags that don't already exist
    const existing = await prisma.formula_photo_tags.findMany({ where: { photo_id: id } })
    const existingTags = new Set(existing.map(t => t.tag))
    const newTags = tags.filter(t => !existingTags.has(t))

    if (newTags.length > 0) {
      await prisma.formula_photo_tags.createMany({
        data: newTags.map(tag => ({ photo_id: id, tag })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({ added: newTags.length, tags: [...existingTags, ...newTags] })
  } catch (error) {
    console.error('Photo tags POST error:', error)
    return NextResponse.json({ error: 'Failed to add tags' }, { status: 500 })
  }
}