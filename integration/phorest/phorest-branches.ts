/**
 * Phorest Branches Module
 * Fetches branch data from Phorest API.
 */

import {
  type PhorestBranch,
  PhorestBranchSchema,
  PhorestError,
  PhorestErrorCodeSchema,
} from "./types";
import { PhorestApiClient, getPhorestClient } from "./phorest-client";

// ═══════════════════════════════════════════════════════════════
// Normalization
// ═══════════════════════════════════════════════════════════════

export interface UnifiedBranch {
  id: string;
  externalId: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
  } | null;
  timeZone: string | null;
  isActive: boolean;
  source: "phorest";
  rawData: unknown;
  createdAt: string;
  updatedAt: string;
}

export function normalizePhorestBranch(
  raw: PhorestBranch,
  opts?: { sourceTimestamp?: string }
): UnifiedBranch {
  const now = opts?.sourceTimestamp ?? new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    externalId: String(raw.id),
    name: raw.name,
    phone: raw.phone ?? null,
    email: raw.email ?? null,
    address: raw.address
      ? {
          line1: raw.address.line1 ?? null,
          line2: raw.address.line2 ?? null,
          city: raw.address.city ?? null,
          state: raw.address.county ?? null,
          zip: raw.address.postcode ?? null,
          country: raw.address.country ?? null,
        }
      : null,
    timeZone: raw.timeZone ?? null,
    isActive: raw.isActive ?? true,
    source: "phorest" as const,
    rawData: raw,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  };
}

// ═══════════════════════════════════════════════════════════════
// Data Access
// ═══════════════════════════════════════════════════════════════

export interface BranchSyncResult {
  branches: UnifiedBranch[];
  totalFetched: number;
  totalNormalized: number;
  errors: Array<{ rawId?: string; error: PhorestError }>;
}

export class PhorestBranchesClient {
  private client: PhorestApiClient;
  private businessId: string;

  constructor(config: { businessId: string; baseUrl?: string }) {
    this.businessId = config.businessId;
    this.client = getPhorestClient({
      businessId: config.businessId,
      fetch: globalThis.fetch,
    });
  }

  /** Fetch a single branch by Phorest ID */
  async getById(phorestBranchId: string): Promise<UnifiedBranch> {
    const raw = await this.client.get<PhorestBranch>(
      `/business/${this.businessId}/branch/${phorestBranchId}`
    );
    const validated = PhorestBranchSchema.parse(raw);
    return normalizePhorestBranch(validated);
  }

  /** Fetch all branches for this business */
  async list(): Promise<BranchSyncResult> {
    const result: BranchSyncResult = {
      branches: [],
      totalFetched: 0,
      totalNormalized: 0,
      errors: [],
    };

    for await (const raw of this.client.paginate<PhorestBranch>(
      `/business/${this.businessId}/branch`
    )) {
      result.totalFetched++;
      try {
        const validated = PhorestBranchSchema.parse(raw);
        const normalized = normalizePhorestBranch(validated);
        result.branches.push(normalized);
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
}

// ═══════════════════════════════════════════════════════════════
// Utility Export
// ═══════════════════════════════════════════════════════════════

export function createPhorestBranchesClient(config: {
  businessId: string;
  baseUrl?: string;
}): PhorestBranchesClient {
  return new PhorestBranchesClient(config);
}
