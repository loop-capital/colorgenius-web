/**
 * Vagaro Authentication Module
 * Handles API key management, auth header injection, and key rotation.
 */

import {
  type VagaroApiKeyConfig,
  type VagaroApiError,
  VagaroApiKeyConfigSchema,
  VagaroError,
  VagaroErrorCodeSchema,
} from "./types";
import crypto from "crypto";

// ═══════════════════════════════════════════════════════════════
// Configuration & Defaults
// ═══════════════════════════════════════════════════════════════

const ENV_KEY_PREFIX = "VAGARO_API_KEY_";
const DEFAULT_RATE_LIMIT_RPS = 5;

export interface AuthConfig {
  /** Primary API key */
  apiKey: string;
  /** Optional fallback / secondary key for rotation */
  fallbackApiKey?: string;
  /** Vagaro Business ID */
  businessId: string;
  /** Custom label for this credential set */
  label?: string;
  /** Rate limit requests per second */
  rateLimitRps?: number;
  /** Optional key expiration date */
  expiresAt?: Date;
  /** Storage adapter (defaults to env + memory) */
  storage?: KeyStorageAdapter;
}

/** Pluggable storage for API keys (e.g., Supabase, Vault, env) */
export interface KeyStorageAdapter {
  get(id: string): Promise<VagaroApiKeyConfig | null>;
  getActive(businessId: string): Promise<VagaroApiKeyConfig | null>;
  set(config: VagaroApiKeyConfig): Promise<void>;
  list(businessId: string): Promise<VagaroApiKeyConfig[]>;
  rotate(businessId: string, newKey: string, opts?: RotationOptions): Promise<VagaroApiKeyConfig>;
}

export interface RotationOptions {
  gracePeriodMs?: number;  // time to keep old key valid
  label?: string;
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// In-Memory Key Storage (default; production should use Supabase/Vault)
// ═══════════════════════════════════════════════════════════════

class InMemoryKeyStorage implements KeyStorageAdapter {
  private store = new Map<string, VagaroApiKeyConfig>();

  async get(id: string): Promise<VagaroApiKeyConfig | null> {
    return this.store.get(id) ?? null;
  }

  async getActive(businessId: string): Promise<VagaroApiKeyConfig | null> {
    for (const config of this.store.values()) {
      if (config.businessId === businessId && config.isActive) {
        if (config.expiresAt && new Date(config.expiresAt) < new Date()) {
          continue; // expired
        }
        return config;
      }
    }
    return null;
  }

  async set(config: VagaroApiKeyConfig): Promise<void> {
    const validated = VagaroApiKeyConfigSchema.parse(config);
    this.store.set(validated.id, validated);
  }

  async list(businessId: string): Promise<VagaroApiKeyConfig[]> {
    return Array.from(this.store.values())
      .filter((c) => c.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async rotate(
    businessId: string,
    newKey: string,
    opts: RotationOptions = {}
  ): Promise<VagaroApiKeyConfig> {
    const { gracePeriodMs = 5 * 60 * 1000, label, metadata } = opts;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + gracePeriodMs).toISOString();

    // Deactivate current active key (with grace period)
    const current = await this.getActive(businessId);
    if (current) {
      const deactivated: VagaroApiKeyConfig = {
        ...current,
        isActive: false,
        expiresAt,
        lastRotatedAt: now,
      };
      await this.set(deactivated);
    }

    // Register new key
    const newConfig: VagaroApiKeyConfig = {
      id: crypto.randomUUID(),
      apiKey: newKey,
      businessId,
      label: label ?? `rotated-${now}`,
      isActive: true,
      createdAt: now,
      rateLimitPerSecond: current?.rateLimitPerSecond ?? DEFAULT_RATE_LIMIT_RPS,
      metadata: {
        previousKeyId: current?.id,
        ...metadata,
      },
    };
    await this.set(newConfig);
    return newConfig;
  }
}

// ═══════════════════════════════════════════════════════════════
// Auth Manager
// ═══════════════════════════════════════════════════════════════

export class VagaroAuthManager {
  private storage: KeyStorageAdapter;
  private activeKeys = new Map<string, VagaroApiKeyConfig>(); // businessId -> config
  private keyHistory = new Map<string, VagaroApiKeyConfig[]>();  // businessId -> recent keys

  constructor(config?: { storage?: KeyStorageAdapter }) {
    this.storage = config?.storage ?? new InMemoryKeyStorage();
  }

  /** Initialize from AuthConfig (one-shot setup) */
  async initialize(authConfig: AuthConfig): Promise<VagaroApiKeyConfig> {
    const { apiKey, businessId, label, rateLimitRps, expiresAt } = authConfig;

    const config: VagaroApiKeyConfig = {
      id: crypto.randomUUID(),
      apiKey,
      businessId: String(businessId),
      label: label ?? "default",
      isActive: true,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt?.toISOString(),
      rateLimitPerSecond: rateLimitRps ?? DEFAULT_RATE_LIMIT_RPS,
    };

    await this.storage.set(config);
    this.activeKeys.set(String(businessId), config);
    return config;
  }

