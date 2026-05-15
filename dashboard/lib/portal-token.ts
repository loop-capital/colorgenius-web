import { randomBytes } from 'crypto'

// Generate a persistent, URL-safe portal token
export function generatePortalToken(): string {
  return randomBytes(24).toString('base64url')
}
