import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

/**
 * POST /api/sessions
 * Create a new photo session for camera capture workflow.
 *
 * Request body:
 *   - clientId: string (optional, link to existing client)
 *   - stylistId: string (optional, defaults to authenticated stylist)
 *   - hairType: string (e.g., "4c", "3b", "2a")
 *   - porosityLevel: "low" | "medium" | "high"
 *   - condition: "virgin" | "colored" | "damaged" | etc.
 *   - lightingConditions: "natural" | "fluorescent" | "led" | etc.
 *
 * Response:
 *   201: { success: true, data: { id, status, createdAt, ... } }
 *   400: { error: "Missing required fields" }
 *   401: { error: "Unauthorized" }
 *   500: { error: "Internal server error" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['hairType', 'porosityLevel', 'condition', 'lightingConditions'];
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate enum values
    const validPorosity = ['low', 'medium', 'high'];
    if (!validPorosity.includes(body.porosityLevel)) {
      return NextResponse.json(
        { error: `Invalid porosityLevel. Must be one of: ${validPorosity.join(', ')}` },
        { status: 400 }
      );
    }

    const validLighting = ['natural', 'fluorescent', 'led', 'tungsten', 'mixed'];
    if (!validLighting.includes(body.lightingConditions)) {
      return NextResponse.json(
        { error: `Invalid lightingConditions. Must be one of: ${validLighting.join(', ')}` },
        { status: 400 }
      );
    }

    // TODO: Replace with actual Prisma call
    // const session = await prisma.photoSession.create({
    //   data: {
    //     clientId: body.clientId,
    //     stylistId: body.stylistId || authenticatedStylistId,
    //     hairType: body.hairType,
    //     porosityLevel: body.porosityLevel,
    //     condition: body.condition,
    //     lightingConditions: body.lightingConditions,
    //   },
    // });

    const session = {
      id: crypto.randomUUID(),
      clientId: body.clientId || null,
      stylistId: body.stylistId || null,
      hairType: body.hairType,
      porosityLevel: body.porosityLevel,
      condition: body.condition,
      lightingConditions: body.lightingConditions,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, data: session },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/sessions
 * List photo sessions for the authenticated stylist.
 *
 * Query params:
 *   - status: filter by status ("active" | "completed" | "cancelled")
 *   - clientId: filter by client
 *   - limit: number of results (default 20, max 100)
 *   - offset: pagination offset
 *
 * Response:
 *   200: { success: true, data: [...sessions], meta: { total, limit, offset } }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // TODO: Replace with actual Prisma call
    // const sessions = await prisma.photoSession.findMany({
    //   where: {
    //     stylistId: authenticatedStylistId,
    //     ...(status && { status }),
    //     ...(clientId && { clientId }),
    //   },
    //   take: limit,
    //   skip: offset,
    //   orderBy: { createdAt: 'desc' },
    // });

    return NextResponse.json({
      success: true,
      data: [],
      meta: { total: 0, limit, offset },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sessions';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}