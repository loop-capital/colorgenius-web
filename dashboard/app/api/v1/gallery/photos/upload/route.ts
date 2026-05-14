import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/v1/gallery/photos/upload — Upload before/after photo pair
// Accepts multipart/form-data with files + metadata
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const formulaId = formData.get('formulaId') as string
    const stylistId = formData.get('stylistId') as string
    const clientId = formData.get('clientId') as string | null
    const caption = formData.get('caption') as string | null
    const hairType = formData.get('hairType') as string | null
    const porosity = formData.get('porosity') as string | null
    const levelBefore = formData.get('levelBefore') as string | null
    const levelAfter = formData.get('levelAfter') as string | null
    const toneBefore = formData.get('toneBefore') as string | null
    const toneAfter = formData.get('toneAfter') as string | null
    const developerVol = formData.get('developerVol') as string | null
    const processingTime = formData.get('processingTime') as string | null
    const tagsRaw = formData.get('tags') as string | null

    const afterFile = formData.get('after') as File | null
    const beforeFile = formData.get('before') as File | null

    if (!formulaId || !stylistId || !afterFile) {
      return NextResponse.json({ error: 'formulaId, stylistId, and after photo are required' }, { status: 400 })
    }

    // In production, upload files to S3/R2/Supabase Storage
    // For now, create object URLs as placeholders
    // TODO: Replace with actual storage upload
    const afterUrl = `/uploads/gallery/${afterFile.name}`
    let beforeUrl: string | null = null
    if (beforeFile) {
      beforeUrl = `/uploads/gallery/${beforeFile.name}`
    }

    const tags = tagsRaw ? JSON.parse(tagsRaw) : []

    const photo = await prisma.formula_photos.create({
      data: {
        formula_id: formulaId,
        stylist_id: stylistId,
        client_id: clientId || null,
        before_url: beforeUrl,
        after_url: afterUrl,
        caption: caption || null,
        hair_type: hairType || null,
        porosity: porosity || null,
        level_before: levelBefore ? parseInt(levelBefore) : null,
        level_after: levelAfter ? parseInt(levelAfter) : null,
        tone_before: toneBefore || null,
        tone_after: toneAfter || null,
        developer_vol: developerVol ? parseInt(developerVol) : null,
        processing_time: processingTime ? parseInt(processingTime) : null,
      },
    })

    // Create tags
    if (tags.length > 0) {
      await prisma.formula_photo_tags.createMany({
        data: tags.map((tag: string) => ({ photo_id: photo.id, tag })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({
      id: photo.id,
      afterUrl: photo.after_url,
      beforeUrl: photo.before_url,
      createdAt: photo.created_at,
    }, { status: 201 })
  } catch (error) {
    console.error('Gallery photo upload error:', error)
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
  }
}