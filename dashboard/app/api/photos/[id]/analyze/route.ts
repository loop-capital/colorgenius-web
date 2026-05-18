import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeImageBuffer } from '@/lib/photo-analysis-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const forceReanalyze = body.forceReanalyze || false;

    const photo = await prisma.photo_analyses.findUnique({
      where: { id },
      select: { id: true, processing_status: true, original_url: true },
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    if (photo.processing_status === 'completed' && !forceReanalyze) {
      return NextResponse.json(
        { error: 'Analysis already completed. Use forceReanalyze=true to override.' },
        { status: 409 }
      );
    }

    const startMs = Date.now();

    await prisma.photo_analyses.update({
      where: { id },
      data: { processing_status: 'processing', processing_started_at: new Date() },
    });

    const imageRes = await fetch(photo.original_url);
    if (!imageRes.ok) {
      await prisma.photo_analyses.update({
        where: { id },
        data: { processing_status: 'failed', error_message: `Failed to fetch image: ${imageRes.status}` },
      });
      return NextResponse.json({ error: 'Could not retrieve photo for analysis' }, { status: 502 });
    }

    const buffer = Buffer.from(await imageRes.arrayBuffer());
    const result = await analyzeImageBuffer(buffer);

    await prisma.photo_analyses.update({
      where: { id },
      data: {
        processing_status: 'completed',
        processing_completed_at: new Date(),
        processing_time_ms: Date.now() - startMs,
        results: result as any,
      },
    });

    return NextResponse.json({
      success: true,
      data: { photoId: id, analysisStatus: 'completed', result },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
