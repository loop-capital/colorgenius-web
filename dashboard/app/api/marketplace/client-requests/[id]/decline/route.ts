/**
 * POST /api/marketplace/client-requests/[id]/decline
 * Stylist declines a client's color request
 */

import { NextRequest, NextResponse } from 'next/server';
import { clientRequests } from '@/lib/api/mock-data';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const req = clientRequests.find(r => r.id === id);

    if (!req) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } }, { status: 404 });
    }

    req.status = 'declined';
    req.decline_reason = body.reason;
    req.updated_at = new Date().toISOString();

    return NextResponse.json({ success: true, data: req });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to decline request';
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
