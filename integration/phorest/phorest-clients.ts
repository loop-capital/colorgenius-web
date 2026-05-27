/**
 * Phorest Clients Sync Module
 * Fetches and normalizes client (customer) data from Phorest API to UnifiedCustomer.
 */

import {
  type PhorestClient,
  type UnifiedCustomer,
  type PhorestClientListParams,
  type PhorestServiceHistory,
  PhorestClientSchema,
  PhorestServiceHistorySchema,
  UnifiedCustomerSchema,
  PhorestError,
  PhorestErrorCodeSchema,
} from "./types";
import { PhorestApiClient, getPhorestClient } from "./phorest-client";

// ═══════════════════════════════════════════════════════════════
// Normalization
// ═══════════════════════════════════════════════════════════════

/**
 * Normalize a raw PhorestClient into a UnifiedCustomer.
 * Handles missing/optional fields safely.
 */
export function normalizePhorestClient(
  raw: PhorestClient,
  opts?: { sourceTimestamp?: string }
): UnifiedCustomer {
  const now = opts?.sourceTimestamp ?? new Date().toISOString();

  return UnifiedCustomerSchema.parse({
    id: crypto.randomUUID(),
    externalId: String(raw.id),
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email ?? null,
    phone: raw.mobilePhone ?? raw.homePhone ?? raw.workPhone ?? null,
    dateOfBirth: raw.dateOfBirth ?? null,
    gender: raw.gender ?? null,
    address: raw.address
      ? {
          line1: raw.address.line1 ?? undefined,
          line2: raw.address.line2 ?? undefined,
          city: raw.address.city ?? undefined,
          state: raw.address.county ?? undefined,
          zip: raw.address.postcode ?? undefined,
          country: raw.address.country ?? "US",
        }
      : null,
    notes: raw.notes ?? null,
    tags: [],
    totalVisits: raw.totalVisits ?? 0,
    totalSpent: raw.totalSpend ?? 0,
    lastVisitDate: raw.lastVisitDate ?? null,
    isVip: false,
    marketingPermission: raw.marketingPermission ?? false,
    source: "phorest" as const,
    rawData: raw,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  });
}

// ═══════════════════════════════════════════════════════════════
// Data Access
// ═══════════════════════════════════════════════════════════════

export interface ClientSyncOptions {
  /** Only fetch clients updated since this ISO datetime */
  updatedSince?: string;
  /** Search query (name, email, phone) */
  search?: string;
  /** Filter by email */
  email?: string;
  /** Filter by mobile phone */
  mobilePhone?: string;
  /** Page size for pagination */
  pageSize?: number;
}

export interface ClientSyncResult {
  clients: UnifiedCustomer[];
  totalFetched: number;
  totalNormalized: number;
  errors: Array<{ rawId?: string; error: PhorestError }>;
}

export interface ServiceHistoryResult {
  history: PhorestServiceHistory[];
  totalFetched: number;
  errors: Array<{ rawId?: string; error: PhorestError }>;
}

export class PhorestClientsClient {
  private client: PhorestApiClient;
  private businessId: string;

  constructor(config: { businessId: string; baseUrl?: string }) {
    this.businessId = config.businessId;
    this.client = getPhorestClient({
      businessId: config.businessId,
      fetch: globalThis.fetch,
    });
  }

  /** Fetch a single client by Phorest ID */
  async getById(phorestClientId: string): Promise<UnifiedCustomer> {
    const raw = await this.client.get<PhorestClient>(`/business/${this.businessId}/client/${phorestClientId}`);
    const validated = PhorestClientSchema.parse(raw);
    return normalizePhorestClient(validated);
  }

  /** Fetch clients with optional filtering */
  async list(options: ClientSyncOptions = {}): Promise<ClientSyncResult> {
    const params: PhorestClientListParams = {
      page: 0,
      size: options.pageSize ?? 100,
      updated_at: options.updatedSince,
      email: options.email,
      mobilePhone: options.mobilePhone,
      firstName: options.search,
      lastName: options.search,
    };

    const result: ClientSyncResult = {
      clients: [],
      totalFetched: 0,
      totalNormalized: 0,
      errors: [],
    };

    for await (const raw of this.client.paginate<PhorestClient>(`/business/${this.businessId}/client`, params)) {
      result.totalFetched++;
      try {
        const validated = PhorestClientSchema.parse(raw);
        const normalized = normalizePhorestClient(validated);
        result.clients.push(normalized);
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

  /** Create a new client in Phorest */
  async create(data: {
    firstName: string;
    lastName: string;
    email?: string;
    mobilePhone?: string;
    dateOfBirth?: string;
    gender?: "Male" | "Female" | "Unspecified";
    notes?: string;
    marketingPermission?: boolean;
  }): Promise<UnifiedCustomer> {
    const raw = await this.client.post<PhorestClient>(`/business/${this.businessId}/client`, data);
    const validated = PhorestClientSchema.parse(raw);
    return normalizePhorestClient(validated);
  }

  /** Update an existing client in Phorest */
  async update(
    phorestClientId: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      mobilePhone: string;
      dateOfBirth: string;
      gender: "Male" | "Female" | "Unspecified";
      notes: string;
      marketingPermission: boolean;
    }>
  ): Promise<UnifiedCustomer> {
    const raw = await this.client.put<PhorestClient>(`/business/${this.businessId}/client/${phorestClientId}`, data);
    const validated = PhorestClientSchema.parse(raw);
    return normalizePhorestClient(validated);
  }

  /** Fetch service history for a client */
  async getServiceHistory(phorestClientId: string): Promise<ServiceHistoryResult> {
    const result: ServiceHistoryResult = {
      history: [],
      totalFetched: 0,
      errors: [],
    };

    try {
      const raw = await this.client.get<PhorestServiceHistory[]>(
        `/business/${this.businessId}/client/${phorestClientId}/service-history`
      );

      for (const item of raw) {
        result.totalFetched++;
        try {
          const validated = PhorestServiceHistorySchema.parse(item);
          result.history.push(validated);
        } catch (err) {
          const error = err instanceof PhorestError
            ? err
            : new PhorestError({
                code: PhorestErrorCodeSchema.enum.VALIDATION_ERROR,
                message: err instanceof Error ? err.message : String(err),
                retryable: false,
              });
          result.errors.push({ rawId: String((item as Record<string, unknown>)?.id ?? "unknown"), error });
        }
      }
    } catch (err) {
      const error = err instanceof PhorestError
        ? err
        : new PhorestError({
            code: PhorestErrorCodeSchema.enum.UNKNOWN,
            message: err instanceof Error ? err.message : String(err),
            retryable: false,
          });
      result.errors.push({ error });
    }

    return result;
  }

  /** Fetch all clients updated since a given timestamp */
  async syncSince(updatedSince: string, options?: Omit<ClientSyncOptions, "updatedSince">): Promise<ClientSyncResult> {
    return this.list({ ...options, updatedSince });
  }

  /** Full sync — fetch all active clients */
  async fullSync(options?: Omit<ClientSyncOptions, "updatedSince">): Promise<ClientSyncResult> {
    return this.list(options);
  }
}

// ═══════════════════════════════════════════════════════════════
// Utility Export
// ═══════════════════════════════════════════════════════════════

export function createPhorestClientsClient(config: {
  businessId: string;
  baseUrl?: string;
}): PhorestClientsClient {
  return new PhorestClientsClient(config);
}
