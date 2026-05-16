/**
 * Square API Client
 * Base HTTP client with auth headers, rate limiting, retries, and pagination
 */

import { z } from 'zod';
import {
  type SquareApiConfig,
  type SquareApiError,
  type SquareApiRequestOptions,
  type SquarePaginatedResponse,
  type SquareTokens,
} from './types';

// ---------------------------------------------------------------------------
// Default config
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: SquareApiConfig = {
  baseUrl: process.env.SQUARE_API_BASE_URL ?? 'https://connect.squareup.com',
  apiVersion: process.env.SQUARE_API_VERSION ?? 'v2',
  timeoutMs: 30_000,
  maxRetries: 3,
  retryDelayMs: 1_000,
  rateLimitPerSecond: 10,
};

// ---------------------------------------------------------------------------
// Rate limiter (token bucket)
// ---------------------------------------------------------------------------

class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per ms

  constructor(capacity: number, perSecond: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.lastRefill = Date.now();
    this.refillRate = perSecond / 1000;
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    const waitMs = Math.ceil((1 - this.tokens) / this.refillRate);
    await sleep(waitMs);
    return this.acquire();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const added = elapsed * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + added);
    this.lastRefill = now;
  }
}

// ---------------------------------------------------------------------------
// Error factory
// ---------------------------------------------------------------------------

