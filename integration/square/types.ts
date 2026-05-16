/**
 * Square Integration — Type Definitions
 * Strict TypeScript types for all Square API interactions
 */

// ---------------------------------------------------------------------------
// OAuth & Tokens
// ---------------------------------------------------------------------------

export interface SquareTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp (seconds)
  token_type: 'Bearer';
  merchant_id: string;
  scopes: string[];
}

export interface SquareTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_at: string; // ISO 8601 from Square
  merchant_id: string;
  refresh_token: string;
  short_lived: boolean;
}

export interface SquareRefreshResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_at: string;
  merchant_id: string;
  refresh_token?: string;
}

// ---------------------------------------------------------------------------
// API Client
// ---------------------------------------------------------------------------

export interface SquareApiConfig {
  baseUrl: string;
  apiVersion: string;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
  rateLimitPerSecond: number;
}

export interface SquareApiError {
  type: 'API_ERROR' | 'RATE_LIMITED' | 'AUTH_ERROR' | 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN';
  code: string;
  detail: string;
  field?: string;
  category?: string;
  statusCode?: number;
  retryable: boolean;
}

export interface SquarePaginatedResponse<T> {
  data: T[];
  cursor?: string;
  hasMore: boolean;
}

export interface SquareApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export interface SquareCustomer {
  id: string;
  created_at: string;
  updated_at: string;
  given_name?: string;
  family_name?: string;
  email_address?: string;
  phone_number?: string;
  company_name?: string;
  birthday?: string; // YYYY-MM-DD
  reference_id?: string;
  note?: string;
  address?: SquareAddress;
  preferences?: SquareCustomerPreferences;
  creation_source?: string;
  version: number;
}

export interface SquareAddress {
  address_line_1?: string;
  address_line_2?: string;
  locality?: string;
  sublocality?: string;
  administrative_district_level_1?: string;
  postal_code?: string;
  country?: string;
}

export interface SquareCustomerPreferences {
  email_unsubscribed?: boolean;
}

// ---------------------------------------------------------------------------
// Payments / Transactions
// ---------------------------------------------------------------------------

export interface SquarePayment {
  id: string;
  created_at: string;
  updated_at: string;
  amount_money: SquareMoney;
  tip_money?: SquareMoney;
  total_money?: SquareMoney;
  app_fee_money?: SquareMoney;
  processing_fee?: SquareProcessingFee[];
  status: 'APPROVED' | 'PENDING' | 'COMPLETED' | 'CANCELED' | 'FAILED';
  delay_duration?: string;
  delay_action?: 'CANCEL' | 'COMPLETE';
  delayed_until?: string;
  source_type: string;
  card_details?: SquareCardDetails;
  location_id?: string;
  order_id?: string;
  reference_id?: string;
  verification_token?: string;
  buyer_email_address?: string;
  buyer_phone_number?: string;
  billing_address?: SquareAddress;
  shipping_address?: SquareAddress;
  note?: string;
  statement_description?: string;
  cash_details?: SquareCashDetails;
  external_details?: SquareExternalDetails;
  version: number;
}

export interface SquareMoney {
  amount: number; // cents
  currency: string; // ISO 4217
}

export interface SquareProcessingFee {
  effective_at: string;
  type: string;
  amount_money: SquareMoney;
}

export interface SquareCardDetails {
  status: string;
  card: SquareCard;
  entry_method: string;
  cvv_status?: string;
  avs_status?: string;
  auth_result_code?: string;
  statement_description?: string;
}

export interface SquareCard {
  card_brand: string;
  last_4: string;
  exp_month: number;
  exp_year: number;
  fingerprint?: string;
  card_type?: string;
  prepaid_type?: string;
  bin?: string;
}

export interface SquareCashDetails {
  buyer_supplied_money?: SquareMoney;
  change_back_money?: SquareMoney;
}

export interface SquareExternalDetails {
  type: string;
  source: string;
  source_id?: string;
}

// ---------------------------------------------------------------------------
// Bookings / Appointments
// ---------------------------------------------------------------------------

export interface SquareBooking {
  id: string;
  version: number;
  status: 'ACCEPTED' | 'PENDING' | 'DECLINED' | 'DEPARTED' | 'CANCELLED' | 'NO_SHOW';
  created_at: string;
  updated_at: string;
  start_at: string;
  location_id: string;
  customer_id?: string;
  customer_note?: string;
  seller_note?: string;
  appointment_segments: SquareAppointmentSegment[];
  transition_time_minutes?: number;
  creator_details?: SquareBookingCreatorDetails;
  source?: string;
}

