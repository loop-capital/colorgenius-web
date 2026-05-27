/**
 * Phorest Full Sync Runner
 * Orchestrates full and incremental syncs with progress tracking and error recovery.
 */

import {
  type SyncRun,
  type SyncEntityType,
  type SyncStatus,
  SyncEntityTypeSchema,
  SyncStatusSchema,
  SyncRunSchema,
  PhorestError,
  PhorestErrorCodeSchema,
} from "./types";
import {
  PhorestClientsClient,
  createPhorestClientsClient,
  type ClientSyncResult,
} from "./phorest-clients";
import {
  PhorestAppointmentsClient,
  createPhorestAppointmentsClient,
  type AppointmentSyncResult,
} from "./phorest-appointments";
import {
  PhorestServicesClient,
  createPhorestServicesClient,
  type ServiceSyncResult,
} from "./phorest-services";
import {
  PhorestInventoryClient,
  createPhorestInventoryClient,
  type InventorySyncResult,
} from "./phorest-inventory";
import {
  PhorestBranchesClient,
  createPhorestBranchesClient,
  type BranchSyncResult,
} from "./phorest-branches";

// ═══════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════

export interface SyncRunnerConfig {
  businessId: string;
  /** Optional branch ID to sync (if omitted, syncs all branches) */
  branchId?: string;
  email: string;
  password: string;
  region?: "us" | "eu";
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
  getLatest(businessId: string, type: "full" | "incremental", branchId?: string): Promise<SyncRun | null>;
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

