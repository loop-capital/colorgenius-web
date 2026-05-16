/**
 * Square OAuth Module
 * Authorization URL generation, token exchange, refresh, and secure storage
 */

import { z } from 'zod';
import {
  type SquareTokens,
  type SquareTokenResponse,
  type SquareRefreshResponse,
  type TokenStorage,
} from './types';

// ---------------------------------------------------------------------------
// Environment validation
// ---------------------------------------------------------------------------

const envSchema = z.object({
  SQUARE_APPLICATION_ID: z.string().min(1, 'SQUARE_APPLICATION_ID is required'),
  SQUARE_APPLICATION_SECRET: z.string().min(1, 'SQUARE_APPLICATION_SECRET is required'),
  SQUARE_OAUTH_REDIRECT_URL: z.string().url('SQUARE_OAUTH_REDIRECT_URL must be a valid URL'),
  SQUARE_OAUTH_SCOPES: z.string().min(1, 'SQUARE_OAUTH_SCOPES is required'),
  SQUARE_API_BASE_URL: z.string().url().default('https://connect.squareup.com'),
  SQUARE_API_VERSION: z.string().default('v2'),
});

export type SquareOAuthEnv = z.infer<typeof envSchema>;

function getEnv(): SquareOAuthEnv {
  return envSchema.parse({
    SQUARE_APPLICATION_ID: process.env.SQUARE_APPLICATION_ID,
    SQUARE_APPLICATION_SECRET: process.env.SQUARE_APPLICATION_SECRET,
    SQUARE_OAUTH_REDIRECT_URL: process.env.SQUARE_OAUTH_REDIRECT_URL,
    SQUARE_OAUTH_SCOPES: process.env.SQUARE_OAUTH_SCOPES,
    SQUARE_API_BASE_URL: process.env.SQUARE_API_BASE_URL,
    SQUARE_API_VERSION: process.env.SQUARE_API_VERSION,
  });
}

// ---------------------------------------------------------------------------
// OAuth scopes (Square v2)
// ---------------------------------------------------------------------------

export const SQUARE_OAUTH_SCOPES = [
  'CUSTOMERS_READ',
  'CUSTOMERS_WRITE',
  'ITEMS_READ',
  'ITEMS_WRITE',
  'ORDERS_READ',
  'ORDERS_WRITE',
  'PAYMENTS_READ',
  'PAYMENTS_WRITE',
  'APPOINTMENTS_READ',
  'APPOINTMENTS_WRITE',
  'APPOINTMENTS_ALL_READ',
  'APPOINTMENTS_BUSINESS_SETTINGS_READ',
  'INVENTORY_READ',
  'INVENTORY_WRITE',
  'MERCHANT_PROFILE_READ',
  'EMPLOYEES_READ',
  'EMPLOYEES_WRITE',
  'TIMECARDS_READ',
  'TIMECARDS_WRITE',
  'CASH_DRAWER_READ',
  'DEVICE_CREDENTIAL_MANAGEMENT',
  'DEVICE_READ',
  'GIFT_CARDS_READ',
  'GIFT_CARDS_WRITE',
  'SUBSCRIPTIONS_READ',
  'SUBSCRIPTIONS_WRITE',
  'DISCOUNTS_READ',
  'DISCOUNTS_WRITE',
  'TAXES_READ',
  'TAXES_WRITE',
  'SETTLEMENTS_READ',
  'BANK_ACCOUNTS_READ',
  'VENDOR_READ',
  'VENDOR_WRITE',
  'LOYALTY_READ',
  'LOYALTY_WRITE',
  'ONLINE_STORE_SITE_READ',
  'ONLINE_STORE_SNIPPET_READ',
  'ONLINE_STORE_SNIPPET_WRITE',
] as const;

export type SquareOAuthScope = (typeof SQUARE_OAUTH_SCOPES)[number];

// ---------------------------------------------------------------------------
// SquareOAuth — main class
// ---------------------------------------------------------------------------

