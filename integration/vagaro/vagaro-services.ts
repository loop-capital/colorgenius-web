/**
 * Vagaro Services Sync Module
 * Fetches service catalog and maps to UnifiedService.
 */

import {
  type VagaroService,
  type UnifiedService,
  type VagaroServiceListParams,
  VagaroServiceSchema,
  UnifiedServiceSchema,
  VagaroError,
  VagaroErrorCodeSchema,
} from "./types";
import { VagaroApiClient, getVagaroClient } from "./vagaro-client";

// ═══════════════════════════════════════════════════════════════
// Normalization
// ═══════════════════════════════════════════════════════════════

/**
 * Normalize a raw VagaroService into a UnifiedService.
 */
export function normalizeVagaroService(
  raw: VagaroService,
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
    durationMinutes: raw.duration,
    bufferMinutes: raw.bufferTime ?? 0,
    isActive: raw.isActive ?? true,
    isOnlineBookable: raw.isOnlineBookable ?? true,
    color: raw.color ?? null,
    imageUrl: raw.imageUrl ?? null,
    taxRate: raw.taxRate ?? null,
    source: "vagaro" as const,
    rawData: raw,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  });
}

// ═══════════════════════════════════════════════════════════════
// Data Access
// ═══════════════════════════════════════════════════════════════

export interface ServiceSyncOptions {
  /** Filter by category ID */
  categoryId?: string | number;
  /** Only active services */
  activeOnly?: boolean;
  /** Only services updated since this ISO datetime */
  updatedSince?: string;
  /** Search query */
  search?: string;
  pageSize?: number;
}

export interface ServiceSyncResult {
  services: UnifiedService[];
  totalFetched: number;
  totalNormalized: number;
  errors: Array<{ rawId?: string; error: VagaroError }>;
}

export class VagaroServicesClient {
  private client: VagaroApiClient;

  constructor(config: { businessId: string; apiKey: string; baseUrl?: string }) {
    this.client = getVagaroClient({
      businessId: config.businessId,
      fetch: globalThis.fetch,
    });
  }

  /** Fetch a single service by Vagaro ID */
  async getById(vagaroServiceId: string | number): Promise<UnifiedService> {
    const raw = await this.client.get<VagaroService>(`/services/${vagaroServiceId}`);
    const validated = VagaroServiceSchema.parse(raw);
    return normalizeVagaroService(validated);
  }

  /** Fetch all services with optional filtering */
  async list(options: ServiceSyncOptions = {}): Promise<ServiceSyncResult> {
    const params: VagaroServiceListParams = {
      page: 1,
      pageSize: options.pageSize ?? 100,
      categoryId: options.categoryId ? String(options.categoryId) : undefined,
      isActive: options.activeOnly,
      updatedSince: options.updatedSince,
      search: options.search,
    };

    const result: ServiceSyncResult = {
      services: [],
      totalFetched: 0,
      totalNormalized: 0,
      errors: [],
    };

    for await (const raw of this.client.paginate<VagaroService>("/services", params)) {
      result.totalFetched++;
      try {
        const validated = VagaroServiceSchema.parse(raw);
        const normalized = normalizeVagaroService(validated);
        result.services.push(normalized);
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

  /** Fetch all service categories */
  async listCategories(): Promise<Array<{ id: string; name: string; description?: string | null }>> {
    const cats = await this.client.get<
      Array<{ id: string | number; name: string; description?: string | null }>
    >("/service-categories");
    return cats.map((c) => ({
      id: String(c.id),
      name: c.name,
      description: c.description ?? null,
    }));
  }

  /** Incremental sync — services updated since a timestamp */
  async syncSince(updatedSince: string, options?: Omit<ServiceSyncOptions, "updatedSince">): Promise<ServiceSyncResult> {
    return this.list({ ...options, updatedSince });
  }

  /** Full sync — all services */
  async fullSync(options?: Omit<ServiceSyncOptions, "updatedSince">): Promise<ServiceSyncResult> {
    return this.list(options);
  }
}

// ═══════════════════════════════════════════════════════════════
// Utility Export
// ═══════════════════════════════════════════════════════════════

export function createVagaroServicesClient(config: {
  businessId: string;
  apiKey: string;
  baseUrl?: string;
}): VagaroServicesClient {
  return new VagaroServicesClient(config);
}
