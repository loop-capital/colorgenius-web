/**
 * Phorest Inventory Sync Module
 * Fetches product inventory and maps to UnifiedInventoryItem.
 */

import {
  type PhorestProduct,
  type UnifiedInventoryItem,
  type PhorestProductListParams,
  PhorestProductSchema,
  UnifiedInventoryItemSchema,
  PhorestError,
  PhorestErrorCodeSchema,
} from "./types";
import { PhorestApiClient, getPhorestClient } from "./phorest-client";

// ═══════════════════════════════════════════════════════════════
// Status Mapping
// ═══════════════════════════════════════════════════════════════

const INVENTORY_STATUS_MAP: Record<
  PhorestProduct["status"] | string,
  UnifiedInventoryItem["status"]
> = {
  ACTIVE: "in_stock",
  INACTIVE: "discontinued",
  ARCHIVED: "archived",
};

// Phorest products don't have explicit stock status, so we infer from quantity
function inferStockStatus(
  quantity: number,
  reorderPoint?: number | null
): UnifiedInventoryItem["status"] {
  if (quantity === 0) return "out_of_stock";
  if (reorderPoint !== null && reorderPoint !== undefined && quantity <= reorderPoint) return "low_stock";
  return "in_stock";
}

// ═══════════════════════════════════════════════════════════════
// Normalization
// ═══════════════════════════════════════════════════════════════

/**
 * Normalize a raw PhorestProduct into a UnifiedInventoryItem.
 */
export function normalizePhorestProduct(
  raw: PhorestProduct,
  opts?: { sourceTimestamp?: string }
): UnifiedInventoryItem {
  const now = opts?.sourceTimestamp ?? new Date().toISOString();

  const mappedStatus = INVENTORY_STATUS_MAP[raw.status] ?? "in_stock";
  const inferredStatus = inferStockStatus(raw.quantityOnHand ?? 0, raw.reorderPoint);

  // Use inferred status if the mapped one is just a fallback
  const finalStatus = mappedStatus === "in_stock" ? inferredStatus : mappedStatus;

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
    status: finalStatus,
    isActive: raw.isActive ?? true,
    isRetail: raw.isRetail ?? true,
    imageUrl: raw.imageUrl ?? null,
    source: "phorest" as const,
    rawData: raw,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  });
}

// ═══════════════════════════════════════════════════════════════
// Data Access
// ═══════════════════════════════════════════════════════════════

export interface InventorySyncOptions {
  /** Branch ID (required for products) */
  branchId: string;
  /** Filter by product type */
  type?: PhorestProduct["type"];
  /** Only items updated since this ISO datetime */
  updatedSince?: string;
  /** Search query */
  name?: string;
  /** Search by barcode */
  barcode?: string;
  /** Include archived items */
  includeArchived?: boolean;
  /** Only low stock items */
  lowStockOnly?: boolean;
  /** Only out of stock items */
  outOfStockOnly?: boolean;
  pageSize?: number;
}

export interface InventorySyncResult {
  items: UnifiedInventoryItem[];
  totalFetched: number;
  totalNormalized: number;
  errors: Array<{ rawId?: string; error: PhorestError }>;
}

export interface LowStockAlert {
  item: UnifiedInventoryItem;
  currentQuantity: number;
  reorderPoint: number;
  shortfall: number;
}

export class PhorestInventoryClient {
  private client: PhorestApiClient;
  private businessId: string;

  constructor(config: { businessId: string; baseUrl?: string }) {
    this.businessId = config.businessId;
    this.client = getPhorestClient({
      businessId: config.businessId,
      fetch: globalThis.fetch,
    });
  }

  /** Fetch a single product by Phorest ID */
  async getById(branchId: string, phorestProductId: string): Promise<UnifiedInventoryItem> {
    const raw = await this.client.get<PhorestProduct>(
      `/business/${this.businessId}/branch/${branchId}/product/${phorestProductId}`
    );
    const validated = PhorestProductSchema.parse(raw);
    return normalizePhorestProduct(validated);
  }

