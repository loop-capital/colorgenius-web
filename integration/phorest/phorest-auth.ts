/**
 * Phorest Authentication Module
 * Handles Basic auth with global/ prefix, credential storage, and validation.
 */

import {
  type PhorestCredentials,
  PhorestCredentialsSchema,
  type PhorestApiError,
  PhorestError,
  PhorestErrorCodeSchema,
  type PhorestRegion,
  PHOREST_BASE_URLS,
} from "./types";
import crypto from "crypto";

// ═══════════════════════════════════════════════════════════════
// Configuration & Defaults
// ═══════════════════════════════════════════════════════════════

const DEFAULT_RATE_LIMIT_RPS = 10;
const GLOBAL_PREFIX = "global/";

export interface AuthConfig {
  /** Phorest Business ID (UUID) */
  businessId: string;
  /** Phorest login email */
  email: string;
  /** Phorest login password */
  password: string;
  /** Server region (us or eu) */
  region?: PhorestRegion;
  /** Optional label */
  label?: string;
  /** Rate limit requests per second */
  rateLimitRps?: number;
  /** Storage adapter (defaults to memory) */
  storage?: CredentialStorageAdapter;
}

/** Pluggable storage for credentials (e.g., Supabase, Vault) */
export interface CredentialStorageAdapter {
  get(id: string): Promise<PhorestCredentials | null>;
  getActive(businessId: string): Promise<PhorestCredentials | null>;
  set(config: PhorestCredentials): Promise<void>;
  list(businessId: string): Promise<PhorestCredentials[]>;
  delete(id: string): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════
// In-Memory Credential Storage (default)
// ═══════════════════════════════════════════════════════════════

class InMemoryCredentialStorage implements CredentialStorageAdapter {
  private store = new Map<string, PhorestCredentials>();

  async get(id: string): Promise<PhorestCredentials | null> {
    return this.store.get(id) ?? null;
  }

  async getActive(businessId: string): Promise<PhorestCredentials | null> {
    const values = Array.from(this.store.values());
    for (const config of values) {
      if (config.businessId === businessId && config.isActive) {
        return config;
      }
    }
    return null;
  }

  async set(config: PhorestCredentials): Promise<void> {
    const validated = PhorestCredentialsSchema.parse(config);
    this.store.set(validated.id, validated);
  }

