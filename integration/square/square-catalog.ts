/**
 * Square Catalog Sync Module
 * Fetch inventory/products and map to UnifiedInventoryItem
 */

import { z } from 'zod';
import { SquareClient, SquareError } from './square-client';
import {
  type SquareCatalogObject,
  type SquareInventoryCount,
  type UnifiedInventoryItem,
  type SquareCatalogItem,
  type SquareCatalogItemVariation,
} from './types';

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const squareMoneySchema = z.object({
  amount: z.number(),
  currency: z.string(),
});

const squareCatalogItemVariationSchema = z.object({
  item_id: z.string().optional(),
  name: z.string().optional(),
  sku: z.string().optional(),
  upc: z.string().optional(),
  ordinal: z.number().optional(),
  pricing_type: z.enum(['FIXED_PRICING', 'VARIABLE_PRICING']).optional(),
  price_money: squareMoneySchema.optional(),
  track_inventory: z.boolean().optional(),
  inventory_alert_type: z.enum(['NONE', 'LOW_QUANTITY', 'HIGH_QUANTITY']).optional(),
  inventory_alert_threshold: z.number().optional(),
  service_duration: z.number().optional(),
  available_for_booking: z.boolean().optional(),
  measurement_unit_id: z.string().optional(),
  sellable: z.boolean().optional(),
  stockable: z.boolean().optional(),
  image_ids: z.array(z.string()).optional(),
  team_member_ids: z.array(z.string()).optional(),
}).passthrough();

const squareCatalogItemSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  abbreviation: z.string().optional(),
  available_online: z.boolean().optional(),
  available_for_pickup: z.boolean().optional(),
  available_electronically: z.boolean().optional(),
  category_id: z.string().optional(),
  tax_ids: z.array(z.string()).optional(),
  variations: z.array(z.unknown()).optional(),
  product_type: z.enum(['REGULAR', 'GIFT_CARD']).optional(),
  skip_modifier_screen: z.boolean().optional(),
  image_ids: z.array(z.string()).optional(),
  sort_name: z.string().optional(),
  description_html: z.string().optional(),
  description_plaintext: z.string().optional(),
}).passthrough();

const squareCatalogCategorySchema = z.object({
  name: z.string().optional(),
  image_ids: z.array(z.string()).optional(),
}).passthrough();

const squareCatalogObjectSchema = z.object({
  type: z.enum([
    'ITEM', 'ITEM_VARIATION', 'CATEGORY', 'DISCOUNT', 'TAX',
    'MODIFIER', 'MODIFIER_LIST', 'PRICING_RULE', 'PRODUCT_SET',
    'TIME_PERIOD', 'MEASUREMENT_UNIT', 'SUBSCRIPTION_PLAN',
    'ITEM_OPTION', 'ITEM_OPTION_VAL', 'QUICK_AMOUNT_SETTINGS',
  ]),
  id: z.string(),
  updated_at: z.string(),
  version: z.number(),
  is_deleted: z.boolean().optional(),
  present_at_all_locations: z.boolean().optional(),
  present_at_location_ids: z.array(z.string()).optional(),
  absent_at_location_ids: z.array(z.string()).optional(),
  item_data: squareCatalogItemSchema.optional(),
  item_variation_data: squareCatalogItemVariationSchema.optional(),
  category_data: squareCatalogCategorySchema.optional(),
}).passthrough();

const squareInventoryCountSchema = z.object({
  catalog_object_id: z.string(),
  catalog_object_type: z.string(),
  state: z.string(),
  location_id: z.string().optional(),
  quantity: z.string().optional(),
  calculated_at: z.string().optional(),
  is_estimated: z.boolean().optional(),
}).passthrough();

// ---------------------------------------------------------------------------
// Type mapping
// ---------------------------------------------------------------------------

function mapCatalogType(type: SquareCatalogObject['type']): UnifiedInventoryItem['type'] {
  switch (type) {
    case 'ITEM':
    case 'ITEM_VARIATION':
      return 'product';
    case 'CATEGORY':
      return 'category';
    case 'DISCOUNT':
      return 'discount';
    case 'TAX':
      return 'tax';
    case 'MODIFIER':
    case 'MODIFIER_LIST':
      return 'modifier';
    default:
      return 'product';
  }
}

