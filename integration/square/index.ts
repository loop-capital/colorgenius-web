/**
 * Square Integration — Main Export
 * COLORgenius / SKINgenius platform
 */

// Core
export { SquareClient, SquareError } from './square-client';
export {
  SquareOAuth,
  InMemoryTokenStorage,
  OAuthError,
  SQUARE_OAUTH_SCOPES,
} from './square-oauth';

// Data sync
export { SquareCustomers, CustomerSyncError } from './square-customers';
export { SquarePayments, PaymentSyncError } from './square-payments';
export { SquareBookings, BookingSyncError } from './square-bookings';
export { SquareCatalog, CatalogSyncError } from './square-catalog';

// Webhooks
export {
  SquareWebhooks,
  InMemoryIdempotencyStore,
  WebhookError,
  parseWebhookHeaders,
} from './square-webhooks';

// Sync
export {
  SquareSync,
  InMemorySyncStateStore,
  SyncError,
} from './square-sync';

// Types
export type {
  // OAuth
  SquareTokens,
  SquareTokenResponse,
  SquareRefreshResponse,
  SquareOAuthEnv,
  SquareOAuthScope,

  // API Client
  SquareApiConfig,
  SquareApiError,
  SquareApiRequestOptions,
  SquarePaginatedResponse,

  // Customers
  SquareCustomer,
  SquareAddress,
  SquareCustomerPreferences,
  UnifiedCustomer,
  UnifiedAddress,

  // Payments
  SquarePayment,
  SquareMoney,
  SquareCard,
  SquareCardDetails,
  SquareProcessingFee,
  UnifiedTransaction,

  // Bookings
  SquareBooking,
  SquareAppointmentSegment,
  SquareCatalogObjectReference,
  SquareBookingCreatorDetails,
  UnifiedAppointment,

  // Catalog
  SquareCatalogObject,
  SquareCatalogItem,
  SquareCatalogItemVariation,
  SquareCatalogCategory,
  SquareInventoryCount,
  SquareInventoryAdjustment,
  UnifiedInventoryItem,

  // Webhooks
  SquareWebhookPayload,
  SquareWebhookData,
  SquareWebhookEventType,
  SquareWebhookConfig,
  WebhookHandler,
  WebhookHandlerMap,
  IdempotencyStore,

  // Sync
  SyncState,
  SyncOptions,
  SyncProgress,
  SyncDataType,
  SyncError as SyncErrorType,
  QueueMessage,
  QueueInterface,

  // Storage
  TokenStorage,
  SyncStateStore,
  UnifiedDataStore,
} from './types';
