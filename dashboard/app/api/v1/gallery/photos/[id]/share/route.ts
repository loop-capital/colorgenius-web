// ============================================================
// POST /api/v1/gallery/photos/[id]/share — Share with stylist
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
    const body = await req.json().catch(() => ({}));
    const { stylistId } = body;

    if (!stylistId) {
      return NextResponse.json(
        { error: 'stylistId is required' },
        { status: 400 }
      );
    }

    // Verify stylist exists
    const stylist = await prisma.stylists.findUnique({
      where: { id: stylistId },
    });

    if (!stylist) {
      return NextResponse.json(
        { error: 'Stylist not found' },
        { status: 404 }
      );
    }

    // Update existing collection entry or create new one
    const existing = await prisma.client_photo_collections.findUnique({
      where: {
        client_id_photo_id: {
          client_id: user.id,
          photo_id: photoId,
        },
      },
    });

    if (existing) {
      await prisma.client_photo_collections.update({
        where: { id: existing.id },
        data: {
          shared_with_stylist_id: stylistId,
          shared_at: new Date(),
          status: 'booked',
          updated_at: new Date(),
        },
      });
    } else {
      await prisma.client_photo_collections.create({
        data: {
          client_id: user.id,
          photo_id: photoId,
          shared_with_stylist_id: stylistId,
          shared_at: new Date(),
          status: 'booked',
        },
      });
    }

    return NextResponse.json({
      success: true,
      photoId,
      sharedWithStylistId: stylistId,
      status: 'booked',
    });
  } catch (error) {
    console.error('POST share photo error:', error);
    return NextResponse.json(
      { error: 'Failed to share photo', message: (error as Error).message },
      { status: 500 }
    );
  }
}
