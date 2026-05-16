/**
 * Vagaro Webhook Handler
 * Signature verification, event routing, idempotency, and queue integration.
 */

import {
  type VagaroWebhookPayload,
  type VagaroWebhookEvent,
  type VagaroWebhookRegistration,
  VagaroWebhookPayloadSchema,
  VagaroWebhookEventSchema,
  VagaroWebhookRegistrationSchema,
  VagaroError,
  VagaroErrorCodeSchema,
} from "./types";
import { VagaroApiClient, getVagaroClient } from "./vagaro-client";
import crypto from "crypto";

// ═══════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════

export interface WebhookHandlerConfig {
  /** Your webhook endpoint secret (from Vagaro dashboard) */
  secret: string;
  /** Business ID for API calls */
  businessId: string;
  /** API key (for registering webhooks) */
  apiKey: string;
  /** Base URL */
  baseUrl?: string;
  /** Tolerance for timestamp skew (default 5 min) */
  timestampToleranceMs?: number;
  /** Custom queue adapter (default: in-memory) */
  queueAdapter?: QueueAdapter;
  /** Custom idempotency store (default: in-memory) */
  idempotencyStore?: IdempotencyStore;
  /** Logger */
  logger?: (level: "debug" | "info" | "warn" | "error", message: string, meta?: unknown) => void;
}

/** Queue adapter for async webhook processing */
export interface QueueAdapter {
  enqueue(job: WebhookJob): Promise<void>;
  process(handler: (job: WebhookJob) => Promise<void>): Promise<void>;
}

export interface WebhookJob {
  id: string;
  event: VagaroWebhookEvent;
  payload: VagaroWebhookPayload;
  receivedAt: string;
  attempt: number;
  maxAttempts: number;
}

/** Idempotency store to prevent duplicate webhook processing */
export interface IdempotencyStore {
  has(id: string): Promise<boolean>;
  mark(id: string, ttlMs?: number): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════
// In-Memory Implementations (default)
// ═══════════════════════════════════════════════════════════════

class InMemoryIdempotencyStore implements IdempotencyStore {
  private store = new Map<string, number>(); // id -> expiry timestamp
  private readonly defaultTtlMs = 24 * 60 * 60 * 1000; // 24 hours

  async has(id: string): Promise<boolean> {
    const expiry = this.store.get(id);
    if (!expiry) return false;
    if (expiry < Date.now()) {
      this.store.delete(id);
      return false;
    }
    return true;
  }

  async mark(id: string, ttlMs = this.defaultTtlMs): Promise<void> {
    this.store.set(id, Date.now() + ttlMs);
  }
}

class InMemoryQueueAdapter implements QueueAdapter {
  private jobs: WebhookJob[] = [];
  private processing = false;

  async enqueue(job: WebhookJob): Promise<void> {
    this.jobs.push(job);
  }

  async process(handler: (job: WebhookJob) => Promise<void>): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.jobs.length > 0) {
      const job = this.jobs.shift()!;
      try {
        await handler(job);
      } catch {
        // Re-queue if attempts remain
        if (job.attempt < job.maxAttempts) {
          this.jobs.push({ ...job, attempt: job.attempt + 1 });
        }
      }
    }

    this.processing = false;
  }
}

// ═══════════════════════════════════════════════════════════════
// Signature Verification
// ═══════════════════════════════════════════════════════════════

/**
 * Verify HMAC-SHA256 signature of a webhook payload.
 *
 * @param secret - The webhook signing secret
 * @param payload - Raw request body (string or Buffer)
 * @param signature - The signature from the X-Vagaro-Signature header
 * @returns true if valid
 */