  /** Get the active API key config for a business */
  async getActiveKey(businessId: string): Promise<VagaroApiKeyConfig> {
    // Check memory cache first
    const cached = this.activeKeys.get(businessId);
    if (cached && this.isKeyValid(cached)) {
      return cached;
    }

    // Fallback to storage
    const fromStorage = await this.storage.getActive(businessId);
    if (!fromStorage) {
      const err: VagaroApiError = {
        code: VagaroErrorCodeSchema.enum.UNAUTHORIZED,
        message: `No active API key found for business ${businessId}`,
        retryable: false,
      };
      throw new VagaroError(err);
    }

    this.activeKeys.set(businessId, fromStorage);
    return fromStorage;
  }

  /** Build request headers with API key */
  async getAuthHeaders(businessId: string): Promise<Record<string, string>> {
    const keyConfig = await this.getActiveKey(businessId);
    return {
      Authorization: `Bearer ${keyConfig.apiKey}`,
      "X-Vagaro-Business-ID": String(keyConfig.businessId),
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  /** Check if a key is still valid (not expired) */
  isKeyValid(config: VagaroApiKeyConfig): boolean {
    if (!config.isActive) return false;
    if (config.expiresAt) {
      return new Date(config.expiresAt) > new Date();
    }
    return true;
  }

  /** Rotate API key for a business */
  async rotateKey(
    businessId: string,
    newKey: string,
    opts?: RotationOptions
  ): Promise<VagaroApiKeyConfig> {
    const rotated = await this.storage.rotate(businessId, newKey, opts);
    this.activeKeys.set(businessId, rotated);

    // Update history
    const history = await this.storage.list(businessId);
    this.keyHistory.set(businessId, history.slice(0, 5));

    return rotated;
  }

  /** Revoke a specific key */
  async revokeKey(keyId: string): Promise<void> {
    const config = await this.storage.get(keyId);
    if (!config) return;

    const revoked: VagaroApiKeyConfig = {
      ...config,
      isActive: false,
      expiresAt: new Date().toISOString(),
    };
    await this.storage.set(revoked);

    // Evict from cache if it was active
    const cached = this.activeKeys.get(config.businessId);
    if (cached?.id === keyId) {
      this.activeKeys.delete(config.businessId);
    }
  }

  /** List all keys for a business (for audit) */
  async listKeys(businessId: string): Promise<VagaroApiKeyConfig[]> {
    return this.storage.list(businessId);
  }

  /** Get rate limit for a business */
  async getRateLimit(businessId: string): Promise<number> {
    const config = await this.getActiveKey(businessId);
    return config.rateLimitPerSecond ?? DEFAULT_RATE_LIMIT_RPS;
  }

  /** Load keys from environment variables */
  async loadFromEnv(): Promise<number> {
    let loaded = 0;
    for (const [key, value] of Object.entries(process.env)) {
      if (!key.startsWith(ENV_KEY_PREFIX) || !value) continue;

      const businessId = key.replace(ENV_KEY_PREFIX, "");
      if (!businessId) continue;

      const config: VagaroApiKeyConfig = {
        id: crypto.randomUUID(),
        apiKey: value,
        businessId,
        label: `env-${key}`,
        isActive: true,
        createdAt: new Date().toISOString(),
        rateLimitPerSecond: DEFAULT_RATE_LIMIT_RPS,
      };

      await this.storage.set(config);
      this.activeKeys.set(businessId, config);
      loaded++;
    }
    return loaded;
  }

  /** Check if a request error indicates an auth problem */
  isAuthError(statusCode: number, body?: unknown): boolean {
    if (statusCode === 401 || statusCode === 403) return true;
    if (typeof body === "object" && body !== null) {
      const b = body as Record<string, unknown>;
      const msg = String(b.message ?? b.error ?? "").toLowerCase();
      if (msg.includes("unauthorized") || msg.includes("invalid key") || msg.includes("forbidden")) {
        return true;
      }
    }
    return false;
  }

  /** Handle auth failure — evict key, trigger rotation if configured */
  async handleAuthFailure(
    businessId: string,
    fallbackKey?: string
  ): Promise<VagaroApiKeyConfig | null> {
    this.activeKeys.delete(businessId);

    if (fallbackKey) {
      return this.rotateKey(businessId, fallbackKey, {
        label: "auto-rotation-on-auth-failure",
      });
    }

    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Singleton Export
// ═══════════════════════════════════════════════════════════════

let globalAuthManager: VagaroAuthManager | null = null;

export function getAuthManager(config?: { storage?: KeyStorageAdapter }): VagaroAuthManager {
  if (!globalAuthManager) {
    globalAuthManager = new VagaroAuthManager(config);
  }
  return globalAuthManager;
}

export function resetAuthManager(): void {
  globalAuthManager = null;
}
