import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/photos/[id]
 * Retrieve photo metadata and current analysis status.
 *
 * Response:
 *   200: { success: true, data: Photo }
 *   404: { error: "Photo not found" }
 *   500: { error: "Internal server error" }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const photo = await prisma.photo_analyses.findUnique({
      where: { id },
      select: {
        id: true,
        photo_type: true,
        photo_label: true,
        original_url: true,
        file_size_bytes: true,
        format: true,
        processing_status: true,
        results: true,
        created_at: true,
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: photo.id,
        sessionId: photo.photo_label, // stored here from upload
        angle: photo.photo_type,
        url: photo.original_url,
        storageKey: null, // not stored separately; derivable from original_url if needed
        sizeBytes: photo.file_size_bytes,
        mimeType: photo.format ? `image/${photo.format}` : null,
        analysisStatus: photo.processing_status,
        colorProfile: photo.results ? (photo.results as any).colorProfile ?? null : null,
        createdAt: photo.created_at?.toISOString() ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch photo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
