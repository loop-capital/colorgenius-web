/**
 * Square Webhook Handler
 * Signature verification, event routing, idempotency, and queue integration
 */

import { z } from 'zod';
import { createHmac, timingSafeEqual } from 'crypto';
import {
  type SquareWebhookPayload,
  type SquareWebhookEventType,
  type QueueInterface,
  type QueueMessage,
  type SquareWebhookConfig,
} from './types';

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const webhookPayloadSchema = z.object({
  merchant_id: z.string(),
  type: z.string(),
  event_id: z.string(),
  created_at: z.string(),
  data: z.object({
    type: z.string(),
    id: z.string(),
    object: z.record(z.unknown()).optional(),
  }),
});

// ---------------------------------------------------------------------------
// Environment config
// ---------------------------------------------------------------------------

function getWebhookConfig(): SquareWebhookConfig {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL;

  if (!signatureKey) {
    throw new WebhookError('CONFIG_MISSING', 'SQUARE_WEBHOOK_SIGNATURE_KEY is required');
  }
  if (!notificationUrl) {
    throw new WebhookError('CONFIG_MISSING', 'SQUARE_WEBHOOK_NOTIFICATION_URL is required');
  }

  return {
    signatureKey,
    notificationUrl,
    eventTypes: parseEventTypes(process.env.SQUARE_WEBHOOK_EVENT_TYPES),
  };
}

function parseEventTypes(env?: string): SquareWebhookEventType[] {
  if (!env) {
    return [
      'payment.created',
      'payment.updated',
      'booking.created',
      'booking.updated',
      'customer.created',
      'customer.updated',
      'customer.deleted',
      'order.created',
      'order.updated',
      'inventory.count.updated',
      'catalog.version.updated',
    ];
  }
  return env.split(',').map((t) => t.trim()) as SquareWebhookEventType[];
}

// ---------------------------------------------------------------------------
// Idempotency store interface
// ---------------------------------------------------------------------------

export interface IdempotencyStore {
  has(eventId: string): Promise<boolean>;
  set(eventId: string, ttlSeconds?: number): Promise<void>;
  delete(eventId: string): Promise<void>;
}

// In-memory implementation (use Redis/Supabase in production)
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private store = new Map<string, number>(); // eventId -> expiry timestamp
  private readonly defaultTtl = 86400; // 24 hours

  async has(eventId: string): Promise<boolean> {
    const expiry = this.store.get(eventId);
    if (!expiry) return false;

    if (Date.now() > expiry) {
      this.store.delete(eventId);
      return false;
    }

    return true;
  }

  async set(eventId: string, ttlSeconds?: number): Promise<void> {
    const ttl = (ttlSeconds ?? this.defaultTtl) * 1000;
    this.store.set(eventId, Date.now() + ttl);
  }

  async delete(eventId: string): Promise<void> {
    this.store.delete(eventId);
  }
}

// ---------------------------------------------------------------------------
// Event handler types
// ---------------------------------------------------------------------------

export type WebhookHandler = (
  payload: SquareWebhookPayload,
) => Promise<void> | void;

export interface WebhookHandlerMap {
  [eventType: string]: WebhookHandler | WebhookHandler[];
}

// ---------------------------------------------------------------------------
// SquareWebhooks class
// ---------------------------------------------------------------------------

export class SquareWebhooks {
  private readonly config: SquareWebhookConfig;
  private readonly idempotencyStore: IdempotencyStore;
  private readonly queue?: QueueInterface;
  private handlers: WebhookHandlerMap = {};

  constructor(
    idempotencyStore: IdempotencyStore,
    queue?: QueueInterface,
    config?: Partial<SquareWebhookConfig>,
  ) {
    this.config = config ? { ...getWebhookConfig(), ...config } : getWebhookConfig();
    this.idempotencyStore = idempotencyStore;
    this.queue = queue;
  }

  // -----------------------------------------------------------------------
  // Handler registration
  // -----------------------------------------------------------------------

