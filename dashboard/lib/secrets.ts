/**
 * Shared credential encryption for POS/scheduling provider connections
 * (Square OAuth tokens, Phorest passwords, and future providers).
 * AES-256-GCM at rest.
 */

import crypto from 'crypto';

function deriveKey(secret: string): Buffer {
  return crypto.createHash('sha256').update(secret).digest();
}

function encryptionKey(): Buffer {
  const secret = process.env.POS_ENCRYPTION_KEY || process.env.PHOREST_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('POS_ENCRYPTION_KEY (or JWT_SECRET) must be set to encrypt/decrypt provider credentials');
  }
  return deriveKey(secret);
}

export function encryptSecret(plainText: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptSecret(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
