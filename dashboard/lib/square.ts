// =====================================================
// SQUARE PAYMENT INTEGRATION
// Cost-plus pricing with Square (SDK v42+)
// =====================================================

import { SquareClient, SquareEnvironment } from 'square';

// ── Square Client ──
const token = process.env.SQUARE_ACCESS_TOKEN || '';
const environment = process.env.SQUARE_ENVIRONMENT === 'production'
  ? SquareEnvironment.Production
  : SquareEnvironment.Sandbox;

export const squareClient = new SquareClient({
  token,
  environment,
});

// ── Subscription Tiers → Square Catalog Mapping ──
// These IDs will be populated after creating catalog items in Square Dashboard
export const SQUARE_CATALOG_ITEM_IDS: Record<string, string> = {
  solo: process.env.SQUARE_SOLO_ITEM_ID || 'PLACEHOLDER_SOLO',
  salon_small: process.env.SQUARE_SALON_SMALL_ITEM_ID || 'PLACEHOLDER_SALON_SMALL',
  salon_medium: process.env.SQUARE_SALON_MEDIUM_ITEM_ID || 'PLACEHOLDER_SALON_MEDIUM',
  salon_large: process.env.SQUARE_SALON_LARGE_ITEM_ID || 'PLACEHOLDER_SALON_LARGE',
  extra_line: process.env.SQUARE_EXTRA_LINE_ITEM_ID || 'PLACEHOLDER_EXTRA_LINE',
};

// ── Create Customer ──
export async function createSquareCustomer(params: {
  email: string;
  givenName: string;
  familyName?: string;
  phone?: string;
  referenceId: string; // Our user ID
}) {
  const idempotencyKey = crypto.randomUUID();

  const response = await squareClient.customers.create({
    idempotencyKey,
    emailAddress: params.email,
    givenName: params.givenName,
    familyName: params.familyName,
    phoneNumber: params.phone,
    referenceId: params.referenceId,
  });

  return response.customer;
}

// ── Create Subscription ──
export async function createSquareSubscription(params: {
  customerId: string;
  planId: string; // Square subscription plan ID
  startDate?: string; // ISO date, defaults to now
}) {
  const idempotencyKey = crypto.randomUUID();

  const response = await squareClient.subscriptions.create({
    idempotencyKey,
    locationId: process.env.SQUARE_LOCATION_ID || '',
    customerId: params.customerId,
    planVariationId: params.planId,
    startDate: params.startDate,
    timezone: 'America/New_York',
  });

  return response.subscription;
}

// ── Cancel Subscription ──
export async function cancelSquareSubscription(subscriptionId: string) {
  const response = await squareClient.subscriptions.cancel({
    subscriptionId,
  });
  return response.subscription;
}

// ── Get Customer ──
export async function getSquareCustomer(customerId: string) {
  const response = await squareClient.customers.get({ customerId });
  return response.customer;
}

// ── List Customer Cards ──
export async function listCustomerCards(customerId: string) {
  const response = await squareClient.cards.list({ customerId });
  return response.data;
}

// ── Create Payment (one-time) ──
export async function createSquarePayment(params: {
  sourceId: string; // card on file or nonce
  amountCents: number;
  customerId?: string;
  note?: string;
}) {
  const idempotencyKey = crypto.randomUUID();

  const response = await squareClient.payments.create({
    idempotencyKey,
    sourceId: params.sourceId,
    amountMoney: {
      amount: BigInt(params.amountCents),
      currency: 'USD',
    },
    customerId: params.customerId,
    note: params.note,
    autocomplete: true,
  });

  return response.payment;
}

// ── Inventory Counts ──
export async function getInventoryCounts(catalogObjectIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (!catalogObjectIds.length) return counts;
  const response = await squareClient.inventory.batchGetCounts({ catalogObjectIds });
  for (const count of response.data ?? []) {
    if (count.catalogObjectId) {
      counts.set(count.catalogObjectId, Number(count.quantity ?? 0));
    }
  }
  return counts;
}

// ── Verify Webhook Signature ──
import { WebhooksHelper } from 'square';

export async function verifySquareWebhookSignature(
  signature: string,
  body: string,
  url: string
): Promise<boolean> {
  try {
    const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '';
    return await WebhooksHelper.verifySignature({
      requestBody: body,
      signatureHeader: signature,
      signatureKey: key,
      notificationUrl: url,
    });
  } catch {
    return false;
  }
}
