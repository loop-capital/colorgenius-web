import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getOrCreateStylistForUser } from '@/lib/stylist';

export type AuthVia = 'session' | 'api_token';

export interface ResolvedStylist {
  id: string;
  via: AuthVia;
  scopes: string[];
  tokenId?: string;
}

const READ_SCOPES = ['transformations:read', 'transformations:write'];
const WRITE_SCOPES = ['transformations:write'];

/**
 * Resolve the authenticated stylist for transformation routes.
 * Accepts EITHER the existing session/JWT (cookie or Bearer) OR a
 * per-stylist API token (Authorization: Bearer <token>, v1 interim auth).
 * Session auth carries full access; API tokens are scope-checked.
 */
export async function resolveStylist(request: Request): Promise<ResolvedStylist | null> {
  // 1. Session / JWT (cookie or Bearer) — full access, no scope check.
  const user = await getUserFromRequest(request);
  if (user) {
    const stylist = await getOrCreateStylistForUser(user.userId);
    if (stylist) {
      return { id: stylist.id, via: 'session', scopes: [...WRITE_SCOPES] };
    }
  }

  // 2. API token via Authorization: Bearer <token>.
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7).trim();
    if (token) {
      const keyHash = createHash('sha256').update(token).digest('hex');
      const key = await prisma.api_keys.findUnique({ where: { key_hash: keyHash } });
      const now = new Date();
      if (
        key &&
        key.is_active &&
        key.owner_type === 'stylist' &&
        (!key.expires_at || key.expires_at > now)
      ) {
        const stylist = await prisma.stylists.findUnique({ where: { id: key.owner_id } });
        if (stylist) {
          // Touch usage stats (fire-and-forget; never blocks the request).
          prisma.api_keys
            .update({
              where: { id: key.id },
              data: { last_used_at: now, usage_count: { increment: 1 } },
            })
            .catch(() => {});
          return {
            id: stylist.id,
            via: 'api_token',
            scopes: key.scopes ?? [],
            tokenId: key.id,
          };
        }
      }
    }
  }

  return null;
}

export function canRead(s: ResolvedStylist): boolean {
  return s.scopes.some((sc) => READ_SCOPES.includes(sc));
}

export function canWrite(s: ResolvedStylist): boolean {
  return s.scopes.some((sc) => WRITE_SCOPES.includes(sc));
}
