import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { HairAnalysisResult } from '@/lib/photo-analysis-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const photo = await prisma.photo_analyses.findUnique({
      where: { id },
      select: { id: true, processing_status: true, results: true },
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    if (photo.processing_status === 'pending' || photo.processing_status === 'processing') {
      return NextResponse.json(
        { success: true, data: { photoId: id, analysisStatus: photo.processing_status } },
        { status: 202 }
      );
    }

    if (photo.processing_status === 'failed') {
      return NextResponse.json(
        { success: false, error: 'Analysis failed. Please retry.' },
        { status: 500 }
      );
    }

    if (!photo.results) {
      return NextResponse.json({ error: 'No analysis results found' }, { status: 404 });
    }

    const r = photo.results as unknown as HairAnalysisResult;

    const hex = r.dominantHex.replace('#', '');
    const rgbR = parseInt(hex.slice(0, 2), 16);
    const rgbG = parseInt(hex.slice(2, 4), 16);
    const rgbB = parseInt(hex.slice(4, 6), 16);

    const analysisResult = {
      id: photo.id,
      photoId: id,
      dominantColor: r.dominantHex,
      dominantColorName: r.currentLevelName,
      rgbR,
      rgbG,
      rgbB,
      underlyingPigment: r.currentTone,
      warmthCoolnessRatio: r.warmthRatio,
      porosityEstimate: r.damageIndicators.porosityEstimate,
      damageLevel: r.condition,
      cuticleVisibility: Math.round(r.damageIndicators.drynessScore),
      confidenceScore: Math.round(r.confidence * 100),
      lightingQuality: r.rawMetrics.avgBrightness > 80 ? 'good' : 'poor',
      angleAccuracy: r.faceDetected ? 'good' : 'uncertain',
      processedAt: new Date().toISOString(),
      modelVersion: 'v1.0.0',
      currentLevel: r.currentLevel,
      currentLevelName: r.currentLevelName,
      currentTone: r.currentTone,
      grayPercent: r.grayPercent,
      recommendations: r.recommendations,
      colorProfile: {
        sections: {
          roots: {
            rgb: { r: Math.round(rgbR * 0.88), g: Math.round(rgbG * 0.88), b: Math.round(rgbB * 0.88) },
            hex: r.dominantHex,
            confidence: r.confidence,
            regionPixels: Math.round(r.rawMetrics.sampleSize * 0.3),
          },
          mid: {
            rgb: { r: rgbR, g: rgbG, b: rgbB },
            hex: r.dominantHex,
            confidence: r.confidence,
            regionPixels: Math.round(r.rawMetrics.sampleSize * 0.4),
          },
          ends: {
            rgb: {
              r: Math.min(255, Math.round(rgbR * 1.12)),
              g: Math.min(255, Math.round(rgbG * 1.12)),
              b: Math.min(255, Math.round(rgbB * 1.12)),
            },
            hex: r.secondaryHex || r.dominantHex,
            confidence: r.confidence * 0.9,
            regionPixels: Math.round(r.rawMetrics.sampleSize * 0.3),
          },
        },
        overall: {
          dominantHex: r.dominantHex,
          warmthIndex: r.warmthRatio,
          lightness: r.rawMetrics.avgBrightness,
          saturation: Math.round(r.saturation * 100),
        },
      },
    };

    return NextResponse.json({ success: true, data: analysisResult });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch analysis' }, { status: 500 });
  }
}
