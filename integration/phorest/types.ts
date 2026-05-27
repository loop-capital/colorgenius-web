/**
 * Phorest API Type Definitions
 * Based on Phorest REST API v3
 * https://developer.phorest.com
 *
 * This module defines all Phorest-specific types, request/response shapes,
 * and Zod schemas for runtime validation.
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// Base Primitives
// ═══════════════════════════════════════════════════════════════

export const PhorestIdSchema = z.string().uuid();
export type PhorestId = z.infer<typeof PhorestIdSchema>;

export const PhorestDateTimeSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/,
  "Expected ISO 8601 datetime"
);
export type PhorestDateTime = z.infer<typeof PhorestDateTimeSchema>;

export const PhorestDateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  "Expected YYYY-MM-DD format"
);
export type PhorestDate = z.infer<typeof PhorestDateSchema>;

export const PhorestPhoneSchema = z.string().regex(
  /^\+?\d{7,15}$/,
  "Expected E.164-like phone number"
);
export type PhorestPhone = z.infer<typeof PhorestPhoneSchema>;

export const PhorestEmailSchema = z.string().email();
export type PhorestEmail = z.infer<typeof PhorestEmailSchema>;

export const PhorestMoneySchema = z.object({
  amount: z.number(),
  currency: z.string().length(3).default("USD"),
});
export type PhorestMoney = z.infer<typeof PhorestMoneySchema>;

// ═══════════════════════════════════════════════════════════════
// Server Region
// ═══════════════════════════════════════════════════════════════

export const PhorestRegionSchema = z.enum(["us", "eu"]);
export type PhorestRegion = z.infer<typeof PhorestRegionSchema>;

export const PHOREST_BASE_URLS: Record<PhorestRegion, string> = {
  us: "https://us.phorest.com",
  eu: "https://api.phorest.com",
};

// ═══════════════════════════════════════════════════════════════
// Authentication
// ═══════════════════════════════════════════════════════════════

export const PhorestCredentialsSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  email: PhorestEmailSchema.describe("Phorest login email"),
  password: z.string().min(1).describe("Phorest login password"),
  region: PhorestRegionSchema.default("us"),
  label: z.string().max(128).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  lastVerifiedAt: z.string().datetime().optional().nullable(),
  rateLimitPerSecond: z.number().int().min(1).default(10),
  metadata: z.record(z.unknown()).optional(),
});
export type PhorestCredentials = z.infer<typeof PhorestCredentialsSchema>;

// ═══════════════════════════════════════════════════════════════
// Pagination
// ═══════════════════════════════════════════════════════════════

export const PhorestPaginationParamsSchema = z.object({
  page: z.number().int().min(0).default(0),
  size: z.number().int().min(1).max(500).default(100),
});
export type PhorestPaginationParams = z.infer<typeof PhorestPaginationParamsSchema>;

export const PhorestPageSchema = z.object({
  size: z.number().int().min(0),
  totalElements: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  number: z.number().int().min(0),
});
export type PhorestPage = z.infer<typeof PhorestPageSchema>;

export interface PhorestPaginatedResponse<T> {
  _embedded: {
    [key: string]: T[];
  };
  page: PhorestPage;
}

// ═══════════════════════════════════════════════════════════════
// Branches
// ═══════════════════════════════════════════════════════════════

export const PhorestBranchSchema = z.object({
  id: PhorestIdSchema,
  name: z.string().min(1),
  phone: PhorestPhoneSchema.optional().nullable(),
  email: PhorestEmailSchema.optional().nullable(),
  address: z.object({
    line1: z.string().optional().nullable(),
    line2: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    county: z.string().optional().nullable(),
    postcode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
  }).optional().nullable(),
  timeZone: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  createdAt: PhorestDateTimeSchema.optional(),
  updatedAt: PhorestDateTimeSchema.optional(),
});
export type PhorestBranch = z.infer<typeof PhorestBranchSchema>;

// ═══════════════════════════════════════════════════════════════
// Clients (Customers)
// ═══════════════════════════════════════════════════════════════

export const PhorestClientSchema = z.object({
  id: PhorestIdSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: PhorestEmailSchema.optional().nullable(),
  mobilePhone: PhorestPhoneSchema.optional().nullable(),
  homePhone: PhorestPhoneSchema.optional().nullable(),
  workPhone: PhorestPhoneSchema.optional().nullable(),
  gender: z.enum(["Male", "Female", "Unspecified"]).optional().nullable(),
  dateOfBirth: PhorestDateSchema.optional().nullable(),
  address: z.object({
    line1: z.string().optional().nullable(),
    line2: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    county: z.string().optional().nullable(),
    postcode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
  }).optional().nullable(),
  notes: z.string().optional().nullable(),
  clientSince: PhorestDateSchema.optional().nullable(),
  totalVisits: z.number().int().min(0).optional().default(0),
  totalSpend: z.number().min(0).optional().default(0),
  lastVisitDate: PhorestDateSchema.optional().nullable(),
  isDeleted: z.boolean().optional().default(false),
  marketingPermission: z.boolean().optional().default(false),
  customFields: z.record(z.string(), z.unknown()).optional().default({}),
  createdAt: PhorestDateTimeSchema.optional(),
  updatedAt: PhorestDateTimeSchema.optional(),
});
export type PhorestClient = z.infer<typeof PhorestClientSchema>;

export const PhorestClientListParamsSchema = z.object({
  ...PhorestPaginationParamsSchema.shape,
  email: PhorestEmailSchema.optional(),
  mobilePhone: PhorestPhoneSchema.optional(),
  updated_at: PhorestDateTimeSchema.optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});
export type PhorestClientListParams = z.infer<typeof PhorestClientListParamsSchema>;

export const PhorestClientCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: PhorestEmailSchema.optional(),
  mobilePhone: PhorestPhoneSchema.optional(),
  homePhone: PhorestPhoneSchema.optional(),
  workPhone: PhorestPhoneSchema.optional(),
  gender: z.enum(["Male", "Female", "Unspecified"]).optional(),
  dateOfBirth: PhorestDateSchema.optional(),
  address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    county: z.string().optional(),
    postcode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
  marketingPermission: z.boolean().optional(),
});
export type PhorestClientCreate = z.infer<typeof PhorestClientCreateSchema>;

export const PhorestServiceHistorySchema = z.object({
  id: PhorestIdSchema,
  clientId: PhorestIdSchema,
  branchId: PhorestIdSchema,
  appointmentId: PhorestIdSchema.optional().nullable(),
  serviceId: PhorestIdSchema.optional().nullable(),
  serviceName: z.string().optional().nullable(),
  staffId: PhorestIdSchema.optional().nullable(),
  staffName: z.string().optional().nullable(),
  date: PhorestDateSchema,
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  durationMinutes: z.number().int().min(0).optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: PhorestDateTimeSchema.optional(),
});
export type PhorestServiceHistory = z.infer<typeof PhorestServiceHistorySchema>;

// ═══════════════════════════════════════════════════════════════
// Appointments
// ═══════════════════════════════════════════════════════════════

export const PhorestAppointmentStatusSchema = z.enum([
  "COMPLETED",
  "CONFIRMED",
  "PENDING",
  "NO_SHOW",
  "CANCELLED",
  "CHECKED_IN",
  "ARRIVED",
  "IN_PROGRESS",
  "DELETED",
]);
export type PhorestAppointmentStatus = z.infer<typeof PhorestAppointmentStatusSchema>;

export const PhorestAppointmentSchema = z.object({
  id: PhorestIdSchema,
  bookingRef: z.string().optional().nullable(),
  clientId: PhorestIdSchema,
  client: PhorestClientSchema.optional(),
  staffId: PhorestIdSchema.optional().nullable(),
  staffName: z.string().optional().nullable(),
  serviceIds: z.array(PhorestIdSchema).optional().default([]),
  services: z.array(z.lazy(() => PhorestServiceSchema)).optional(),
  startDateTime: PhorestDateTimeSchema,
  endDateTime: PhorestDateTimeSchema,
  duration: z.number().int().min(0).optional().nullable(),
  status: PhorestAppointmentStatusSchema,
  notes: z.string().optional().nullable(),
  isRecurring: z.boolean().optional().default(false),
  recurrenceId: PhorestIdSchema.optional().nullable(),
  isOnlineBooking: z.boolean().optional().default(false),
  checkedInAt: PhorestDateTimeSchema.optional().nullable(),
  totalPrice: z.number().min(0).optional().nullable(),
  totalDuration: z.number().int().min(0).optional().nullable(),
  roomId: PhorestIdSchema.optional().nullable(),
  roomName: z.string().optional().nullable(),
  branchId: PhorestIdSchema,
  cancellationReason: z.string().optional().nullable(),
  cancelledBy: z.enum(["CLIENT", "STAFF", "SYSTEM"]).optional().nullable(),
  createdAt: PhorestDateTimeSchema.optional(),
  updatedAt: PhorestDateTimeSchema.optional(),
});
export type PhorestAppointment = z.infer<typeof PhorestAppointmentSchema>;

export const PhorestAppointmentListParamsSchema = z.object({
  ...PhorestPaginationParamsSchema.shape,
  date: PhorestDateSchema.optional(),
  updated_at: PhorestDateTimeSchema.optional(),
  staff_id: PhorestIdSchema.optional(),
  room_id: PhorestIdSchema.optional(),
  client_id: PhorestIdSchema.optional(),
  include_canceled: z.boolean().optional().default(false),
  include_deleted: z.boolean().optional().default(false),
  include_archived: z.boolean().optional().default(false),
});
export type PhorestAppointmentListParams = z.infer<typeof PhorestAppointmentListParamsSchema>;

export const PhorestCheckInSchema = z.object({
  appointmentId: PhorestIdSchema,
  checkedInAt: PhorestDateTimeSchema.optional(),
});
export type PhorestCheckIn = z.infer<typeof PhorestCheckInSchema>;

// ═══════════════════════════════════════════════════════════════
// Services
// ═══════════════════════════════════════════════════════════════

export const PhorestServiceCategorySchema = z.object({
  id: PhorestIdSchema,
  name: z.string(),
  description: z.string().optional().nullable(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional().default(true),
});
export type PhorestServiceCategory = z.infer<typeof PhorestServiceCategorySchema>;

export const PhorestServiceSchema = z.object({
  id: PhorestIdSchema,
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  categoryId: PhorestIdSchema.optional().nullable(),
  category: PhorestServiceCategorySchema.optional(),
  price: z.number().min(0),
  specialPrice: z.number().min(0).optional().nullable(),
  durationMinutes: z.number().int().min(1),
  bufferMinutes: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
  isOnlineBookable: z.boolean().optional().default(true),
  color: z.string().regex(/^#?[0-9A-Fa-f]{6}$/).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  taxRate: z.number().min(0).max(1).optional().nullable(),
  processingTime: z.number().int().min(0).optional().default(0),
  notes: z.string().optional().nullable(),
  createdAt: PhorestDateTimeSchema.optional(),
  updatedAt: PhorestDateTimeSchema.optional(),
});
export type PhorestService = z.infer<typeof PhorestServiceSchema>;

export const PhorestServiceListParamsSchema = z.object({
  ...PhorestPaginationParamsSchema.shape,
  categoryId: PhorestIdSchema.optional(),
  isActive: z.boolean().optional(),
  updated_at: PhorestDateTimeSchema.optional(),
  name: z.string().optional(),
});
export type PhorestServiceListParams = z.infer<typeof PhorestServiceListParamsSchema>;

// ═══════════════════════════════════════════════════════════════
// Products / Inventory
// ═══════════════════════════════════════════════════════════════

export const PhorestProductTypeSchema = z.enum([
  "RETAIL",
  "PROFESSIONAL",
  "GIFT_CARD",
  "PACKAGE",
  "OTHER",
]);
export type PhorestProductType = z.infer<typeof PhorestProductTypeSchema>;

export const PhorestProductStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
]);
export type PhorestProductStatus = z.infer<typeof PhorestProductStatusSchema>;

export const PhorestStockStatusSchema = z.enum([
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
]);
export type PhorestStockStatus = z.infer<typeof PhorestStockStatusSchema>;

export const PhorestProductSchema = z.object({
  id: PhorestIdSchema,
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  type: PhorestProductTypeSchema.optional().default("RETAIL"),
  status: PhorestProductStatusSchema.optional().default("ACTIVE"),
  price: z.number().min(0),
  cost: z.number().min(0).optional().nullable(),
  taxRate: z.number().min(0).max(1).optional().nullable(),
  quantityOnHand: z.number().int().min(0).optional().default(0),
  quantityReserved: z.number().int().min(0).optional().default(0),
  reorderPoint: z.number().int().min(0).optional().nullable(),
  reorderQuantity: z.number().int().min(0).optional().nullable(),
  unitOfMeasure: z.string().optional().nullable(),
  supplier: z.string().optional().nullable(),
  supplierSku: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  isRetail: z.boolean().optional().default(true),
  imageUrl: z.string().url().optional().nullable(),
  branchQuantities: z.array(z.object({
    branchId: PhorestIdSchema,
    quantityOnHand: z.number().int().min(0),
    quantityReserved: z.number().int().min(0),
  })).optional().default([]),
  createdAt: PhorestDateTimeSchema.optional(),
  updatedAt: PhorestDateTimeSchema.optional(),
});
export type PhorestProduct = z.infer<typeof PhorestProductSchema>;

export const PhorestProductListParamsSchema = z.object({
  ...PhorestPaginationParamsSchema.shape,
  type: PhorestProductTypeSchema.optional(),
  updated_at: PhorestDateTimeSchema.optional(),
  name: z.string().optional(),
  barcode: z.string().optional(),
  include_archived: z.boolean().optional().default(false),
  low_stock: z.boolean().optional().default(false),
  out_of_stock: z.boolean().optional().default(false),
});
export type PhorestProductListParams = z.infer<typeof PhorestProductListParamsSchema>;

// ═══════════════════════════════════════════════════════════════
// Purchases
// ═══════════════════════════════════════════════════════════════

export const PhorestPurchaseItemSchema = z.object({
  productId: PhorestIdSchema.optional().nullable(),
  serviceId: PhorestIdSchema.optional().nullable(),
  name: z.string(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  taxAmount: z.number().min(0).optional().default(0),
  discountAmount: z.number().min(0).optional().default(0),
});
export type PhorestPurchaseItem = z.infer<typeof PhorestPurchaseItemSchema>;

export const PhorestPurchaseSchema = z.object({
  id: PhorestIdSchema,
  clientId: PhorestIdSchema.optional().nullable(),
  staffId: PhorestIdSchema.optional().nullable(),
  branchId: PhorestIdSchema,
  appointmentId: PhorestIdSchema.optional().nullable(),
  items: z.array(PhorestPurchaseItemSchema),
  subtotal: z.number().min(0),
  taxTotal: z.number().min(0),
  discountTotal: z.number().min(0),
  total: z.number().min(0),
  paymentMethod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: PhorestDateTimeSchema,
});
export type PhorestPurchase = z.infer<typeof PhorestPurchaseSchema>;

export const PhorestPurchaseCreateSchema = z.object({
  clientId: PhorestIdSchema.optional(),
  staffId: PhorestIdSchema.optional(),
  appointmentId: PhorestIdSchema.optional(),
  items: z.array(PhorestPurchaseItemSchema).min(1),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});
export type PhorestPurchaseCreate = z.infer<typeof PhorestPurchaseCreateSchema>;

// ═══════════════════════════════════════════════════════════════
// Reviews
// ═══════════════════════════════════════════════════════════════

export const PhorestReviewSchema = z.object({
  id: PhorestIdSchema,
  clientId: PhorestIdSchema,
  branchId: PhorestIdSchema,
  appointmentId: PhorestIdSchema.optional().nullable(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional().nullable(),
  comment: z.string().optional().nullable(),
  staffId: PhorestIdSchema.optional().nullable(),
  reply: z.string().optional().nullable(),
  replyAt: PhorestDateTimeSchema.optional().nullable(),
  isPublished: z.boolean().optional().default(true),
  createdAt: PhorestDateTimeSchema,
});
export type PhorestReview = z.infer<typeof PhorestReviewSchema>;

// ═══════════════════════════════════════════════════════════════
// Unified / Normalized Types (COLORgenius domain)
// ═══════════════════════════════════════════════════════════════

export const UnifiedCustomerSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().default("US"),
  }).optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  totalVisits: z.number().int().min(0).default(0),
  totalSpent: z.number().min(0).default(0),
  lastVisitDate: z.string().optional().nullable(),
  isVip: z.boolean().default(false),
  marketingPermission: z.boolean().default(false),
  source: z.literal("phorest"),
  rawData: z.unknown().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type UnifiedCustomer = z.infer<typeof UnifiedCustomerSchema>;

export const UnifiedAppointmentSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string(),
  customerId: z.string(),
  employeeId: z.string().optional().nullable(),
  serviceIds: z.array(z.string()).default([]),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  duration: z.number().int().min(0).optional().nullable(),
  status: z.enum(["confirmed", "pending", "completed", "no_show", "cancelled", "rescheduled", "checked_in", "arrived", "in_progress", "deleted"]),
  notes: z.string().optional().nullable(),
  isRecurring: z.boolean().default(false),
  isOnlineBooking: z.boolean().default(false),
  totalPrice: z.number().min(0).optional().nullable(),
  totalDuration: z.number().int().min(0).optional().nullable(),
  cancellationReason: z.string().optional().nullable(),
  roomId: z.string().optional().nullable(),
  branchId: z.string(),
  source: z.literal("phorest"),
  rawData: z.unknown().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type UnifiedAppointment = z.infer<typeof UnifiedAppointmentSchema>;

export const UnifiedServiceSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  categoryName: z.string().optional().nullable(),
  price: z.number().min(0),
  durationMinutes: z.number().int().min(1),
  bufferMinutes: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isOnlineBookable: z.boolean().default(true),
  color: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  taxRate: z.number().min(0).max(1).optional().nullable(),
  source: z.literal("phorest"),
  rawData: z.unknown().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type UnifiedService = z.infer<typeof UnifiedServiceSchema>;

export const UnifiedInventoryItemSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string(),
  sku: z.string().optional().nullable(),
  name: z.string(),
  description: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  price: z.number().min(0),
  cost: z.number().min(0).optional().nullable(),
  quantityOnHand: z.number().int().min(0).default(0),
  quantityReserved: z.number().int().min(0).default(0),
  reorderPoint: z.number().int().min(0).optional().nullable(),
  status: z.enum(["in_stock", "low_stock", "out_of_stock", "discontinued", "archived"]).default("in_stock"),
  isActive: z.boolean().default(true),
  isRetail: z.boolean().default(true),
  imageUrl: z.string().optional().nullable(),
  source: z.literal("phorest"),
  rawData: z.unknown().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type UnifiedInventoryItem = z.infer<typeof UnifiedInventoryItemSchema>;

// ═══════════════════════════════════════════════════════════════
// Error Types
// ═══════════════════════════════════════════════════════════════

export const PhorestErrorCodeSchema = z.enum([
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION_ERROR",
  "RATE_LIMITED",
  "SERVER_ERROR",
  "NETWORK_ERROR",
  "TIMEOUT",
  "INVALID_RESPONSE",
  "UNKNOWN",
]);
export type PhorestErrorCode = z.infer<typeof PhorestErrorCodeSchema>;

export const PhorestApiErrorSchema = z.object({
  code: PhorestErrorCodeSchema,
  message: z.string(),
  statusCode: z.number().int().optional(),
  phorestCode: z.string().optional().describe("Phorest-specific error code if any"),
  phorestMessage: z.string().optional(),
  requestId: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  retryable: z.boolean().default(false),
  retryAfterMs: z.number().int().optional(),
});
export type PhorestApiError = z.infer<typeof PhorestApiErrorSchema>;

export class PhorestError extends Error {
  public readonly code: PhorestErrorCode;
  public readonly statusCode?: number;
  public readonly phorestCode?: string;
  public readonly requestId?: string;
  public readonly details?: Record<string, unknown>;
  public readonly retryable: boolean;
  public readonly retryAfterMs?: number;

  constructor(error: PhorestApiError) {
    super(error.message);
    this.name = "PhorestError";
    this.code = error.code;
    this.statusCode = error.statusCode;
    this.phorestCode = error.phorestCode;
    this.requestId = error.requestId;
    this.details = error.details;
    this.retryable = error.retryable;
    this.retryAfterMs = error.retryAfterMs;
  }

  toJSON(): PhorestApiError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      phorestCode: this.phorestCode,
      requestId: this.requestId,
      details: this.details,
      retryable: this.retryable,
      retryAfterMs: this.retryAfterMs,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// Sync Types
// ═══════════════════════════════════════════════════════════════

export const SyncEntityTypeSchema = z.enum([
  "clients",
  "appointments",
  "services",
  "inventory",
  "branches",
  "reviews",
]);
export type SyncEntityType = z.infer<typeof SyncEntityTypeSchema>;

export const SyncStatusSchema = z.enum([
  "idle",
  "running",
  "completed",
  "failed",
  "partial",
]);
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

export const SyncRunSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string(),
  branchId: z.string().optional().nullable(),
  type: z.enum(["full", "incremental"]),
  status: SyncStatusSchema,
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional().nullable(),
  entityProgress: z.record(
    SyncEntityTypeSchema,
    z.object({
      status: SyncStatusSchema,
      total: z.number().int().min(0).default(0),
      processed: z.number().int().min(0).default(0),
      failed: z.number().int().min(0).default(0),
      startedAt: z.string().datetime().optional(),
      completedAt: z.string().datetime().optional().nullable(),
      error: z.string().optional().nullable(),
    })
  ).optional().default({}),
  errorLog: z.array(z.object({
    entityType: SyncEntityTypeSchema,
    entityId: z.string().optional(),
    error: PhorestApiErrorSchema,
    timestamp: z.string().datetime(),
  })).optional().default([]),
  metadata: z.record(z.unknown()).optional(),
});
export type SyncRun = z.infer<typeof SyncRunSchema>;