  /**
   * Register a handler for a specific event type
   */
  on(eventType: SquareWebhookEventType | string, handler: WebhookHandler): void {
    const existing = this.handlers[eventType];
    if (existing) {
      if (Array.isArray(existing)) {
        existing.push(handler);
      } else {
        this.handlers[eventType] = [existing, handler];
      }
    } else {
      this.handlers[eventType] = handler;
    }
  }

  /**
   * Register multiple handlers at once
   */
  onMany(map: WebhookHandlerMap): void {
    for (const [eventType, handler] of Object.entries(map)) {
      const handlers = Array.isArray(handler) ? handler : [handler];
      for (const h of handlers) {
        this.on(eventType, h);
      }
    }
  }

  /**
   * Remove a handler for an event type
   */
  off(eventType: string, handler?: WebhookHandler): void {
    if (!handler) {
      delete this.handlers[eventType];
      return;
    }

    const existing = this.handlers[eventType];
    if (!existing) return;

    if (Array.isArray(existing)) {
      const filtered = existing.filter((h) => h !== handler);
      this.handlers[eventType] = filtered.length === 1 ? filtered[0] : filtered;
    } else if (existing === handler) {
      delete this.handlers[eventType];
    }
  }

  // -----------------------------------------------------------------------
  // Signature verification
  // -----------------------------------------------------------------------

  /**
   * Verify the Square webhook signature
   * @param signature - The signature from the X-Square-Signature header
   * @param body - The raw request body (string)
   * @returns true if valid
   */
  verifySignature(signature: string, body: string): boolean {
    if (!signature || !body) return false;

    const hmac = createHmac('sha256', this.config.signatureKey);
    hmac.update(body);
    const expectedSignature = hmac.digest('base64');

    try {
      const sigBuf = Buffer.from(signature, 'base64');
      const expectedBuf = Buffer.from(expectedSignature, 'base64');

      if (sigBuf.length !== expectedBuf.length) return false;
      return timingSafeEqual(sigBuf, expectedBuf);
    } catch {
      return false;
    }
  }

  /**
   * Verify signature with notification URL (Square v2 format)
   * Square signs: signatureKey + notificationUrl + body
   */
  verifySignatureV2(signature: string, body: string): boolean {
    if (!signature || !body) return false;

    const payload = this.config.signatureKey + this.config.notificationUrl + body;
    const hmac = createHmac('sha256', this.config.signatureKey);
    hmac.update(payload);
    const expectedSignature = hmac.digest('base64');

    try {
      const sigBuf = Buffer.from(signature, 'base64');
      const expectedBuf = Buffer.from(expectedSignature, 'base64');

      if (sigBuf.length !== expectedBuf.length) return false;
      return timingSafeEqual(sigBuf, expectedBuf);
    } catch {
      return false;
    }
  }

  // -----------------------------------------------------------------------
  // Request handling
  // -----------------------------------------------------------------------