export interface SquareAppointmentSegment {
  duration_minutes: number;
  service_variation?: SquareCatalogObjectReference;
  team_member_id?: string;
  service_variation_version?: number;
  intermission_duration_minutes?: number;
  any_team_member?: boolean;
}

export interface SquareCatalogObjectReference {
  object_id?: string;
  catalog_version?: number;
}

export interface SquareBookingCreatorDetails {
  creator_type: 'TEAM_MEMBER' | 'CUSTOMER';
  team_member_id?: string;
  customer_id?: string;
}

// ---------------------------------------------------------------------------
// Catalog / Inventory
// ---------------------------------------------------------------------------

export type SquareCatalogObjectType =
  | 'ITEM'
  | 'ITEM_VARIATION'
  | 'CATEGORY'
  | 'DISCOUNT'
  | 'TAX'
  | 'MODIFIER'
  | 'MODIFIER_LIST'
  | 'PRICING_RULE'
  | 'PRODUCT_SET'
  | 'TIME_PERIOD'
  | 'MEASUREMENT_UNIT'
  | 'SUBSCRIPTION_PLAN'
  | 'ITEM_OPTION'
  | 'ITEM_OPTION_VAL'
  | 'QUICK_AMOUNT_SETTINGS';

export interface SquareCatalogObject {
  type: SquareCatalogObjectType;
  id: string;
  updated_at: string;
  version: number;
  is_deleted?: boolean;
  present_at_all_locations?: boolean;
  present_at_location_ids?: string[];
  absent_at_location_ids?: string[];
  item_data?: SquareCatalogItem;
  item_variation_data?: SquareCatalogItemVariation;
  category_data?: SquareCatalogCategory;
  tax_data?: SquareCatalogTax;
  discount_data?: SquareCatalogDiscount;
  modifier_list_data?: SquareCatalogModifierList;
  modifier_data?: SquareCatalogModifier;
}

export interface SquareCatalogItem {
  name?: string;
  description?: string;
  abbreviation?: string;
  label_color?: string;
  available_online?: boolean;
  available_for_pickup?: boolean;
  available_electronically?: boolean;
  category_id?: string;
  tax_ids?: string[];
  modifier_list_info?: SquareCatalogItemModifierListInfo[];
  variations?: SquareCatalogObject[];
  product_type?: 'REGULAR' | 'GIFT_CARD';
  skip_modifier_screen?: boolean;
  item_options?: SquareCatalogItemOptionForItem[];
  image_ids?: string[];
  sort_name?: string;
  description_html?: string;
  description_plaintext?: string;
}

export interface SquareCatalogItemVariation {
  item_id?: string;
  name?: string;
  sku?: string;
  upc?: string;
  ordinal?: number;
  pricing_type?: 'FIXED_PRICING' | 'VARIABLE_PRICING';
  price_money?: SquareMoney;
  location_overrides?: SquareItemVariationLocationOverride[];
  track_inventory?: boolean;
  inventory_alert_type?: 'NONE' | 'LOW_QUANTITY' | 'HIGH_QUANTITY';
  inventory_alert_threshold?: number;
  user_data?: string;
  service_duration?: number;
  available_for_booking?: boolean;
  item_option_values?: SquareCatalogItemOptionValueForItemVariation[];
  measurement_unit_id?: string;
  sellable?: boolean;
  stockable?: boolean;
  image_ids?: string[];
  team_member_ids?: string[];
  stockable_conversion?: SquareCatalogStockConversion;
  item_variation_vendor_info_ids?: string[];
}

export interface SquareCatalogCategory {
  name?: string;
  image_ids?: string[];
}

export interface SquareCatalogTax {
  name?: string;
  calculation_phase?: 'TAX_SUBTOTAL_PHASE' | 'TAX_TOTAL_PHASE';
  inclusion_type?: 'ADDITIVE' | 'INCLUSIVE';
  percentage?: string;
  applies_to_custom_amounts?: boolean;
  enabled?: boolean;
}

export interface SquareCatalogDiscount {
  name?: string;
  discount_type?: 'FIXED_PERCENTAGE' | 'FIXED_AMOUNT' | 'VARIABLE_PERCENTAGE' | 'VARIABLE_AMOUNT';
  percentage?: string;
  amount_money?: SquareMoney;
  pin_required?: boolean;
  label_color?: string;
  modify_tax_basis?: 'MODIFY_TAX_BASIS' | 'DO_NOT_MODIFY_TAX_BASIS';
}

