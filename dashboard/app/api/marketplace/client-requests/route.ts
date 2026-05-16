/**
 * GET /api/marketplace/client-requests
 * List incoming color requests for the authenticated stylist
 * 
 * POST /api/marketplace/client-requests
 * Submit a new client request (from GetUpLook)
 */

import { NextRequest, NextResponse } from 'next/server';
import { clientRequests, formulas, generateId } from '@/lib/api/mock-data';
import { generateShareCode } from '@/lib/share-code';
import { ClientRequest } from '@/lib/api/types';

function getUserFromAuth(request: NextRequest): { id: string } | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const [id] = token.split(':');
  if (!id) return null;
  return { id };
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Bearer token required' } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let requests = clientRequests.filter(r => r.stylist_id === user.id);
    if (status) {
      requests = requests.filter(r => r.status === status);
    }
    requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      data: { requests },
      meta: { total: requests.length },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch requests';
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { share_code, client_name, client_email, consumer_notes, appointment_date, stylist_id } = body;

    if (!share_code || !client_name || !stylist_id) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'share_code, client_name, and stylist_id required' } }, { status: 400 });
    }

    // Find formula by share code
    const normalized = share_code.toUpperCase().replace(/^CG-/, '');
    const fullCode = `CG-${normalized}`;
    const formula = formulas.find(f => generateShareCode(f.id) === fullCode);

    if (!formula) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Formula not found for this code' } }, { status: 404 });
    }

    const clientRequest: ClientRequest = {
      id: `cr-${generateId().slice(0, 8)}`,
      client_name,
      client_email: client_email || '',
      formula_id: formula.id,
      share_code: fullCode,
      formula_title: formula.title,
      creator_name: formula.creator_name,
      tier: formula.tier,
      per_use_cents: formula.per_use_cents,
      color_hex: '#8B5E3C', // Would come from formula data
      consumer_notes,
      appointment_date,
      status: 'pending',
      required_products: [], // Would be populated from formula data
      formula_ready: false,
      stylist_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    clientRequests.push(clientRequest);

    return NextResponse.json({ success: true, data: clientRequest }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create request';
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
