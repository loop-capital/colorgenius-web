import { NextRequest, NextResponse } from 'next/server';
import { formulate, FormulationInput } from '@/lib/formulation';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

/**
 * POST /api/analyze
 * AI Hair Analysis & Formulation Endpoint
 * 
 * Accepts a hair state description and returns a complete color formulation
 * (brand, shade, developer volume, ratio, timing) based on the input.
 * 
 * Request Body:
 *   - currentLevel: number (1-10)
 *   - currentTone: string (warm, cool, neutral, ash, golden, copper, red, violet, pearl, beige, mahogany, chocolate)
 *   - targetLevel: number (1-10)
 *   - targetTone: string (same options as currentTone)
 *   - condition: object
 *     - type: 'virgin' | 'previously_colored' | 'damaged' | 'highly_damaged'
 *     - porosity: 'low' | 'normal' | 'high'
 *     - grayPercent: number (0-100)
 *     - highlights: boolean
 *     - highlightedPercent: number (0-100)
 *   - brandPreference?: string
 *   - linePreference?: string
 * 
 * Response:
 *   200: { success: true, data: {...}, meta: {...} }
 *   400: { error: string }
 *   500: { error: string }
 */

export async function POST(request: NextRequest) {
  // Rate limiting: allow 5 requests per minute per client
  const clientId = getClientIdentifier(request);
  const rateLimitResult = rateLimit(clientId, 60000, 5); // 5 requests per minute
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded. Please try again later.',
        rateLimit: {
          limit: 5,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime
        }
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      }
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.currentLevel || !body.targetLevel || !body.currentTone || !body.targetTone) {
      return NextResponse.json(
        { error: 'Missing required fields: currentLevel, currentTone, targetLevel, targetTone' },
        { status: 400 }
      );
    }

    const currentLevel = Number(body.currentLevel);
    const targetLevel = Number(body.targetLevel);

    // Validate levels are in range 1-10
    if (currentLevel < 1 || currentLevel > 10 || targetLevel < 1 || targetLevel > 10) {
      return NextResponse.json(
        { error: 'Hair level must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Build the formulation input
    const input: FormulationInput = {
      currentLevel,
      currentTone: body.currentTone,
      targetLevel,
      targetTone: body.targetTone,
      condition: {
        type: body.condition?.type || 'previously_colored',
        porosity: body.condition?.porosity || 'normal',
        grayPercent: Number(body.condition?.grayPercent || 0),
        highlights: Boolean(body.condition?.highlights || false),
        highlightedPercent: Number(body.condition?.highlightedPercent || 0),
      },
      brandPreference: body.brandPreference,
      linePreference: body.linePreference,
    };

    // Generate the formulation
    const result = formulate(input);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Formulation failed',
          warnings: result.warnings,
        },
        { status: 400 }
      );
    }

    // Build the AI analysis response with the dummy formula
    return NextResponse.json({
      success: true,
      data: {
        // Hair state summary
        hairState: {
          currentLevel,
          currentTone: body.currentTone,
          targetLevel,
          targetTone: body.targetTone,
          condition: input.condition,
        },
        // The formulation
        formula: {
          brand: result.brand,
          line: result.line,
          steps: result.steps.map((step, index) => ({
            step: index + 1,
            product: step.product.shadeName,
            shadeCode: step.product.shadeCode,
            grams: step.grams,
            role: step.role,
            notes: step.notes,
          })),
          developer: {
            volume: result.developerVolume,
            ml: result.developerMl,
          },
          mixingRatio: result.steps[0]?.product.mixingRatio || '1:1',
          totalFormulaMl: result.totalMl,
          processingTime: result.processingTime,
          application: result.application,
          coverage: result.coverage,
        },
        instructions: {
          notes: result.notes,
          warnings: result.warnings,
          technique: result.application,
        },
      },
      meta: {
        analyzedAt: new Date().toISOString(),
        version: '1.0.0-dummy',
        confidence: 0.85,
      }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI analysis failed';
    console.error('[AI Analysis Error]', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