  async getLatest(businessId: string, type: "full" | "incremental", branchId?: string): Promise<SyncRun | null> {
    const runs = await this.list(businessId);
    return runs.find((r) => r.type === type && (!branchId || r.branchId === branchId)) ?? null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Sync Runner
// ═══════════════════════════════════════════════════════════════

export class PhorestSyncRunner {
  private config: SyncRunnerConfig;
  private store: SyncStoreAdapter;
  private logger: NonNullable<SyncRunnerConfig["logger"]>;
  private clientsClient: PhorestClientsClient;
  private appointmentsClient: PhorestAppointmentsClient;
  private servicesClient: PhorestServicesClient;
  private inventoryClient: PhorestInventoryClient;
  private branchesClient: PhorestBranchesClient;
  private branchIds: string[] = [];

  constructor(config: SyncRunnerConfig) {
    this.config = config;
    this.store = config.store ?? new InMemorySyncStore();
    this.logger = config.logger ?? (() => {});

    const clientConfig = {
      businessId: config.businessId,
      baseUrl: config.baseUrl,
    };

    this.clientsClient = createPhorestClientsClient(clientConfig);
    this.appointmentsClient = createPhorestAppointmentsClient(clientConfig);
    this.servicesClient = createPhorestServicesClient(clientConfig);
    this.inventoryClient = createPhorestInventoryClient(clientConfig);
    this.branchesClient = createPhorestBranchesClient(clientConfig);
  }

  /**
   * Discover branches for this business (used when no branchId specified).
   */
  async discoverBranches(): Promise<string[]> {
    if (this.config.branchId) {
      this.branchIds = [this.config.branchId];
      return this.branchIds;
    }

    try {
      const branches = await this.branchesClient.list();
      this.branchIds = branches.branches.map((b) => b.externalId);
      this.logger("info", "[Phorest Sync] Discovered branches", { count: this.branchIds.length });
      return this.branchIds;
    } catch (err) {
      this.logger("warn", "[Phorest Sync] Failed to discover branches, using default", { error: err });
      this.branchIds = [];
      return this.branchIds;
    }
  }

  /**
   * Run a full sync across all configured entities.
   */
  async runFullSync(): Promise<SyncRun> {
    await this.discoverBranches();

    const run = this.createSyncRun("full");
    await this.store.create(run);
    this.logger("info", "[Phorest Sync] Full sync started", { id: run.id, businessId: run.businessId, branchId: run.branchId });

    const entities = this.config.entities ?? SyncEntityTypeSchema.options;

    for (const entity of entities) {
      await this.syncEntity(run, entity, "full");
    }

    // Determine final status
    const allStatuses = Object.values(run.entityProgress ?? {}).map((entry) => (entry as { status: SyncStatus }).status);
    if (allStatuses.every((s) => s === "completed")) {
      run.status = "completed";
    } else if (allStatuses.some((s) => s === "running")) {
      run.status = "partial";
    } else if (allStatuses.some((s) => s === "failed")) {
      run.status = allStatuses.some((s) => s === "completed") ? "partial" : "failed";
    }

    run.completedAt = new Date().toISOString();
    await this.store.update(run);

    this.logger("info", `[Phorest Sync] Full sync ${run.status}`, { id: run.id });
    return run;
  }

  /**
   * Run an incremental sync (delta since last successful sync).
   */
  async runIncrementalSync(): Promise<SyncRun> {
    await this.discoverBranches();

    const lastFull = await this.store.getLatest(this.config.businessId, "full", this.config.branchId);
    const lastIncremental = await this.store.getLatest(this.config.businessId, "incremental", this.config.branchId);

    const lastSuccessful =
      lastIncremental?.status === "completed" ? lastIncremental : lastFull;

    const since = lastSuccessful?.completedAt;

    if (!since) {
      this.logger("info", "[Phorest Sync] No previous successful sync found; falling back to full sync");
      return this.runFullSync();
    }

    const run = this.createSyncRun("incremental");
    await this.store.create(run);
    this.logger("info", "[Phorest Sync] Incremental sync started", { id: run.id, since });

    const entities = this.config.entities ?? SyncEntityTypeSchema.options;

    for (const entity of entities) {
      await this.syncEntity(run, entity, "incremental", since);
    }

    const allStatuses2 = Object.values(run.entityProgress ?? {}).map((entry) => (entry as { status: SyncStatus }).status);
    if (allStatuses2.every((s) => s === "completed")) {
      run.status = "completed";
    } else if (allStatuses2.some((s) => s === "failed")) {
      run.status = allStatuses2.some((s) => s === "completed") ? "partial" : "failed";
    }

    run.completedAt = new Date().toISOString();
    await this.store.update(run);

    this.logger("info", `[Phorest Sync] Incremental sync ${run.status}`, { id: run.id });
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

    this.logger("info", `[Phorest Sync] Syncing ${entity} (${mode})`, { runId: run.id });

    let result: ClientSyncResult | AppointmentSyncResult | ServiceSyncResult | InventorySyncResult | BranchSyncResult | null = null;

    try {
      switch (entity) {
        case "clients":
          result = await (mode === "incremental" && since
            ? this.clientsClient.syncSince(since)
            : this.clientsClient.fullSync());
          progress.total = result.totalFetched;
          progress.processed = result.totalNormalized;
          progress.failed = result.errors.length;
          break;

        case "appointments": {
          if (this.branchIds.length === 0) {
            this.logger("warn", "[Phorest Sync] No branches available, skipping appointments");
            progress.total = 0;
            progress.processed = 0;
            progress.failed = 0;
            break;
          }

          const allAppointments: import("./types").UnifiedAppointment[] = [];
          let totalFetched = 0;
          let totalNormalized = 0;
          let totalErrors = 0;

          for (const branchId of this.branchIds) {
            const apptResult =
              mode === "incremental" && since
                ? await this.appointmentsClient.syncSince(branchId, since)
                : await this.appointmentsClient.fullSync(branchId);
            allAppointments.push(...apptResult.appointments);
            totalFetched += apptResult.totalFetched;
            totalNormalized += apptResult.totalNormalized;
            totalErrors += apptResult.errors.length;
          }

          result = {
            appointments: allAppointments,
            totalFetched,
            totalNormalized,
            errors: [], // errors are logged per-branch
          } as AppointmentSyncResult;

          progress.total = totalFetched;
          progress.processed = totalNormalized;
          progress.failed = totalErrors;
          break;
        }

        case "services": {
          if (this.branchIds.length === 0) {
            this.logger("warn", "[Phorest Sync] No branches available, skipping services");
            progress.total = 0;
            progress.processed = 0;
            progress.failed = 0;
            break;
          }

          const allServices: import("./types").UnifiedService[] = [];
          let totalFetched = 0;
          let totalNormalized = 0;
          let totalErrors = 0;

          for (const branchId of this.branchIds) {
            const svcResult =
              mode === "incremental" && since
                ? await this.servicesClient.syncSince(branchId, since)
                : await this.servicesClient.fullSync(branchId);
            allServices.push(...svcResult.services);
            totalFetched += svcResult.totalFetched;
            totalNormalized += svcResult.totalNormalized;
            totalErrors += svcResult.errors.length;
          }

          result = {
            services: allServices,
            totalFetched,
            totalNormalized,
            errors: [],
          } as ServiceSyncResult;

          progress.total = totalFetched;
          progress.processed = totalNormalized;
          progress.failed = totalErrors;
          break;
        }

        case "inventory": {
          if (this.branchIds.length === 0) {
            this.logger("warn", "[Phorest Sync] No branches available, skipping inventory");
            progress.total = 0;
            progress.processed = 0;
            progress.failed = 0;
            break;
          }

          const allItems: import("./types").UnifiedInventoryItem[] = [];
          let totalFetched = 0;
          let totalNormalized = 0;
          let totalErrors = 0;

          for (const branchId of this.branchIds) {
            const invResult =
              mode === "incremental" && since
                ? await this.inventoryClient.syncSince(branchId, since)
                : await this.inventoryClient.fullSync(branchId);
            allItems.push(...invResult.items);
            totalFetched += invResult.totalFetched;
            totalNormalized += invResult.totalNormalized;
            totalErrors += invResult.errors.length;
          }

          result = {
            items: allItems,
            totalFetched,
            totalNormalized,
            errors: [],
          } as InventorySyncResult;

          progress.total = totalFetched;
          progress.processed = totalNormalized;
          progress.failed = totalErrors;
          break;
        }

        case "branches":
          result = await this.branchesClient.list();
          progress.total = result.totalFetched;
          progress.processed = result.totalNormalized;
          progress.failed = result.errors.length;
          break;

        case "reviews":
          // Reviews don't have a dedicated sync client yet
          this.logger("info", "[Phorest Sync] Reviews sync not yet implemented");
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
            error: err.error instanceof PhorestError ? err.error.toJSON() : {
              code: PhorestErrorCodeSchema.enum.UNKNOWN,
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
        error: err instanceof PhorestError
          ? err.toJSON()
          : {
              code: PhorestErrorCodeSchema.enum.UNKNOWN,
              message: String(err),
              retryable: false,
            },
        timestamp: new Date().toISOString(),
      });

      this.logger("error", `[Phorest Sync] ${entity} sync failed`, { runId: run.id, error: progress.error });
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
      .filter(([, entry]) => {
        const p = entry as { status: SyncStatus };
        return p.status === "failed" || p.status === "partial";
      })
      .map(([entity]) => entity as SyncEntityType);

    if (failedEntities.length === 0) {
      this.logger("info", "[Phorest Sync] No failed entities to retry", { runId });
      return originalRun;
    }

    const retryRun = this.createSyncRun(originalRun.type);
    retryRun.metadata = {
      ...retryRun.metadata,
      retriedFrom: runId,
      retriedEntities: failedEntities,
    };
    await this.store.create(retryRun);

    this.logger("info", `[Phorest Sync] Retrying ${failedEntities.length} failed entities`, {
      runId: retryRun.id,
      retriedFrom: runId,
    });

    const since =
      originalRun.type === "incremental" ? originalRun.startedAt : undefined;

    for (const entity of failedEntities) {
      await this.syncEntity(retryRun, entity, originalRun.type as "full" | "incremental", since);
    }

    retryRun.completedAt = new Date().toISOString();
    const allStatuses3 = Object.values(retryRun.entityProgress ?? {}).map((entry) => (entry as { status: SyncStatus }).status);
    retryRun.status = allStatuses3.every((s) => s === "completed")
      ? "completed"
      : allStatuses3.some((s) => s === "failed")
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
      ? this.store.getLatest(this.config.businessId, type, this.config.branchId)
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
      branchId: this.config.branchId ?? null,
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

export function createPhorestSyncRunner(config: SyncRunnerConfig): PhorestSyncRunner {
  return new PhorestSyncRunner(config);
}