function mapPricingType(
  pricingType?: 'FIXED_PRICING' | 'VARIABLE_PRICING',
): UnifiedInventoryItem['pricingType'] {
  switch (pricingType) {
    case 'FIXED_PRICING':
      return 'fixed';
    case 'VARIABLE_PRICING':
      return 'variable';
    default:
      return undefined;
  }
}

// ---------------------------------------------------------------------------
// SquareCatalog class
// ---------------------------------------------------------------------------

export class SquareCatalog {
  private readonly client: SquareClient;
  private categoryCache = new Map<string, string>();

  constructor(client: SquareClient) {
    this.client = client;
  }

  // -----------------------------------------------------------------------
  // Catalog objects
  // -----------------------------------------------------------------------

  /**
   * Fetch a single catalog object by ID
   */
  async getCatalogObject(
    merchantId: string,
    objectId: string,
    includeRelatedObjects?: boolean,
  ): Promise<UnifiedInventoryItem | null> {
    try {
      const response = await this.client.get<{
        object?: unknown;
        related_objects?: unknown[];
        errors?: unknown[];
      }>(
        merchantId,
        `/catalog/object/${objectId}`,
        includeRelatedObjects ? { include_related_objects: true } : undefined,
      );

      if (response.errors?.length) {
        throw new CatalogSyncError(
          'FETCH_FAILED',
          `Catalog object fetch failed: ${JSON.stringify(response.errors)}`,
        );
      }

      if (!response.object) return null;

      const validated = squareCatalogObjectSchema.safeParse(response.object);
      if (!validated.success) {
        throw new CatalogSyncError(
          'VALIDATION_FAILED',
          `Catalog object ${objectId} failed validation: ${validated.error.message}`,
        );
      }

      // Build category cache from related objects
      if (response.related_objects) {
        for (const rel of response.related_objects) {
          const parsed = squareCatalogObjectSchema.safeParse(rel);
          if (parsed.success && parsed.data.type === 'CATEGORY' && parsed.data.category_data?.name) {
            this.categoryCache.set(parsed.data.id, parsed.data.category_data.name);
          }
        }
      }

      return this.normalizeCatalogObject(validated.data, merchantId);
    } catch (error) {
      if (error instanceof SquareError && error.code === 'NOT_FOUND') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Fetch all catalog objects of specific types
   */
  async getCatalogObjects(
    merchantId: string,
    options: {
      types?: string[];
      updatedAfter?: Date;
      cursor?: string;
      limit?: number;
    } = {},
  ): Promise<{ items: UnifiedInventoryItem[]; cursor?: string }> {
    const body: Record<string, unknown> = {};

    if (options.types?.length) {
      body.object_types = options.types;
    }
    if (options.updatedAfter) {
      body.begin_time = options.updatedAfter.toISOString();
    }
    if (options.cursor) {
      body.cursor = options.cursor;
    }
    if (options.limit) {
      body.limit = options.limit;
    }

    const response = await this.client.post<{
      objects?: unknown[];
      cursor?: string;
      errors?: unknown[];
      related_objects?: unknown[];
    }>(merchantId, '/catalog/list', body);

    if (response.errors?.length) {
      throw new CatalogSyncError(
        'FETCH_FAILED',
        `Catalog list failed: ${JSON.stringify(response.errors)}`,
      );
    }

    // Build category cache
    if (response.related_objects) {
      for (const rel of response.related_objects) {
        const parsed = squareCatalogObjectSchema.safeParse(rel);
        if (parsed.success && parsed.data.type === 'CATEGORY' && parsed.data.category_data?.name) {
          this.categoryCache.set(parsed.data.id, parsed.data.category_data.name);
        }
      }
    }

    const items: UnifiedInventoryItem[] = [];
    for (const raw of response.objects ?? []) {
      const validated = squareCatalogObjectSchema.safeParse(raw);
      if (!validated.success) {
        console.warn(`Catalog object validation failed, skipping: ${validated.error.message}`);
        continue;
      }
      items.push(this.normalizeCatalogObject(validated.data, merchantId));
    }

    return { items, cursor: response.cursor };
  }

  /**
   * Fetch all catalog objects with auto-pagination
   */
  async getAllCatalogObjects(
    merchantId: string,
    options: {
      types?: string[];
      updatedAfter?: Date;
      onProgress?: (processed: number) => void;
    } = {},
  ): Promise<UnifiedInventoryItem[]> {
    const results: UnifiedInventoryItem[] = [];
    let cursor: string | undefined;

    do {
      const page = await this.getCatalogObjects(merchantId, {
        ...options,
        cursor,
        limit: 100,
      });

      results.push(...page.items);
      cursor = page.cursor;

      options.onProgress?.(results.length);
    } while (cursor);

    return results;
  }

  /**
   * Fetch items only (products/services)
   */
  async getItems(
    merchantId: string,
    options: {
      updatedAfter?: Date;
      onProgress?: (processed: number) => void;
    } = {},
  ): Promise<UnifiedInventoryItem[]> {
    return this.getAllCatalogObjects(merchantId, {
      types: ['ITEM'],
      ...options,
    });
  }

  /**
   * Fetch categories
   */
  async getCategories(
    merchantId: string,
    options: {
      updatedAfter?: Date;
      onProgress?: (processed: number) => void;
    } = {},
  ): Promise<UnifiedInventoryItem[]> {
    return this.getAllCatalogObjects(merchantId, {
      types: ['CATEGORY'],
      ...options,
    });
  }

  // -----------------------------------------------------------------------
  // Inventory
  // -----------------------------------------------------------------------

  /**
   * Fetch inventory counts for catalog objects
   */
  async getInventoryCounts(
    merchantId: string,
    options: {
      catalogObjectIds?: string[];
      locationIds?: string[];
      updatedAfter?: Date;
      cursor?: string;
      limit?: number;
    } = {},
  ): Promise<{ counts: SquareInventoryCount[]; cursor?: string }> {
    const body: Record<string, unknown> = {};

    if (options.catalogObjectIds?.length) {
      body.catalog_object_ids = options.catalogObjectIds;
    }
    if (options.locationIds?.length) {
      body.location_ids = options.locationIds;
    }
    if (options.updatedAfter) {
      body.updated_after = options.updatedAfter.toISOString();
    }
    if (options.cursor) {
      body.cursor = options.cursor;
    }
    if (options.limit) {
      body.limit = options.limit;
    }

    const response = await this.client.post<{
      counts?: unknown[];
      cursor?: string;
      errors?: unknown[];
    }>(merchantId, '/inventory/batch-retrieve-counts', body);

    if (response.errors?.length) {
      throw new CatalogSyncError(
        'FETCH_FAILED',
        `Inventory counts fetch failed: ${JSON.stringify(response.errors)}`,
      );
    }

    const counts: SquareInventoryCount[] = [];
    for (const raw of response.counts ?? []) {
      const validated = squareInventoryCountSchema.safeParse(raw);
      if (!validated.success) {
        console.warn(`Inventory count validation failed, skipping: ${validated.error.message}`);
        continue;
      }
      counts.push(validated.data);
    }

    return { counts, cursor: response.cursor };
  }

  /**
   * Get inventory counts for specific items
   */
  async getInventoryForItems(
    merchantId: string,
    itemIds: string[],
  ): Promise<Map<string, number>> {
    const result = new Map<string, number>();
    const counts = await this.getInventoryCounts(merchantId, {
      catalogObjectIds: itemIds,
    });

    for (const count of counts.counts) {
      if (count.state === 'IN_STOCK' && count.quantity) {
        const existing = result.get(count.catalog_object_id) ?? 0;
        result.set(count.catalog_object_id, existing + parseFloat(count.quantity));
      }
    }

    return result;
  }

  /**
   * Get inventory count for a single item
   */
  async getInventoryForItem(
    merchantId: string,
    itemId: string,
  ): Promise<number> {
    const map = await this.getInventoryForItems(merchantId, [itemId]);
    return map.get(itemId) ?? 0;
  }

  // -----------------------------------------------------------------------
  // Search
  // -----------------------------------------------------------------------

  /**
   * Search catalog objects
   */
  async searchCatalog(
    merchantId: string,
    query: string,
    options: {
      types?: string[];
      limit?: number;
      cursor?: string;
    } = {},
  ): Promise<{ items: UnifiedInventoryItem[]; cursor?: string }> {
    const body: Record<string, unknown> = {
      text: query,
    };

    if (options.types?.length) {
      body.object_types = options.types;
    }
    if (options.limit) {
      body.limit = options.limit;
    }
    if (options.cursor) {
      body.cursor = options.cursor;
    }

    const response = await this.client.post<{
      objects?: unknown[];
      cursor?: string;
      errors?: unknown[];
      related_objects?: unknown[];
    }>(merchantId, '/catalog/search', body);

    if (response.errors?.length) {
      throw new CatalogSyncError(
        'SEARCH_FAILED',
        `Catalog search failed: ${JSON.stringify(response.errors)}`,
      );
    }

    const items: UnifiedInventoryItem[] = [];
    for (const raw of response.objects ?? []) {
      const validated = squareCatalogObjectSchema.safeParse(raw);
      if (!validated.success) {
        console.warn(`Search result validation failed, skipping: ${validated.error.message}`);
        continue;
      }
      items.push(this.normalizeCatalogObject(validated.data, merchantId));
    }

    return { items, cursor: response.cursor };
  }

  // -----------------------------------------------------------------------
  // Normalization
  // -----------------------------------------------------------------------

  private normalizeCatalogObject(
    obj: SquareCatalogObject,
    merchantId: string,
  ): UnifiedInventoryItem {
    const itemData = obj.item_data;
    const variationData = obj.item_variation_data;
    const categoryData = obj.category_data;

    // Determine name
    const name =
      variationData?.name ??
      itemData?.name ??
      categoryData?.name ??
      'Unknown';

    // Determine description
    const description =
      itemData?.description ??
      itemData?.description_plaintext ??
      undefined;

    // Determine price
    let price: number | undefined;
    let currency: string | undefined;
    if (variationData?.price_money) {
      price = variationData.price_money.amount / 100;
      currency = variationData.price_money.currency;
    }

    // Determine category
    const categoryId = itemData?.category_id;
    const categoryName = categoryId ? this.categoryCache.get(categoryId) : undefined;

    // Determine type
    const type = mapCatalogType(obj.type);

    // Determine if it's a service
    const isService =
      type === 'product' &&
      (variationData?.service_duration !== undefined ||
        variationData?.available_for_booking === true);

    return {
      id: `sq_${obj.id}`,
      externalId: obj.id,
      platform: 'square',
      merchantId,
      type: isService ? 'service' : type,
      name,
      description,
      sku: variationData?.sku,
      upc: variationData?.upc,
      categoryId,
      categoryName,
      price,
      currency,
      pricingType: mapPricingType(variationData?.pricing_type),
      trackInventory: variationData?.track_inventory,
      quantity: undefined, // Fetched separately via inventory API
      availableForBooking: variationData?.available_for_booking,
      serviceDuration: variationData?.service_duration
        ? Math.round(variationData.service_duration / 60)
        : undefined,
      isDeleted: obj.is_deleted ?? false,
      locationIds: obj.present_at_location_ids ??
        (obj.present_at_all_locations ? [] : undefined),
      variationIds: itemData?.variations
        ?.filter((v): v is { id: string } => typeof v === 'object' && v !== null && 'id' in v)
        .map((v) => v.id) ??
        (variationData ? [obj.id] : undefined),
      imageUrls: itemData?.image_ids?.map((id) =
        `https://square-catalog-production.s3.amazonaws.com/${id}`) ??
        variationData?.image_ids?.map((id) =
          `https://square-catalog-production.s3.amazonaws.com/${id}`),
      createdAt: undefined, // Not provided by Square
      updatedAt: obj.updated_at,
      rawData: obj as unknown as Record<string, unknown>,
    };
  }
}

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

export class CatalogSyncError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'CatalogSyncError';
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CatalogSyncError);
    }
  }
}
