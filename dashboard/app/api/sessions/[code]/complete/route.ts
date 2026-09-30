import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/sessions/[code]/complete
 *
 * NOT IMPLEMENTED (501). This endpoint previously returned hardcoded fake data
 * (level 3, tone 'warm', shade '5WR', fabricated per-section hexes) as if it were
 * real analysis. That placeholder behavior was removed — this stub now answers
 * 501 rather than present invented values as formulation output.
 *
 * To implement for real, this endpoint must:
 * 1. Load the session by its code and validate required angles (roots, mid, ends)
 *    have been uploaded
 * 2. Confirm every photo has a completed analysis row
 * 3. Aggregate per-angle color profiles (see lib/photo-analysis-server.ts)
 * 4. Generate a formulation from the aggregated profile
 * 5. Mark the session 'completed'
 *
 * Returns:
 *   501: { error, message } — session completion is not implemented yet.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    return NextResponse.json(
      {
        error: 'Not implemented',
        message:
          'Session completion for session ' + code + ' is not implemented yet. ' +
          'A previous placeholder returned hardcoded fake data as analysis; ' +
          'that stub has been removed. Implement session validation, analysis ' +
          'aggregation, and formulation generation before enabling this endpoint.',
      },
      { status: 501 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to complete session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
