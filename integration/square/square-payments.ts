/**
 * Square Payments Sync Module
 * Fetch transactions and map to UnifiedTransaction
 */

import { z } from 'zod';
import { SquareClient, SquareError } from './square-client';
import {
  type SquarePayment,
  type UnifiedTransaction,
  type SquarePaginatedResponse,
} from './types';

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const squareMoneySchema = z.object({
  amount: z.number(),
  currency: z.string(),
});

const squareProcessingFeeSchema = z.object({
  effective_at: z.string(),
  type: z.string(),
  amount_money: squareMoneySchema,
});

const squareCardSchema = z.object({
  card_brand: z.string(),
  last_4: z.string(),
  exp_month: z.number(),
  exp_year: z.number(),
  fingerprint: z.string().optional(),
  card_type: z.string().optional(),
  prepaid_type: z.string().optional(),
  bin: z.string().optional(),
});

const squareCardDetailsSchema = z.object({
  status: z.string(),
  card: squareCardSchema,
  entry_method: z.string(),
  cvv_status: z.string().optional(),
  avs_status: z.string().optional(),
  auth_result_code: z.string().optional(),
  statement_description: z.string().optional(),
});

const squareAddressSchema = z.object({
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  locality: z.string().optional(),
  sublocality: z.string().optional(),
  administrative_district_level_1: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

const squareCashDetailsSchema = z.object({
  buyer_supplied_money: squareMoneySchema.optional(),
  change_back_money: squareMoneySchema.optional(),
});

const squareExternalDetailsSchema = z.object({
  type: z.string(),
  source: z.string(),
  source_id: z.string().optional(),
});

const squarePaymentSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  amount_money: squareMoneySchema,
  tip_money: squareMoneySchema.optional(),
  total_money: squareMoneySchema.optional(),
  app_fee_money: squareMoneySchema.optional(),
  processing_fee: z.array(squareProcessingFeeSchema).optional(),
  status: z.enum(['APPROVED', 'PENDING', 'COMPLETED', 'CANCELED', 'FAILED']),
  delay_duration: z.string().optional(),
  delay_action: z.enum(['CANCEL', 'COMPLETE']).optional(),
  delayed_until: z.string().optional(),
  source_type: z.string(),
  card_details: squareCardDetailsSchema.optional(),
  location_id: z.string().optional(),
  order_id: z.string().optional(),
  reference_id: z.string().optional(),
  verification_token: z.string().optional(),
  buyer_email_address: z.string().optional(),
  buyer_phone_number: z.string().optional(),
  billing_address: squareAddressSchema.optional(),
  shipping_address: squareAddressSchema.optional(),
  note: z.string().optional(),
  statement_description: z.string().optional(),
  cash_details: squareCashDetailsSchema.optional(),
  external_details: squareExternalDetailsSchema.optional(),
  version: z.number(),
}).passthrough();

// ---------------------------------------------------------------------------
// Status mapping
// ---------------------------------------------------------------------------

function mapStatus(status: SquarePayment['status']): UnifiedTransaction['status'] {
  switch (status) {
    case 'APPROVED':
    case 'COMPLETED':
      return 'completed';
    case 'PENDING':
      return 'pending';
    case 'CANCELED':
      return 'cancelled';
    case 'FAILED':
      return 'failed';
    default:
      return 'pending';
  }
}

function mapPaymentMethod(sourceType: string, cardDetails?: { card: { card_brand: string } }): string {
  switch (sourceType) {
    case 'CARD':
      return cardDetails?.card?.card_brand ?? 'card';
    case 'CASH':
      return 'cash';
    case 'EXTERNAL':
      return 'external';
    case 'BANK_ACCOUNT':
      return 'bank_transfer';
    case 'WALLET':
      return 'wallet';
    case 'BUY_NOW_PAY_LATER':
      return 'bnpl';
    default:
      return sourceType.toLowerCase();
  }
}

// ---------------------------------------------------------------------------
// SquarePayments class
// ---------------------------------------------------------------------------

export class SquarePayments {
  private readonly client: SquareClient;

  constructor(client: SquareClient) {
    this.client = client;
  }

  // -----------------------------------------------------------------------
  // Fetch
  // -----------------------------------------------------------------------

