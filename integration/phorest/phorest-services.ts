/**
 * Phorest Services Sync Module
 * Fetches service catalog and maps to UnifiedService.
 */

import {
  type PhorestService,
  type UnifiedService,
  type PhorestServiceListParams,
  PhorestServiceSchema,
  UnifiedServiceSchema,
  PhorestError,
  PhorestErrorCodeSchema,
} from "./types";
import { PhorestApiClient, getPhorestClient } from "./phorest-client";

// ═══════════════════════════════════════════════════════════════
// Normalization
// ═══════════════════════════════════════════════════════════════

/**
 * Normalize a raw PhorestService into a UnifiedService.
 */
export function normalizePhorestService(
  raw: PhorestService,
  opts?: { sourceTimestamp?: string }
): UnifiedService {
  const now = opts?.sourceTimestamp ?? new Date().toISOString();

  return UnifiedServiceSchema.parse({
    id: crypto.randomUUID(),
    externalId: String(raw.id),
    name: raw.name,
    description: raw.description ?? null,
    categoryId: raw.categoryId ? String(raw.categoryId) : null,
    categoryName: raw.category?.name ?? null,
    price: raw.price,
    durationMinutes: raw.durationMinutes,
    bufferMinutes: raw.bufferMinutes ?? 0,
    isActive: raw.isActive ?? true,
    isOnlineBookable: raw.isOnlineBookable ?? true,
    color: raw.color ?? null,
    imageUrl: raw.imageUrl ?? null,
    taxRate: raw.taxRate ?? null,
    source: "phorest" as const,
    rawData: raw,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  });
}

// ═══════════════════════════════════════════════════════════════
// Data Access
// ═══════════════════════════════════════════════════════════════

export interface ServiceSyncOptions {
  /** Branch ID (required for services) */
  branchId: string;
  /** Filter by category ID */
  categoryId?: string;
  /** Only active services */
  activeOnly?: boolean;
  /** Only services updated since this ISO datetime */
  updatedSince?: string;
  /** Search query */
  name?: string;
  pageSize?: number;
}

export interface ServiceSyncResult {
  services: UnifiedService[];
  totalFetched: number;
  totalNormalized: number;
  errors: Array<{ rawId?: string; error: PhorestError }>;
}

export class PhorestServicesClient {
  private client: PhorestApiClient;
  private businessId: string;

  constructor(config: { businessId: string; baseUrl?: string }) {
    this.businessId = config.businessId;
    this.client = getPhorestClient({
      businessId: config.businessId,
      fetch: globalThis.fetch,
    });
  }

  /** Fetch a single service by Phorest ID */
  async getById(branchId: string, phorestServiceId: string): Promise<UnifiedService> {
    const raw = await this.client.get<PhorestService>(
      `/business/${this.businessId}/branch/${branchId}/service/${phorestServiceId}`
    );
    const validated = PhorestServiceSchema.parse(raw);
    return normalizePhorestService(validated);
  }

  /** Fetch all services with optional filtering */
  async list(options: ServiceSyncOptions): Promise<ServiceSyncResult> {
    const params: PhorestServiceListParams = {
      page: 0,
      size: options.pageSize ?? 100,
      categoryId: options.categoryId,
      isActive: options.activeOnly,
      updated_at: options.updatedSince,
      name: options.name,
    };

    const result: ServiceSyncResult = {
      services: [],
      totalFetched: 0,
      totalNormalized: 0,
      errors: [],
    };

    for await (const raw of this.client.paginate<PhorestService>(
      `/business/${this.businessId}/branch/${options.branchId}/service`,
      params
    )) {
      result.totalFetched++;
      try {
        const validated = PhorestServiceSchema.parse(raw);
        const normalized = normalizePhorestService(validated);
        result.services.push(normalized);
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

  /** Fetch all service categories for a branch */
  async listCategories(branchId: string): Promise<Array<{ id: string; name: string; description?: string | null }>> {
    // Phorest embeds categories within services; fetch services and extract unique categories
    const result = await this.list({ branchId });
    const categoryMap = new Map<string, { id: string; name: string; description?: string | null }>();

    for (const service of result.services) {
      if (service.categoryId && !categoryMap.has(service.categoryId)) {
        categoryMap.set(service.categoryId, {
          id: service.categoryId,
          name: service.categoryName ?? "Unknown",
          description: null,
        });
      }
    }

    return Array.from(categoryMap.values());
  }

  /** Incremental sync — services updated since a timestamp */
  async syncSince(branchId: string, updatedSince: string, options?: Omit<ServiceSyncOptions, "branchId" | "updatedSince">): Promise<ServiceSyncResult> {
    return this.list({ branchId, ...options, updatedSince });
  }

  /** Full sync — all services */
  async fullSync(branchId: string, options?: Omit<ServiceSyncOptions, "branchId" | "updatedSince">): Promise<ServiceSyncResult> {
    return this.list({ branchId, ...options });
  }
}

// ═══════════════════════════════════════════════════════════════
// Utility Export
// ═══════════════════════════════════════════════════════════════

export function createPhorestServicesClient(config: {
  businessId: string;
  baseUrl?: string;
}): PhorestServicesClient {
  return new PhorestServicesClient(config);
}
