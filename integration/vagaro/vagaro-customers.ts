/**
 * Vagaro Customers Sync Module
 * Fetches and normalizes customer data from Vagaro API to UnifiedCustomer.
 */

import {
  type VagaroCustomer,
  type UnifiedCustomer,
  type VagaroCustomerListParams,
  VagaroCustomerSchema,
  UnifiedCustomerSchema,
  VagaroError,
} from "./types";
import { VagaroApiClient, getVagaroClient } from "./vagaro-client";

// ═══════════════════════════════════════════════════════════════
// Normalization
// ═══════════════════════════════════════════════════════════════

/**
 * Normalize a raw VagaroCustomer into a UnifiedCustomer.
 * Handles missing/optional fields safely.
 */
export function normalizeVagaroCustomer(
  raw: VagaroCustomer,
  opts?: { sourceTimestamp?: string }
): UnifiedCustomer {
  const now = opts?.sourceTimestamp ?? new Date().toISOString();

  return UnifiedCustomerSchema.parse({
    id: crypto.randomUUID(),
    externalId: String(raw.id),
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email ?? null,
    phone: raw.phone ?? raw.mobilePhone ?? null,
    dateOfBirth: raw.dateOfBirth ?? null,
    gender: raw.gender ?? null,
    address: raw.address ?? null,
    notes: raw.notes ?? null,
    tags: raw.tags ?? [],
    totalVisits: raw.totalVisits ?? 0,
    totalSpent: raw.totalSpent ?? 0,
    lastVisitDate: raw.lastVisitDate ?? null,
    isVip: raw.isVip ?? false,
    source: "vagaro" as const,
    rawData: raw,
    createdAt: now,
    updatedAt: now,
  });
}

// ═══════════════════════════════════════════════════════════════
// Data Access
// ═══════════════════════════════════════════════════════════════

export interface CustomerSyncOptions {
  /** Only fetch customers updated since this ISO datetime */
  updatedSince?: string;
  /** Include soft-deleted customers */
  includeDeleted?: boolean;
  /** Search query (name, email, phone) */
  search?: string;
  /** Page size for pagination */
  pageSize?: number;
}

export interface CustomerSyncResult {
  customers: UnifiedCustomer[];
  totalFetched: number;
  totalNormalized: number;
  errors: Array<{ rawId?: string; error: VagaroError }>;
}

export class VagaroCustomersClient {
  private client: VagaroApiClient;

  constructor(config: { businessId: string; apiKey: string; baseUrl?: string }) {
    this.client = getVagaroClient({
      businessId: config.businessId,
      fetch: globalThis.fetch,
    });
  }

  /** Fetch a single customer by Vagaro ID */
  async getById(vagaroCustomerId: string | number): Promise<UnifiedCustomer> {
    const raw = await this.client.get<VagaroCustomer>(`/customers/${vagaroCustomerId}`);
    const validated = VagaroCustomerSchema.parse(raw);
    return normalizeVagaroCustomer(validated);
  }

  /** Fetch customers with optional filtering */
  async list(options: CustomerSyncOptions = {}): Promise<CustomerSyncResult> {
    const params: VagaroCustomerListParams = {
      page: 1,
      pageSize: options.pageSize ?? 100,
      updatedSince: options.updatedSince,
      includeDeleted: options.includeDeleted ?? false,
      search: options.search,
    };

    const result: CustomerSyncResult = {
      customers: [],
      totalFetched: 0,
      totalNormalized: 0,
      errors: [],
    };

    for await (const raw of this.client.paginate<VagaroCustomer>("/customers", params)) {
      result.totalFetched++;
      try {
        const validated = VagaroCustomerSchema.parse(raw);
        const normalized = normalizeVagaroCustomer(validated);
        result.customers.push(normalized);
        result.totalNormalized++;
      } catch (err) {
        const error = err instanceof VagaroError
          ? err
          : new VagaroError({
              code: "VALIDATION_ERROR",
              message: err instanceof Error ? err.message : String(err),
              retryable: false,
            });
        result.errors.push({ rawId: String((raw as Record<string, unknown>)?.id ?? "unknown"), error });
      }
    }

    return result;
  }

  /** Fetch all customers updated since a given timestamp */
  async syncSince(updatedSince: string, options?: Omit<CustomerSyncOptions, "updatedSince">): Promise<CustomerSyncResult> {
    return this.list({ ...options, updatedSince });
  }

  /** Full sync — fetch all active customers */
  async fullSync(options?: Omit<CustomerSyncOptions, "updatedSince">): Promise<CustomerSyncResult> {
    return this.list(options);
  }
}

// ═══════════════════════════════════════════════════════════════
// Utility Export
// ═══════════════════════════════════════════════════════════════

export function createVagaroCustomersClient(config: {
  businessId: string;
  apiKey: string;
  baseUrl?: string;
}): VagaroCustomersClient {
  return new VagaroCustomersClient(config);
}
