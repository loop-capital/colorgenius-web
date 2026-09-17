/**
 * Multi-tenant Clover client manager — same shape as lib/square-multi.ts.
 * Each salon connects their own Clover merchant account via OAuth2; tokens
 * are stored encrypted per-salon in clover_connections.
 *
 * Requires CLOVER_APP_ID / CLOVER_APP_SECRET from a Clover developer
 * account (docs.clover.com) — sandbox signup is self-serve and immediate;
 * production apps need Clover's approval before going live with real
 * merchants.
 */

import { prisma } from './prisma';
import { encryptSecret, decryptSecret } from './secrets';

const CLOVER_APP_ID = process.env.CLOVER_APP_ID || '';
const CLOVER_APP_SECRET = process.env.CLOVER_APP_SECRET || '';
const isProd = process.env.CLOVER_ENVIRONMENT === 'production';

const CLOVER_BASE = isProd ? 'https://www.clover.com' : 'https://sandbox.dev.clover.com';
const CLOVER_API_BASE = isProd ? 'https://api.clover.com' : 'https://apisandbox.dev.clover.com';

export function getAuthUrl(salonId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: CLOVER_APP_ID,
    redirect_uri: redirectUri,
    state: salonId,
  });
  return `${CLOVER_BASE}/oauth/authorize?${params.toString()}`;
}

export async function exchangeAuthCode(code: string): Promise<{ access_token: string; merchant_id: string }> {
  const params = new URLSearchParams({
    client_id: CLOVER_APP_ID,
    client_secret: CLOVER_APP_SECRET,
    code,
  });
  const response = await fetch(`${CLOVER_BASE}/oauth/token?${params.toString()}`, { method: 'GET' });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Clover OAuth failed: ${error}`);
  }
  const data = await response.json();
  // Clover's token response nests merchant info under access_token.merchant.id
  // for some app types and top-level for others — normalize both.
  const merchantId = data.merchant_id || data.access_token?.merchant?.id || '';
  return { access_token: data.access_token?.token || data.access_token, merchant_id: merchantId };
}

export interface CloverConnection {
  salon_id: string;
  access_token: string;
  merchant_id: string;
  merchant_name: string;
}

export async function saveConnection(conn: CloverConnection): Promise<void> {
  const encrypted = encryptSecret(conn.access_token);
  await prisma.clover_connections.upsert({
    where: { salon_id: conn.salon_id },
    update: {
      merchant_id: conn.merchant_id,
      merchant_name: conn.merchant_name,
      access_token_encrypted: encrypted,
      status: 'connected',
      updated_at: new Date(),
    },
    create: {
      salon_id: conn.salon_id,
      merchant_id: conn.merchant_id,
      merchant_name: conn.merchant_name,
      access_token_encrypted: encrypted,
      status: 'connected',
    },
  });
}

export async function getConnection(salonId: string): Promise<CloverConnection | null> {
  const row = await prisma.clover_connections.findUnique({ where: { salon_id: salonId } });
  if (!row || row.status !== 'connected' || !row.access_token_encrypted) return null;
  try {
    return {
      salon_id: salonId,
      access_token: decryptSecret(row.access_token_encrypted),
      merchant_id: row.merchant_id || '',
      merchant_name: row.merchant_name || '',
    };
  } catch {
    return null;
  }
}

export async function removeConnection(salonId: string): Promise<void> {
  await prisma.clover_connections.deleteMany({ where: { salon_id: salonId } });
}

/**
 * Create a real order on the salon's own Clover merchant, one line item
 * per priced step, then add the line items (Clover creates an empty order
 * first, then line items are POSTed to it as a sub-resource).
 */
export async function createCloverOrder(
  conn: CloverConnection,
  lineItems: { name: string; priceCents: number }[]
): Promise<{ orderId: string }> {
  const headers = {
    Authorization: `Bearer ${conn.access_token}`,
    'Content-Type': 'application/json',
  };

  const orderRes = await fetch(`${CLOVER_API_BASE}/v3/merchants/${conn.merchant_id}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ state: 'open' }),
  });
  if (!orderRes.ok) throw new Error(`Clover order creation failed: ${await orderRes.text()}`);
  const order = await orderRes.json();

  for (const item of lineItems) {
    const itemRes = await fetch(`${CLOVER_API_BASE}/v3/merchants/${conn.merchant_id}/orders/${order.id}/line_items`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: item.name, price: item.priceCents }),
    });
    if (!itemRes.ok) throw new Error(`Clover line item failed: ${await itemRes.text()}`);
  }

  return { orderId: order.id };
}
