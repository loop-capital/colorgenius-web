/**
 * Phorest API Client
 * Base HTTP client with Basic auth, rate limiting, typed errors, and pagination.
 */

import {
  type PhorestApiError,
  type PhorestPaginationParams,
  type PhorestPaginatedResponse,
  type PhorestPage,
  PhorestError,
  PhorestErrorCodeSchema,
} from "./types";
import { PhorestAuthManager, getAuthManager } from "./phorest-auth";

// ═══════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1_000;
const BACKOFF_MULTIPLIER = 2;
const MAX_RETRY_DELAY_MS = 30_000;

export interface PhorestClientConfig {
  /** Phorest Business ID (UUID) */
  businessId: string;
  /** Optional base URL override */
  baseUrl?: string;
  /** Request timeout in ms */
  timeoutMs?: number;
  /** Max retries for retryable errors */
  maxRetries?: number;
  /** Initial retry delay in ms */
  retryDelayMs?: number;
  /** Auth manager instance (singleton by default) */
  authManager?: PhorestAuthManager;
  /** Custom fetch implementation (for testing) */
  fetch?: typeof globalThis.fetch;
  /** Logging function */
  logger?: (level: "debug" | "info" | "warn" | "error", message: string, meta?: unknown) => void;
}

// ═══════════════════════════════════════════════════════════════
// Rate Limiter (token bucket)
// ═══════════════════════════════════════════════════════════════

