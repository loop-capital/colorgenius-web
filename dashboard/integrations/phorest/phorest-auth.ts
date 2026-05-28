/**
 * Phorest Authentication Module
 *
 * Phorest uses Basic HTTP Authentication with username + password.
 * Username format: "global/email@example.com" (with "global/" prefix)
 * No OAuth flow — credentials are provided by Phorest support team.
 *
 * @see https://developer.phorest.com/docs/getting-started.md
 */

import {
  PhorestCredentials,
  PhorestRegion,
  getPhorestBaseUrl,
} from './types';

const REGION_STORAGE_KEY = 'phorest_region_cache';

/**
 * Build the Basic Auth header from credentials
 */
export function buildBasicAuthHeader(credentials: PhorestCredentials): string {
  const { username, password } = credentials;
  // Ensure username has the "global/" prefix
  const normalizedUsername = username.startsWith('global/') ? username : `global/${username}`;
  const token = Buffer.from(`${normalizedUsername}:${password}`).toString('base64');
  return `Basic ${token}`;
}

/**
 * Normalize Phorest username — ensures the "global/" prefix is present
 */
export function normalizeUsername(username: string): string {
  return username.startsWith('global/') ? username : `global/${username}`;
}

/**
 * Validate Phorest credentials by making a lightweight API call
 * (lists branches — smallest payload)
 */
export async function validatePhorestCredentials(
  credentials: PhorestCredentials
): Promise<{
  valid: boolean;
  error?: string;
  region?: PhorestRegion;
  businessName?: string;
}> {
  const { businessId, region = 'us' } = credentials;
  const baseUrl = getPhorestBaseUrl(region);
  const authHeader = buildBasicAuthHeader(credentials);

  try {
    const response = await fetch(`${baseUrl}/api/business/${businessId}/branch?page=0&size=1`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
      // Short timeout for validation — don't block
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 200) {
      const data = await response.json();
      const branches = data._embedded?.branches || [];
      const businessName = branches[0]?.name || 'Unknown';
      return { valid: true, region, businessName };
    }

    if (response.status === 401) {
      return { valid: false, error: 'Invalid credentials. Check username and password.' };
    }

    if (response.status === 404) {
      return { valid: false, error: 'Business not found. Check your Business ID.' };
    }

    if (response.status === 429) {
      return { valid: false, error: 'Rate limit exceeded. Try again later.' };
    }

    const body = await response.text();
    return { valid: false, error: `Phorest API error (${response.status}): ${body}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Timeout') || message.includes('abort')) {
      // Try the other region if timeout (might be wrong region)
      const otherRegion: PhorestRegion = region === 'us' ? 'eu' : 'us';
      const otherBaseUrl = getPhorestBaseUrl(otherRegion);
      try {
        const retry = await fetch(
          `${otherBaseUrl}/api/business/${businessId}/branch?page=0&size=1`,
          {
            method: 'GET',
            headers: {
              Authorization: authHeader,
              Accept: 'application/json',
            },
            signal: AbortSignal.timeout(10000),
          }
        );
        if (retry.status === 200) {
          const data = await retry.json();
          const branches = data._embedded?.branches || [];
          const businessName = branches[0]?.name || 'Unknown';
          return { valid: true, region: otherRegion, businessName };
        }
      } catch {
        // Fall through to original error
      }
    }
    return { valid: false, error: `Connection failed: ${message}` };
  }
}

/**
 * Simple in-memory credential store (per-request — for serverless environments)
 * Production should use encrypted DB storage (see prisma schema phorest_connections)
 */
const _credentialStore = new Map<string, PhorestCredentials>();

export function cacheCredentials(salonId: string, credentials: PhorestCredentials): void {
  _credentialStore.set(salonId, credentials);
}

export function getCachedCredentials(salonId: string): PhorestCredentials | undefined {
  return _credentialStore.get(salonId);
}

export function clearCachedCredentials(salonId: string): void {
  _credentialStore.delete(salonId);
}

/**
 * Detect the correct Phorest region for a business.
 * Returns the region that successfully responds.
 */
export async function detectRegion(
  businessId: string,
  username: string,
  password: string
): Promise<PhorestRegion | null> {
  const regions: PhorestRegion[] = ['us', 'eu'];
  for (const region of regions) {
    const result = await validatePhorestCredentials({ businessId, username, password, region });
    if (result.valid) {
      return result.region || region;
    }
  }
  return null;
}
