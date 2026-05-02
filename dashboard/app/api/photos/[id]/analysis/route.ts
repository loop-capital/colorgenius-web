import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

/**
 * GET /api/photos/[id]/analysis
 * Get analysis results for a specific photo.
 *
 * Response:
 *   200: { success: true, data: { ...AnalysisResult, colorProfile } }
 *   202: { success: true, data: { photoId, analysisStatus: "processing" } }
 *   404: { error: "Photo not found" }
 *   404: { error: "No analysis results found" }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Fetch photo from database
    // const photo = await prisma.photo.findUnique({
    //   where: { id },
    //   select: {
    //     id: true,
    //     analysisStatus: true,
    //     colorProfile: true,
    //     angle: true,
    //   },
    // });
    //
    // if (!photo) {
    //   return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    // }
    //
    // if (photo.analysisStatus === 'pending' || photo.analysisStatus === 'processing') {
    //   return NextResponse.json(
    //     { success: true, data: { photoId: id, analysisStatus: photo.analysisStatus } },
    //     { status: 202 }
    //   );
    // }
    //
    // if (photo.analysisStatus === 'failed') {
    //   return NextResponse.json(
    //     { success: false, error: 'Analysis failed. Please retry.' },
    //     { status: 500 }
    //   );
    // }
    //
    // const analysisResult = await prisma.analysisResult.findUnique({
    //   where: { photoId: id },
    // });
    //
    // if (!analysisResult) {
    //   return NextResponse.json({ error: 'No analysis results found' }, { status: 404 });
    // }

    // Stub response
    const analysisResult = {
      id: crypto.randomUUID(),
      photoId: id,
      sessionId: null,
      dominantColor: '#3d2b1f',
      dominantColorName: 'Dark Brown',
      rgbR: 61,
      rgbG: 43,
      rgbB: 31,
      underlyingPigment: 'Red',
      warmthCoolnessRatio: 1.35,
      porosityEstimate: 'medium',
      damageLevel: 'minimal',
      cuticleVisibility: 65,
      confidenceScore: 82,
      lightingQuality: 'good',
      angleAccuracy: 'good',
      processedAt: new Date().toISOString(),
      modelVersion: 'v1.0.0',
      colorProfile: {
        sections: {
          roots: {
            rgb: { r: 45, g: 30, b: 20 },
            hex: '#2d1e14',
            confidence: 0.85,
            regionPixels: 12500,
          },
          mid: {
            rgb: { r: 61, g: 43, b: 31 },
            hex: '#3d2b1f',
            confidence: 0.88,
            regionPixels: 15000,
          },
          ends: {
            rgb: { r: 78, g: 55, b: 38 },
            hex: '#4e3726',
            confidence: 0.82,
            regionPixels: 11000,
          },
        },
        overall: {
          dominantHex: '#3d2b1f',
          warmthIndex: 1.35,
          lightness: 22,
          saturation: 45,
        },
      },
    };

    return NextResponse.json({ success: true, data: analysisResult });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch analysis';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}