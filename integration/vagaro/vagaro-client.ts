/**
 * Vagaro API Client
 * Base HTTP client with auth, rate limiting, typed errors, and pagination.
 */

import {
  type VagaroApiError,
  type VagaroPaginationParams,
  type VagaroPaginatedResponse,
  VagaroError,
  VagaroErrorCodeSchema,
} from "./types";
import { VagaroAuthManager, getAuthManager } from "./vagaro-auth";

// ═══════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════

const VAGARO_BASE_URL = "https://api.vagaro.com/v2";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1_000;
const BACKOFF_MULTIPLIER = 2;
const MAX_RETRY_DELAY_MS = 30_000;

export interface VagaroClientConfig {
  /** Vagaro Business ID */
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
  authManager?: VagaroAuthManager;
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

export class VagaroApiClient {
  private readonly config: Required<Pick<VagaroClientConfig, "baseUrl" | "timeoutMs" | "maxRetries" | "retryDelayMs">> &
    Pick<VagaroClientConfig, "businessId" | "fetch" | "logger" | "authManager">;
  private rateLimiter: RateLimiter | null = null;

  constructor(config: VagaroClientConfig) {
    this.config = {
      businessId: config.businessId,
      baseUrl: config.baseUrl ?? VAGARO_BASE_URL,
      timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      maxRetries: config.maxRetries ?? DEFAULT_RETRIES,
      retryDelayMs: config.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS,
      fetch: config.fetch ?? globalThis.fetch,
      logger: config.logger ?? (() => {}),
      authManager: config.authManager ?? getAuthManager(),
    };
  }

  /** Ensure rate limiter is initialized */
  private async ensureRateLimiter(): Promise<void> {
    if (this.rateLimiter) return;
    const rps = await this.config.authManager.getRateLimit(this.config.businessId);
    this.rateLimiter = new RateLimiter(rps);
  }

  /** Execute a GET request */
  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>("GET", url);
  }

