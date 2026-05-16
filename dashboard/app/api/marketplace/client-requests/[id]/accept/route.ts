/**
 * POST /api/marketplace/client-requests/[id]/accept
 * Stylist accepts a client's color request
 */

import { NextRequest, NextResponse } from 'next/server';
import { clientRequests } from '@/lib/api/mock-data';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const req = clientRequests.find(r => r.id === id);

    if (!req) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } }, { status: 404 });
    }

    req.status = 'accepted';
    req.formula_ready = true;
    req.updated_at = new Date().toISOString();

    return NextResponse.json({ success: true, data: req });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to accept request';
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