  /** Fetch all products with optional filtering */
  async list(options: InventorySyncOptions): Promise<InventorySyncResult> {
    const params: PhorestProductListParams = {
      page: 0,
      size: options.pageSize ?? 100,
      type: options.type,
      updated_at: options.updatedSince,
      name: options.name,
      barcode: options.barcode,
      include_archived: options.includeArchived ?? false,
      low_stock: options.lowStockOnly ?? false,
      out_of_stock: options.outOfStockOnly ?? false,
    };

    const result: InventorySyncResult = {
      items: [],
      totalFetched: 0,
      totalNormalized: 0,
      errors: [],
    };

    for await (const raw of this.client.paginate<PhorestProduct>(
      `/business/${this.businessId}/branch/${options.branchId}/product`,
      params
    )) {
      result.totalFetched++;
      try {
        const validated = PhorestProductSchema.parse(raw);
        const normalized = normalizePhorestProduct(validated);
        result.items.push(normalized);
        result.totalNormalized++;
      } catch (err) {
        const error = err instanceof PhorestError
          ? err
          : new PhorestError({
              code: PhorestErrorCodeSchema.enum.VALIDATION_ERROR,
              message: err instanceof Error ? err.message : String(err),
              retryable: false,
            });
        result.errors.push({ rawId: String((raw as Record<string, unknown>)?.id ?? "unknown"), error });
      }
    }

    return result;
  }

  /** Fetch only low-stock items (useful for alerts) */
  async getLowStock(options: Omit<InventorySyncOptions, "lowStockOnly">): Promise<InventorySyncResult> {
    return this.list({ ...options, lowStockOnly: true });
  }

  /** Fetch only out-of-stock items */
  async getOutOfStock(options: Omit<InventorySyncOptions, "outOfStockOnly">): Promise<InventorySyncResult> {
    return this.list({ ...options, outOfStockOnly: true });
  }

  /** Get low-stock alerts with shortfall calculations */
  async getLowStockAlerts(options: Omit<InventorySyncOptions, "lowStockOnly">): Promise<LowStockAlert[]> {
    const result = await this.getLowStock(options);
    const alerts: LowStockAlert[] = [];

    for (const item of result.items) {
      if (item.reorderPoint !== null && item.reorderPoint !== undefined && item.quantityOnHand < item.reorderPoint) {
        alerts.push({
          item,
          currentQuantity: item.quantityOnHand,
          reorderPoint: item.reorderPoint,
          shortfall: item.reorderPoint - item.quantityOnHand,
        });
      }
    }

    return alerts.sort((a, b) => b.shortfall - a.shortfall);
  }

  /** Incremental sync — products updated since a timestamp */
  async syncSince(branchId: string, updatedSince: string, options?: Omit<InventorySyncOptions, "branchId" | "updatedSince">): Promise<InventorySyncResult> {
    return this.list({ branchId, ...options, updatedSince });
  }

  /** Full sync — all products */
  async fullSync(branchId: string, options?: Omit<InventorySyncOptions, "branchId" | "updatedSince">): Promise<InventorySyncResult> {
    return this.list({ branchId, ...options });
  }

  /** Record a purchase (used for inventory deduction) */
  async recordPurchase(
    branchId: string,
    data: {
      clientId?: string;
      staffId?: string;
      appointmentId?: string;
      items: Array<{
        productId?: string;
        serviceId?: string;
        name: string;
        quantity: number;
        unitPrice: number;
      }>;
      paymentMethod?: string;
      notes?: string;
    }
  ): Promise<unknown> {
    const purchaseItems = data.items.map((item) => ({
      ...item,
      totalPrice: item.unitPrice * item.quantity,
      taxAmount: 0,
      discountAmount: 0,
    }));

    const subtotal = purchaseItems.reduce((sum, item) => sum + item.totalPrice, 0);

    return this.client.post<unknown>(`/business/${this.businessId}/branch/${branchId}/purchase`, {
      clientId: data.clientId,
      staffId: data.staffId,
      appointmentId: data.appointmentId,
      items: purchaseItems,
      subtotal,
      taxTotal: 0,
      discountTotal: 0,
      total: subtotal,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// Utility Export
// ═══════════════════════════════════════════════════════════════

export function createPhorestInventoryClient(config: {
  businessId: string;
  baseUrl?: string;
}): PhorestInventoryClient {
  return new PhorestInventoryClient(config);
}