function classifyError(status: number, body: unknown): SquareApiError {
  // Square error shape: { errors: [{ category, code, detail, field }] }
  const errors = Array.isArray((body as Record<string, unknown>)?.errors)
    ? ((body as Record<string, unknown>).errors as Array<Record<string, unknown>>)
    : [];

  const first = errors[0] ?? {};
  const category = String(first.category ?? 'UNKNOWN');
  const code = String(first.code ?? 'UNKNOWN_ERROR');
  const detail = String(first.detail ?? 'Unknown error');
  const field = first.field ? String(first.field) : undefined;

  let type: SquareApiError['type'] = 'UNKNOWN';
  let retryable = false;

  if (status === 429) {
    type = 'RATE_LIMITED';
    retryable = true;
  } else if (status === 401 || status === 403) {
    type = 'AUTH_ERROR';
    retryable = false;
  } else if (status === 400 || status === 422) {
    type = 'VALIDATION_ERROR';
    retryable = false;
  } else if (status >= 500) {
    type = 'API_ERROR';
    retryable = true;
  } else if (status === 0 || !status) {
    type = 'NETWORK_ERROR';
    retryable = true;
  }

  return {
    type,
    code,
    detail,
    field,
    category,
    statusCode: status,
    retryable,
  };
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class SquareClient {
  private readonly config: SquareApiConfig;
  private readonly rateLimiter: RateLimiter;
  private getTokens: (merchantId: string) => Promise<SquareTokens | null>;

  constructor(
    config: Partial<SquareApiConfig> = {},
    tokenResolver: (merchantId: string) => Promise<SquareTokens | null>,
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rateLimiter = new RateLimiter(
      this.config.rateLimitPerSecond,
      this.config.rateLimitPerSecond,
    );
    this.getTokens = tokenResolver;
  }

  /**
   * Set a new token resolver (useful for testing or dynamic token sources)
   */
  setTokenResolver(resolver: (merchantId: string) => Promise<SquareTokens | null>): void {
    this.getTokens = resolver;
  }

  /**
   * Low-level request with auth, retries, rate limiting, and timeout
   */
  async request<T = unknown>(
    merchantId: string,
    options: SquareApiRequestOptions,
  ): Promise<T> {
    const tokens = await this.getTokens(merchantId);
    if (!tokens) {
      throw new SquareError({
        type: 'AUTH_ERROR',
        code: 'TOKEN_NOT_FOUND',
        detail: `No tokens found for merchant ${merchantId}`,
        retryable: false,
      });
    }

    if (this.isExpired(tokens)) {
      throw new SquareError({
        type: 'AUTH_ERROR',
        code: 'TOKEN_EXPIRED',
        detail: `Access token expired for merchant ${merchantId}. Refresh required.`,
        retryable: false,
      });
    }

    const url = new URL(
      `/${this.config.apiVersion}${options.path}`,
      this.config.baseUrl,
    );

    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Square-Version': this.config.apiVersion,
      ...options.headers,
    };

    const body = options.body ? JSON.stringify(options.body) : undefined;

    let lastError: SquareApiError | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      await this.rateLimiter.acquire();

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

        const response = await fetch(url.toString(), {
          method: options.method,
          headers,
          body,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseBody = await this.parseBody(response);

        if (!response.ok) {
          const err = classifyError(response.status, responseBody);
          if (err.retryable && attempt < this.config.maxRetries) {
            lastError = err;
            const delay = this.config.retryDelayMs * Math.pow(2, attempt);
            await sleep(delay);
            continue;
          }
          throw new SquareError(err);
        }

        return responseBody as T;
      } catch (error) {
        if (error instanceof SquareError) throw error;

        // Network / Abort errors
        const isAbort = error instanceof Error && error.name === 'AbortError';
        const err = classifyError(0, {
          errors: [{
            category: 'API_ERROR',
            code: isAbort ? 'TIMEOUT' : 'NETWORK_ERROR',
            detail: isAbort
              ? `Request timed out after ${this.config.timeoutMs}ms`
              : error instanceof Error
                ? error.message
                : 'Network error',
          }],
        });

        if (err.retryable && attempt < this.config.maxRetries) {
          lastError = err;
          const delay = this.config.retryDelayMs * Math.pow(2, attempt);
          await sleep(delay);
          continue;
        }

        throw new SquareError(err);
      }
    }

    throw new SquareError(lastError ?? {
      type: 'UNKNOWN',
      code: 'MAX_RETRIES_EXCEEDED',
      detail: 'Maximum retry attempts exceeded',
      retryable: false,
    });
  }

  /**
   * Convenience: GET request
   */
  async get<T = unknown>(
    merchantId: string,
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    return this.request<T>(merchantId, { method: 'GET', path, query });
  }

  /**
   * Convenience: POST request
   */
  async post<T = unknown>(
    merchantId: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    return this.request<T>(merchantId, { method: 'POST', path, body });
  }

  /**
   * Convenience: PUT request
   */
  async put<T = unknown>(
    merchantId: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    return this.request<T>(merchantId, { method: 'PUT', path, body });
  }

  /**
   * Convenience: DELETE request
   */
  async delete<T = unknown>(
    merchantId: string,
    path: string,
  ): Promise<T> {
    return this.request<T>(merchantId, { method: 'DELETE', path });
  }

  /**
   * Paginated fetch — iterates through all pages automatically
   */
  async *paginate<T = unknown>(
    merchantId: string,
    path: string,
    query: Record<string, string | number | boolean | undefined> = {},
    cursorKey = 'cursor',
    dataKey = 'data',
  ): AsyncGenerator<T[], void, unknown> {
    let cursor: string | undefined;

    do {
      const pageQuery = cursor ? { ...query, [cursorKey]: cursor } : query;
      const response = await this.get<SquarePaginatedResponse<T>>(merchantId, path, pageQuery);

      yield response.data ?? [];
      cursor = response.cursor;
    } while (cursor);
  }

  /**
   * Fetch all paginated results into a single array
   */
  async fetchAll<T = unknown>(
    merchantId: string,
    path: string,
    query: Record<string, string | number | boolean | undefined> = {},
    cursorKey = 'cursor',
    dataKey = 'data',
  ): Promise<T[]> {
    const results: T[] = [];
    for await (const page of this.paginate<T>(merchantId, path, query, cursorKey, dataKey)) {
      results.push(...page);
    }
    return results;
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private isExpired(tokens: SquareTokens): boolean {
    // Add 60s buffer
    return Date.now() / 1000 >= tokens.expires_at - 60;
  }

  private async parseBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }
}

// ---------------------------------------------------------------------------
// Typed error class
// ---------------------------------------------------------------------------

export class SquareError extends Error {
  readonly type: SquareApiError['type'];
  readonly code: string;
  readonly detail: string;
  readonly field?: string;
  readonly category?: string;
  readonly statusCode?: number;
  readonly retryable: boolean;

  constructor(err: SquareApiError) {
    super(`[${err.type}] ${err.code}: ${err.detail}`);
    this.name = 'SquareError';
    this.type = err.type;
    this.code = err.code;
    this.detail = err.detail;
    this.field = err.field;
    this.category = err.category;
    this.statusCode = err.statusCode;
    this.retryable = err.retryable;

    // Maintains proper stack trace in modern engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SquareError);
    }
  }

  toJSON(): SquareApiError {
    return {
      type: this.type,
      code: this.code,
      detail: this.detail,
      field: this.field,
      category: this.category,
      statusCode: this.statusCode,
      retryable: this.retryable,
    };
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
