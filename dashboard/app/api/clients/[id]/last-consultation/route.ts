import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyBearerToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify auth
    const userId = await verifyBearerToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: clientId } = await params;

    // Get client's most recent formulation as "last consultation"
    const latestFormulation = await prisma.formulations.findFirst({
      where: { client_id: clientId },
      orderBy: { created_at: 'desc' },
      include: {
        clients: true,
      },
    });

    if (!latestFormulation) {
      return NextResponse.json({ consultation: null });
    }

    // Extract consultation data from formulation input_data
    const input = latestFormulation.input_data as any || {};
    const condition = input.condition || {};
    const primary = latestFormulation.primary_formula as any || {};

    const consultation = {
      // Hair Assessment
      texture: input.texture || condition.texture || 'medium',
      hairPattern: input.hairPattern || condition.hairPattern || 'straight',
      density: input.density || condition.density || 'medium',
      currentLevel: input.currentLevel || condition.currentLevel || 5,
      currentTone: input.currentTone || condition.currentTone || 'natural',
      
      // Chemical History
      lastServiceType: input.lastServiceType || input.serviceType || 'full_head',
      chemicalHistory: input.chemicalHistory || condition.chemicalHistory || [],
      sensitivities: input.sensitivities || condition.sensitivities || [],
      lastChemicalService: input.lastChemicalService || condition.lastChemicalService || '1-3_months',
      
      // Desired Result
      serviceType: input.serviceType || 'full_head',
      targetLevel: input.targetLevel || primary.targetLevel || 6,
      targetTone: input.targetTone || primary.targetTone || 'natural',
      
      // Condition
      conditionType: condition.type || 'previously_colored',
      porosity: condition.porosity || 'normal',
      grayPercent: condition.grayPercent || 0,
      problemIndicators: condition.problemIndicators || [],
    };

    return NextResponse.json({ consultation });
  } catch (error) {
    console.error('[Last Consultation] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultation data' },
      { status: 500 }
    );
  }
}
