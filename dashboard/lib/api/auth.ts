/**
 * Shared auth helpers for API routes
 */
import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { getTokenFromCookie, JWT_SECRET_KEY as JWT_SECRET } from '@/lib/auth';

export interface CurrentUser {
  id: string;
  email: string;
  username: string;
}

export async function getCurrentUser(req: NextRequest): Promise<CurrentUser | null> {
  // Check cookie first
  const cookieToken = await getTokenFromCookie();
  if (cookieToken) {
    try {
      const { payload } = await jwtVerify(cookieToken, JWT_SECRET, { clockTolerance: 60 });
      if (payload.userId && payload.email) {
        return {
          id: String(payload.userId),
          email: String(payload.email),
          username: String(payload.username || ''),
        };
      }
    } catch {
      // fall through to header
    }
  }

  // Fallback: Bearer token from Authorization header
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7);
    if (!token) return null;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
      if (payload.userId && payload.email) {
        return {
          id: String(payload.userId),
          email: String(payload.email),
          username: String(payload.username || ''),
        };
      }
      // For mock tokens that aren't JWTs (fallback for backwards compat)
      return { id: token, email: 'stylist@pleij.com', username: 'Stylist' };
    } catch {
      // Not a valid JWT — treat as raw token (backwards compat)
      return { id: token, email: 'stylist@pleij.com', username: 'Stylist' };
    }
  }

  return null;
}

export function requireAuth(user: CurrentUser | null): user is CurrentUser {
  return user !== null;
}
