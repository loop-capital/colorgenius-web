import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/sessions
 * Create a formulation session and generate a 4-digit code for phone-to-iPad photo transfer.
 *
 * Request body:
 *   - salonId: string (required)
 *   - stylistId: string (optional)
 *   - clientId: string (optional)
 *
 * Response:
 *   201: { success: true, data: { sessionId, code, expiresAt } }
 *   400: { error: "Missing required fields" }
 *   500: { error: "Internal server error" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.salonId) {
      return NextResponse.json(
        { error: 'Missing required field: salonId' },
        { status: 400 }
      );
    }

    // Create formulation session
    const session = await prisma.formulation_sessions.create({
      data: {
        salonId: body.salonId,
        stylistId: body.stylistId || null,
        clientId: body.clientId || null,
        status: 'active',
      },
    });

    // Generate 4-digit random code
    const code = String(Math.floor(1000 + Math.random() * 9000));

    // 10-minute expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Create session code
    await prisma.session_codes.create({
      data: {
        salonId: body.salonId,
        code,
        formulationSessionId: session.id,
        expiresAt,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          sessionId: session.id,
          code,
          expiresAt: expiresAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/sessions?code=XXXX
 * Look up a session by its 4-digit code.
 *
 * Query params:
 *   - code: string (required, 4-digit code)
 *
 * Response:
 *   200: { success: true, data: formulation_session + photoUrl }
 *   400: { error: "Missing code" }
 *   404: { error: "Session not found or code expired/used" }
 *   500: { error: "Internal server error" }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Missing required query param: code' },
        { status: 400 }
      );
    }

    const sessionCode = await prisma.session_codes.findFirst({
      where: {
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!sessionCode) {
      return NextResponse.json(
        { error: 'Session not found or code expired/used' },
        { status: 404 }
      );
    }

    const session = await prisma.formulation_sessions.findUnique({
      where: { id: sessionCode.formulationSessionId! },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        salonId: session.salonId,
        stylistId: session.stylistId,
        clientId: session.clientId,
        status: session.status,
        photoUrl: session.photoUrl,
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
