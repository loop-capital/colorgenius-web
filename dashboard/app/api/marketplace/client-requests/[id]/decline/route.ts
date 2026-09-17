/**
 * POST /api/marketplace/client-requests/[id]/decline
 * Stylist declines a client's color request
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getOrCreateStylistForUser } from '@/lib/stylist';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
    }
    const stylist = await getOrCreateStylistForUser(authUser.userId);
    if (!stylist) {
      return NextResponse.json({ success: false, error: { code: 'NO_PROFILE', message: 'No creator profile for this account' } }, { status: 400 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const existing = await prisma.formula_client_requests.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } }, { status: 404 });
    }
    if (existing.stylist_id !== stylist.id) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Not your request' } }, { status: 403 });
    }

    const req = await prisma.formula_client_requests.update({
      where: { id },
      data: { status: 'declined', decline_reason: body.reason },
    });

    return NextResponse.json({ success: true, data: req });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to decline request';
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
