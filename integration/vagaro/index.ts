/**
 * Vagaro Integration — COLORgenius
 *
 * Complete Vagaro POS + Scheduling integration module.
 * Re-exports all sub-modules for clean imports.
 *
 * @example
 * ```ts
 * import { VagaroSyncRunner, VagaroAuthManager, getVagaroClient } from "./integration/vagaro";
 *
 * const auth = new VagaroAuthManager();
 * await auth.initialize({ apiKey: process.env.VAGARO_API_KEY, businessId: "12345" });
 *
 * const runner = createVagaroSyncRunner({
 *   businessId: "12345",
 *   apiKey: process.env.VAGARO_API_KEY!,
 * });
 * await runner.runFullSync();
 * ```
 */

// ─── Types ───────────────────────────────────────────────────
export {
  // Base
  VagaroIdSchema,
  VagaroDateSchema,
  VagaroDateTimeSchema,
  VagaroPhoneSchema,
  VagaroEmailSchema,
  VagaroMoneySchema,
  type VagaroId,
  type VagaroDate,
  type VagaroDateTime,
  type VagaroPhone,
  type VagaroEmail,
  type VagaroMoney,

  // Auth
  VagaroTokenResponseSchema,
  VagaroApiKeyConfigSchema,
  type VagaroTokenResponse,
  type VagaroApiKeyConfig,

  // Pagination
  VagaroPaginationParamsSchema,
  VagaroPaginationMetaSchema,
  type VagaroPaginationParams,
  type VagaroPaginationMeta,
  type VagaroPaginatedResponse,

  // Customers
  VagaroCustomerSchema,
  VagaroCustomerListParamsSchema,
  type VagaroCustomer,
  type VagaroCustomerListParams,

  // Appointments
  VagaroAppointmentStatusSchema,
  VagaroAppointmentSchema,
  VagaroAppointmentListParamsSchema,
  type VagaroAppointmentStatus,
  type VagaroAppointment,
  type VagaroAppointmentListParams,

  // Services
  VagaroServiceCategorySchema,
  VagaroServiceSchema,
  VagaroServiceListParamsSchema,
  type VagaroServiceCategory,
  type VagaroService,
  type VagaroServiceListParams,

  // Inventory
  VagaroProductStatusSchema,
  VagaroInventoryItemSchema,
  VagaroInventoryListParamsSchema,
  type VagaroProductStatus,
  type VagaroInventoryItem,
  type VagaroInventoryListParams,

  // Employees
  VagaroEmployeeSchema,
  type VagaroEmployee,

  // Webhooks
  VagaroWebhookEventSchema,
  VagaroWebhookPayloadSchema,
  VagaroWebhookRegistrationSchema,
  type VagaroWebhookEvent,
  type VagaroWebhookPayload,
  type VagaroWebhookRegistration,

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
  VagaroErrorCodeSchema,
  VagaroApiErrorSchema,
  VagaroError,
  type VagaroErrorCode,
  type VagaroApiError,

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
  VagaroAuthManager,
  getAuthManager,
  resetAuthManager,
  type AuthConfig,
  type KeyStorageAdapter,
  type RotationOptions,
} from "./vagaro-auth";

// ─── API Client ────────────────────────────────────────────────
export {
  VagaroApiClient,
  getVagaroClient,
  clearClientCache,
  type VagaroClientConfig,
} from "./vagaro-client";

// ─── Customers ─────────────────────────────────────────────────
export {
  VagaroCustomersClient,
  createVagaroCustomersClient,
  normalizeVagaroCustomer,
  type CustomerSyncOptions,
  type CustomerSyncResult,
} from "./vagaro-customers";

// ─── Appointments ──────────────────────────────────────────────
export {
  VagaroAppointmentsClient,
  createVagaroAppointmentsClient,
  normalizeVagaroAppointment,
  type AppointmentSyncOptions,
  type AppointmentSyncResult,
} from "./vagaro-appointments";

// ─── Services ──────────────────────────────────────────────────
export {
  VagaroServicesClient,
  createVagaroServicesClient,
  normalizeVagaroService,
  type ServiceSyncOptions,
  type ServiceSyncResult,
} from "./vagaro-services";

// ─── Inventory ─────────────────────────────────────────────────
export {
  VagaroInventoryClient,
  createVagaroInventoryClient,
  normalizeVagaroInventoryItem,
  type InventorySyncOptions,
  type InventorySyncResult,
} from "./vagaro-inventory";

// ─── Webhooks ──────────────────────────────────────────────────
export {
  VagaroWebhookHandler,
  createVagaroWebhookHandler,
  verifyWebhookSignature,
  verifyWebhookTimestamp,
  type WebhookHandlerConfig,
  type WebhookEventHandler,
  type WebhookRouter,
  type WebhookJob,
  type QueueAdapter,
  type IdempotencyStore,
} from "./vagaro-webhooks";

// ─── Sync Runner ───────────────────────────────────────────────
export {
  VagaroSyncRunner,
  createVagaroSyncRunner,
  type SyncRunnerConfig,
  type SyncStoreAdapter,
} from "./vagaro-sync";