export function verifyWebhookSignature(
  secret: string,
  payload: string | Buffer,
  signature: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Verify the webhook payload timestamp to prevent replay attacks.
 */
export function verifyWebhookTimestamp(
  payloadTimestamp: string,
  toleranceMs = 5 * 60 * 1000 // 5 minutes
): boolean {
  const payloadTime = new Date(payloadTimestamp).getTime();
  const now = Date.now();
  return Math.abs(now - payloadTime) <= toleranceMs;
}

// ═══════════════════════════════════════════════════════════════
// Webhook Handler
// ═══════════════════════════════════════════════════════════════

export type WebhookEventHandler = (payload: VagaroWebhookPayload) => Promise<void>;

export interface WebhookRouter {
  [event: string]: WebhookEventHandler | undefined;
  "*"?: WebhookEventHandler; // catch-all
}

export class VagaroWebhookHandler {
  private config: WebhookHandlerConfig;
  private router: WebhookRouter = {};
  private idempotency: IdempotencyStore;
  private queue: QueueAdapter;
  private logger: WebhookHandlerConfig["logger"];

  constructor(config: WebhookHandlerConfig) {
    this.config = config;
    this.idempotency = config.idempotencyStore ?? new InMemoryIdempotencyStore();
    this.queue = config.queueAdapter ?? new InMemoryQueueAdapter();
    this.logger = config.logger ?? (() => {});
  }

  /**
   * Register a handler for a specific webhook event.
   */
  on(event: VagaroWebhookEvent | "*", handler: WebhookEventHandler): this {
    this.router[event] = handler;
    return this;
  }

  /**
   * Register multiple handlers at once.
   */
  register(router: WebhookRouter): this {
    this.router = { ...this.router, ...router };
    return this;
  }

  /**
   * Handle an incoming webhook request.
   *
   * @param rawBody - The raw request body (must NOT be parsed JSON)
   * @param headers - Request headers (case-insensitive lookup)
   * @returns validation result
   */
  async handle(
    rawBody: string | Buffer,
    headers: Record<string, string | string[] | undefined>
  ): Promise<{ success: boolean; id: string; event: string; processed: boolean; error?: string }> {
    const signature = String(headers["x-vagaro-signature"] ?? headers["X-Vagaro-Signature"] ?? "");
    if (!signature) {
      return { success: false, id: "", event: "", processed: false, error: "Missing signature header" };
    }

    // Verify signature
    if (!verifyWebhookSignature(this.config.secret, rawBody, signature)) {
      return { success: false, id: "", event: "", processed: false, error: "Invalid signature" };
    }

    // Parse payload
    let payload: VagaroWebhookPayload;
    try {
      const parsed = JSON.parse(rawBody.toString());
      payload = VagaroWebhookPayloadSchema.parse(parsed);
    } catch (err) {
      return {
        success: false,
        id: "",
        event: "",
        processed: false,
        error: `Payload validation failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    // Verify timestamp
    if (
      !verifyWebhookTimestamp(
        payload.timestamp,
        this.config.timestampToleranceMs
      )
    ) {
      return {
        success: false,
        id: payload.id,
        event: payload.event,
        processed: false,
        error: "Timestamp outside tolerance window",
      };
    }

    // Check idempotency
    if (await this.idempotency.has(payload.id)) {
      this.logger("info", `[Vagaro Webhook] Duplicate event ignored`, { id: payload.id, event: payload.event });
      return { success: true, id: payload.id, event: payload.event, processed: false };
    }
    await this.idempotency.mark(payload.id);

    // Enqueue for processing
    const job: WebhookJob = {
      id: payload.id,
      event: payload.event,
      payload,
      receivedAt: new Date().toISOString(),
      attempt: 1,
      maxAttempts: 3,
    };
    await this.queue.enqueue(job);

    this.logger("info", `[Vagaro Webhook] Event queued`, { id: payload.id, event: payload.event });

    // Process immediately (or run queue.process() in a background worker)
    await this.processQueue();

    return { success: true, id: payload.id, event: payload.event, processed: true };
  }

  /**
   * Process all queued webhook jobs.
   */
  async processQueue(): Promise<void> {
    await this.queue.process(async (job) => {
      const handler = this.router[job.event] ?? this.router["*"];
      if (!handler) {
        this.logger("warn", `[Vagaro Webhook] No handler for event`, { event: job.event, id: job.id });
        return;
      }

      try {
        await handler(job.payload);
        this.logger("info", `[Vagaro Webhook] Event handled`, { id: job.id, event: job.event });
      } catch (err) {
        this.logger("error", `[Vagaro Webhook] Handler failed`, {
          id: job.id,
          event: job.event,
          attempt: job.attempt,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err; // Re-throw so queue can retry
      }
    });
  }

  /**
   * Register this webhook endpoint with Vagaro.
   * Requires API key with webhook management scope.
   */
  async registerEndpoint(
    url: string,
    events: VagaroWebhookEvent[],
    opts?: { secret?: string; metadata?: Record<string, unknown> }
  ): Promise<VagaroWebhookRegistration> {
    const client = getVagaroClient({
      businessId: this.config.businessId,
      fetch: globalThis.fetch,
    });

    const secret = opts?.secret ?? crypto.randomBytes(32).toString("hex");

    const registration: VagaroWebhookRegistration = {
      id: crypto.randomUUID(),
      url,
      events,
      secret,
      isActive: true,
      createdAt: new Date().toISOString(),
      failureCount: 0,
      ...opts?.metadata,
    };

    // Call Vagaro API to register webhook
    await client.post("/webhooks", {
      url,
      events,
      secret,
    });

    return VagaroWebhookRegistrationSchema.parse(registration);
  }

  /**
   * List registered webhooks.
   */
  async listEndpoints(): Promise<VagaroWebhookRegistration[]> {
    const client = getVagaroClient({
      businessId: this.config.businessId,
      fetch: globalThis.fetch,
    });

    const raw = await client.get<
      Array<{
        id: string;
        url: string;
        events: string[];
        secret: string;
        isActive: boolean;
        createdAt: string;
        lastDeliveredAt?: string | null;
        failureCount?: number;
      }>
    >("/webhooks");

    return raw.map((r) =>
      VagaroWebhookRegistrationSchema.parse({
        ...r,
        events: r.events.map((e) => VagaroWebhookEventSchema.parse(e)),
      })
    );
  }

  /**
   * Delete a registered webhook endpoint.
   */
  async deleteEndpoint(webhookId: string): Promise<void> {
    const client = getVagaroClient({
      businessId: this.config.businessId,
      fetch: globalThis.fetch,
    });
    await client.delete(`/webhooks/${webhookId}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// Factory
// ═══════════════════════════════════════════════════════════════

export function createVagaroWebhookHandler(config: WebhookHandlerConfig): VagaroWebhookHandler {
  return new VagaroWebhookHandler(config);
}
