/**
 * POST /api/phorest/status
 * Save Phorest credentials and test connection
 *
 * GET /api/phorest/status
 * Check Phorest connection status
 *
 * DELETE /api/phorest/status
 * Disconnect Phorest
 */

import { NextRequest, NextResponse } from 'next/server';
import { validatePhorestCredentials, savePhorestConnection, loadPhorestConnection, removePhorestConnection, isPhorestConnected } from '@/integrations/phorest';
import { getUserFromRequest } from '@/lib/auth';
import { getSalonIdForUser } from '@/lib/stylist';

async function requireSalonId(request: NextRequest): Promise<{ salonId: string } | { error: NextResponse }> {
  const authUser = await getUserFromRequest(request);
  if (!authUser) {
    return { error: NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } }, { status: 401 }) };
  }
  const salonId = await getSalonIdForUser(authUser.userId);
  if (!salonId) {
    return { error: NextResponse.json({ success: false, error: { code: 'NO_SALON', message: 'This account is not linked to a salon yet.' } }, { status: 400 }) };
  }
  return { salonId };
}

export async function POST(request: NextRequest) {
  try {
    const resolved = await requireSalonId(request);
    if ('error' in resolved) return resolved.error;
    const { salonId } = resolved;

    const body = await request.json();
    const { username, password, businessId, region = 'us' } = body;

    if (!username || !password || !businessId) {
      return NextResponse.json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Username, password, and businessId are required.' },
      }, { status: 400 });
    }

    // Validate credentials with Phorest API
    const validation = await validatePhorestCredentials({
      username,
      password,
      businessId,
      region,
    });

    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: validation.error || 'Invalid credentials' },
      }, { status: 401 });
    }

    // Save connection
    await savePhorestConnection({
      salon_id: salonId,
      business_id: businessId,
      username,
      password,
      region: validation.region || region,
      auto_sync_enabled: false,
      sync_interval_minutes: 60,
    });

    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        business_id: businessId,
        region: validation.region || region,
        business_name: validation.businessName,
        connected_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Connection failed';
    return NextResponse.json({
      success: false,
      error: { code: 'CONNECTION_FAILED', message },
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const resolved = await requireSalonId(request);
  if ('error' in resolved) return resolved.error;
  const { salonId } = resolved;

  try {
    const connection = await loadPhorestConnection(salonId);

    if (!connection) {
      return NextResponse.json({
        success: true,
        data: {
          connected: false,
          message: 'Phorest not connected. POST credentials to connect.',
        },
      });
    }

    // Test if credentials still work
    const isConnected = await isPhorestConnected(salonId);

    return NextResponse.json({
      success: true,
      data: {
        connected: isConnected,
        business_id: connection.business_id,
        username: connection.username,
        region: connection.region,
        default_branch_id: connection.default_branch_id,
        auto_sync_enabled: connection.auto_sync_enabled,
        sync_interval_minutes: connection.sync_interval_minutes,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Status check failed';
    return NextResponse.json({
      success: false,
      error: { code: 'STATUS_FAILED', message },
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const resolved = await requireSalonId(request);
  if ('error' in resolved) return resolved.error;
  const { salonId } = resolved;

  await removePhorestConnection(salonId);

  return NextResponse.json({
    success: true,
    data: { message: 'Phorest disconnected' },
  });
}
