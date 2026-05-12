import { NextRequest, NextResponse } from 'next/server';
import { formulate, FormulationInput } from '@/lib/formulation';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const input: FormulationInput = {
      currentLevel: Number(body.currentLevel),
      currentTone: body.currentTone,
      targetLevel: Number(body.targetLevel),
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

    // Basic validation
    if (!input.currentLevel || !input.targetLevel || !input.currentTone || !input.targetTone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (input.currentLevel < 1 || input.currentLevel > 10 || input.targetLevel < 1 || input.targetLevel > 10) {
      return NextResponse.json({ error: 'Level must be between 1 and 10' }, { status: 400 });
    }

    const result = formulate(input);

    return NextResponse.json({ 
      success: true, 
      data: result,
      meta: {
        formulatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Formulation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
