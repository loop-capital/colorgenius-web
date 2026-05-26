// ============================================================
// POST /api/v1/gallery/photos/[id]/save — Save photo to client collection
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAuth } from '@/lib/api/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!requireAuth(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const photoId = id;

    // Verify photo exists
    const photo = await prisma.formula_photos.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Upsert the collection entry
    const collection = await prisma.client_photo_collections.upsert({
      where: {
        client_id_photo_id: {
          client_id: user.id,
          photo_id: photoId,
        },
      },
      update: {
        status: 'saved',
        updated_at: new Date(),
      },
      create: {
        client_id: user.id,
        photo_id: photoId,
        status: 'saved',
      },
    });

    return NextResponse.json({
      id: collection.id,
      photoId: collection.photo_id,
      clientId: collection.client_id,
      status: collection.status,
      createdAt: collection.created_at,
    });
  } catch (error) {
    console.error('POST save photo error:', error);
    return NextResponse.json(
      { error: 'Failed to save photo', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/v1/gallery/photos/[id]/save — Remove from collection
// ============================================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!requireAuth(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const photoId = id;

    await prisma.client_photo_collections.deleteMany({
      where: {
        client_id: user.id,
        photo_id: photoId,
      },
    });

    return NextResponse.json({ success: true, message: 'Photo removed from collection' });
  } catch (error) {
    console.error('DELETE unsave photo error:', error);
    return NextResponse.json(
      { error: 'Failed to remove photo', message: (error as Error).message },
      { status: 500 }
    );
  }
}