export interface SquareCatalogModifierList {
  name?: string;
  ordinal?: number;
  selection_type?: 'SINGLE' | 'MULTIPLE';
  modifiers?: SquareCatalogObject[];
  image_ids?: string[];
}

export interface SquareCatalogModifier {
  name?: string;
  price_money?: SquareMoney;
  ordinal?: number;
  modifier_list_id?: string;
}

export interface SquareCatalogItemModifierListInfo {
  modifier_list_id?: string;
  modifier_overrides?: SquareCatalogModifierOverride[];
  min_selected_modifiers?: number;
  max_selected_modifiers?: number;
  enabled?: boolean;
  ordinal?: number;
}

export interface SquareCatalogModifierOverride {
  modifier_id?: string;
  on_by_default?: boolean;
}

export interface SquareItemVariationLocationOverride {
  location_id?: string;
  price_money?: SquareMoney;
  pricing_type?: 'FIXED_PRICING' | 'VARIABLE_PRICING';
  track_inventory?: boolean;
  inventory_alert_type?: 'NONE' | 'LOW_QUANTITY' | 'HIGH_QUANTITY';
  inventory_alert_threshold?: number;
  sold_out?: boolean;
  sold_out_valid_until?: string;
}

export interface SquareCatalogItemOptionForItem {
  item_option_id?: string;
}

export interface SquareCatalogItemOptionValueForItemVariation {
  item_option_id?: string;
  item_option_value_id?: string;
}

