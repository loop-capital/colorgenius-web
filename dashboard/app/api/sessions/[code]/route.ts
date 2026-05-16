import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

/**
 * GET /api/sessions/[code]
 * Retrieve a single photo session (by code or id) with its photos and analysis results.
 *
 * Response:
 *   200: { success: true, data: PhotoSession }
 *   404: { error: "Session not found" }
 *   500: { error: "Internal server error" }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // TODO: Replace with actual Prisma call — try code first, then id
    // const sessionCode = await prisma.session_codes.findFirst({
    //   where: { code, used: false, expiresAt: { gt: new Date() } },
    // });
    // const session = sessionCode
    //   ? await prisma.formulation_sessions.findUnique({ where: { id: sessionCode.formulationSessionId! } })
    //   : await prisma.formulation_sessions.findUnique({ where: { id: code } });

    // Stub response — aligned with dashboard/types/camera.ts
    const session = {
      id: code,
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
