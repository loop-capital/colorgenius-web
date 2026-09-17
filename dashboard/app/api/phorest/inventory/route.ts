/**
 * GET /api/phorest/inventory
 * Get synced Phorest inventory for a salon
 *
 * POST /api/phorest/inventory
 * Trigger inventory sync for a specific branch
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPhorestInventory, syncPhorestInventory, loadPhorestConnection } from '@/integrations/phorest';

import { getUserFromRequest } from '@/lib/auth';
import { getSalonIdForUser } from '@/lib/stylist';

async function resolveSalonId(request: NextRequest): Promise<string | null> {
  const authUser = await getUserFromRequest(request);
  if (!authUser) return null;
  return getSalonIdForUser(authUser.userId);
}

export async function GET(request: NextRequest) {
  const salonId = await resolveSalonId(request);
  if (!salonId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const lowStock = searchParams.get('lowStock') === 'true';

    const inventory = await getPhorestInventory(salonId, {
      category: category || undefined,
      search: search || undefined,
      lowStock,
    });

    return NextResponse.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load inventory';
    return NextResponse.json({
      success: false,
      error: { code: 'INVENTORY_LOAD_FAILED', message },
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const salonId = await resolveSalonId(request);
  if (!salonId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { branchId, dryRun = false, productTypes, includeArchived = false } = body;

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

    const result = await syncPhorestInventory({
      salonId,
      branchId,
      credentials,
      productTypes,
      includeArchived,
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
    const message = error instanceof Error ? error.message : 'Inventory sync failed';
    return NextResponse.json({
      success: false,
      error: { code: 'SYNC_FAILED', message },
    }, { status: 500 });
  }
}
