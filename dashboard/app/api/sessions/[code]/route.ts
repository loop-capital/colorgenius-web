import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/sessions/[code]
 * Retrieve a single photo session by its 4-digit code or session ID.
 *
 * Response:
 *   200: { success: true, data: FormulationSession }
 *   404: { error: "Session not found" }
 *   500: { error: "Internal server error" }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Try session code first (4-digit code lookup)
    const sessionCode = await prisma.session_codes.findFirst({
      where: { code, used: false, expiresAt: { gt: new Date() } },
    });

    const session = sessionCode
      ? await prisma.formulation_sessions.findUnique({ where: { id: sessionCode.formulationSessionId! } })
      : await prisma.formulation_sessions.findUnique({ where: { id: code } });

    if (!session) {
      return NextResponse.json({ error: 'Session not found or code expired' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        clientId: session.clientId,
        stylistId: session.stylistId,
        salonId: session.salonId,
        status: session.status,
        photoUrl: session.photoUrl,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        completedAt: session.completedAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
