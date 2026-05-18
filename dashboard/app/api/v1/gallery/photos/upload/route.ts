import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAuth } from '@/lib/api/auth';
import { uploadToR2 } from '@/lib/r2';

// POST /api/v1/gallery/photos/upload — Upload before/after photo pair
// Accepts multipart/form-data with files + metadata
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!requireAuth(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const formulaId = formData.get('formulaId') as string;
    const stylistId = user.id;
    const clientId = formData.get('clientId') as string | null;
    const caption = formData.get('caption') as string | null;
    const hairType = formData.get('hairType') as string | null;
    const porosity = formData.get('porosity') as string | null;
    const levelBefore = formData.get('levelBefore') as string | null;
    const levelAfter = formData.get('levelAfter') as string | null;
    const toneBefore = formData.get('toneBefore') as string | null;
    const toneAfter = formData.get('toneAfter') as string | null;
    const developerVol = formData.get('developerVol') as string | null;
    const processingTime = formData.get('processingTime') as string | null;
    const tagsRaw = formData.get('tags') as string | null;

    const afterFile = formData.get('after') as File | null;
    const beforeFile = formData.get('before') as File | null;

    if (!formulaId || !afterFile) {
      return NextResponse.json({ error: 'formulaId and after photo are required' }, { status: 400 });
    }

    const afterExt = afterFile.type.split('/')[1] || 'jpg';
    const afterKey = `gallery/${stylistId}/${formulaId}/after-${Date.now()}.${afterExt}`;
    const afterUrl = await uploadToR2(afterKey, Buffer.from(await afterFile.arrayBuffer()), afterFile.type);

    let beforeUrl: string | null = null;
    if (beforeFile) {
      const beforeExt = beforeFile.type.split('/')[1] || 'jpg';
      const beforeKey = `gallery/${stylistId}/${formulaId}/before-${Date.now()}.${beforeExt}`;
      beforeUrl = await uploadToR2(beforeKey, Buffer.from(await beforeFile.arrayBuffer()), beforeFile.type);
    }

    const tags = tagsRaw ? JSON.parse(tagsRaw) : [];

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
    });

    if (tags.length > 0) {
      await prisma.formula_photo_tags.createMany({
        data: tags.map((tag: string) => ({ photo_id: photo.id, tag })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      id: photo.id,
      afterUrl: photo.after_url,
      beforeUrl: photo.before_url,
      createdAt: photo.created_at,
    }, { status: 201 });
  } catch (error) {
    console.error('Gallery photo upload error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}
