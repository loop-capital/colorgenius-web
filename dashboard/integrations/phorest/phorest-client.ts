/**
 * Phorest API Client
 *
 * Handles all HTTP communication with the Phorest REST API.
 * Features:
 * - Basic Auth support (per request)
 * - Rate limiting (100 RPS max — enforced client-side)
 * - Exponential backoff retry on 429/5xx
 * - Pagination helpers
 * - Request/response logging
 *
 * @see https://developer.phorest.com/
 */

import {
  PhorestCredentials,
  PhorestRegion,
  PhorestPagedResponse,
  PhorestErrorResponse,
  PhorestBranch,
  PhorestClientData,
  PhorestAppointment,
  PhorestService,
  PhorestProduct,
  PhorestServiceHistory,
  PhorestCsvExportJob,
  PhorestStaff,
  getPhorestBaseUrl,
} from './types';
import { buildBasicAuthHeader } from './phorest-auth';

// ── Rate Limiter ──
// Phorest limit: 100 requests per second
const RATE_LIMIT_RPS = 95; // Stay under the 100 limit with margin
const REQUEST_INTERVAL_MS = Math.ceil(1000 / RATE_LIMIT_RPS);

class RateLimiter {
  private lastRequestTime = 0;
  private queue: Array<{ resolve: () => void; reject: (e: Error) => void }> = [];
  private running = false;

  async acquire(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });
      this.processQueue();
    });
  }

  private processQueue(): void {
    if (this.running || this.queue.length === 0) return;
    this.running = true;

    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    const wait = Math.max(0, REQUEST_INTERVAL_MS - elapsed);

    setTimeout(() => {
      const next = this.queue.shift();
      if (next) {
        this.lastRequestTime = Date.now();
        next.resolve();
      }
      this.running = false;
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }, wait);
  }
}

const globalRateLimiter = new RateLimiter();

// ── Retry Logic ──
interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableStatusCodes: number[];
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  retryableStatusCodes: [429, 500, 502, 503, 504],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exponential = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // 0–1000ms jitter
  return Math.min(exponential + jitter, maxDelayMs);
}

// ── Client Class ──
export class PhorestClient {
  private credentials: PhorestCredentials;
  private baseUrl: string;
  private authHeader: string;

  constructor(credentials: PhorestCredentials) {
    this.credentials = credentials;
    this.baseUrl = getPhorestBaseUrl(credentials.region);
    this.authHeader = buildBasicAuthHeader(credentials);
  }

  /**
   * Make an authenticated request to the Phorest API
   */
  async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      queryParams?: Record<string, string | number | boolean | undefined>;
      body?: unknown;
      retry?: Partial<RetryOptions>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', queryParams, body, retry = {} } = options;
    const retryOpts = { ...DEFAULT_RETRY_OPTIONS, ...retry };

