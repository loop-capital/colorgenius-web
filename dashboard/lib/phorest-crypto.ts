/**
 * Phorest credential encryption utilities — thin wrapper over the shared
 * lib/secrets.ts (AES-256-GCM), kept so existing callers don't need to change.
 */

import { encryptSecret, decryptSecret } from './secrets';

export function encryptPhorestPassword(plainText: string): string {
  return encryptSecret(plainText);
}

export function decryptPhorestPassword(encryptedData: string): string {
  return decryptSecret(encryptedData);
}
