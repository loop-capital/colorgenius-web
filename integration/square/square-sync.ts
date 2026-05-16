/**
 * Square Full Sync Runner
 * Initial full sync, incremental sync, progress tracking, and error recovery
 */

import { z } from 'zod';
import { SquareClient } from './square-client';
import { SquareOAuth, type TokenStorage } from './square-oauth';
import { SquareCustomers } from './square-customers';
import { SquarePayments } from './square-payments';
import { SquareBookings } from './square-bookings';
import { SquareCatalog } from './square-catalog';
import {
  type SyncState,
  type SyncOptions,
  type SyncProgress,
  type SyncDataType,
  type SyncError,
} from './types';

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const syncStateSchema = z.object({
  id: z.string(),
  merchantId: z.string(),
  dataType: z.enum(['customers', 'payments', 'bookings', 'catalog', 'inventory']),
  status: z.enum(['idle', 'running', 'completed', 'failed', 'partial']),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  cursor: z.string().optional(),
  itemsProcessed: z.number().default(0),
  itemsTotal: z.number().optional(),
  itemsFailed: z.number().default(0),
  errors: z.array(z.object({
    itemId: z.string().optional(),
    code: z.string(),
    message: z.string(),
    timestamp: z.string(),
    retryable: z.boolean(),
  })).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ---------------------------------------------------------------------------
// Sync state store interface
// ---------------------------------------------------------------------------

export interface SyncStateStore {
  get(id: string): Promise<SyncState | null>;
  getByMerchantAndType(merchantId: string, dataType: SyncDataType): Promise<SyncState | null>;
  set(state: SyncState): Promise<void>;
  list(merchantId?: string): Promise<SyncState[]>;
  delete(id: string): Promise<void>;
}

// In-memory store (use Supabase/Redis in production)
export class InMemorySyncStateStore implements SyncStateStore {
  private store = new Map<string, SyncState>();

  async get(id: string): Promise<SyncState | null> {
    return this.store.get(id) ?? null;
  }

  async getByMerchantAndType(
    merchantId: string,
    dataType: SyncDataType,
  ): Promise<SyncState | null> {
    for (const state of this.store.values()) {
      if (state.merchantId === merchantId && state.dataType === dataType) {
        return state;
      }
    }
    return null;
  }

  async set(state: SyncState): Promise<void> {
    this.store.set(state.id, { ...state });
  }

  async list(merchantId?: string): Promise<SyncState[]> {
    const states = Array.from(this.store.values());
    return merchantId ? states.filter((s) => s.merchantId === merchantId) : states;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}

// ---------------------------------------------------------------------------
// Unified data store interface (for persisting normalized data)
// ---------------------------------------------------------------------------

export interface UnifiedDataStore {
  saveCustomer(customer: { id: string; externalId: string; merchantId: string; [key: string]: unknown }): Promise<void>;
  saveTransaction(transaction: { id: string; externalId: string; merchantId: string; [key: string]: unknown }): Promise<void>;
  saveAppointment(appointment: { id: string; externalId: string; merchantId: string; [key: string]: unknown }): Promise<void>;
  saveInventoryItem(item: { id: string; externalId: string; merchantId: string; [key: string]: unknown }): Promise<void>;
  saveInventoryCount(itemId: string, quantity: number, locationId?: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// SquareSync class
// ---------------------------------------------------------------------------

export class SquareSync {
  private readonly client: SquareClient;
  private readonly oauth: SquareOAuth;
  private readonly customers: SquareCustomers;
  private readonly payments: SquarePayments;
  private readonly bookings: SquareBookings;
  private readonly catalog: SquareCatalog;
  private readonly stateStore: SyncStateStore;
  private readonly dataStore: UnifiedDataStore;

  constructor(
    client: SquareClient,
    oauth: SquareOAuth,
    stateStore: SyncStateStore,
    dataStore: UnifiedDataStore,
  ) {
    this.client = client;
    this.oauth = oauth;
    this.stateStore = stateStore;
    this.dataStore = dataStore;

    this.customers = new SquareCustomers(client);
    this.payments = new SquarePayments(client);
    this.bookings = new SquareBookings(client);
    this.catalog = new SquareCatalog(client);
  }

  // -----------------------------------------------------------------------
  // Full sync (all data types)
  // -----------------------------------------------------------------------

  /**
   * Run a full sync for a merchant across all data types
   */
  async fullSync(
    merchantId: string,
    options: Omit<SyncOptions, 'dataTypes' | 'incremental' | 'cursor'> = {},
  ): Promise<Record<SyncDataType, SyncState>> {
    const dataTypes: SyncDataType[] = ['customers', 'payments', 'bookings', 'catalog'];
    const results: Record<SyncDataType, SyncState> = {} as Record<SyncDataType, SyncState>;

    // Ensure tokens are valid before starting
    await this.oauth.ensureValid(merchantId);

    for (const dataType of dataTypes) {
      results[dataType] = await this.syncDataType(merchantId, dataType, {
        ...options,
        incremental: false,
      });
    }

    return results;
  }

  /**
   * Run a full sync for a specific data type
   */
  async syncDataType(
    merchantId: string,
    dataType: SyncDataType,
    options: Omit<SyncOptions, 'dataTypes' | 'cursor'> = {},
  ): Promise<SyncState> {
    // Check for existing running sync
    const existing = await this.stateStore.getByMerchantAndType(merchantId, dataType);
    if (existing?.status === 'running') {
      throw new SyncError(
        'SYNC_ALREADY_RUNNING',
        `Sync already running for ${dataType} on merchant ${merchantId}`,
      );
    }

    // Initialize sync state
    const syncId = this.generateSyncId(merchantId, dataType);
    const state: SyncState = {
      id: syncId,
      merchantId,
      dataType,
      status: 'running',
      startedAt: new Date().toISOString(),
      itemsProcessed: 0,
      itemsFailed: 0,
      errors: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.stateStore.set(state);

    const reportProgress = (phase: SyncProgress['phase'], current: number, total?: number) => {
      const progress: SyncProgress = {
        dataType,
        phase,
        current,
        total,
        hasMore: total ? current < total : true,
      };
      options.onProgress?.(progress);
    };

    try {
      switch (dataType) {
        case 'customers':
          await this.syncCustomers(merchantId, state, reportProgress, options);
          break;
        case 'payments':
          await this.syncPayments(merchantId, state, reportProgress, options);
          break;
        case 'bookings':
          await this.syncBookings(merchantId, state, reportProgress, options);
          break;
        case 'catalog':
          await this.syncCatalog(merchantId, state, reportProgress, options);
          break;
        case 'inventory':
          await this.syncInventory(merchantId, state, reportProgress, options);
          break;
      }

      state.status = state.itemsFailed > 0 ? 'partial' : 'completed';
      state.completedAt = new Date().toISOString();
    } catch (error) {
      state.status = 'failed';
      state.completedAt = new Date().toISOString();
      state.errors.push({
        code: 'SYNC_FATAL',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        retryable: true,
      });
    } finally {
      state.updatedAt = new Date().toISOString();
      await this.stateStore.set(state);
    }

    return state;
  }

  // -----------------------------------------------------------------------
  // Incremental sync (from webhook events or scheduled)
  // -----------------------------------------------------------------------

  /**
   * Run an incremental sync using stored cursor or timestamp
   */
  async incrementalSync(
    merchantId: string,
    dataType: SyncDataType,
    options: Omit<SyncOptions, 'dataTypes' | 'incremental'> = {},
  ): Promise<SyncState> {
    const existing = await this.stateStore.getByMerchantAndType(merchantId, dataType);
    const since = existing?.completedAt
      ? new Date(existing.completedAt)
      : options.since
        ? new Date(options.since)
        : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: last 24h

    return this.syncDataType(merchantId, dataType, {
      ...options,
      incremental: true,
      since: since.toISOString(),
    });
  }

  // -----------------------------------------------------------------------
  // Per-data-type sync implementations
  // -----------------------------------------------------------------------

  private async syncCustomers(
    merchantId: string,
    state: SyncState,
    reportProgress: (phase: SyncProgress['phase'], current: number, total?: number) => void,
    options: Omit<SyncOptions, 'dataTypes' | 'cursor'>,
  ): Promise<void> {
    reportProgress('fetching', 0, undefined);

    const customers = await this.customers.getAllCustomers(merchantId);

    reportProgress('transforming', 0, customers.length);

    let processed = 0;
    for (const customer of customers) {
      try {
        await this.dataStore.saveCustomer(customer as unknown as Record<string, unknown>);
        processed++;
        state.itemsProcessed = processed;
        reportProgress('saving', processed, customers.length);
      } catch (error) {
        state.itemsFailed++;
        state.errors.push({
          itemId: customer.id,
          code: 'SAVE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown',
          timestamp: new Date().toISOString(),
          retryable: true,
        });
      }

      // Update state periodically
      if (processed % 100 === 0) {
        state.updatedAt = new Date().toISOString();
        await this.stateStore.set(state);
      }
    }

    reportProgress('complete', processed, processed);
  }

  private async syncPayments(
    merchantId: string,
    state: SyncState,
    reportProgress: (phase: SyncProgress['phase'], current: number, total?: number) => void,
    options: Omit<SyncOptions, 'dataTypes' | 'cursor'>,
  ): Promise<void> {
    reportProgress('fetching', 0, undefined);

    const since = options.since ? new Date(options.since) : undefined;
    const payments = await this.payments.getAllPaymentsPaginated(merchantId, {
      startDate: since,
      onProgress: (count) => reportProgress('fetching', count, undefined),
    });

    reportProgress('transforming', 0, payments.length);

    let processed = 0;
    for (const payment of payments) {
      try {
        await this.dataStore.saveTransaction(payment as unknown as Record<string, unknown>);
        processed++;
        state.itemsProcessed = processed;
        reportProgress('saving', processed, payments.length);
      } catch (error) {
        state.itemsFailed++;
        state.errors.push({
          itemId: payment.id,
          code: 'SAVE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown',
          timestamp: new Date().toISOString(),
          retryable: true,
        });
      }

      if (processed % 100 === 0) {
        state.updatedAt = new Date().toISOString();
        await this.stateStore.set(state);
      }
    }

    reportProgress('complete', processed, processed);
  }

  private async syncBookings(
    merchantId: string,
    state: SyncState,
    reportProgress: (phase: SyncProgress['phase'], current: number, total?: number) => void,
    options: Omit<SyncOptions, 'dataTypes' | 'cursor'>,
  ): Promise<void> {
    reportProgress('fetching', 0, undefined);

    const since = options.since ? new Date(options.since) : undefined;
    const bookings = await this.bookings.getAllBookingsPaginated(merchantId, {
      startAtMin: since,
      onProgress: (count) => reportProgress('fetching', count, undefined),
    });

    reportProgress('transforming', 0, bookings.length);

    let processed = 0;
    for (const booking of bookings) {
      try {
        await this.dataStore.saveAppointment(booking as unknown as Record<string, unknown>);
        processed++;
        state.itemsProcessed = processed;
        reportProgress('saving', processed, bookings.length);
      } catch (error) {
        state.itemsFailed++;
        state.errors.push({
          itemId: booking.id,
          code: 'SAVE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown',
          timestamp: new Date().toISOString(),
          retryable: true,
        });
      }

      if (processed % 100 === 0) {
        state.updatedAt = new Date().toISOString();
        await this.stateStore.set(state);
      }
    }

    reportProgress('complete', processed, processed);
  }

  private async syncCatalog(
    merchantId: string,
    state: SyncState,
    reportProgress: (phase: SyncProgress['phase'], current: number, total?: number) => void,
    options: Omit<SyncOptions, 'dataTypes' | 'cursor'>,
  ): Promise<void> {
    reportProgress('fetching', 0, undefined);

    const since = options.since ? new Date(options.since) : undefined;
    const items = await this.catalog.getAllCatalogObjects(merchantId, {
      updatedAfter: since,
      onProgress: (count) => reportProgress('fetching', count, undefined),
    });

    reportProgress('transforming', 0, items.length);

    let processed = 0;
    for (const item of items) {
      try {
        await this.dataStore.saveInventoryItem(item as unknown as Record<string, unknown>);
        processed++;
        state.itemsProcessed = processed;
        reportProgress('saving', processed, items.length);
      } catch (error) {
        state.itemsFailed++;
        state.errors.push({
          itemId: item.id,
          code: 'SAVE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown',
          timestamp: new Date().toISOString(),
          retryable: true,
        });
      }

      if (processed % 100 === 0) {
        state.updatedAt = new Date().toISOString();
        await this.stateStore.set(state);
      }
    }

    reportProgress('complete', processed, processed);
  }

  private async syncInventory(
    merchantId: string,
    state: SyncState,
    reportProgress: (phase: SyncProgress['phase'], current: number, total?: number) => void,
    options: Omit<SyncOptions, 'dataTypes' | 'cursor'>,
  ): Promise<void> {
    reportProgress('fetching', 0, undefined);

    // Get all catalog items to know what to check inventory for
    const items = await this.catalog.getAllCatalogObjects(merchantId);
    const itemIds = items
      .filter((i) => i.type === 'product' && !i.isDeleted)
      .map((i) => i.externalId);

    // Fetch inventory counts in batches
    const batchSize = 100;
    let processed = 0;

    for (let i = 0; i < itemIds.length; i += batchSize) {
      const batch = itemIds.slice(i, i + batchSize);

      try {
        const { counts } = await this.catalog.getInventoryCounts(merchantId, {
          catalogObjectIds: batch,
        });

        for (const count of counts) {
          if (count.state === 'IN_STOCK' && count.quantity) {
            await this.dataStore.saveInventoryCount(
              count.catalog_object_id,
              parseFloat(count.quantity),
              count.location_id,
            );
          }
        }

        processed += batch.length;
        state.itemsProcessed = processed;
        reportProgress('saving', processed, itemIds.length);
      } catch (error) {
        state.itemsFailed += batch.length;
        state.errors.push({
          code: 'INVENTORY_BATCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown',
          timestamp: new Date().toISOString(),
          retryable: true,
        });
      }

      state.updatedAt = new Date().toISOString();
      await this.stateStore.set(state);
    }

    reportProgress('complete', processed, processed);
  }

  // -----------------------------------------------------------------------
  // Error recovery
  // -----------------------------------------------------------------------

  /**
   * Retry a failed sync
   */
  async retrySync(merchantId: string, dataType: SyncDataType): Promise<SyncState> {
    const state = await this.stateStore.getByMerchantAndType(merchantId, dataType);
    if (!state) {
      throw new SyncError(
        'NO_PREVIOUS_SYNC',
        `No previous sync found for ${dataType} on merchant ${merchantId}`,
      );
    }

    if (state.status === 'running') {
      throw new SyncError(
        'SYNC_ALREADY_RUNNING',
        `Sync is already running for ${dataType}`,
      );
    }

    // Reset for retry
    const retryState: SyncState = {
      ...state,
      id: this.generateSyncId(merchantId, dataType),
      status: 'running',
      startedAt: new Date().toISOString(),
      completedAt: undefined,
      itemsProcessed: 0,
      itemsFailed: 0,
      errors: [],
      updatedAt: new Date().toISOString(),
    };

    await this.stateStore.set(retryState);

    try {
      return await this.syncDataType(merchantId, dataType);
    } catch {
      // Return the state that was updated by syncDataType
      return (await this.stateStore.getByMerchantAndType(merchantId, dataType))!;
    }
  }

  /**
   * Get sync status for a merchant
   */
  async getSyncStatus(merchantId: string): Promise<Record<SyncDataType, SyncState | null>> {
    const types: SyncDataType[] = ['customers', 'payments', 'bookings', 'catalog', 'inventory'];
    const result: Record<SyncDataType, SyncState | null> = {} as Record<SyncDataType, SyncState | null>;

    for (const type of types) {
      result[type] = await this.stateStore.getByMerchantAndType(merchantId, type);
    }

    return result;
  }

  /**
   * List all sync states
   */
  async listSyncStates(merchantId?: string): Promise<SyncState[]> {
    return this.stateStore.list(merchantId);
  }

  // -----------------------------------------------------------------------
  // Utilities
  // -----------------------------------------------------------------------

  private generateSyncId(merchantId: string, dataType: SyncDataType): string {
    return `sync_${merchantId}_${dataType}_${Date.now()}`;
  }
}

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

export class SyncError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'SyncError';
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SyncError);
    }
  }
}
