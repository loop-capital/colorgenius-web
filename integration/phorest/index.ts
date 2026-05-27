/**
 * Phorest Integration — COLORgenius
 *
 * Complete Phorest salon software integration module.
 * Supports: clients, appointments, services, inventory, branches, reviews.
 * Uses Basic auth with global/ prefix. Polling-based sync (no webhooks).
 *
 * @example
 * ```ts
 * import { PhorestSyncRunner, PhorestAuthManager, getPhorestClient } from "./integration/phorest";
 *
 * const auth = new PhorestAuthManager();
 * await auth.initialize({
 *   businessId: "uuid-here",
 *   email: "user@salon.com",
 *   password: "secret",
 *   region: "us",
 * });
 *
 * const runner = createPhorestSyncRunner({
 *   businessId: "uuid-here",
 *   email: "user@salon.com",
 *   password: "secret",
 *   region: "us",
 * });
 * await runner.runFullSync();
 * ```
 */

// ─── Types ───────────────────────────────────────────────────
export {
  // Base
  PhorestIdSchema,
  PhorestDateTimeSchema,
  PhorestDateSchema,
  PhorestPhoneSchema,
  PhorestEmailSchema,
  PhorestMoneySchema,
  PhorestRegionSchema,
  PHOREST_BASE_URLS,
  type PhorestId,
  type PhorestDateTime,
  type PhorestDate,
  type PhorestPhone,
  type PhorestEmail,
  type PhorestMoney,
  type PhorestRegion,

  // Auth
  PhorestCredentialsSchema,
  type PhorestCredentials,

  // Pagination
  PhorestPaginationParamsSchema,
  PhorestPageSchema,
  type PhorestPaginationParams,
  type PhorestPage,
  type PhorestPaginatedResponse,

  // Branches
  PhorestBranchSchema,
  type PhorestBranch,

  // Clients
  PhorestClientSchema,
  PhorestClientListParamsSchema,
  PhorestClientCreateSchema,
  PhorestServiceHistorySchema,
  type PhorestClient,
  type PhorestClientListParams,
  type PhorestClientCreate,
  type PhorestServiceHistory,

  // Appointments
  PhorestAppointmentStatusSchema,
  PhorestAppointmentSchema,
  PhorestAppointmentListParamsSchema,
  PhorestCheckInSchema,
  type PhorestAppointmentStatus,
  type PhorestAppointment,
  type PhorestAppointmentListParams,
  type PhorestCheckIn,

  // Services
  PhorestServiceCategorySchema,
  PhorestServiceSchema,
  PhorestServiceListParamsSchema,
  type PhorestServiceCategory,
  type PhorestService,
  type PhorestServiceListParams,

  // Inventory / Products
  PhorestProductTypeSchema,
  PhorestProductStatusSchema,
  PhorestStockStatusSchema,
  PhorestProductSchema,
  PhorestProductListParamsSchema,
  type PhorestProductType,
  type PhorestProductStatus,
  type PhorestStockStatus,
  type PhorestProduct,
  type PhorestProductListParams,

  // Purchases
  PhorestPurchaseItemSchema,
  PhorestPurchaseSchema,
  PhorestPurchaseCreateSchema,
  type PhorestPurchaseItem,
  type PhorestPurchase,
  type PhorestPurchaseCreate,

  // Reviews
  PhorestReviewSchema,
  type PhorestReview,

  // Unified
  UnifiedCustomerSchema,
  UnifiedAppointmentSchema,
  UnifiedServiceSchema,
  UnifiedInventoryItemSchema,
  type UnifiedCustomer,
  type UnifiedAppointment,
  type UnifiedService,
  type UnifiedInventoryItem,

  // Errors
  PhorestErrorCodeSchema,
  PhorestApiErrorSchema,
  PhorestError,
  type PhorestErrorCode,
  type PhorestApiError,

  // Sync
  SyncEntityTypeSchema,
  SyncStatusSchema,
  SyncRunSchema,
  type SyncEntityType,
  type SyncStatus,
  type SyncRun,
} from "./types";

// ─── Auth ──────────────────────────────────────────────────────
export {
  PhorestAuthManager,
  getAuthManager,
  resetAuthManager,
  type AuthConfig,
  type CredentialStorageAdapter,
} from "./phorest-auth";

// ─── API Client ────────────────────────────────────────────────
export {
  PhorestApiClient,
  getPhorestClient,
  clearClientCache,
  type PhorestClientConfig,
} from "./phorest-client";

// ─── Branches ─────────────────────────────────────────────────
export {
  PhorestBranchesClient,
  createPhorestBranchesClient,
  normalizePhorestBranch,
  type UnifiedBranch,
  type BranchSyncResult,
} from "./phorest-branches";

// ─── Clients ─────────────────────────────────────────────────
export {
  PhorestClientsClient,
  createPhorestClientsClient,
  normalizePhorestClient,
  type ClientSyncOptions,
  type ClientSyncResult,
  type ServiceHistoryResult,
} from "./phorest-clients";

// ─── Appointments ──────────────────────────────────────────────
export {
  PhorestAppointmentsClient,
  createPhorestAppointmentsClient,
  normalizePhorestAppointment,
  type AppointmentSyncOptions,
  type AppointmentSyncResult,
} from "./phorest-appointments";

// ─── Services ──────────────────────────────────────────────────
export {
  PhorestServicesClient,
  createPhorestServicesClient,
  normalizePhorestService,
  type ServiceSyncOptions,
  type ServiceSyncResult,
} from "./phorest-services";

// ─── Inventory ─────────────────────────────────────────────────
export {
  PhorestInventoryClient,
  createPhorestInventoryClient,
  normalizePhorestProduct,
  type InventorySyncOptions,
  type InventorySyncResult,
  type LowStockAlert,
} from "./phorest-inventory";

// ─── Sync Runner ───────────────────────────────────────────────
export {
  PhorestSyncRunner,
  createPhorestSyncRunner,
  type SyncRunnerConfig,
  type SyncStoreAdapter,
} from "./phorest-sync";