export interface SquareCatalogStockConversion {
  stockable_item_variation_id?: string;
  stockable_quantity?: string;
  nonstockable_quantity?: string;
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export interface SquareInventoryCount {
  catalog_object_id: string;
  catalog_object_type: string;
  state: 'IN_STOCK' | 'SOLD' | 'RETURNED_BY_CUSTOMER' | 'RESERVED_FOR_SALE' | 'SOLD_ONLINE' | 'ORDERED_FROM_VENDOR' | 'RECEIVED_FROM_VENDOR' | 'IN_TRANSIT_TO' | 'NONE' | 'WASTE' | 'ADJUSTMENT' | 'RETURN_TO_VENDOR';
  location_id?: string;
  quantity?: string;
  calculated_at?: string;
  is_estimated?: boolean;
}

export interface SquareInventoryAdjustment {
  id: string;
  reference_id?: string;
  from_state: string;
  to_state: string;
  location_id: string;
  catalog_object_id: string;
  catalog_object_type: string;
  quantity?: string;
  total_price_money?: SquareMoney;
  occurred_at?: string;
  created_at: string;
  source?: SquareSourceApplication;
  employee_id?: string;
  team_member_id?: string;
  transaction_id?: string;
  refund_id?: string;
  purchase_order_id?: string;
  goods_receipt_id?: string;
  adjustment_group?: SquareInventoryAdjustmentGroup;
}

export interface SquareSourceApplication {
  product?: string;
  application_id?: string;
  name?: string;
}

export interface SquareInventoryAdjustmentGroup {
  id: string;
  root_adjustment_id?: string;
  from_state?: string;
  to_state?: string;
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

export interface SquareWebhookPayload {
  merchant_id: string;
  type: string; // e.g., "payment.created"
  event_id: string;
  created_at: string;
  data: SquareWebhookData;
}

export interface SquareWebhookData {
  type: string;
  id: string;
  object?: Record<string, unknown>;
}

export type SquareWebhookEventType =
  | 'payment.created'
  | 'payment.updated'
  | 'booking.created'
  | 'booking.updated'
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  | 'order.created'
  | 'order.updated'
  | 'inventory.count.updated'
  | 'catalog.version.updated';

export interface SquareWebhookConfig {
  signatureKey: string;
  notificationUrl: string;
  eventTypes: SquareWebhookEventType[];
}

// ---------------------------------------------------------------------------
// Unified Models (COLORgenius Domain)
// ---------------------------------------------------------------------------

export interface UnifiedCustomer {
  id: string; // internal UUID
  externalId: string; // Square customer id
  platform: 'square';
  merchantId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  birthday?: string; // ISO 8601
  address?: UnifiedAddress;
  preferences?: Record<string, unknown>;
  notes?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  rawData?: Record<string, unknown>;
}

export interface UnifiedAddress {
  line1?: string;
  line2?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface UnifiedTransaction {
  id: string;
  externalId: string;
  platform: 'square';
  merchantId: string;
  customerId?: string;
  amount: number; // normalized to major unit (e.g., dollars)
  currency: string;
  tipAmount?: number;
  feeAmount?: number;
  netAmount?: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  cardLastFour?: string;
  cardBrand?: string;
  locationId?: string;
  orderId?: string;
  referenceId?: string;
  note?: string;
  processedAt: string; // ISO 8601
  rawData?: Record<string, unknown>;
}

export interface UnifiedAppointment {
  id: string;
  externalId: string;
  platform: 'square';
  merchantId: string;
  customerId?: string;
  locationId: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show' | 'declined';
  startAt: string; // ISO 8601
  endAt?: string; // ISO 8601
  serviceName?: string;
  serviceVariationId?: string;
  staffId?: string;
  staffName?: string;
  customerNote?: string;
  sellerNote?: string;
  createdAt: string;
  updatedAt: string;
  rawData?: Record<string, unknown>;
}

export interface UnifiedInventoryItem {
  id: string;
  externalId: string;
  platform: 'square';
  merchantId: string;
  type: 'product' | 'service' | 'category' | 'discount' | 'tax' | 'modifier';
  name: string;
  description?: string;
  sku?: string;
  upc?: string;
  categoryId?: string;
  categoryName?: string;
  price?: number; // major unit
  currency?: string;
  pricingType?: 'fixed' | 'variable';
  trackInventory?: boolean;
  quantity?: number;
  availableForBooking?: boolean;
  serviceDuration?: number; // minutes
  isDeleted: boolean;
  locationIds?: string[];
  variationIds?: string[];
  imageUrls?: string[];
  createdAt?: string;
  updatedAt: string;
  rawData?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

export type SyncDataType = 'customers' | 'payments' | 'bookings' | 'catalog' | 'inventory';

export interface SyncState {
  id: string;
  merchantId: string;
  dataType: SyncDataType;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'partial';
  startedAt?: string;
  completedAt?: string;
  cursor?: string;
  itemsProcessed: number;
  itemsTotal?: number;
  itemsFailed: number;
  errors: SyncError[];
  createdAt: string;
  updatedAt: string;
}

export interface SyncError {
  itemId?: string;
  code: string;
  message: string;
  timestamp: string;
  retryable: boolean;
}

export interface SyncOptions {
  dataTypes?: SyncDataType[];
  incremental?: boolean;
  since?: string; // ISO 8601
  cursor?: Record<SyncDataType, string | undefined>;
  batchSize?: number;
  onProgress?: (progress: SyncProgress) => void | Promise<void>;
}

export interface SyncProgress {
  dataType: SyncDataType;
  phase: 'fetching' | 'transforming' | 'saving' | 'complete';
  current: number;
  total?: number;
  cursor?: string;
  hasMore: boolean;
}

// ---------------------------------------------------------------------------
// Queue
// ---------------------------------------------------------------------------

export interface QueueMessage {
  id: string;
  payload: unknown;
  metadata: {
    source: 'webhook' | 'sync' | 'manual';
    eventType?: string;
    receivedAt: string;
    attempts: number;
    maxAttempts: number;
  };
}

export interface QueueInterface {
  enqueue(message: QueueMessage): Promise<void>;
  dequeue(): Promise<QueueMessage | null>;
  ack(messageId: string): Promise<void>;
  nack(messageId: string, requeue?: boolean): Promise<void>;
}

// ---------------------------------------------------------------------------
// Token Storage
// ---------------------------------------------------------------------------

export interface TokenStorage {
  get(merchantId: string): Promise<SquareTokens | null>;
  set(merchantId: string, tokens: SquareTokens): Promise<void>;
  delete(merchantId: string): Promise<void>;
  list(): Promise<string[]>; // merchant IDs
}

// ---------------------------------------------------------------------------
// Environment Config
// ---------------------------------------------------------------------------

export interface SquareEnvConfig {
  SQUARE_APPLICATION_ID: string;
  SQUARE_APPLICATION_SECRET: string;
  SQUARE_API_BASE_URL: string;
  SQUARE_API_VERSION: string;
  SQUARE_WEBHOOK_SIGNATURE_KEY: string;
  SQUARE_WEBHOOK_NOTIFICATION_URL: string;
  SQUARE_OAUTH_REDIRECT_URL: string;
  SQUARE_OAUTH_SCOPES: string;
}