  /**
   * Fetch a single payment by ID
   */
  async getPayment(merchantId: string, paymentId: string): Promise<UnifiedTransaction | null> {
    try {
      const response = await this.client.get<{ payment?: unknown }>(
        merchantId,
        `/payments/${paymentId}`,
      );

      if (!response.payment) return null;

      const validated = squarePaymentSchema.safeParse(response.payment);
      if (!validated.success) {
        throw new PaymentSyncError(
          'VALIDATION_FAILED',
          `Payment ${paymentId} failed validation: ${validated.error.message}`,
        );
      }

      return this.normalizePayment(validated.data, merchantId);
    } catch (error) {
      if (error instanceof SquareError && error.code === 'NOT_FOUND') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Fetch all payments with optional filters
   */
  async getAllPayments(
    merchantId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      locationId?: string;
      cursor?: string;
      limit?: number;
    } = {},
  ): Promise<{ transactions: UnifiedTransaction[]; cursor?: string }> {
    const query: Record<string, string | number | undefined> = {
      limit: options.limit ?? 100,
    };

    if (options.startDate) {
      query.begin_time = options.startDate.toISOString();
    }
    if (options.endDate) {
      query.end_time = options.endDate.toISOString();
    }
    if (options.locationId) {
      query.location_id = options.locationId;
    }
    if (options.cursor) {
      query.cursor = options.cursor;
    }

    const response = await this.client.get<{
      payments?: unknown[];
      cursor?: string;
      errors?: unknown[];
    }>(merchantId, '/payments', query);

    if (response.errors?.length) {
      throw new PaymentSyncError(
        'FETCH_FAILED',
        `Payments fetch failed: ${JSON.stringify(response.errors)}`,
      );
    }

    const transactions: UnifiedTransaction[] = [];
    for (const raw of response.payments ?? []) {
      const validated = squarePaymentSchema.safeParse(raw);
      if (!validated.success) {
        console.warn(`Payment validation failed, skipping: ${validated.error.message}`);
        continue;
      }
      transactions.push(this.normalizePayment(validated.data, merchantId));
    }

    return { transactions, cursor: response.cursor };
  }

  /**
   * Fetch all payments via pagination (auto-cursor)
   */
  async getAllPaymentsPaginated(
    merchantId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      locationId?: string;
      onProgress?: (processed: number) => void;
    } = {},
  ): Promise<UnifiedTransaction[]> {
    const results: UnifiedTransaction[] = [];
    let cursor: string | undefined;

    do {
      const page = await this.getAllPayments(merchantId, {
        ...options,
        cursor,
        limit: 100,
      });

      results.push(...page.transactions);
      cursor = page.cursor;

      options.onProgress?.(results.length);
    } while (cursor);

    return results;
  }

  /**
   * Fetch payments by order ID
   */
  async getPaymentsByOrderId(merchantId: string, orderId: string): Promise<UnifiedTransaction[]> {
    const response = await this.client.get<{
      payments?: unknown[];
      errors?: unknown[];
    }>(merchantId, '/payments', { order_id: orderId });

    if (response.errors?.length) {
      throw new PaymentSyncError(
        'FETCH_FAILED',
        `Payments by order fetch failed: ${JSON.stringify(response.errors)}`,
      );
    }

    const transactions: UnifiedTransaction[] = [];
    for (const raw of response.payments ?? []) {
      const validated = squarePaymentSchema.safeParse(raw);
      if (!validated.success) {
        console.warn(`Payment validation failed, skipping: ${validated.error.message}`);
        continue;
      }
      transactions.push(this.normalizePayment(validated.data, merchantId));
    }

    return transactions;
  }

  /**
   * Fetch payments by customer ID
   */
  async getPaymentsByCustomerId(
    merchantId: string,
    customerId: string,
  ): Promise<UnifiedTransaction[]> {
    // Square Payments API doesn't have a direct customer filter.
    // We use the Orders API to find orders for the customer, then get payments.
    // Alternative: fetch all payments and filter client-side (acceptable for small data)
    const all = await this.getAllPaymentsPaginated(merchantId);
    return all.filter((t) => {
      // Best-effort: payments don't always expose customer_id directly
      // This is a limitation of the Square Payments API
      return t.rawData?.customer_id === customerId;
    });
  }

  // -----------------------------------------------------------------------
  // Normalization
  // -----------------------------------------------------------------------

  private normalizePayment(payment: SquarePayment, merchantId: string): UnifiedTransaction {
    const amountMajor = payment.amount_money.amount / 100;
    const tipMajor = payment.tip_money ? payment.tip_money.amount / 100 : undefined;
    const feeTotal = payment.processing_fee
      ? payment.processing_fee.reduce((sum, f) => sum + f.amount_money.amount, 0)
      : 0;
    const feeMajor = feeTotal / 100;
    const netMajor = amountMajor - feeMajor;

    return {
      id: `sq_${payment.id}`,
      externalId: payment.id,
      platform: 'square',
      merchantId,
      customerId: payment.buyer_email_address, // Best-effort; customer_id not always present
      amount: amountMajor,
      currency: payment.amount_money.currency,
      tipAmount: tipMajor,
      feeAmount: feeMajor,
      netAmount: netMajor,
      status: mapStatus(payment.status),
      paymentMethod: mapPaymentMethod(payment.source_type, payment.card_details),
      cardLastFour: payment.card_details?.card.last_4,
      cardBrand: payment.card_details?.card.card_brand,
      locationId: payment.location_id,
      orderId: payment.order_id,
      referenceId: payment.reference_id,
      note: payment.note,
      processedAt: payment.created_at,
      rawData: payment as unknown as Record<string, unknown>,
    };
  }
}

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

export class PaymentSyncError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'PaymentSyncError';
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PaymentSyncError);
    }
  }
}
