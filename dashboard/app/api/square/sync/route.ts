/**
 * POST /api/square/sync
 * Sync a salon's Square product catalog into COLORgenius
 * 
 * Pulls all catalog items from the salon's Square account
 * and creates a product mapping for inventory checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSalonClient, getConnection, saveConnection } from '@/lib/square-multi';

interface SyncedProduct {
  square_catalog_id: string;
  name: string;
  category?: string;
  sku?: string;
  price_cents?: number;
  quantity?: number;
}

// In-memory product store — in production this would be a database table
const salonProducts = new Map<string, SyncedProduct[]>();

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    const salonId = auth?.startsWith('Bearer ') ? auth.slice(7).split(':')[0] : 'default';

    const client = createSalonClient(salonId);
    if (!client) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_CONNECTED', message: 'Square not connected. Connect first.' },
      }, { status: 400 });
    }

    const connection = getConnection(salonId);
    const locationId = connection?.location_ids[0] || '';

    // Fetch all catalog items
    const products: SyncedProduct[] = [];
    let cursor: string | undefined;

    do {
      const response = await client.catalog.list({
        types: 'ITEM',
        cursor,
      });

      for (const obj of response.data || []) {
        if (obj.type !== 'ITEM' || !obj.itemData) continue;

        const item = obj.itemData;
        const variation = item.variations?.[0];
        const price = variation?.itemVariationData?.priceMoney;

        // Get inventory for this item
        let quantity = 0;
        try {
          const invResponse = await client.inventory.batchGet({
            catalogObjectIds: [variation?.id || ''],
            locationIds: [locationId],
          });
          quantity = Number(invResponse.counts?.[0]?.quantity || 0);
        } catch {
          // Inventory may not be tracked for this item
        }

        products.push({
          square_catalog_id: obj.id || '',
          name: item.name || 'Unknown',
          category: item.categories?.[0]?.name,
          sku: variation?.itemVariationData?.sku || undefined,
          price_cents: price ? Number(price.amount) : undefined,
          quantity,
        });
      }

      cursor = response.cursor;
    } while (cursor);

    // Store synced products
    salonProducts.set(salonId, products);

    // Update connection sync timestamp
    if (connection) {
      connection.catalog_synced_at = new Date().toISOString();
      saveConnection(connection);
    }

    return NextResponse.json({
      success: true,
      data: {
        products_synced: products.length,
        products: products.slice(0, 20), // Return first 20 for preview
        synced_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    return NextResponse.json({
      success: false,
      error: { code: 'SYNC_FAILED', message },
    }, { status: 500 });
  }
}

/**
 * GET /api/square/sync
 * Get synced products for a salon
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  const salonId = auth?.startsWith('Bearer ') ? auth.slice(7).split(':')[0] : 'default';

  const products = salonProducts.get(salonId) || [];
  const connection = getConnection(salonId);

  return NextResponse.json({
    success: true,
    data: {
      products,
      total: products.length,
      last_synced: connection?.catalog_synced_at || null,
    },
  });
}

function getSyncedProducts(salonId: string): SyncedProduct[] {
  return salonProducts.get(salonId) || [];
}
