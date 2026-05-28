/**
 * POST /api/v1/phorest/connect
 * Save Phorest credentials (encrypts password, validates against Phorest API)
 *
 * GET /api/v1/phorest/connect
 * Get Phorest connection status for the current salon
 *
 * DELETE /api/v1/phorest/connect
 * Disconnect Phorest (removes credentials from DB)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyBearerToken } from '@/lib/auth';
import { encryptPhorestPassword, decryptPhorestPassword } from '@/lib/phorest-crypto';
import { validatePhorestCredentials, PhorestCredentials } from '@/integrations/phorest';

// ─── Helpers ───────────────────────────────────────────────────

function getSalonIdFromRequest(request: NextRequest): string | null {
  const salonId = request.headers.get('x-salon-id');
  if (salonId) return salonId;

  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7);
    const [id] = token.split(':');
    if (id) return id;
  }
  return null;
}

// ─── POST: Save & Connect ──────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const user = await verifyBearerToken(request);
    const salonId = user?.userId || getSalonIdFromRequest(request);

    if (!salonId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { businessId, branchId, apiEmail, apiPassword, serverRegion = 'us' } = body;

    // Validate required fields
    if (!businessId || !branchId || !apiEmail || !apiPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'businessId, branchId, apiEmail, and apiPassword are required.',
          },
        },
        { status: 400 }
      );
    }

    // Build credentials for validation
    const credentials: PhorestCredentials = {
      businessId: String(businessId),
      username: apiEmail, // phorest-auth normalizes with global/ prefix
      password: apiPassword,
      region: serverRegion === 'eu' ? 'eu' : 'us',
    };

    // Test connection to Phorest API
    const validation = await validatePhorestCredentials(credentials);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: validation.error || 'Could not connect to Phorest. Check your credentials.',
          },
        },
        { status: 401 }
      );
    }

    // Encrypt password before storing
    const encryptedPassword = encryptPhorestPassword(apiPassword);

    // Upsert connection record
    const connection = await prisma.phorest_connections.upsert({
      where: { salon_id: salonId },
      update: {
        business_id: String(businessId),
        branch_id: String(branchId),
        api_email: apiEmail,
        api_password: encryptedPassword,
        server_region: validation.region || serverRegion,
        status: 'connected',
        updated_at: new Date(),
      },
      create: {
        salon_id: salonId,
        business_id: String(businessId),
        branch_id: String(branchId),
        api_email: apiEmail,
        api_password: encryptedPassword,
        server_region: validation.region || serverRegion,
        status: 'connected',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        business_id: connection.business_id,
        branch_id: connection.branch_id,
        business_name: validation.businessName,
        region: connection.server_region,
        connected_at: connection.created_at,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Connection failed';
    console.error('[Phorest Connect] POST error:', message);
    return NextResponse.json(
      { success: false, error: { code: 'CONNECTION_FAILED', message } },
      { status: 500 }
    );
  }
}

// ─── GET: Status ───────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const user = await verifyBearerToken(request);
    const salonId = user?.userId || getSalonIdFromRequest(request);

    if (!salonId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    const connection = await prisma.phorest_connections.findUnique({
      where: { salon_id: salonId },
    });

    if (!connection) {
      return NextResponse.json({
        success: true,
        data: {
          connected: false,
          message: 'Phorest not connected.',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        connected: connection.status === 'connected',
        business_id: connection.business_id,
        branch_id: connection.branch_id,
        api_email: connection.api_email,
        region: connection.server_region,
        status: connection.status,
        last_sync_at: connection.last_sync_at,
        sync_error: connection.sync_error,
        created_at: connection.created_at,
        updated_at: connection.updated_at,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Status check failed';
    console.error('[Phorest Connect] GET error:', message);
    return NextResponse.json(
      { success: false, error: { code: 'STATUS_FAILED', message } },
      { status: 500 }
    );
  }
}

// ─── DELETE: Disconnect ──────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyBearerToken(request);
    const salonId = user?.userId || getSalonIdFromRequest(request);

    if (!salonId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    await prisma.phorest_connections.deleteMany({
      where: { salon_id: salonId },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Phorest disconnected successfully.' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Disconnect failed';
    console.error('[Phorest Connect] DELETE error:', message);
    return NextResponse.json(
      { success: false, error: { code: 'DISCONNECT_FAILED', message } },
      { status: 500 }
    );
  }
}
