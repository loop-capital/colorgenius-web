/**
 * Phorest Integration — Main Export File
 *
 * Usage:
 *   import { createPhorestClient, syncPhorestInventory, performFullSync } from '@/integrations/phorest';
 *
 * Or use individual modules for specific needs:
 *   import { PhorestClient } from '@/integrations/phorest/phorest-client';
 */

// ── Types ──
export type {
  // Auth types
  PhorestCredentials,
  PhorestRegion,
  PhorestConnection,

  // Entity types
  PhorestBranch,
  PhorestClientData,
  PhorestAddress,
  PhorestGender,
  PhorestAppointment,
  PhorestService,
  PhorestProduct,
  PhorestServiceHistory,
  PhorestStaff,
  PhorestCsvExportJob,

  // Pagination
  PageMetadata,
  PhorestPagedResponse,

  // Error
  PhorestErrorResponse,

  // Sync types
  PhorestSyncedClient,
  PhorestSyncedAppointment,
  PhorestSyncedProduct,
  PhorestSyncResult,
  PhorestFullSyncResult,
} from './types';

// ── Auth ──
export {
  buildBasicAuthHeader,
  normalizeUsername,
  validatePhorestCredentials,
  cacheCredentials,
  getCachedCredentials,
  clearCachedCredentials,
  detectRegion,
} from './phorest-auth';

// ── Client ──
export { PhorestApiError, createPhorestClient } from './phorest-client';
export type { PhorestClient } from './phorest-client';

// ── Inventory ──
export {
  syncPhorestInventory,
  getPhorestInventory,
  getPhorestLowStock,
  mapProductCategory,
  extractShadeCode,
  extractBrand,
  extractProductLine,
} from './phorest-inventory';
export type { InventorySyncOptions } from './phorest-inventory';

// ── Appointments ──
export {
  syncPhorestAppointments,
  syncPhorestServiceHistories,
  getPhorestUpcomingAppointments,
} from './phorest-appointments';
export type { AppointmentSyncOptions, ServiceHistorySyncOptions } from './phorest-appointments';

// ── Sync Engine ──
export {
  performFullSync,
  performIncrementalSync,
  savePhorestConnection,
  loadPhorestConnection,
  removePhorestConnection,
  isPhorestConnected,
  getJobStatus,
  getActiveJobs,
} from './phorest-sync';
export type { FullSyncOptions, IncrementalSyncOptions, SyncJob, PhorestConnectionConfig } from './phorest-sync';

// ── Utilities ──
export { getPhorestBaseUrl } from './types';
