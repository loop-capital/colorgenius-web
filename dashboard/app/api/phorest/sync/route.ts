/**
 * POST /api/phorest/sync
 * Trigger a Phorest data sync (full or incremental)
 *
 * GET /api/phorest/sync
 * Get sync status / history
 */

import { NextRequest, NextResponse } from 'next/server';
import { performFullSync, performIncrementalSync, loadPhorestConnection, getActiveJobs, createPhorestClient } from '@/integrations/phorest';
import { getUserFromRequest } from '@/lib/auth';
import { getSalonIdForUser } from '@/lib/stylist';
import { prisma } from '@/lib/prisma';

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
    const { syncType = 'full', entities = ['branches', 'clients', 'products', 'appointments'], branchIds, dryRun = false } = body;

    // Load credentials
    const connection = await loadPhorestConnection(salonId);
    if (!connection) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_CONNECTED', message: 'Phorest not connected. Connect first via /api/phorest/status' },
      }, { status: 400 });
    }

    const credentials = {
      username: connection.username,
      password: connection.password,
      businessId: connection.business_id,
      region: connection.region,
    };

    // Perform sync
    if (syncType === 'incremental') {
      const since = body.since || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const result = await performIncrementalSync({
        salonId,
        credentials,
        since,
        branchIds: branchIds || (connection.default_branch_id ? [connection.default_branch_id] : undefined),
        entities: body.entities || ['clients', 'appointments', 'products'],
      });

      return NextResponse.json({
        success: result.success,
        data: {
          syncType: 'incremental',
          since,
          itemsSynced: result.itemsSynced,
          itemsFailed: result.itemsFailed,
          errors: result.errors.slice(0, 20), // Limit errors in response
          durationMs: result.durationMs,
        },
      });
    }

    // Full sync
    const result = await performFullSync({
      salonId,
      credentials,
      branchIds: branchIds || (connection.default_branch_id ? [connection.default_branch_id] : undefined),
      entities,
      dryRun,
    });

    return NextResponse.json({
      success: result.clients_synced.success || result.products_synced.success,
      data: {
        syncType: 'full',
        dryRun,
        branches: {
          synced: result.branches_synced.itemsSynced,
          failed: result.branches_synced.itemsFailed,
        },
        clients: {
          synced: result.clients_synced.itemsSynced,
          failed: result.clients_synced.itemsFailed,
        },
        products: {
          synced: result.products_synced.itemsSynced,
          failed: result.products_synced.itemsFailed,
        },
        appointments: {
          synced: result.appointments_synced.itemsSynced,
          failed: result.appointments_synced.itemsFailed,
        },
        services: {
          synced: result.services_synced.itemsSynced,
          failed: result.services_synced.itemsFailed,
        },
        durationMs: result.total_duration_ms,
        startedAt: result.started_at,
        completedAt: result.completed_at,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    console.error('[Phorest Sync] POST error:', message);
    return NextResponse.json({
      success: false,
      error: { code: 'SYNC_FAILED', message },
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const resolved = await requireSalonId(request);
  if ('error' in resolved) return resolved.error;
  const { salonId } = resolved;

  try {
    // Get active jobs
    const jobs = getActiveJobs(salonId);

    // Get last sync info from the real phorest_connections row — this
    // previously read salons.settings.phorest directly, a second read
    // path independent of loadPhorestConnection's own storage, which
    // could disagree about whether Phorest was even connected.
    const connection = await prisma.phorest_connections.findUnique({ where: { salon_id: salonId } });

    return NextResponse.json({
      success: true,
      data: {
        connected: !!connection && connection.status === 'connected',
        last_sync: connection?.last_sync_at || null,
        auto_sync: connection?.auto_sync_enabled || false,
        sync_interval: connection?.sync_interval_minutes || null,
        active_jobs: jobs.map((j) => ({
          id: j.id,
          type: j.type,
          status: j.status,
          startedAt: j.startedAt,
          entitiesSynced: j.entitiesSynced,
        })),
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