export class SquareOAuth {
  private readonly env: SquareOAuthEnv;
  private readonly storage: TokenStorage;

  constructor(storage: TokenStorage, env?: Partial<SquareOAuthEnv>) {
    this.env = env ? { ...getEnv(), ...env } : getEnv();
    this.storage = storage;
  }

  // -----------------------------------------------------------------------
  // Authorization URL
  // -----------------------------------------------------------------------

  /**
   * Build the OAuth authorization URL for redirecting the merchant
   */
  getAuthorizationUrl(options: {
    state: string;
    scopes?: string[];
    codeChallenge?: string;
    codeChallengeMethod?: 'S256' | 'plain';
    session?: boolean;
  }): string {
    const scopes = options.scopes ?? this.env.SQUARE_OAUTH_SCOPES.split(/\s+/);
    const url = new URL(`${this.env.SQUARE_API_BASE_URL}/oauth2/authorize`);

    url.searchParams.set('client_id', this.env.SQUARE_APPLICATION_ID);
    url.searchParams.set('scope', scopes.join(' '));
    url.searchParams.set('redirect_uri', this.env.SQUARE_OAUTH_REDIRECT_URL);
    url.searchParams.set('state', options.state);
    url.searchParams.set('session', String(options.session ?? false));

    if (options.codeChallenge) {
      url.searchParams.set('code_challenge', options.codeChallenge);
      url.searchParams.set(
        'code_challenge_method',
        options.codeChallengeMethod ?? 'S256',
      );
    }

    return url.toString();
  }

  // -----------------------------------------------------------------------
  // Token exchange (authorization code → tokens)
  // -----------------------------------------------------------------------

  /**
   * Exchange an authorization code for access + refresh tokens
   */
  async exchangeCode(options: {
    code: string;
    codeVerifier?: string;
  }): Promise<SquareTokens> {
    const body = new URLSearchParams({
      client_id: this.env.SQUARE_APPLICATION_ID,
      client_secret: this.env.SQUARE_APPLICATION_SECRET,
      code: options.code,
      grant_type: 'authorization_code',
      redirect_uri: this.env.SQUARE_OAUTH_REDIRECT_URL,
    });

    if (options.codeVerifier) {
      body.append('code_verifier', options.codeVerifier);
    }

    const response = await this.tokenRequest(body);
    const tokens = this.normalizeTokens(response);
    await this.storage.set(tokens.merchant_id, tokens);

    return tokens;
  }

  // -----------------------------------------------------------------------
  // Token refresh
  // -----------------------------------------------------------------------

  /**
   * Refresh an expired access token using the refresh token
   */
  async refreshTokens(merchantId: string): Promise<SquareTokens> {
    const existing = await this.storage.get(merchantId);
    if (!existing) {
      throw new OAuthError(
        'NO_TOKENS',
        `No tokens found for merchant ${merchantId}`,
      );
    }

    const body = new URLSearchParams({
      client_id: this.env.SQUARE_APPLICATION_ID,
      client_secret: this.env.SQUARE_APPLICATION_SECRET,
      refresh_token: existing.refresh_token,
      grant_type: 'refresh_token',
    });

    const response = await this.tokenRequest(body);
    const tokens = this.normalizeTokens(response);
    await this.storage.set(merchantId, tokens);

    return tokens;
  }

  /**
   * Ensure tokens are valid — refresh if expired
   */
  async ensureValid(merchantId: string): Promise<SquareTokens> {
    const tokens = await this.storage.get(merchantId);
    if (!tokens) {
      throw new OAuthError(
        'NO_TOKENS',
        `No tokens found for merchant ${merchantId}`,
      );
    }

    // 60-second buffer before expiry
    const now = Math.floor(Date.now() / 1000);
    if (now >= tokens.expires_at - 60) {
      return this.refreshTokens(merchantId);
    }

    return tokens;
  }

  // -----------------------------------------------------------------------
  // Revoke
  // -----------------------------------------------------------------------

