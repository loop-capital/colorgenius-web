/**
 * Vagaro API Type Definitions
 * Based on Vagaro Pro API v2 (OAuth 2.0 + REST)
 * https://www.vagaro.com/pro/api
 *
 * This module defines all Vagaro-specific types, request/response shapes,
 * and Zod schemas for runtime validation.
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// Base Primitives
// ═══════════════════════════════════════════════════════════════

export const VagaroIdSchema = z.union([z.string(), z.number()]).transform(String);
export type VagaroId = z.infer<typeof VagaroIdSchema>;

export const VagaroDateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  "Expected YYYY-MM-DD format"
);
export type VagaroDate = z.infer<typeof VagaroDateSchema>;

export const VagaroDateTimeSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/,
  "Expected ISO 8601 datetime"
);
export type VagaroDateTime = z.infer<typeof VagaroDateTimeSchema>;

export const VagaroPhoneSchema = z.string().regex(
  /^\+?\d{10,15}$/,
  "Expected E.164-like phone number"
);
export type VagaroPhone = z.infer<typeof VagaroPhoneSchema>;

export const VagaroEmailSchema = z.string().email();
export type VagaroEmail = z.infer<typeof VagaroEmailSchema>;

export const VagaroMoneySchema = z.object({
  amount: z.number().min(0),
  currency: z.string().length(3).default("USD"),
});
export type VagaroMoney = z.infer<typeof VagaroMoneySchema>;

// ═══════════════════════════════════════════════════════════════
// Authentication & Tokens
// ═══════════════════════════════════════════════════════════════

export const VagaroTokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.literal("Bearer"),
  expires_in: z.number().int().positive(),
  scope: z.string().optional(),
});
export type VagaroTokenResponse = z.infer<typeof VagaroTokenResponseSchema>;

export const VagaroApiKeyConfigSchema = z.object({
  id: z.string().uuid(),
  apiKey: z.string().min(32).describe("Vagaro Business API Key"),
  businessId: VagaroIdSchema.describe("Vagaro Business ID"),
  label: z.string().max(128).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  lastRotatedAt: z.string().datetime().optional(),
  rateLimitPerSecond: z.number().int().min(1).default(5),
  metadata: z.record(z.unknown()).optional(),
});
export type VagaroApiKeyConfig = z.infer<typeof VagaroApiKeyConfigSchema>;

// ═══════════════════════════════════════════════════════════════
// Pagination
// ═══════════════════════════════════════════════════════════════

export const VagaroPaginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(500).default(100),
});
export type VagaroPaginationParams = z.infer<typeof VagaroPaginationParamsSchema>;

export const VagaroPaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  totalPages: z.number().int().min(0),
  totalCount: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});
export type VagaroPaginationMeta = z.infer<typeof VagaroPaginationMetaSchema>;

export interface VagaroPaginatedResponse<T> {
  data: T[];
  pagination: VagaroPaginationMeta;
}

// ═══════════════════════════════════════════════════════════════
// Customers
// ═══════════════════════════════════════════════════════════════

export const VagaroCustomerSchema = z.object({
  id: VagaroIdSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: VagaroEmailSchema.optional().nullable(),
  phone: VagaroPhoneSchema.optional().nullable(),
  mobilePhone: VagaroPhoneSchema.optional().nullable(),
  gender: z.enum(["Male", "Female", "Other", "PreferNotToSay"]).optional().nullable(),
  dateOfBirth: VagaroDateSchema.optional().nullable(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional().default("US"),
  }).optional().nullable(),
  notes: z.string().optional().nullable(),
  clientSince: VagaroDateSchema.optional().nullable(),
  totalVisits: z.number().int().min(0).optional().default(0),
  totalSpent: z.number().min(0).optional().default(0),
  lastVisitDate: VagaroDateSchema.optional().nullable(),
  isVip: z.boolean().optional().default(false),
  isDeleted: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  customFields: z.record(z.string(), z.unknown()).optional().default({}),
  createdAt: VagaroDateTimeSchema.optional(),
  updatedAt: VagaroDateTimeSchema.optional(),
});
export type VagaroCustomer = z.infer<typeof VagaroCustomerSchema>;

export const VagaroCustomerListParamsSchema = z.object({
  ...VagaroPaginationParamsSchema.shape,
  search: z.string().optional(),
  email: VagaroEmailSchema.optional(),
  phone: VagaroPhoneSchema.optional(),
  updatedSince: VagaroDateTimeSchema.optional(),
  includeDeleted: z.boolean().optional().default(false),
  tag: z.string().optional(),
});
export type VagaroCustomerListParams = z.infer<typeof VagaroCustomerListParamsSchema>;

// ═══════════════════════════════════════════════════════════════
// Appointments (Bookings)
// ═══════════════════════════════════════════════════════════════

export const VagaroAppointmentStatusSchema = z.enum([
  "Confirmed",
  "Pending",
  "Completed",
  "NoShow",
  "Cancelled",
  "Rescheduled",
]);
export type VagaroAppointmentStatus = z.infer<typeof VagaroAppointmentStatusSchema>;

export const VagaroAppointmentSchema = z.object({
  id: VagaroIdSchema,
  bookingNumber: z.string().optional(),
  customerId: VagaroIdSchema,
  customer: VagaroCustomerSchema.optional(),
  employeeId: VagaroIdSchema,
  serviceIds: z.array(VagaroIdSchema).optional().default([]),
  services: z.array(z.lazy(() => VagaroServiceSchema)).optional(),
  startDateTime: VagaroDateTimeSchema,
  endDateTime: VagaroDateTimeSchema,
  status: VagaroAppointmentStatusSchema,
  notes: z.string().optional().nullable(),
  isRecurring: z.boolean().optional().default(false),
  recurrenceId: VagaroIdSchema.optional().nullable(),
  isOnlineBooking: z.boolean().optional().default(false),
  confirmationStatus: z.enum(["Confirmed", "Unconfirmed", "Declined"]).optional().default("Confirmed"),
  checkedInAt: VagaroDateTimeSchema.optional().nullable(),
  checkedOutAt: VagaroDateTimeSchema.optional().nullable(),
  totalPrice: z.number().min(0).optional(),
  totalDuration: z.number().int().min(0).optional(),
  locationId: VagaroIdSchema.optional().nullable(),
  roomId: VagaroIdSchema.optional().nullable(),
  createdAt: VagaroDateTimeSchema.optional(),
  updatedAt: VagaroDateTimeSchema.optional(),
  cancellationReason: z.string().optional().nullable(),
  cancelledBy: z.enum(["Customer", "Business", "System"]).optional().nullable(),
});
export type VagaroAppointment = z.infer<typeof VagaroAppointmentSchema>;

export const VagaroAppointmentListParamsSchema = z.object({
  ...VagaroPaginationParamsSchema.shape,
  startDate: VagaroDateSchema,
  endDate: VagaroDateSchema,
  customerId: VagaroIdSchema.optional(),
  employeeId: VagaroIdSchema.optional(),
  status: z.array(VagaroAppointmentStatusSchema).optional(),
  updatedSince: VagaroDateTimeSchema.optional(),
  includeDeleted: z.boolean().optional().default(false),
});
export type VagaroAppointmentListParams = z.infer<typeof VagaroAppointmentListParamsSchema>;

// ═══════════════════════════════════════════════════════════════
// Services
// ═══════════════════════════════════════════════════════════════

export const VagaroServiceCategorySchema = z.object({
  id: VagaroIdSchema,
  name: z.string(),
  description: z.string().optional().nullable(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional().default(true),
});
export type VagaroServiceCategory = z.infer<typeof VagaroServiceCategorySchema>;

export const VagaroServiceSchema = z.object({
  id: VagaroIdSchema,
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  categoryId: VagaroIdSchema,
  category: VagaroServiceCategorySchema.optional(),
  price: z.number().min(0),
  specialPrice: z.number().min(0).optional().nullable(),
  duration: z.number().int().min(1), // minutes
  bufferTime: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
  isOnlineBookable: z.boolean().optional().default(true),
  color: z.string().regex(/^#?[0-9A-Fa-f]{6}$/).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  taxRate: z.number().min(0).max(1).optional().nullable(),
  requiredDeposit: z.number().min(0).optional().nullable(),
  processingTime: z.number().int().min(0).optional().default(0),
  addons: z.array(z.lazy(() => VagaroServiceSchema)).optional().default([]),
  requiredProducts: z.array(z.string()).optional().default([]),
  notes: z.string().optional().nullable(),
  createdAt: VagaroDateTimeSchema.optional(),
  updatedAt: VagaroDateTimeSchema.optional(),
});
export type VagaroService = z.infer<typeof VagaroServiceSchema>;

export const VagaroServiceListParamsSchema = z.object({
  ...VagaroPaginationParamsSchema.shape,
  categoryId: VagaroIdSchema.optional(),
  isActive: z.boolean().optional(),
  updatedSince: VagaroDateTimeSchema.optional(),
  search: z.string().optional(),
});
export type VagaroServiceListParams = z.infer<typeof VagaroServiceListParamsSchema>;

// ═══════════════════════════════════════════════════════════════
// Inventory / Products
// ═══════════════════════════════════════════════════════════════

export const VagaroProductStatusSchema = z.enum([
  "InStock",
  "LowStock",
  "OutOfStock",
  "Discontinued",
]);
export type VagaroProductStatus = z.infer<typeof VagaroProductStatusSchema>;

export const VagaroInventoryItemSchema = z.object({
  id: VagaroIdSchema,
  sku: z.string().optional().nullable(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  price: z.number().min(0),
  cost: z.number().min(0).optional().nullable(),
  quantityOnHand: z.number().int().min(0).optional().default(0),
  quantityReserved: z.number().int().min(0).optional().default(0),
  reorderPoint: z.number().int().min(0).optional().nullable(),
  reorderQuantity: z.number().int().min(0).optional().nullable(),
  unitOfMeasure: z.string().optional().nullable(),
  supplier: z.string().optional().nullable(),
  supplierSku: z.string().optional().nullable(),
  status: VagaroProductStatusSchema.optional().default("InStock"),
  isActive: z.boolean().optional().default(true),
  isRetail: z.boolean().optional().default(true),
  isProfessional: z.boolean().optional().default(false),
  weightOz: z.number().positive().optional().nullable(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  }).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  locationQuantities: z.array(z.object({
    locationId: VagaroIdSchema,
    quantityOnHand: z.number().int().min(0),
    quantityReserved: z.number().int().min(0),
  })).optional().default([]),
  createdAt: VagaroDateTimeSchema.optional(),
  updatedAt: VagaroDateTimeSchema.optional(),
});
export type VagaroInventoryItem = z.infer<typeof VagaroInventoryItemSchema>;

export const VagaroInventoryListParamsSchema = z.object({
  ...VagaroPaginationParamsSchema.shape,
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.array(VagaroProductStatusSchema).optional(),
  isActive: z.boolean().optional(),
  lowStockOnly: z.boolean().optional().default(false),
  updatedSince: VagaroDateTimeSchema.optional(),
});
export type VagaroInventoryListParams = z.infer<typeof VagaroInventoryListParamsSchema>;

// ═══════════════════════════════════════════════════════════════
// Employees
// ═══════════════════════════════════════════════════════════════

export const VagaroEmployeeSchema = z.object({
  id: VagaroIdSchema,
  firstName: z.string(),
  lastName: z.string(),
  email: VagaroEmailSchema.optional().nullable(),
  phone: VagaroPhoneSchema.optional().nullable(),
  title: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  isBookableOnline: z.boolean().optional().default(true),
  bio: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  color: z.string().regex(/^#?[0-9A-Fa-f]{6}$/).optional().nullable(),
  serviceIds: z.array(VagaroIdSchema).optional().default([]),
  schedule: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    isWorking: z.boolean().default(true),
  })).optional(),
  createdAt: VagaroDateTimeSchema.optional(),
  updatedAt: VagaroDateTimeSchema.optional(),
});
export type VagaroEmployee = z.infer<typeof VagaroEmployeeSchema>;

// ═══════════════════════════════════════════════════════════════
// Webhooks
// ═══════════════════════════════════════════════════════════════

export const VagaroWebhookEventSchema = z.enum([
  "appointment.created",
  "appointment.updated",
  "appointment.cancelled",
  "appointment.completed",
  "customer.created",
  "customer.updated",
  "customer.deleted",
  "service.created",
  "service.updated",
  "service.deleted",
  "inventory.created",
  "inventory.updated",
  "inventory.deleted",
  "employee.updated",
]);
export type VagaroWebhookEvent = z.infer<typeof VagaroWebhookEventSchema>;

export const VagaroWebhookPayloadSchema = z.object({
  id: z.string().uuid(),
  event: VagaroWebhookEventSchema,
  businessId: VagaroIdSchema,
  timestamp: VagaroDateTimeSchema,
  data: z.record(z.unknown()),
  signature: z.string().describe("HMAC-SHA256 signature"),
  attempt: z.number().int().min(1).default(1),
});
export type VagaroWebhookPayload = z.infer<typeof VagaroWebhookPayloadSchema>;

export const VagaroWebhookRegistrationSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  events: z.array(VagaroWebhookEventSchema),
  secret: z.string().min(32),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  lastDeliveredAt: z.string().datetime().optional().nullable(),
  failureCount: z.number().int().min(0).default(0),
});
export type VagaroWebhookRegistration = z.infer<typeof VagaroWebhookRegistrationSchema>;

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
    street: z.string().optional(),
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
  source: z.literal("vagaro"),
  rawData: z.unknown().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type UnifiedCustomer = z.infer<typeof UnifiedCustomerSchema>;

export const UnifiedAppointmentSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string(),
  customerId: z.string(),
  employeeId: z.string(),
  serviceIds: z.array(z.string()).default([]),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: z.enum(["confirmed", "pending", "completed", "no_show", "cancelled", "rescheduled"]),
  notes: z.string().optional().nullable(),
  isRecurring: z.boolean().default(false),
  isOnlineBooking: z.boolean().default(false),
  totalPrice: z.number().min(0).optional().nullable(),
  totalDuration: z.number().int().min(0).optional().nullable(),
  cancellationReason: z.string().optional().nullable(),
  source: z.literal("vagaro"),
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
  source: z.literal("vagaro"),
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
  status: z.enum(["in_stock", "low_stock", "out_of_stock", "discontinued"]).default("in_stock"),
  isActive: z.boolean().default(true),
  isRetail: z.boolean().default(true),
  imageUrl: z.string().optional().nullable(),
  source: z.literal("vagaro"),
  rawData: z.unknown().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type UnifiedInventoryItem = z.infer<typeof UnifiedInventoryItemSchema>;

// ═══════════════════════════════════════════════════════════════
// Error Types
// ═══════════════════════════════════════════════════════════════

export const VagaroErrorCodeSchema = z.enum([
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
export type VagaroErrorCode = z.infer<typeof VagaroErrorCodeSchema>;

export const VagaroApiErrorSchema = z.object({
  code: VagaroErrorCodeSchema,
  message: z.string(),
  statusCode: z.number().int().optional(),
  vagaroCode: z.string().optional().describe("Vagaro-specific error code if any"),
  vagaroMessage: z.string().optional(),
  requestId: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  retryable: z.boolean().default(false),
  retryAfterMs: z.number().int().optional(),
});
export type VagaroApiError = z.infer<typeof VagaroApiErrorSchema>;

export class VagaroError extends Error {
  public readonly code: VagaroErrorCode;
  public readonly statusCode?: number;
  public readonly vagaroCode?: string;
  public readonly requestId?: string;
  public readonly details?: Record<string, unknown>;
  public readonly retryable: boolean;
  public readonly retryAfterMs?: number;

  constructor(error: VagaroApiError) {
    super(error.message);
    this.name = "VagaroError";
    this.code = error.code;
    this.statusCode = error.statusCode;
    this.vagaroCode = error.vagaroCode;
    this.requestId = error.requestId;
    this.details = error.details;
    this.retryable = error.retryable;
    this.retryAfterMs = error.retryAfterMs;
  }

  toJSON(): VagaroApiError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      vagaroCode: this.vagaroCode,
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
  "customers",
  "appointments",
  "services",
  "inventory",
  "employees",
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
    error: VagaroApiErrorSchema,
    timestamp: z.string().datetime(),
  })).optional().default([]),
  metadata: z.record(z.unknown()).optional(),
});
export type SyncRun = z.infer<typeof SyncRunSchema>;
