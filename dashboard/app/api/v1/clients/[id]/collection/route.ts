// ============================================================
// GET /api/v1/clients/[id]/collection — Get client's saved photos
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAuth } from '@/lib/api/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!requireAuth(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const clientId = id;

    // Only allow accessing own collection
    if (clientId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden — can only access own collection' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build where clause
    const where: any = { client_id: clientId };
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.client_photo_collections.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { created_at: 'desc' },
        include: {
          photo: {
            include: {
              formulas: true,
              stylists: true,
              photo_tags: true,
            },
          },
        },
      }),
      prisma.client_photo_collections.count({ where }),
    ]);

    const response = items.map((item: any) => {
      const photo = item.photo;
      return {
        id: item.id,
        photoId: item.photo_id,
        formulaId: photo.formula_id,
        beforeUrl: photo.before_url,
        afterUrl: photo.after_url,
        caption: photo.caption,
        brand: null, // TODO: fetch brand separately or add relation
        shades: [],
        stylistName: photo.stylists
          ? `${photo.stylists.first_name} ${photo.stylists.last_name || ''}`.trim()
          : null,
        tags: photo.photo_tags?.map((t: any) => t.tag) || [],
        upvotes: photo.upvotes || 0,
        downvotes: photo.downvotes || 0,
        commentCount: 0,
        viewCount: photo.view_count || 0,
        score: photo.score || 0,
        notes: item.notes,
        status: item.status,
        sharedWithStylistId: item.shared_with_stylist_id,
        sharedAt: item.shared_at,
        createdAt: item.created_at,
      };
    });

    return NextResponse.json({
      items: response,
      total,
      limit,
      offset,
      hasMore: offset + items.length < total,
    });
  } catch (error) {
    console.error('GET client collection error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection', message: (error as Error).message },
      { status: 500 }
    );
  }
}
