/**
 * GET /api/phorest/appointments
 * Get upcoming appointments from Phorest
 *
 * POST /api/phorest/appointments
 * Sync appointments for a branch
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPhorestUpcomingAppointments, syncPhorestAppointments, loadPhorestConnection } from '@/integrations/phorest';

function getUserFromAuth(request: NextRequest): { id: string } | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const [id] = token.split(':');
  if (!id) return null;
  return { id };
}

export async function GET(request: NextRequest) {
  const user = getUserFromAuth(request);
  const salonId = user?.id || 'default';

  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const days = parseInt(searchParams.get('days') || '7', 10);
    const staffId = searchParams.get('staffId') || undefined;

    if (!branchId) {
      return NextResponse.json({
        success: false,
        error: { code: 'MISSING_BRANCH', message: 'branchId query parameter is required' },
      }, { status: 400 });
    }

    const connection = await loadPhorestConnection(salonId);
    if (!connection) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_CONNECTED', message: 'Phorest not connected' },
      }, { status: 400 });
    }

    const credentials = {
      username: connection.username,
      password: connection.password,
      businessId: connection.business_id,
      region: connection.region,
    };

    const appointments = await getPhorestUpcomingAppointments(salonId, {
      credentials,
      branchId,
      days,
      staffId,
    });

    return NextResponse.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load appointments';
    return NextResponse.json({
      success: false,
      error: { code: 'APPOINTMENTS_LOAD_FAILED', message },
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getUserFromAuth(request);
  const salonId = user?.id || 'default';

  try {
    const body = await request.json();
    const { branchId, fromDate, toDate, clientId, staffId, includeCancelled = false, dryRun = false } = body;

    if (!branchId) {
      return NextResponse.json({
        success: false,
        error: { code: 'MISSING_BRANCH', message: 'branchId is required' },
      }, { status: 400 });
    }

    const connection = await loadPhorestConnection(salonId);
    if (!connection) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_CONNECTED', message: 'Phorest not connected' },
      }, { status: 400 });
    }

    const credentials = {
      username: connection.username,
      password: connection.password,
      businessId: connection.business_id,
      region: connection.region,
    };

    const result = await syncPhorestAppointments({
      salonId,
      branchId,
      credentials,
      fromDate,
      toDate,
      clientId,
      staffId,
      includeCancelled,
      includeDeleted: false,
      includeArchived: false,
      dryRun,
    });

    return NextResponse.json({
      success: result.success,
      data: {
        itemsSynced: result.itemsSynced,
        itemsFailed: result.itemsFailed,
        errors: result.errors.slice(0, 20),
        durationMs: result.durationMs,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Appointment sync failed';
    return NextResponse.json({
      success: false,
      error: { code: 'SYNC_FAILED', message },
    }, { status: 500 });
  }
}
