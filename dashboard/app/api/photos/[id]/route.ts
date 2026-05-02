import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

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

    // TODO: Replace with actual Prisma call
    // const photo = await prisma.photo.findUnique({
    //   where: { id },
    //   include: {
    //     session: true,
    //     analysisResult: true,
    //   },
    // });
    //
    // if (!photo) {
    //   return NextResponse.json(
    //     { error: 'Photo not found' },
    //     { status: 404 }
    //   );
    // }

    // Stub response — aligned with dashboard/types/camera.ts
    const photo = {
      id,
      sessionId: null,
      angle: 'roots',
      url: `https://storage.example.com/photos/${id}.jpg`,
      storageKey: `photos/${id}.jpg`,
      sizeBytes: 2048000,
      mimeType: 'image/jpeg',
      analysisStatus: 'pending',
      colorProfile: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysisResult: null,
    };

    return NextResponse.json({ success: true, data: photo });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch photo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
