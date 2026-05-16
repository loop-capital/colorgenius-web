/**
 * Vagaro Full Sync Runner
 * Orchestrates full and incremental syncs with progress tracking and error recovery.
 */

import {
  type SyncRun,
  type SyncEntityType,
  type SyncStatus,
  SyncEntityTypeSchema,
  SyncStatusSchema,
  SyncRunSchema,
  VagaroError,
  VagaroErrorCodeSchema,
} from "./types";
import {
  VagaroCustomersClient,
  createVagaroCustomersClient,
  type CustomerSyncResult,
} from "./vagaro-customers";
import {
  VagaroAppointmentsClient,
  createVagaroAppointmentsClient,
  type AppointmentSyncResult,
} from "./vagaro-appointments";
import {
  VagaroServicesClient,
  createVagaroServicesClient,
  type ServiceSyncResult,
} from "./vagaro-services";
import {
  VagaroInventoryClient,
  createVagaroInventoryClient,
  type InventorySyncResult,
} from "./vagaro-inventory";

// ═══════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════

export interface SyncRunnerConfig {
  businessId: string;
  apiKey: string;
  baseUrl?: string;
  /** Entities to sync (default: all) */
  entities?: SyncEntityType[];
  /** Callback on sync progress */
  onProgress?: (run: SyncRun) => void | Promise<void>;
  /** Callback on entity completion */
  onEntityComplete?: (
    entity: SyncEntityType,
    status: SyncStatus,
    result: unknown
  ) => void | Promise<void>;
  /** Store adapter for persisting sync state */
  store?: SyncStoreAdapter;
  /** Logger */
  logger?: (level: "debug" | "info" | "warn" | "error", message: string, meta?: unknown) => void;
}

/** Pluggable store for sync run persistence */
export interface SyncStoreAdapter {
  create(run: SyncRun): Promise<void>;
  update(run: SyncRun): Promise<void>;
  get(id: string): Promise<SyncRun | null>;
  list(businessId: string, opts?: { limit?: number; status?: SyncStatus }): Promise<SyncRun[]>;
  getLatest(businessId: string, type: "full" | "incremental"): Promise<SyncRun | null>;
}

// ═══════════════════════════════════════════════════════════════
// In-Memory Sync Store (default)
// ═══════════════════════════════════════════════════════════════

class InMemorySyncStore implements SyncStoreAdapter {
  private store = new Map<string, SyncRun>();

  async create(run: SyncRun): Promise<void> {
    this.store.set(run.id, run);
  }

  async update(run: SyncRun): Promise<void> {
    this.store.set(run.id, run);
  }

  async get(id: string): Promise<SyncRun | null> {
    return this.store.get(id) ?? null;
  }