  async list(businessId: string): Promise<PhorestCredentials[]> {
    return Array.from(this.store.values())
      .filter((c) => c.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}

// ═══════════════════════════════════════════════════════════════
// Auth Manager
// ═══════════════════════════════════════════════════════════════

export class PhorestAuthManager {
  private storage: CredentialStorageAdapter;
  private activeCredentials = new Map<string, PhorestCredentials>(); // businessId -> config

  constructor(config?: { storage?: CredentialStorageAdapter }) {
    this.storage = config?.storage ?? new InMemoryCredentialStorage();
  }

  /** Initialize from AuthConfig (one-shot setup) */
  async initialize(authConfig: AuthConfig): Promise<PhorestCredentials> {
    const { businessId, email, password, region = "us", label, rateLimitRps } = authConfig;

    const config: PhorestCredentials = {
      id: crypto.randomUUID(),
      businessId: String(businessId),
      email,
      password,
      region,
      label: label ?? "default",
      isActive: true,
      createdAt: new Date().toISOString(),
      lastVerifiedAt: null,
      rateLimitPerSecond: rateLimitRps ?? DEFAULT_RATE_LIMIT_RPS,
    };

    await this.storage.set(config);
    this.activeCredentials.set(String(businessId), config);
    return config;
  }

  /** Get the active credentials for a business */
  async getActiveCredentials(businessId: string): Promise<PhorestCredentials> {
    // Check memory cache first
    const cached = this.activeCredentials.get(businessId);
    if (cached && cached.isActive) {
      return cached;
    }

    // Fallback to storage
    const fromStorage = await this.storage.getActive(businessId);
    if (!fromStorage) {
      const err: PhorestApiError = {
        code: PhorestErrorCodeSchema.enum.UNAUTHORIZED,
        message: `No active credentials found for business ${businessId}`,
        retryable: false,
      };
      throw new PhorestError(err);
    }

    this.activeCredentials.set(businessId, fromStorage);
    return fromStorage;
  }

  /** Build Basic auth header with global/ prefix */
  async getAuthHeaders(businessId: string): Promise<Record<string, string>> {
    const creds = await this.getActiveCredentials(businessId);
    const username = `${GLOBAL_PREFIX}${creds.email}`;
    const password = creds.password;
    const encoded = Buffer.from(`${username}:${password}`).toString("base64");

    return {
      Authorization: `Basic ${encoded}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  /** Get base URL for a business */
  async getBaseUrl(businessId: string): Promise<string> {
    const creds = await this.getActiveCredentials(businessId);
    return PHOREST_BASE_URLS[creds.region];
  }

  /** Validate credentials by making a test request */
  async validateCredentials(businessId: string): Promise<boolean> {
    try {
      const creds = await this.getActiveCredentials(businessId);
      const baseUrl = PHOREST_BASE_URLS[creds.region];
      const username = `${GLOBAL_PREFIX}${creds.email}`;
      const encoded = Buffer.from(`${username}:${creds.password}`).toString("base64");

      const response = await fetch(`${baseUrl}/business/${businessId}/branch?page=0&size=1`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${encoded}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10_000),
      });

      if (response.ok) {
        // Update lastVerifiedAt
        const updated: PhorestCredentials = {
          ...creds,
          lastVerifiedAt: new Date().toISOString(),
        };
        await this.storage.set(updated);
        this.activeCredentials.set(businessId, updated);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /** Update credentials (e.g., password change) */
  async updateCredentials(
    businessId: string,
    updates: Partial<Pick<PhorestCredentials, "email" | "password" | "region" | "label">>
  ): Promise<PhorestCredentials> {
    const current = await this.getActiveCredentials(businessId);
    const updated: PhorestCredentials = {
      ...current,
      ...updates,
    };
    await this.storage.set(updated);
    this.activeCredentials.set(businessId, updated);
    return updated;
  }

  /** Deactivate credentials for a business */
  async deactivate(businessId: string): Promise<void> {
    const current = await this.storage.getActive(businessId);
    if (!current) return;

    const deactivated: PhorestCredentials = {
      ...current,
      isActive: false,
    };
    await this.storage.set(deactivated);
    this.activeCredentials.delete(businessId);
  }

  /** List all credentials for a business (for audit) */
  async listCredentials(businessId: string): Promise<PhorestCredentials[]> {
    return this.storage.list(businessId);
  }

  /** Get rate limit for a business */
  async getRateLimit(businessId: string): Promise<number> {
    const config = await this.getActiveCredentials(businessId);
    return config.rateLimitPerSecond ?? DEFAULT_RATE_LIMIT_RPS;
  }

  /** Load credentials from environment variables */
  async loadFromEnv(): Promise<number> {
    let loaded = 0;
    for (const [key, value] of Object.entries(process.env)) {
      if (!key.startsWith("PHOREST_CREDENTIALS_") || !value) continue;

      // Expected format: businessId:email:password[:region]
      const parts = value.split(":");
      if (parts.length < 3) continue;

      const [businessId, email, password, region = "us"] = parts;
      if (!businessId || !email || !password) continue;

      const config: PhorestCredentials = {
        id: crypto.randomUUID(),
        businessId,
        email,
        password,
        region: region as PhorestRegion,
        label: `env-${key}`,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastVerifiedAt: null,
        rateLimitPerSecond: DEFAULT_RATE_LIMIT_RPS,
      };

      await this.storage.set(config);
      this.activeCredentials.set(businessId, config);
      loaded++;
    }
    return loaded;
  }

  /** Check if an error indicates auth failure */
  isAuthError(statusCode: number, body?: unknown): boolean {
    if (statusCode === 401 || statusCode === 403) return true;
    if (typeof body === "object" && body !== null) {
      const b = body as Record<string, unknown>;
      const msg = String(b.message ?? b.error ?? "").toLowerCase();
      if (msg.includes("unauthorized") || msg.includes("invalid credentials") || msg.includes("forbidden")) {
        return true;
      }
    }
    return false;
  }

  /** Handle auth failure — evict from cache */
  async handleAuthFailure(businessId: string): Promise<void> {
    this.activeCredentials.delete(businessId);
  }
}

// ═══════════════════════════════════════════════════════════════
// Singleton Export
// ═══════════════════════════════════════════════════════════════

let globalAuthManager: PhorestAuthManager | null = null;

export function getAuthManager(config?: { storage?: CredentialStorageAdapter }): PhorestAuthManager {
  if (!globalAuthManager) {
    globalAuthManager = new PhorestAuthManager(config);
  }
  return globalAuthManager;
}

export function resetAuthManager(): void {
  globalAuthManager = null;
}