    // Build URL with query params
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: this.authHeader,
      Accept: 'application/json',
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retryOpts.maxRetries; attempt++) {
      // Wait for rate limiter slot
      await globalRateLimiter.acquire();

      try {
        const response = await fetch(url.toString(), {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(30000), // 30s timeout
        });

        // Handle rate limit explicitly
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : calculateBackoff(attempt, retryOpts.baseDelayMs, retryOpts.maxDelayMs);
          if (attempt < retryOpts.maxRetries) {
            console.warn(`[Phorest] Rate limited. Retrying after ${delay}ms...`);
            await sleep(delay);
            continue;
          }
        }

        // Retry on transient errors
        if (retryOpts.retryableStatusCodes.includes(response.status) && attempt < retryOpts.maxRetries) {
          const delay = calculateBackoff(attempt, retryOpts.baseDelayMs, retryOpts.maxDelayMs);
          console.warn(`[Phorest] HTTP ${response.status} on ${endpoint}. Retrying after ${delay}ms...`);
          await sleep(delay);
          continue;
        }

        // Parse response
        const responseBody = await response.text();

        if (!response.ok) {
          let errorData: PhorestErrorResponse | undefined;
          try {
            errorData = JSON.parse(responseBody) as PhorestErrorResponse;
          } catch {
            // Not JSON
          }
          throw new PhorestApiError(
            errorData?.detail || `Phorest API error: ${response.status} ${response.statusText}`,
            response.status,
            errorData?.errorCode,
            errorData?.id
          );
        }

        return JSON.parse(responseBody) as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on network abort or other non-retryable errors on last attempt
        if (attempt < retryOpts.maxRetries) {
          if (lastError.message.includes('abort') || lastError.message.includes('Timeout')) {
            const delay = calculateBackoff(attempt, retryOpts.baseDelayMs, retryOpts.maxDelayMs);
            console.warn(`[Phorest] Network timeout on ${endpoint}. Retrying after ${delay}ms...`);
            await sleep(delay);
            continue;
          }
        }

        // If it's already a PhorestApiError and not retryable, throw immediately
        if (error instanceof PhorestApiError) {
          throw error;
        }
      }
    }

    throw lastError || new Error(`Failed after ${retryOpts.maxRetries} retries`);
  }

  // ─── Convenience Methods ───

  /**
   * GET wrapper
   */
  async get<T>(endpoint: string, queryParams?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', queryParams });
  }

  /**
   * POST wrapper
   */
  async post<T>(endpoint: string, body: unknown, queryParams?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, queryParams });
  }

  /**
   * PUT wrapper
   */
  async put<T>(endpoint: string, body: unknown, queryParams?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, queryParams });
  }

  /**
   * DELETE wrapper
   */
  async delete<T>(endpoint: string, queryParams?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', queryParams });
  }

  // ─── Entity Endpoints ───

  /** List branches for a business */
  async listBranches(page = 0, size = 100): Promise<PhorestPagedResponse<PhorestBranch>> {
    return this.get<PhorestPagedResponse<PhorestBranch>>(
      `/api/business/${this.credentials.businessId}/branch`,
      { page, size }
    );
  }

  /** List clients (paginated) */
  async listClients(params: {
    page?: number;
    size?: number;
    email?: string;
    phone?: string;
    updatedAfter?: string;
    updatedBefore?: string;
    firstName?: string;
    lastName?: string;
    externalId?: string;
    includeArchived?: boolean;
    includeDeleted?: boolean;
  } = {}): Promise<PhorestPagedResponse<PhorestClientData>> {
    return this.get<PhorestPagedResponse<PhorestClientData>>(
      `/api/business/${this.credentials.businessId}/client`,
      {
        page: params.page ?? 0,
        size: Math.min(params.size ?? 100, 100),
        email: params.email,
        phone: params.phone,
        updatedAfter: params.updatedAfter,
        updatedBefore: params.updatedBefore,
        firstName: params.firstName,
        lastName: params.lastName,
        externalId: params.externalId,
        includeArchived: params.includeArchived,
        includeDeleted: params.includeDeleted,
      }
    );
  }

  /** Get a single client */
  async getClient(clientId: string): Promise<PhorestClientData> {
    return this.get<PhorestClientData>(`/api/business/${this.credentials.businessId}/client/${clientId}`);
  }

  /** Get client service history */
  async getClientServiceHistories(clientId: string): Promise<{ _embedded: { serviceHistories: PhorestServiceHistory[] } }> {
    return this.get<{ _embedded: { serviceHistories: PhorestServiceHistory[] } }>(
      `/api/business/${this.credentials.businessId}/client/${clientId}/serviceHistory`
    );
  }

  /** List appointments for a branch */
  async listAppointments(
    branchId: string,
    params: {
      page?: number;
      size?: number;
      from_date?: string;
      to_date?: string;
      staff_id?: string;
      client_id?: string;
      fetch_canceled?: boolean;
      fetch_deleted?: boolean;
      fetch_archived?: boolean;
      updated_from?: string;
      updated_to?: string;
      fetch_online_category?: boolean;
      fetch_notes?: boolean;
    } = {}
  ): Promise<PhorestPagedResponse<PhorestAppointment>> {
    return this.get<PhorestPagedResponse<PhorestAppointment>>(
      `/api/business/${this.credentials.businessId}/branch/${branchId}/appointment`,
      {
        page: params.page ?? 0,
        size: Math.min(params.size ?? 100, 100),
        from_date: params.from_date,
        to_date: params.to_date,
        staff_id: params.staff_id,
        client_id: params.client_id,
        fetch_canceled: params.fetch_canceled,
        fetch_deleted: params.fetch_deleted,
        fetch_archived: params.fetch_archived,
        updated_from: params.updated_from,
        updated_to: params.updated_to,
        fetch_online_category: params.fetch_online_category,
        fetch_notes: params.fetch_notes,
      }
    );
  }

  /** Get a single appointment */
  async getAppointment(branchId: string, appointmentId: string): Promise<PhorestAppointment> {
    return this.get<PhorestAppointment>(
      `/api/business/${this.credentials.businessId}/branch/${branchId}/appointment/${appointmentId}`
    );
  }

  /** List services for a branch */
  async listServices(
    branchId: string,
    params: {
      page?: number;
      size?: number;
      category_id?: string;
      includeArchived?: boolean;
      fetch_online_category?: boolean;
    } = {}
  ): Promise<PhorestPagedResponse<PhorestService>> {
    return this.get<PhorestPagedResponse<PhorestService>>(
      `/api/business/${this.credentials.businessId}/branch/${branchId}/service`,
      {
        page: params.page ?? 0,
        size: Math.min(params.size ?? 100, 100),
        category_id: params.category_id,
        includeArchived: params.includeArchived,
        fetch_online_category: params.fetch_online_category,
      }
    );
  }

  /** List products for a branch */
  async listProducts(
    branchId: string,
    params: {
      page?: number;
      size?: number;
      productType?: string;
      searchQuery?: string;
      archivedOnly?: boolean;
      outOfStock?: boolean;
      lowStock?: boolean;
      includeArchived?: boolean;
      updated_from?: string;
      updated_to?: string;
    } = {}
  ): Promise<PhorestPagedResponse<PhorestProduct>> {
    return this.get<PhorestPagedResponse<PhorestProduct>>(
      `/api/business/${this.credentials.businessId}/branch/${branchId}/product`,
      {
        page: params.page ?? 0,
        size: Math.min(params.size ?? 100, 100),
        productType: params.productType,
        searchQuery: params.searchQuery,
        archivedOnly: params.archivedOnly,
        outOfStock: params.outOfStock,
        lowStock: params.lowStock,
        includeArchived: params.includeArchived,
        updated_from: params.updated_from,
        updated_to: params.updated_to,
      }
    );
  }

  /** Create a CSV export job */
  async createCsvExportJob(
    branchId: string,
    reportType: string,
    fromDate: string,
    toDate: string
  ): Promise<PhorestCsvExportJob> {
    return this.post<PhorestCsvExportJob>(
      `/api/business/${this.credentials.businessId}/branch/${branchId}/csvExportJob`,
      {
        reportType,
        fromDate,
        toDate,
      }
    );
  }

  /** Get CSV export job status */
  async getCsvExportJob(branchId: string, jobId: string): Promise<PhorestCsvExportJob> {
    return this.get<PhorestCsvExportJob>(
      `/api/business/${this.credentials.businessId}/branch/${branchId}/csvExportJob/${jobId}`
    );
  }
}

// ─── Custom Error ───
export class PhorestApiError extends Error {
  statusCode: number;
  errorCode?: string;
  requestId?: string;

  constructor(message: string, statusCode: number, errorCode?: string, requestId?: string) {
    super(message);
    this.name = 'PhorestApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.requestId = requestId;
  }
}

/**
 * Create a Phorest client for a salon.
 * Credentials should be loaded from secure storage.
 */
export function createPhorestClient(credentials: PhorestCredentials): PhorestClient {
  return new PhorestClient(credentials);
}