  async list(
    businessId: string,
    opts?: { limit?: number; status?: SyncStatus }
  ): Promise<SyncRun[]> {
    const runs = Array.from(this.store.values())
      .filter((r) => r.businessId === businessId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    if (opts?.status) {
      return runs.filter((r) => r.status === opts.status).slice(0, opts.limit ?? runs.length);
    }
    return runs.slice(0, opts?.limit ?? runs.length);
  }

  async getLatest(businessId: string, type: "full" | "incremental"): Promise<SyncRun | null> {
    const runs = await this.list(businessId);
    return runs.find((r) => r.type === type) ?? null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Sync Runner
// ═══════════════════════════════════════════════════════════════

export class VagaroSyncRunner {
  private config: SyncRunnerConfig;
  private store: SyncStoreAdapter;
  private logger: NonNullable<SyncRunnerConfig["logger"]>;
  private customersClient: VagaroCustomersClient;
  private appointmentsClient: VagaroAppointmentsClient;
  private servicesClient: VagaroServicesClient;
  private inventoryClient: VagaroInventoryClient;

  constructor(config: SyncRunnerConfig) {
    this.config = config;
    this.store = config.store ?? new InMemorySyncStore();
    this.logger = config.logger ?? (() => {});

    const clientConfig = {
      businessId: config.businessId,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
    };

    this.customersClient = createVagaroCustomersClient(clientConfig);
    this.appointmentsClient = createVagaroAppointmentsClient(clientConfig);
    this.servicesClient = createVagaroServicesClient(clientConfig);
    this.inventoryClient = createVagaroInventoryClient(clientConfig);
  }

  /**
   * Run a full sync across all configured entities.
   */
  async runFullSync(): Promise<SyncRun> {
    const run = this.createSyncRun("full");
    await this.store.create(run);
    this.logger("info", "[Vagaro Sync] Full sync started", { id: run.id, businessId: run.businessId });

    const entities = this.config.entities ?? SyncEntityTypeSchema.options;

    for (const entity of entities) {
      await this.syncEntity(run, entity, "full");
    }

    // Determine final status
    const allStatuses = Object.values(run.entityProgress ?? {}).map((e) => e.status);
    if (allStatuses.every((s) => s === "completed")) {
      run.status = "completed";
    } else if (allStatuses.some((s) => s === "running")) {
      run.status = "partial";
    } else if (allStatuses.some((s) => s === "failed")) {
      run.status = allStatuses.some((s) => s === "completed") ? "partial" : "failed";
    }

    run.completedAt = new Date().toISOString();
    await this.store.update(run);

    this.logger("info", `[Vagaro Sync] Full sync ${run.status}`, { id: run.id });
    return run;
  }

  /**
   * Run an incremental sync (delta since last successful sync).
   */
  async runIncrementalSync(): Promise<SyncRun> {
    const lastFull = await this.store.getLatest(this.config.businessId, "full");
    const lastIncremental = await this.store.getLatest(this.config.businessId, "incremental");

    const lastSuccessful =
      lastIncremental?.status === "completed" ? lastIncremental : lastFull;

    const since = lastSuccessful?.completedAt;

    if (!since) {
      this.logger("info", "[Vagaro Sync] No previous successful sync found; falling back to full sync");
      return this.runFullSync();
    }

    const run = this.createSyncRun("incremental");
    await this.store.create(run);
    this.logger("info", "[Vagaro Sync] Incremental sync started", { id: run.id, since });

    const entities = this.config.entities ?? SyncEntityTypeSchema.options;

    for (const entity of entities) {
      await this.syncEntity(run, entity, "incremental", since);
    }

    const allStatuses = Object.values(run.entityProgress ?? {}).map((e) => e.status);
    if (allStatuses.every((s) => s === "completed")) {
      run.status = "completed";
    } else if (allStatuses.some((s) => s === "failed")) {
      run.status = allStatuses.some((s) => s === "completed") ? "partial" : "failed";
    }

    run.completedAt = new Date().toISOString();
    await this.store.update(run);

    this.logger("info", `[Vagaro Sync] Incremental sync ${run.status}`, { id: run.id });
    return run;
  }

  /**
   * Sync a single entity type.
   */
  private async syncEntity(
    run: SyncRun,
    entity: SyncEntityType,
    mode: "full" | "incremental",
    since?: string
  ): Promise<void> {
    const progress = (run.entityProgress ??= {})[entity] ?? {
      status: "running" as SyncStatus,
      total: 0,
      processed: 0,
      failed: 0,
      startedAt: new Date().toISOString(),
    };
    progress.status = "running";
    progress.startedAt = new Date().toISOString();
    run.entityProgress[entity] = progress;
    await this.store.update(run);
    await this.config.onProgress?.(run);

    this.logger("info", `[Vagaro Sync] Syncing ${entity} (${mode})`, { runId: run.id });

    let result: CustomerSyncResult | AppointmentSyncResult | ServiceSyncResult | InventorySyncResult | null = null;

    try {
      switch (entity) {
        case "customers":
          result = await (mode === "incremental" && since
            ? this.customersClient.syncSince(since)
            : this.customersClient.fullSync());
          progress.total = result.totalFetched;
          progress.processed = result.totalNormalized;
          progress.failed = result.errors.length;
          break;

        case "appointments": {
          // For incremental, sync last 7 days forward; for full, default window
          const apptResult =
            mode === "incremental" && since
              ? await this.appointmentsClient.syncSince(since)
              : await this.appointmentsClient.fullSync();
          result = apptResult;
          progress.total = apptResult.totalFetched;
          progress.processed = apptResult.totalNormalized;
          progress.failed = apptResult.errors.length;
          break;
        }

        case "services":
          result = await (mode === "incremental" && since
            ? this.servicesClient.syncSince(since)
            : this.servicesClient.fullSync());
          progress.total = result.totalFetched;
          progress.processed = result.totalNormalized;
          progress.failed = result.errors.length;
          break;

        case "inventory":
          result = await (mode === "incremental" && since
            ? this.inventoryClient.syncSince(since)
            : this.inventoryClient.fullSync());
          progress.total = result.totalFetched;
          progress.processed = result.totalNormalized;
          progress.failed = result.errors.length;
          break;

        case "employees":
          // TODO: Implement employee sync when Vagaro API supports it
          progress.total = 0;
          progress.processed = 0;
          progress.failed = 0;
          break;

        default:
          throw new Error(`Unknown entity type: ${entity}`);
      }

      progress.status = progress.failed > 0 ? "partial" : "completed";
      progress.completedAt = new Date().toISOString();

      // Log individual errors
      if (result && "errors" in result && result.errors.length > 0) {
        for (const err of result.errors) {
          run.errorLog = run.errorLog ?? [];
          run.errorLog.push({
            entityType: entity,
            entityId: err.rawId,
            error: err.error instanceof VagaroError ? err.error.toJSON() : {
              code: VagaroErrorCodeSchema.enum.UNKNOWN,
              message: String(err.error),
              retryable: false,
            },
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      progress.status = "failed";
      progress.completedAt = new Date().toISOString();
      progress.error = err instanceof Error ? err.message : String(err);

      run.errorLog = run.errorLog ?? [];
      run.errorLog.push({
        entityType: entity,
        error: err instanceof VagaroError
          ? err.toJSON()
          : {
              code: VagaroErrorCodeSchema.enum.UNKNOWN,
              message: String(err),
              retryable: false,
            },
        timestamp: new Date().toISOString(),
      });

      this.logger("error", `[Vagaro Sync] ${entity} sync failed`, { runId: run.id, error: progress.error });
    }

    run.entityProgress[entity] = progress;
    await this.store.update(run);
    await this.config.onProgress?.(run);
    await this.config.onEntityComplete?.(entity, progress.status, result);
  }

  /**
   * Retry a failed sync run (re-runs only failed entities).
   */
  async retrySync(runId: string): Promise<SyncRun> {
    const originalRun = await this.store.get(runId);
    if (!originalRun) {
      throw new Error(`Sync run not found: ${runId}`);
    }

    const failedEntities = Object.entries(originalRun.entityProgress ?? {})
      .filter(([, p]) => p.status === "failed" || p.status === "partial")
      .map(([entity]) => entity as SyncEntityType);

    if (failedEntities.length === 0) {
      this.logger("info", "[Vagaro Sync] No failed entities to retry", { runId });
      return originalRun;
    }

    const retryRun = this.createSyncRun(originalRun.type);
    retryRun.metadata = {
      ...retryRun.metadata,
      retriedFrom: runId,
      retriedEntities: failedEntities,
    };
    await this.store.create(retryRun);

    this.logger("info", `[Vagaro Sync] Retrying ${failedEntities.length} failed entities`, {
      runId: retryRun.id,
      retriedFrom: runId,
    });

    const since =
      originalRun.type === "incremental" ? originalRun.startedAt : undefined;

    for (const entity of failedEntities) {
      await this.syncEntity(retryRun, entity, originalRun.type as "full" | "incremental", since);
    }

    retryRun.completedAt = new Date().toISOString();
    const allStatuses = Object.values(retryRun.entityProgress ?? {}).map((e) => e.status);
    retryRun.status = allStatuses.every((s) => s === "completed")
      ? "completed"
      : allStatuses.some((s) => s === "failed")
      ? "failed"
      : "partial";

    await this.store.update(retryRun);
    return retryRun;
  }

  /**
   * Get the latest sync run for this business.
   */
  async getLatestSync(type?: "full" | "incremental"): Promise<SyncRun | null> {
    return type
      ? this.store.getLatest(this.config.businessId, type)
      : (await this.store.list(this.config.businessId, { limit: 1 }))[0] ?? null;
  }

  /**
   * Get sync history for this business.
   */
  async getHistory(limit?: number): Promise<SyncRun[]> {
    return this.store.list(this.config.businessId, { limit });
  }

  private createSyncRun(type: "full" | "incremental"): SyncRun {
    return SyncRunSchema.parse({
      id: crypto.randomUUID(),
      businessId: this.config.businessId,
      type,
      status: "running" as SyncStatus,
      startedAt: new Date().toISOString(),
      entityProgress: {},
      errorLog: [],
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// Factory
// ═══════════════════════════════════════════════════════════════

export function createVagaroSyncRunner(config: SyncRunnerConfig): VagaroSyncRunner {
  return new VagaroSyncRunner(config);
}
