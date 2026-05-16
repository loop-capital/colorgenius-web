/**
 * POST /api/marketplace/inventory/check
 * Check if stylist has required products for a formula
 * Uses Square Inventory API when configured, falls back to mock data
 */

import { NextRequest, NextResponse } from 'next/server';
import { clientRequests } from '@/lib/api/mock-data';

// Try to import Square — may fail if not configured
let getInventoryCounts: ((ids: string[]) => Promise<Map<string, number>>) | null = null;
try {
  const square = await import('@/lib/square');
  getInventoryCounts = square.getInventoryCounts;
} catch {
  // Square not available, use mock
}

// Product name → Square catalog item ID mapping
// In production, this would be stored in the database
const PRODUCT_CATALOG_MAP: Record<string, string> = {
  'Wella Koleston Perfect 7/3': 'SQUARE_ITEM_placeholder_1',
  'Wella Koleston Perfect 9/1': 'SQUARE_ITEM_placeholder_2',
  'Wella Welloxon 30vol': 'SQUARE_ITEM_placeholder_3',
  'Schwarzkopf Igora Royal 6-0': 'SQUARE_ITEM_placeholder_4',
  'Schwarzkopf Igora Royal 6-12': 'SQUARE_ITEM_placeholder_5',
  'Igora Developer 6%': 'SQUARE_ITEM_placeholder_6',
  'Pulp Riot #6.46': 'SQUARE_ITEM_placeholder_7',
  'Pulp Riot #8.46': 'SQUARE_ITEM_placeholder_8',
  'Pulp Riot Developer 20vol': 'SQUARE_ITEM_placeholder_9',
  'Matrix Socolor 5RV': 'SQUARE_ITEM_placeholder_10',
  'Matrix Color Sync 5RV': 'SQUARE_ITEM_placeholder_11',
};

interface RequiredProduct {
  name: string;
  in_stock: boolean;
  quantity?: number;
  square_catalog_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formula_id } = body;

    if (!formula_id) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'formula_id required' },
      }, { status: 400 });
    }

    // Get required products from client requests
    const relatedRequests = clientRequests.filter(r => r.formula_id === formula_id);
    const allProducts = relatedRequests.flatMap(r => r.required_products);
    const uniqueProductNames = [...new Set(allProducts.map(p => p.name))];

    // Try to check Square inventory
    const catalogIds = uniqueProductNames
      .map(name => PRODUCT_CATALOG_MAP[name])
      .filter(Boolean);

    let inventoryCounts = new Map<string, number>();
    let squareConnected = false;

    if (getInventoryCounts && catalogIds.length > 0) {
      try {
        inventoryCounts = await getInventoryCounts(catalogIds);
        squareConnected = true;
      } catch (e) {
        console.warn('Square inventory check failed, using mock data:', e);
      }
    }

    // Build response
    const requiredProducts: RequiredProduct[] = uniqueProductNames.map(name => {
      const catalogId = PRODUCT_CATALOG_MAP[name];
      if (squareConnected && catalogId) {
        const qty = inventoryCounts.get(catalogId) || 0;
        return { name, in_stock: qty > 0, quantity: qty, square_catalog_id: catalogId };
      }
      // Fallback to mock data from client requests
      const mockProduct = allProducts.find(p => p.name === name);
      return { name, in_stock: mockProduct?.in_stock ?? false };
    });

    const missingProducts = requiredProducts.filter(p => !p.in_stock).map(p => p.name);
    const lowStock = requiredProducts.filter(p => p.in_stock && (p.quantity ?? 999) < 3).map(p => p.name);
    const allInStock = missingProducts.length === 0;

    return NextResponse.json({
      success: true,
      data: {
        formula_id,
        square_connected: squareConnected,
        required_products: requiredProducts,
        all_in_stock: allInStock,
        missing_products: missingProducts,
        low_stock: lowStock,
        suggestion: allInStock
          ? lowStock.length > 0
            ? `All products in stock but ${lowStock.join(', ')} running low — consider reordering`
            : 'All products in stock — ready to prepare'
          : `Order ${missingProducts.join(', ')} before appointment`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Inventory check failed';
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message },
    }, { status: 500 });
  }
}