  /**
   * Process an incoming webhook request
   * Returns structured result for HTTP response
   */
  async handleRequest(
    signature: string,
    body: string,
  ): Promise<{
    status: 'ok' | 'duplicate' | 'invalid' | 'error';
    eventId?: string;
    eventType?: string;
    merchantId?: string;
    message: string;
  }> {
    // 1. Verify signature
    const valid = this.verifySignature(signature, body);
    if (!valid) {
      // Try v2 format as fallback
      const validV2 = this.verifySignatureV2(signature, body);
      if (!validV2) {
        return {
          status: 'invalid',
          message: 'Invalid webhook signature',
        };
      }
    }

    // 2. Parse payload
    let payload: SquareWebhookPayload;
    try {
      const parsed = JSON.parse(body);
      const validated = webhookPayloadSchema.safeParse(parsed);
      if (!validated.success) {
        return {
          status: 'invalid',
          message: `Invalid payload: ${validated.error.message}`,
        };
      }
      payload = validated.data;
    } catch {
      return {
        status: 'invalid',
        message: 'Invalid JSON in webhook body',
      };
    }

    // 3. Idempotency check
    const isDuplicate = await this.idempotencyStore.has(payload.event_id);
    if (isDuplicate) {
      return {
        status: 'duplicate',
        eventId: payload.event_id,
        eventType: payload.type,
        merchantId: payload.merchant_id,
        message: 'Duplicate event — already processed',
      };
    }

    // 4. Mark as processing (prevent duplicates even if handler fails)
    await this.idempotencyStore.set(payload.event_id, 86400);

    // 5. Route to handler(s) or queue
    try {
      if (this.queue) {
        // Queue for async processing
        await this.enqueue(payload);
        return {
          status: 'ok',
          eventId: payload.event_id,
          eventType: payload.type,
          merchantId: payload.merchant_id,
          message: 'Event queued for processing',
        };
      } else {
        // Process synchronously
        await this.processEvent(payload);
        return {
          status: 'ok',
          eventId: payload.event_id,
          eventType: payload.type,
          merchantId: payload.merchant_id,
          message: 'Event processed successfully',
        };
      }
    } catch (error) {
      // Don't remove from idempotency store — event was received,
      // but handler failed. Manual intervention may be needed.
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        status: 'error',
        eventId: payload.event_id,
        eventType: payload.type,
        merchantId: payload.merchant_id,
        message: `Handler error: ${message}`,
      };
    }
  }

  // -----------------------------------------------------------------------
  // Event processing
  // -----------------------------------------------------------------------

  /**
   * Process a webhook event directly (for queue consumers)
   */
  async processEvent(payload: SquareWebhookPayload): Promise<void> {
    const handlers = this.handlers[payload.type];

    if (!handlers) {
      console.warn(`No handler registered for event type: ${payload.type}`);
      return;
    }

    if (Array.isArray(handlers)) {
      for (const handler of handlers) {
        await handler(payload);
      }
    } else {
      await handlers(payload);
    }
  }

  /**
   * Process a queued message
   */
  async processQueuedMessage(message: QueueMessage): Promise<void> {
    const payload = message.payload as SquareWebhookPayload;
    await this.processEvent(payload);
  }

  // -----------------------------------------------------------------------
  // Queue integration
  // -----------------------------------------------------------------------

  private async enqueue(payload: SquareWebhookPayload): Promise<void> {
    if (!this.queue) {
      throw new WebhookError('NO_QUEUE', 'Queue not configured');
    }

    const message: QueueMessage = {
      id: payload.event_id,
      payload,
      metadata: {
        source: 'webhook',
        eventType: payload.type,
        receivedAt: new Date().toISOString(),
        attempts: 0,
        maxAttempts: 3,
      },
    };

    await this.queue.enqueue(message);
  }

  // -----------------------------------------------------------------------
  // Utility
  // -----------------------------------------------------------------------

  /**
   * Extract event type and ID from a raw webhook body
   */
  parseEvent(body: string): { eventType: string; eventId: string; merchantId: string } | null {
    try {
      const parsed = JSON.parse(body);
      const validated = webhookPayloadSchema.safeParse(parsed);
      if (!validated.success) return null;

      return {
        eventType: validated.data.type,
        eventId: validated.data.event_id,
        merchantId: validated.data.merchant_id,
      };
    } catch {
      return null;
    }
  }

  /**
   * Check if an event type is configured to be handled
   */
  isConfiguredEvent(eventType: string): boolean {
    return this.config.eventTypes.includes(eventType as SquareWebhookEventType);
  }
}

// ---------------------------------------------------------------------------
// Helper: Parse webhook headers
// ---------------------------------------------------------------------------

export interface WebhookHeaders {
  signature: string;
  eventType?: string;
  eventId?: string;
}

export function parseWebhookHeaders(headers: Record<string, string | string[] | undefined>): WebhookHeaders {
  const getHeader = (name: string): string | undefined => {
    const val = headers[name.toLowerCase()] ?? headers[name];
    return Array.isArray(val) ? val[0] : val;
  };

  return {
    signature:
      getHeader('x-square-signature') ??
      getHeader('x-square-hmacsha256-signature') ??
      '',
    eventType: getHeader('x-square-event-type'),
    eventId: getHeader('x-square-event-id'),
  };
}

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

export class WebhookError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'WebhookError';
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WebhookError);
    }
  }
}
