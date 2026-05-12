import { NextRequest, NextResponse } from 'next/server';
import { getFormulas, saveFormula, deleteFormula } from '@/lib/storage';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function GET() {
  const formulas = getFormulas();
  return NextResponse.json({ formulas, total: formulas.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Formula name is required' }, { status: 400 });
    }

    if (!body.formulation) {
      return NextResponse.json({ error: 'Formulation data is required' }, { status: 400 });
    }

    const formula = saveFormula({
      name: body.name.trim(),
      clientId: body.clientId,
      clientName: body.clientName,
      formulation: body.formulation,
      tags: body.tags || [],
    });

    return NextResponse.json({ formula, success: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save formula';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Formula ID is required' }, { status: 400 });
    }

    deleteFormula(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete formula';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
