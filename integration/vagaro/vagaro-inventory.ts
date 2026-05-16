/**
 * Vagaro Inventory Sync Module
 * Fetches product inventory and maps to UnifiedInventoryItem.
 */

import {
  type VagaroInventoryItem,
  type UnifiedInventoryItem,
  type VagaroInventoryListParams,
  VagaroInventoryItemSchema,
  UnifiedInventoryItemSchema,
  VagaroError,
  VagaroErrorCodeSchema,
} from "./types";
import { VagaroApiClient, getVagaroClient } from "./vagaro-client";

// ═══════════════════════════════════════════════════════════════
// Status Mapping
// ═══════════════════════════════════════════════════════════════

const INVENTORY_STATUS_MAP: Record<
  VagaroInventoryItem["status"],
  UnifiedInventoryItem["status"]
> = {
  InStock: "in_stock",
  LowStock: "low_stock",
  OutOfStock: "out_of_stock",
  Discontinued: "discontinued",
};

// ═══════════════════════════════════════════════════════════════
// Normalization
// ═══════════════════════════════════════════════════════════════

/**
 * Normalize a raw VagaroInventoryItem into a UnifiedInventoryItem.
 */
export function normalizeVagaroInventoryItem(
  raw: VagaroInventoryItem,
  opts?: { sourceTimestamp?: string }
): UnifiedInventoryItem {
  const now = opts?.sourceTimestamp ?? new Date().toISOString();

  const mappedStatus = INVENTORY_STATUS_MAP[raw.status] ?? "in_stock";

  return UnifiedInventoryItemSchema.parse({
    id: crypto.randomUUID(),
    externalId: String(raw.id),
    sku: raw.sku ?? null,
    name: raw.name,
    description: raw.description ?? null,
    brand: raw.brand ?? null,
    category: raw.category ?? null,
    barcode: raw.barcode ?? null,
    price: raw.price,
    cost: raw.cost ?? null,
    quantityOnHand: raw.quantityOnHand ?? 0,
    quantityReserved: raw.quantityReserved ?? 0,
    reorderPoint: raw.reorderPoint ?? null,
    status: mappedStatus,
    isActive: raw.isActive ?? true,
    isRetail: raw.isRetail ?? true,
    imageUrl: raw.imageUrl ?? null,
    source: "vagaro" as const,
    rawData: raw,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  });
}

// ═══════════════════════════════════════════════════════════════
// Data Access
// ═══════════════════════════════════════════════════════════════

export interface InventorySyncOptions {
  /** Filter by category name */
  category?: string;
  /** Filter by statuses */
  statuses?: VagaroInventoryItem["status"][];
  /** Only active items */
  activeOnly?: boolean;
  /** Only low stock items */
  lowStockOnly?: boolean;
  /** Only items updated since this ISO datetime */
  updatedSince?: string;
  /** Search query */
  search?: string;
  pageSize?: number;
}

export interface InventorySyncResult {
  items: UnifiedInventoryItem[];
  totalFetched: number;
  totalNormalized: number;
  errors: Array<{ rawId?: string; error: VagaroError }>;
}

export class VagaroInventoryClient {
  private client: VagaroApiClient;

  constructor(config: { businessId: string; apiKey: string; baseUrl?: string }) {
    this.client = getVagaroClient({
      businessId: config.businessId,
      fetch: globalThis.fetch,
    });
  }

  /** Fetch a single inventory item by Vagaro ID */
  async getById(vagaroItemId: string | number): Promise<UnifiedInventoryItem> {
    const raw = await this.client.get<VagaroInventoryItem>(`/inventory/${vagaroItemId}`);
    const validated = VagaroInventoryItemSchema.parse(raw);
    return normalizeVagaroInventoryItem(validated);
  }

  /** Fetch all inventory items with optional filtering */
  async list(options: InventorySyncOptions = {}): Promise<InventorySyncResult> {
    const params: VagaroInventoryListParams = {
      page: 1,
      pageSize: options.pageSize ?? 100,
      category: options.category,
      status: options.statuses,
      isActive: options.activeOnly,
      lowStockOnly: options.lowStockOnly ?? false,
      updatedSince: options.updatedSince,
      search: options.search,
    };

    const result: InventorySyncResult = {
      items: [],
      totalFetched: 0,
      totalNormalized: 0,
      errors: [],
    };

    for await (const raw of this.client.paginate<VagaroInventoryItem>("/inventory", params)) {
      result.totalFetched++;
      try {
        const validated = VagaroInventoryItemSchema.parse(raw);
        const normalized = normalizeVagaroInventoryItem(validated);
        result.items.push(normalized);
        result.totalNormalized++;
      } catch (err) {
        const error = err instanceof VagaroError
          ? err
          : new VagaroError({
              code: VagaroErrorCodeSchema.enum.VALIDATION_ERROR,
              message: err instanceof Error ? err.message : String(err),
              retryable: false,
            });
        result.errors.push({ rawId: String((raw as Record<string, unknown>)?.id ?? "unknown"), error });
      }
    }

    return result;
  }

  /** Fetch only low-stock items (useful for alerts) */
  async getLowStock(options?: Omit<InventorySyncOptions, "lowStockOnly">): Promise<InventorySyncResult> {
    return this.list({ ...options, lowStockOnly: true });
  }

  /** Fetch only out-of-stock items */
  async getOutOfStock(options?: Omit<InventorySyncOptions, "statuses">): Promise<InventorySyncResult> {
    return this.list({ ...options, statuses: ["OutOfStock"] });
  }

  /** Incremental sync — inventory updated since a timestamp */
  async syncSince(updatedSince: string, options?: Omit<InventorySyncOptions, "updatedSince">): Promise<InventorySyncResult> {
    return this.list({ ...options, updatedSince });
  }

  /** Full sync — all inventory items */
  async fullSync(options?: Omit<InventorySyncOptions, "updatedSince">): Promise<InventorySyncResult> {
    return this.list(options);
  }
}

// ═══════════════════════════════════════════════════════════════
// Utility Export
// ═══════════════════════════════════════════════════════════════

export function createVagaroInventoryClient(config: {
  businessId: string;
  apiKey: string;
  baseUrl?: string;
}): VagaroInventoryClient {
  return new VagaroInventoryClient(config);
}
