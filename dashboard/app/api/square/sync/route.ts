/**
 * POST /api/square/sync
 * Sync a salon's Square product catalog into COLORgenius inventory_items table
 *
 * Pulls all catalog items from the salon's Square account
 * and upserts them into inventory_items with source="square"
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSalonClient, getConnection, saveConnection } from '@/lib/square-multi';
import { prisma } from '@/lib/prisma';

interface SyncedProduct {
  square_catalog_id: string;
  name: string;
  category?: string;
  sku?: string;
  price_cents?: number;
  quantity?: number;
}

/**
 * Map Square catalog category names to our internal category codes
 */
function mapCategory(squareCategory?: string): string {
  if (!squareCategory) return 'other';
  const lower = squareCategory.toLowerCase();
  if (lower.includes('hair color') || lower.includes('haircolor') || lower.includes('colour')) return 'color';
  if (lower.includes('developer') || lower.includes('oxidant') || lower.includes('peroxide')) return 'developer';
  if (lower.includes('treatment') || lower.includes('conditioner') || lower.includes('mask')) return 'treatment';
  return 'other';
}

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    const salonId = auth?.startsWith('Bearer ') ? auth.slice(7).split(':')[0] : 'default';

    // Check that the salon has inventory_management enabled
    const salon = await prisma.salons.findUnique({ where: { id: salonId } });
    if (!salon) {
      return NextResponse.json({
        success: false,
        error: { code: 'SALON_NOT_FOUND', message: 'Salon not found.' },
      }, { status: 404 });
    }

    const features = salon.features_enabled as Record<string, unknown> | null;
    if (!features || features.inventory_management !== true) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVENTORY_DISABLED', message: 'Inventory management is not enabled for this salon. Enable it in salon settings first.' },
      }, { status: 403 });
    }

    const client = await createSalonClient(salonId);
    if (!client) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_CONNECTED', message: 'Square not connected. Connect first.' },
      }, { status: 400 });
    }

    const connection = await getConnection(salonId);
    const locationId = connection?.location_ids[0] || '';

    // Fetch all catalog items from Square
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

    // Upsert each product into inventory_items
    const upsertResults = await Promise.all(
      products.map(async (product) => {
        const category = mapCategory(product.category);
        const shadeCode = product.sku || product.square_catalog_id;
        const brand = product.name.split(' ')[0] || 'Unknown';
        const productLine = product.name;
        const retailPrice = product.price_cents ? product.price_cents / 100 : null;

        return prisma.inventory_items.upsert({
          where: {
            salon_id_brand_shade_code: {
              salon_id: salonId,
              brand: brand,
              shade_code: shadeCode,
            },
          },
          update: {
            source: 'square',
            square_catalog_object_id: product.square_catalog_id,
            square_variation_id: product.sku || null,
            shade_name: product.name,
            category: category,
            quantity_on_hand: product.quantity || 0,
            unit_of_measure: 'grams',
            low_stock_threshold: 50,
            retail_price: retailPrice,
            reorder_point: 25,
            reorder_quantity: 100,
            last_synced_at: new Date(),
            updated_at: new Date(),
          },
          create: {
            salon_id: salonId,
            source: 'square',
            square_catalog_object_id: product.square_catalog_id,
            square_variation_id: product.sku || null,
            brand: brand,
            product_line: productLine,
            shade_code: shadeCode,
            shade_name: product.name,
            category: category,
            quantity_on_hand: product.quantity || 0,
            unit_of_measure: 'grams',
            low_stock_threshold: 50,
            retail_price: retailPrice,
            reorder_point: 25,
            reorder_quantity: 100,
            last_synced_at: new Date(),
          },
        });
      })
    );

    // Update connection sync timestamp
    if (connection) {
      connection.catalog_synced_at = new Date().toISOString();
      await saveConnection(connection);
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
 * Get synced products for a salon from the database
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  const salonId = auth?.startsWith('Bearer ') ? auth.slice(7).split(':')[0] : 'default';

  const items = await prisma.inventory_items.findMany({
    where: {
      salon_id: salonId,
      source: 'square',
    },
    orderBy: { updated_at: 'desc' },
  });

  const connection = await getConnection(salonId);

  return NextResponse.json({
    success: true,
    data: {
      products: items.map((item) => ({
        id: item.id,
        square_catalog_id: item.square_catalog_object_id,
        name: item.shade_name || item.shade_code || '',
        category: item.category,
        sku: item.square_variation_id || undefined,
        price_cents: item.retail_price ? Number(item.retail_price) * 100 : undefined,
        quantity: item.quantity_on_hand,
        brand: item.brand,
        product_line: item.product_line,
      })),
      total: items.length,
      last_synced: connection?.catalog_synced_at || null,
    },
  });
}