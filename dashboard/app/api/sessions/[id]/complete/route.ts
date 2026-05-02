import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

/**
 * POST /api/sessions/[id]/complete
 * Finalize a photo session and generate a formulation from the combined analysis.
 *
 * This endpoint:
 * 1. Validates that all required angles (roots, mid, ends) have been uploaded
 * 2. Checks that all photos have completed analysis
 * 3. Aggregates color profiles from all angles
 * 4. Generates a formulation recommendation
 * 5. Updates session status to "completed"
 *
 * Request body (optional):
 *   - generateFormulation: boolean (default true)
 *   - targetLevel: number (1-10, overrides estimated target)
 *   - targetTone: string (overrides estimated target)
 *   - brandPreference: string (preferred brand)
 *
 * Response:
 *   200: { success: true, data: { session, formulation? } }
 *   400: { error: "Missing required photos. Need: roots, mid, ends" }
 *   404: { error: "Session not found" }
 *   409: { error: "Session already completed" }
 *   422: { error: "Not all photos have completed analysis" }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const generateFormulation = body.generateFormulation !== false;
    const targetLevel = body.targetLevel;
    const targetTone = body.targetTone;
    const brandPreference = body.brandPreference;

    // Validate target level if provided
    if (targetLevel && (targetLevel < 1 || targetLevel > 10)) {
      return NextResponse.json(
        { error: 'Target level must be between 1 and 10' },
        { status: 400 }
      );
    }

    // TODO: Fetch session with photos and analyses
    // const session = await prisma.photoSession.findUnique({
    //   where: { id },
    //   include: {
    //     photos: true,
    //     analysisResults: {
    //       include: { photo: true },
    //     },
    //   },
    // });
    //
    // if (!session) {
    //   return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    // }
    //
    // if (session.status === 'completed') {
    //   return NextResponse.json({ error: 'Session already completed' }, { status: 409 });
    // }
    //
    // // Check all required angles are present
    // const angles = session.photos.map(p => p.angle);
    // const requiredAngles = ['roots', 'mid', 'ends'];
    // const missingAngles = requiredAngles.filter(a => !angles.includes(a));
    // if (missingAngles.length > 0) {
    //   return NextResponse.json(
    //     { error: `Missing required photos for angles: ${missingAngles.join(', ')}` },
    //     { status: 400 }
    //   );
    // }
    //
    // // Check all analyses are complete
    // const pendingPhotos = session.photos.filter(p =>
    //   p.analysisStatus !== 'completed'
    // );
    // if (pendingPhotos.length > 0) {
    //   return NextResponse.json(
    //     { error: 'Not all photos have completed analysis', pendingPhotos: pendingPhotos.map(p => p.id) },
    //     { status: 422 }
    //   );
    // }
    //
    // // Aggregate color profiles
    // const aggregatedProfile = aggregateColorProfiles(session.analysisResults);
    //
    // // Generate formulation if requested
    // let formulation = null;
    // if (generateFormulation) {
    //   formulation = await generateFormulationFromAnalysis({
    //     analysisResults: session.analysisResults,
    //     aggregatedProfile,
    //     targetLevel,
    //     targetTone,
    //     brandPreference,
    //   });
    // }
    //
    // // Update session status
    // await prisma.photoSession.update({
    //   where: { id },
    //   data: { status: 'completed' },
    // });

    const result = {
      session: {
        id,
        status: 'completed',
        updatedAt: new Date().toISOString(),
      },
      aggregatedProfile: {
        overall: {
          dominantHex: '#3d2b1f',
          dominantName: 'Dark Brown',
          level: 3,
          tone: 'warm',
          warmthIndex: 1.35,
          porosity: 'medium',
          damageLevel: 'minimal',
        },
        sections: {
          roots: { hex: '#2d1e14', confidence: 0.85 },
          mid: { hex: '#3d2b1f', confidence: 0.88 },
          ends: { hex: '#4e3726', confidence: 0.82 },
        },
      },
      formulation: generateFormulation
        ? {
            id: crypto.randomUUID(),
            recommendedShade: '5WR',
            developerVolume: 20,
            processingTime: 30,
            ratio: '1:1',
            brand: brandPreference || 'Redken',
          }
        : null,
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to complete session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}