  /** Execute a POST request */
  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>("POST", url, body);
  }

  /** Execute a PUT request */
  async put<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>("PUT", url, body);
  }

  /** Execute a PATCH request */
  async patch<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>("PATCH", url, body);
  }

  /** Execute a DELETE request */
  async delete<T>(path: string): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>("DELETE", url);
  }

  /** Fetch a paginated resource, auto-iterating through pages */
  async *paginate<T>(
    path: string,
    params: VagaroPaginationParams & Record<string, string | number | boolean | undefined> = { page: 1, pageSize: 100 }
  ): AsyncGenerator<T, void, unknown> {
    let page = params.page ?? 1;
    const pageSize = params.pageSize ?? 100;

    while (true) {
      const response = await this.get<VagaroPaginatedResponse<T>>(path, {
        ...params,
        page,
        pageSize,
      });

      for (const item of response.data) {
        yield item;
      }

      if (!response.pagination.hasNext) break;
      page++;
    }
  }

  /** Fetch all paginated results into an array */
  async paginateAll<T>(
    path: string,
    params?: VagaroPaginationParams & Record<string, string | number | boolean | undefined>
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
    await this.ensureRateLimiter();
    await this.rateLimiter!.acquire();

    const headers = await this.config.authManager.getAuthHeaders(this.config.businessId);
    const requestInit: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.config.timeoutMs),
    };

    if (body !== undefined && method !== "GET" && method !== "DELETE") {
      requestInit.body = JSON.stringify(body);
    }

    this.config.logger("debug", `[Vagaro] ${method} ${url}`, { attempt });

    let response: Response;
    try {
      response = await this.config.fetch(url, requestInit);
    } catch (networkErr) {
      const error = this.parseNetworkError(networkErr);
      if (attempt < this.config.maxRetries && error.retryable) {
        await this.delay(attempt);
        return this.request<T>(method, url, body, attempt + 1);
      }
      throw new VagaroError(error);
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

      // Auth failure — try key rotation if configured
      if (
        (error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN") &&
        attempt === 1
      ) {
        await this.config.authManager.handleAuthFailure(this.config.businessId);
      }

      if (attempt < this.config.maxRetries && error.retryable) {
        await this.delay(attempt);
        return this.request<T>(method, url, body, attempt + 1);
      }

      throw new VagaroError(error);
    }

    // Log rate limit headers for observability
    const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
    const rateLimitReset = response.headers.get("X-RateLimit-Reset");
    if (rateLimitRemaining) {
      this.config.logger("debug", "[Vagaro] Rate limit status", {
        remaining: rateLimitRemaining,
        reset: rateLimitReset,
      });
    }

    return json as T;
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(path.replace(/^\//, ""), this.config.baseUrl);
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
    this.config.logger("warn", `[Vagaro] Retry ${attempt}/${this.config.maxRetries} after ${delayMs}ms`);
    await sleep(delayMs);
  }

  private parseNetworkError(err: unknown): VagaroApiError {
    const message = err instanceof Error ? err.message : String(err);
    const isTimeout =
      err instanceof Error &&
      (message.includes("timeout") || message.includes("abort") || message.includes("AbortError"));

    return {
      code: isTimeout
        ? VagaroErrorCodeSchema.enum.TIMEOUT
        : VagaroErrorCodeSchema.enum.NETWORK_ERROR,
      message: isTimeout ? `Request timed out: ${message}` : `Network error: ${message}`,
      retryable: true,
      retryAfterMs: isTimeout ? 5000 : 1000,
    };
  }

  private parseHttpError(response: Response, body: unknown): VagaroApiError {
    const status = response.status;

    // Try to extract Vagaro-specific error details
    let vagaroCode: string | undefined;
    let vagaroMessage: string | undefined;
    let details: Record<string, unknown> | undefined;

    if (typeof body === "object" && body !== null) {
      const b = body as Record<string, unknown>;
      vagaroCode = String(b.code ?? b.error_code ?? "");
      vagaroMessage = String(b.message ?? b.error ?? b.error_message ?? "");
      details = b.details as Record<string, unknown> | undefined;
      if (!vagaroMessage || vagaroMessage === "undefined") {
        vagaroMessage = undefined;
      }
    }

    const message = vagaroMessage ?? `HTTP ${status}: ${response.statusText}`;

    // Determine error code and retryability
    let code = VagaroErrorCodeSchema.enum.UNKNOWN;
    let retryable = false;
    let retryAfterMs: number | undefined;

    switch (status) {
      case 400:
        code = VagaroErrorCodeSchema.enum.VALIDATION_ERROR;
        retryable = false;
        break;
      case 401:
        code = VagaroErrorCodeSchema.enum.UNAUTHORIZED;
        retryable = false;
        break;
      case 403:
        code = VagaroErrorCodeSchema.enum.FORBIDDEN;
        retryable = false;
        break;
      case 404:
        code = VagaroErrorCodeSchema.enum.NOT_FOUND;
        retryable = false;
        break;
      case 409:
        code = VagaroErrorCodeSchema.enum.VALIDATION_ERROR;
        retryable = false;
        break;
      case 422:
        code = VagaroErrorCodeSchema.enum.VALIDATION_ERROR;
        retryable = false;
        break;
      case 429:
        code = VagaroErrorCodeSchema.enum.RATE_LIMITED;
        retryable = true;
        retryAfterMs = this.parseRetryAfter(response);
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        code = VagaroErrorCodeSchema.enum.SERVER_ERROR;
        retryable = true;
        retryAfterMs = 2000 * (status === 503 ? 2 : 1);
        break;
    }

    return {
      code,
      message,
      statusCode: status,
      vagaroCode,
      vagaroMessage,
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

const clientCache = new Map<string, VagaroApiClient>();

export function getVagaroClient(config: VagaroClientConfig): VagaroApiClient {
  const key = `${config.businessId}:${config.baseUrl ?? VAGARO_BASE_URL}`;
  if (!clientCache.has(key)) {
    clientCache.set(key, new VagaroApiClient(config));
  }
  return clientCache.get(key)!;
}

export function clearClientCache(): void {
  clientCache.clear();
}
