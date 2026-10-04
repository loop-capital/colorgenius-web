import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getOrCreateStylistForUser } from '@/lib/stylist';

const TOKEN_PREFIX = 'cgt_';
const ALLOWED_SCOPES = ['transformations:write', 'transformations:read'];
const DEFAULT_SCOPES = ['transformations:write'];

/**
 * Resolve the stylist via session/JWT only. API tokens cannot issue new
 * tokens (no privilege escalation) — issuance requires an interactive session.
 */
async function resolveSessionStylist(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return null;
  return getOrCreateStylistForUser(user.userId);
}

function publicKey(k: any) {
  return {
    id: k.id,
    key_prefix: k.key_prefix,
    scopes: k.scopes,
    is_active: k.is_active,
    expires_at: k.expires_at,
    last_used_at: k.last_used_at,
    usage_count: k.usage_count,
    created_at: k.created_at,
  };
}

// GET /api/v1/auth/tokens — list this stylist's API tokens (hashes never exposed).
export async function GET(req: NextRequest) {
  const stylist = await resolveSessionStylist(req);
  if (!stylist) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const keys = await prisma.api_keys.findMany({
    where: { owner_type: 'stylist', owner_id: stylist.id },
    orderBy: { created_at: 'desc' },
  });
  return NextResponse.json({ items: keys.map(publicKey) });
}

// POST /api/v1/auth/tokens — issue a per-stylist API token (v1 interim auth
// for the agent-mediated flow; OAuth transformations:write comes with Track B).
// The plaintext token is returned ONCE; only its sha256 is stored.
export async function POST(req: NextRequest) {
  const stylist = await resolveSessionStylist(req);
  if (!stylist) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // defaults apply
  }

  const scopes: string[] = Array.isArray(body.scopes) ? body.scopes : DEFAULT_SCOPES;
  const bad = scopes.filter((s) => !ALLOWED_SCOPES.includes(s));
  if (bad.length > 0 || scopes.length === 0) {
    return NextResponse.json(
      { error: `scopes must be a non-empty subset of: ${ALLOWED_SCOPES.join(', ')}` },
      { status: 400 }
    );
  }

  let expiresAt: Date | null = null;
  if (body.expires_at) {
    expiresAt = new Date(body.expires_at);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      return NextResponse.json({ error: 'expires_at must be a future timestamp' }, { status: 400 });
    }
  }

  const token = TOKEN_PREFIX + randomBytes(24).toString('hex'); // 192 bits
  const keyHash = createHash('sha256').update(token).digest('hex');

  const key = await prisma.api_keys.create({
    data: {
      owner_type: 'stylist',
      owner_id: stylist.id,
      key_hash: keyHash,
      key_prefix: token.slice(0, 8),
      scopes,
      expires_at: expiresAt,
      created_by: stylist.id,
    },
  });

  return NextResponse.json(
    {
      ...publicKey(key),
      token, // shown once — never stored, never returned again
      warning: 'Store this token now. It will not be shown again.',
    },
    { status: 201 }
  );
}
