/**
 * Multi-tenant Square client manager
 * Each salon stores their own Square access token in the database
 * Uses Prisma square_connections table for persistence
 */

import { prisma } from './prisma';

const SQUARE_APP_ID = process.env.SQUARE_APP_ID || '';
const SQUARE_APP_SECRET = process.env.SQUARE_APP_SECRET || '';

function getSquareEnv() {
  const { SquareEnvironment } = require('square');
  return process.env.SQUARE_ENVIRONMENT === 'production'
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox;
}

function getSquareEnvName(): string {
  return process.env.SQUARE_ENVIRONMENT || 'sandbox';
}

// Square OAuth URLs
export // Lazy-loaded URLs based on environment
function getOAuthUrl() {
  return process.env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com/oauth2/authorize'
    : 'https://connect.squareupsandbox.com/oauth2/authorize';
}

export const SQUARE_OAUTH_URL = { get value() { return getOAuthUrl(); } };
export const SQUARE_TOKEN_URL = { get value() {
  return process.env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com/oauth2/token'
    : 'https://connect.squareupsandbox.com/oauth2/token';
} };

// ── Salon Square Connections (persisted in database) ──

export interface SalonSquareConnection {
  salon_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  merchant_id: string;
  location_ids: string[];
  business_name: string;
  connected_at: string;
  catalog_synced_at?: string;
}

/**
 * Store a salon's Square connection in the database
 */
export async function saveConnection(connection: SalonSquareConnection): Promise<void> {
  await prisma.square_connections.upsert({
    where: { salon_id: connection.salon_id },
    update: {
      square_merchant_id: connection.merchant_id,
      access_token_encrypted: connection.access_token,
      refresh_token_encrypted: connection.refresh_token,
      token_expires_at: new Date(connection.expires_at),
      status: 'connected',
      square_location_id: connection.location_ids[0] || null,
      square_location_name: connection.business_name,
      last_sync_at: connection.catalog_synced_at ? new Date(connection.catalog_synced_at) : null,
      updated_at: new Date(),
    },
    create: {
      salon_id: connection.salon_id,
      square_merchant_id: connection.merchant_id,
      access_token_encrypted: connection.access_token,
      refresh_token_encrypted: connection.refresh_token,
      token_expires_at: new Date(connection.expires_at),
      status: 'connected',
      square_location_id: connection.location_ids[0] || null,
      square_location_name: connection.business_name,
      created_at: new Date(connection.connected_at),
      updated_at: new Date(),
    },
  });
}

/**
 * Get a salon's Square connection from the database
 */
export async function getConnection(salonId: string): Promise<SalonSquareConnection | undefined> {
  const row = await prisma.square_connections.findUnique({
    where: { salon_id: salonId },
  });
  if (!row) return undefined;

  return {
    salon_id: row.salon_id,
    access_token: row.access_token_encrypted || '',
    refresh_token: row.refresh_token_encrypted || '',
    expires_at: row.token_expires_at?.toISOString() || '',
    merchant_id: row.square_merchant_id || '',
    location_ids: row.square_location_id ? [row.square_location_id] : [],
    business_name: row.square_location_name || '',
    connected_at: row.created_at?.toISOString() || '',
    catalog_synced_at: row.last_sync_at?.toISOString() || undefined,
  };
}

/**
 * Remove a salon's Square connection from the database
 */
export async function removeConnection(salonId: string): Promise<void> {
  await prisma.square_connections.deleteMany({
    where: { salon_id: salonId },
  });
}

/**
 * Check if a salon has an active Square connection
 */
export async function isConnected(salonId: string): Promise<boolean> {
  const row = await prisma.square_connections.findUnique({
    where: { salon_id: salonId },
  });
  if (!row) return false;
  if (row.status !== 'connected') return false;
  if (!row.token_expires_at) return false;
  return new Date(row.token_expires_at) > new Date();
}

/**
 * Create a Square client for a specific salon
 */
export async function createSalonClient(salonId: string): Promise<any | null> {
  const conn = await getConnection(salonId);
  if (!conn) return null;

  const { SquareClient } = require('square');
  return new SquareClient({
    token: conn.access_token,
    environment: getSquareEnv(),
  });
}

/**
 * Exchange OAuth authorization code for access token
 */
export async function exchangeAuthCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_at: string;
  merchant_id: string;
}> {
  const response = await fetch(SQUARE_TOKEN_URL.value, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: SQUARE_APP_ID,
      client_secret: SQUARE_APP_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Square OAuth failed: ${error}`);
  }

  return response.json();
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_at: string;
}> {
  const response = await fetch(SQUARE_TOKEN_URL.value, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: SQUARE_APP_ID,
      client_secret: SQUARE_APP_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Square token');
  }

  return response.json();
}

/**
 * Build the Square OAuth authorization URL
 */
export function getAuthUrl(salonId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: SQUARE_APP_ID,
    scope: 'ITEMS_READ INVENTORY_READ INVENTORY_WRITE MERCHANT_PROFILE_READ PAYMENTS_READ',
    session: 'false',
    state: salonId,
  });
  return `${getOAuthUrl()}?${params.toString()}`;
}

/**
 * List all connected salons (admin use)
 */
export async function listConnections(): Promise<SalonSquareConnection[]> {
  const rows = await prisma.square_connections.findMany({
    where: { status: 'connected' },
  });
  return rows.map((row) => ({
    salon_id: row.salon_id,
    access_token: row.access_token_encrypted || '',
    refresh_token: row.refresh_token_encrypted || '',
    expires_at: row.token_expires_at?.toISOString() || '',
    merchant_id: row.square_merchant_id || '',
    location_ids: row.square_location_id ? [row.square_location_id] : [],
    business_name: row.square_location_name || '',
    connected_at: row.created_at?.toISOString() || '',
    catalog_synced_at: row.last_sync_at?.toISOString() || undefined,
  }));
}

// App credentials
export const appId = SQUARE_APP_ID;
export const appSecret = SQUARE_APP_SECRET;