class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly ratePerSecond: number;

  constructor(ratePerSecond: number) {
    this.tokens = ratePerSecond;
    this.lastRefill = Date.now();
    this.ratePerSecond = ratePerSecond;
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    const waitMs = (1 - this.tokens) * (1000 / this.ratePerSecond);
    await sleep(waitMs);
    this.tokens -= 1;
  }

  private refill(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastRefill;
    const newTokens = (elapsedMs / 1000) * this.ratePerSecond;
    this.tokens = Math.min(this.ratePerSecond, this.tokens + newTokens);
    this.lastRefill = now;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════
// API Client
// ═══════════════════════════════════════════════════════════════

export class PhorestApiClient {
  private readonly config: Required<Pick<PhorestClientConfig, "timeoutMs" | "maxRetries" | "retryDelayMs">> &
    Pick<PhorestClientConfig, "businessId" | "fetch" | "logger" | "authManager"> &
    { baseUrl?: string };
  private rateLimiter: RateLimiter | null = null;

  constructor(config: PhorestClientConfig) {
    this.config = {
      businessId: config.businessId,
      baseUrl: config.baseUrl ?? undefined,
      timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      maxRetries: config.maxRetries ?? DEFAULT_RETRIES,
      retryDelayMs: config.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS,
      fetch: config.fetch ?? globalThis.fetch,
      logger: config.logger ?? (() => {}),
      authManager: config.authManager ?? getAuthManager(),
    };
  }

  /** Resolve base URL from auth manager or override */
  private async resolveBaseUrl(): Promise<string> {
    const authManager = this.config.authManager ?? getAuthManager();
    return this.config.baseUrl ?? await authManager.getBaseUrl(this.config.businessId);
  }

  private async ensureRateLimiter(): Promise<RateLimiter> {
    if (this.rateLimiter) return this.rateLimiter;
    const authManager = this.config.authManager ?? getAuthManager();
    const rps = await authManager.getRateLimit(this.config.businessId);
    this.rateLimiter = new RateLimiter(rps);
    return this.rateLimiter;
  }

  /** Execute a GET request */
  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = await this.buildUrl(path, params);
    return this.request<T>("GET", url);
  }

  /** Execute a POST request */
  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = await this.buildUrl(path);
    return this.request<T>("POST", url, body);
  }

  /** Execute a PUT request */
  async put<T>(path: string, body?: unknown): Promise<T> {
    const url = await this.buildUrl(path);
    return this.request<T>("PUT", url, body);
  }

  /** Execute a PATCH request */
  async patch<T>(path: string, body?: unknown): Promise<T> {
    const url = await this.buildUrl(path);
    return this.request<T>("PATCH", url, body);
  }

  /** Execute a DELETE request */
  async delete<T>(path: string): Promise<T> {
    const url = await this.buildUrl(path);
    return this.request<T>("DELETE", url);
  }

  /** Fetch a paginated resource, auto-iterating through pages */
  async *paginate<T>(
    path: string,
    params: PhorestPaginationParams & Record<string, string | number | boolean | undefined> = { page: 0, size: 100 }
  ): AsyncGenerator<T, void, unknown> {
    let page = params.page ?? 0;
    const size = params.size ?? 100;

    while (true) {
      const response = await this.get<PhorestPaginatedResponse<T>>(path, {
        ...params,
        page,
        size,
      });

      // Extract items from _embedded (Phorest HAL format)
      const embeddedKeys = Object.keys(response._embedded ?? {});
      const items = embeddedKeys.length > 0
        ? response._embedded[embeddedKeys[0]]
        : [];

      for (const item of items) {
        yield item;
      }

      const pageInfo = response.page;
      if (!pageInfo || pageInfo.number >= pageInfo.totalPages - 1) break;
      page++;
    }
  }

  /** Fetch all paginated results into an array */
  async paginateAll<T>(
    path: string,
    params?: PhorestPaginationParams & Record<string, string | number | boolean | undefined>
  ): Promise<T[]> {
    const results: T[] = [];
    for await (const item of this.paginate<T>(path, params)) {
      results.push(item);
    }
    return results;
  }

  // ─────────────────────────────────────────────────────────────
  // Core request handler
  // ─────────────────────────────────────────────────────────────

  private async request<T>(
    method: string,
    url: string,
    body?: unknown,
    attempt = 1
  ): Promise<T> {
    const rlimiter = await this.ensureRateLimiter();
    await rlimiter.acquire();

    const authManager = this.config.authManager ?? getAuthManager();
    const headers = await authManager.getAuthHeaders(this.config.businessId);
    const requestInit: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.config.timeoutMs),
    };

    if (body !== undefined && method !== "GET" && method !== "DELETE") {
      requestInit.body = JSON.stringify(body);
    }

    const fetchFn = this.config.fetch ?? globalThis.fetch;
    const logger = this.config.logger ?? (() => {});
    logger("debug", `[Phorest] ${method} ${url}`, { attempt });

    let response: Response;
    try {
      response = await fetchFn(url, requestInit);
    } catch (networkErr) {
      const error = this.parseNetworkError(networkErr);
      if (attempt < this.config.maxRetries && error.retryable) {
        await this.delay(attempt);
        return this.request<T>(method, url, body, attempt + 1);
      }
      throw new PhorestError(error);
    }

    // Handle empty body (e.g., 204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      const text = await response.text().catch(() => "");
      json = { raw: text };
    }

    if (!response.ok) {
      const error = this.parseHttpError(response, json);

      // Auth failure — evict from cache
      if (
        (error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN") &&
        attempt === 1
      ) {
        const authManager2 = this.config.authManager ?? getAuthManager();
        await authManager2.handleAuthFailure(this.config.businessId);
      }

      if (attempt < this.config.maxRetries && error.retryable) {
        await this.delay(attempt);
        return this.request<T>(method, url, body, attempt + 1);
      }

      throw new PhorestError(error);
    }

    // Log rate limit headers for observability
    const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
    const rateLimitReset = response.headers.get("X-RateLimit-Reset");
    if (rateLimitRemaining) {
      const logger = this.config.logger ?? (() => {});
      logger("debug", "[Phorest] Rate limit status", {
        remaining: rateLimitRemaining,
        reset: rateLimitReset,
      });
    }

    return json as T;
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────

  private async buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<string> {
    const baseUrl = await this.resolveBaseUrl();
    const cleanPath = path.replace(/^\//, "");
    const url = new URL(cleanPath, baseUrl.endsWith("/") ? baseUrl : baseUrl + "/");
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async delay(attempt: number): Promise<void> {
    const delayMs = Math.min(
      this.config.retryDelayMs * Math.pow(BACKOFF_MULTIPLIER, attempt - 1),
      MAX_RETRY_DELAY_MS
    );
    const logger = this.config.logger ?? (() => {});
    logger("warn", `[Phorest] Retry ${attempt}/${this.config.maxRetries} after ${delayMs}ms`);
    await sleep(delayMs);
  }

  private parseNetworkError(err: unknown): PhorestApiError {
    const message = err instanceof Error ? err.message : String(err);
    const isTimeout =
      err instanceof Error &&
      (message.includes("timeout") || message.includes("abort") || message.includes("AbortError"));

    return {
      code: isTimeout
        ? PhorestErrorCodeSchema.enum.TIMEOUT
        : PhorestErrorCodeSchema.enum.NETWORK_ERROR,
      message: isTimeout ? `Request timed out: ${message}` : `Network error: ${message}`,
      retryable: true,
      retryAfterMs: isTimeout ? 5000 : 1000,
    };
  }

  private parseHttpError(response: Response, body: unknown): PhorestApiError {
    const status = response.status;

    // Try to extract Phorest-specific error details
    let phorestCode: string | undefined;
    let phorestMessage: string | undefined;
    let details: Record<string, unknown> | undefined;

    if (typeof body === "object" && body !== null) {
      const b = body as Record<string, unknown>;
      phorestCode = String(b.code ?? b.error_code ?? "");
      phorestMessage = String(b.message ?? b.error ?? b.error_message ?? "");
      details = b.details as Record<string, unknown> | undefined;
      if (!phorestMessage || phorestMessage === "undefined") {
        phorestMessage = undefined;
      }
    }

    const message = phorestMessage ?? `HTTP ${status}: ${response.statusText}`;

    // Determine error code and retryability
    let code = PhorestErrorCodeSchema.enum.UNKNOWN;
    let retryable = false;
    let retryAfterMs: number | undefined;

    switch (status) {
      case 400:
        code = PhorestErrorCodeSchema.enum.VALIDATION_ERROR;
        retryable = false;
        break;
      case 401:
        code = PhorestErrorCodeSchema.enum.UNAUTHORIZED;
        retryable = false;
        break;
      case 403:
        code = PhorestErrorCodeSchema.enum.FORBIDDEN;
        retryable = false;
        break;
      case 404:
        code = PhorestErrorCodeSchema.enum.NOT_FOUND;
        retryable = false;
        break;
      case 409:
        code = PhorestErrorCodeSchema.enum.VALIDATION_ERROR;
        retryable = false;
        break;
      case 422:
        code = PhorestErrorCodeSchema.enum.VALIDATION_ERROR;
        retryable = false;
        break;
      case 429:
        code = PhorestErrorCodeSchema.enum.RATE_LIMITED;
        retryable = true;
        retryAfterMs = this.parseRetryAfter(response);
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        code = PhorestErrorCodeSchema.enum.SERVER_ERROR;
        retryable = true;
        retryAfterMs = 2000 * (status === 503 ? 2 : 1);
        break;
    }

    return {
      code,
      message,
      statusCode: status,
      phorestCode,
      phorestMessage,
      requestId: response.headers.get("X-Request-ID") ?? undefined,
      details,
      retryable,
      retryAfterMs,
    };
  }

  private parseRetryAfter(response: Response): number | undefined {
    const header = response.headers.get("Retry-After");
    if (!header) return undefined;

    const seconds = parseInt(header, 10);
    if (!isNaN(seconds)) return seconds * 1000;

    // Try parsing as HTTP date
    const date = new Date(header);
    if (!isNaN(date.getTime())) {
      return Math.max(0, date.getTime() - Date.now());
    }

    return undefined;
  }
}

// ═══════════════════════════════════════════════════════════════
// Factory
// ═══════════════════════════════════════════════════════════════

const clientCache = new Map<string, PhorestApiClient>();

export function getPhorestClient(config: PhorestClientConfig): PhorestApiClient {
  const key = `${config.businessId}:${config.baseUrl ?? "auto"}`;
  if (!clientCache.has(key)) {
    clientCache.set(key, new PhorestApiClient(config));
  }
  return clientCache.get(key)!;
}

export function clearClientCache(): void {
  clientCache.clear();
}
