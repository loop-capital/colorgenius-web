/**
 * Multi-tenant Square client manager
 * Each salon stores their own Square access token
 * This module creates per-salon Square clients on demand
 */

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

// ── Salon Square Connections (in-memory for now, database in production) ──

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

// In-memory store — in production this would be a database table
const salonConnections = new Map<string, SalonSquareConnection>();

/**
 * Store a salon's Square connection
 */
export function saveConnection(connection: SalonSquareConnection) {
  salonConnections.set(connection.salon_id, connection);
}

/**
 * Get a salon's Square connection
 */
export function getConnection(salonId: string): SalonSquareConnection | undefined {
  return salonConnections.get(salonId);
}

/**
 * Remove a salon's Square connection
 */
export function removeConnection(salonId: string) {
  salonConnections.delete(salonId);
}

/**
 * Check if a salon has an active Square connection
 */
export function isConnected(salonId: string): boolean {
  const conn = salonConnections.get(salonId);
  if (!conn) return false;
  return new Date(conn.expires_at) > new Date();
}

/**
 * Create a Square client for a specific salon
 */
export function createSalonClient(salonId: string): any | null {
  const conn = salonConnections.get(salonId);
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
  const response = await fetch(SQUARE_TOKEN_URL, {
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
  const response = await fetch(SQUARE_TOKEN_URL, {
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
export function listConnections(): SalonSquareConnection[] {
  return Array.from(salonConnections.values());
}

// App credentials
export const appId = SQUARE_APP_ID;
export const appSecret = SQUARE_APP_SECRET;
