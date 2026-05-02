import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

/**
 * GET /api/sessions/[id]
 * Retrieve a single photo session with its photos and analysis results.
 *
 * Response:
 *   200: { success: true, data: PhotoSession }
 *   404: { error: "Session not found" }
 *   500: { error: "Internal server error" }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Replace with actual Prisma call
    // const session = await prisma.photoSession.findUnique({
    //   where: { id },
    //   include: {
    //     photos: {
    //       orderBy: { createdAt: 'asc' },
    //     },
    //     analysisResults: {
    //       include: { photo: true },
    //     },
    //   },
    // });
    //
    // if (!session) {
    //   return NextResponse.json(
    //     { error: 'Session not found' },
    //     { status: 404 }
    //   );
    // }

    // Stub response — aligned with dashboard/types/camera.ts
    const session = {
      id,
      clientId: null,
      stylistId: null,
      hairType: '4c',
      lightingConditions: { source: 'natural', notes: 'Window light, overcast' },
      status: 'capturing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      photos: [],
      analysisResults: [],
    };

    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
