/**
 * GET /api/marketplace/client-requests
 * List incoming color requests for the authenticated stylist
 * 
 * POST /api/marketplace/client-requests
 * Submit a new client request (from GetUpLook)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getOrCreateStylistForUser } from '@/lib/stylist';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
    }
    const stylist = await getOrCreateStylistForUser(authUser.userId);
    if (!stylist) {
      return NextResponse.json({ success: false, error: { code: 'NO_PROFILE', message: 'No creator profile for this account' } }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const requests = await prisma.formula_client_requests.findMany({
      where: { stylist_id: stylist.id, ...(status ? { status } : {}) },
      orderBy: { created_at: 'desc' },
      include: { listing: { select: { id: true, title: true, tier: true, per_use_cents: true } } },
    });

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

// Submitted by a consumer (e.g. from GetUpLook), not an authenticated stylist —
// identifies the target listing/stylist purely via the public share_code.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { share_code, client_name, client_email, consumer_notes, appointment_date } = body;

    if (!share_code || !client_name) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'share_code and client_name required' } }, { status: 400 });
    }

    const normalized = share_code.toUpperCase().replace(/^CG-/, '');
    const fullCode = `CG-${normalized}`;
    const listing = await prisma.formula_listings.findUnique({ where: { share_code: fullCode } });

    if (!listing) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Formula not found for this code' } }, { status: 404 });
    }

    const clientRequest = await prisma.formula_client_requests.create({
      data: {
        stylist_id: listing.creator_id,
        listing_id: listing.id,
        client_name,
        client_email: client_email || null,
        consumer_notes,
        appointment_date: appointment_date ? new Date(appointment_date) : null,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, data: clientRequest }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create request';
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
