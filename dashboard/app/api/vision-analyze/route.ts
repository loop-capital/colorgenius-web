import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageBuffer } from '@/lib/photo-analysis-server';

/**
 * POST /api/vision-analyze
 * 
 * Accepts a base64 image (from the formulate page photo upload)
 * and returns AI-powered hair analysis results.
 * 
 * Request Body:
 *   - image: string (base64 encoded JPEG/PNG)
 * 
 * Response:
 *   200: { success: true, analysis: HairAnalysisResult }
 *   400: { error: string }
 *   500: { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.image || typeof body.image !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: image (base64 string)' },
        { status: 400 }
      );
    }

    // Strip data URI prefix if present (e.g., "data:image/jpeg;base64,...")
    const base64Data = body.image.includes(',') 
      ? body.image.split(',')[1] 
      : body.image;

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    if (buffer.length < 100) {
      return NextResponse.json(
        { error: 'Invalid image data' },
        { status: 400 }
      );
    }

    // Run the analysis
    const result = await analyzeImageBuffer(buffer);

    return NextResponse.json({
      success: true,
      analysis: result,
    });

  } catch (error: any) {
    console.error('[Vision Analyze Error]', error);
    return NextResponse.json(
      { error: error.message || 'Vision analysis failed' },
      { status: 500 }
    );
  }
}