  /**
   * Revoke an access token (logout/disconnect)
   */
  async revokeToken(merchantId: string, tokenType: 'access' | 'refresh' = 'access'): Promise<void> {
    const tokens = await this.storage.get(merchantId);
    if (!tokens) {
      throw new OAuthError(
        'NO_TOKENS',
        `No tokens found for merchant ${merchantId}`,
      );
    }

    const token = tokenType === 'access' ? tokens.access_token : tokens.refresh_token;

    const body = new URLSearchParams({
      client_id: this.env.SQUARE_APPLICATION_ID,
      client_secret: this.env.SQUARE_APPLICATION_SECRET,
      token,
    });

    const response = await fetch(`${this.env.SQUARE_API_BASE_URL}/oauth2/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new OAuthError(
        'REVOKE_FAILED',
        `Failed to revoke token: ${response.status} ${errorBody}`,
      );
    }

    // Clean up storage
    await this.storage.delete(merchantId);
  }

  // -----------------------------------------------------------------------
  // Token info / validation
  // -----------------------------------------------------------------------

  /**
   * Get info about an access token (useful for validation)
   */
  async getTokenInfo(accessToken: string): Promise<{
    merchant_id: string;
    access_token: string;
    expires_at: string;
    client_id: string;
    scopes: string[];
  }> {
    const response = await fetch(`${this.env.SQUARE_API_BASE_URL}/oauth2/token/status`, {
      method: 'POST',
      headers: {
        Authorization: `Client ${this.env.SQUARE_APPLICATION_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token: accessToken }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new OAuthError(
        'TOKEN_INFO_FAILED',
        `Failed to get token info: ${response.status} ${errorBody}`,
      );
    }

    return response.json();
  }

  // -----------------------------------------------------------------------
  // PKCE helpers
  // -----------------------------------------------------------------------

  /**
   * Generate a PKCE code verifier
   */
  generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64URLEncode(array);
  }

  /**
   * Derive a PKCE code challenge from a verifier
   */
  async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64URLEncode(new Uint8Array(digest));
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private async tokenRequest(body: URLSearchParams): Promise<SquareTokenResponse> {
    const response = await fetch(`${this.env.SQUARE_API_BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new OAuthError(
        'TOKEN_EXCHANGE_FAILED',
        `Square OAuth token request failed: ${response.status} ${errorBody}`,
      );
    }

    const data = await response.json() as SquareTokenResponse;
    return data;
  }

  private normalizeTokens(response: SquareTokenResponse | SquareRefreshResponse): SquareTokens {
    const scopes = Array.isArray(response.token_type)
      ? []
      : (response as SquareTokenResponse).scopes ?? [];

    return {
      access_token: response.access_token,
      refresh_token: 'refresh_token' in response ? response.refresh_token : '',
      expires_at: Math.floor(new Date(response.expires_at).getTime() / 1000),
      token_type: response.token_type as 'Bearer',
      merchant_id: response.merchant_id,
      scopes,
    };
  }
}

// ---------------------------------------------------------------------------
// PKCE utilities
// ---------------------------------------------------------------------------

function base64URLEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

export class OAuthError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'OAuthError';
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OAuthError);
    }
  }
}

// ---------------------------------------------------------------------------
// In-memory token storage (for development/testing)
// Replace with Supabase / Redis in production
// ---------------------------------------------------------------------------

export class InMemoryTokenStorage implements TokenStorage {
  private store = new Map<string, SquareTokens>();

  async get(merchantId: string): Promise<SquareTokens | null> {
    return this.store.get(merchantId) ?? null;
  }

  async set(merchantId: string, tokens: SquareTokens): Promise<void> {
    this.store.set(merchantId, { ...tokens });
  }

  async delete(merchantId: string): Promise<void> {
    this.store.delete(merchantId);
  }

  async list(): Promise<string[]> {
    return Array.from(this.store.keys());
  }
}
