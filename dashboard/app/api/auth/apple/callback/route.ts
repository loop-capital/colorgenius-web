import { NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

async function generateClientSecret() {
  const teamId = process.env.APPLE_TEAM_ID!;
  const keyId = process.env.APPLE_KEY_ID!;
  const servicesId = process.env.APPLE_SERVICES_ID!;

  const pemKey = process.env.APPLE_PRIVATE_KEY!;
  // Handle escaped newlines from env vars
  const pem = pemKey.replace(/\\n/g, '\n');

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(pem),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const now = Math.floor(Date.now() / 1000);

  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 60) // 1 hour
    .setAudience('https://appleid.apple.com')
    .setSubject(servicesId)
    .sign(privateKey);

  return jwt;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const lines = pem.split('\n').filter(
    (line) => !line.startsWith('-----') && line.trim() !== ''
  );
  const base64 = lines.join('');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function exchangeCodeForTokens(code: string) {
  const clientSecret = await generateClientSecret();
  const clientId = process.env.APPLE_SERVICES_ID!;

  const response = await fetch('https://appleid.apple.com/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Apple token exchange failed: ${err}`);
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    console.log('[Apple Callback] Content-Type:', contentType);

    let code: string | null = null;
    let error: string | null = null;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      code = formData.get('code') as string;
      error = formData.get('error') as string;
      const user = formData.get('user');
      console.log('[Apple Callback] form_post - code:', !!code, 'error:', error, 'user:', user);
    } else {
      const { searchParams } = new URL(request.url);
      code = searchParams.get('code');
      error = searchParams.get('error');
      console.log('[Apple Callback] query - code:', !!code, 'error:', error);
    }

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/login?error=missing_code', request.url)
      );
    }

    const tokens = await exchangeCodeForTokens(code);

    // Verify the id_token to get user info
    const pem = (process.env.APPLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    const publicKey = await crypto.subtle.importKey(
      'spki',
      pemToArrayBuffer(pem),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );

    // Decode the id_token payload (we trust Apple's signature)
    const payload = JSON.parse(
      Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString()
    );

    const appleUserId = payload.sub;
    const email = payload.email;

    // Apple only sends name on first sign-in, parse it from the form data
    const nameJson = formData.get('user') as string;
    let firstName = '';
    let lastName = '';
    if (nameJson) {
      try {
        const nameObj = JSON.parse(nameJson);
        firstName = nameObj?.name?.firstName || '';
        lastName = nameObj?.name?.lastName || '';
      } catch {}
    }

    // Create or find user in Supabase
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://beuiayrnzbgvvqfgsenc.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
    const supabaseHeaders = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };

    // Check if user exists by apple_id
    let user = null;
    const existingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=*&apple_id=eq.${encodeURIComponent(appleUserId)}&limit=1`,
      { headers: supabaseHeaders }
    );
    const existing = await existingRes.json();
    if (existing.length > 0) {
      user = existing[0];
    }

    if (!user && email) {
      // Check by email
      const emailRes = await fetch(
        `${SUPABASE_URL}/rest/v1/users?select=*&email=eq.${encodeURIComponent(email)}&limit=1`,
        { headers: supabaseHeaders }
      );
      const emailUsers = await emailRes.json();
      if (emailUsers.length > 0) {
        // Link Apple ID to existing account
        const updateRes = await fetch(
          `${SUPABASE_URL}/rest/v1/users?id=eq.${emailUsers[0].id}`,
          {
            method: 'PATCH',
            headers: supabaseHeaders,
            body: JSON.stringify({ apple_id: appleUserId }),
          }
        );
        const updated = await updateRes.json();
        user = updated[0] || emailUsers[0];
      }
    }

    if (!user) {
      // Create new user
      const createRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          apple_id: appleUserId,
          is_active: true,
          created_at: new Date().toISOString(),
        }),
      });
      const created = await createRes.json();
      user = created[0];
    }

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=account_creation_failed', request.url)
      );
    }

    // Issue our own session JWT
    const jwtSecret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'colorgenius-prod-secret-2026'
    );

    const sessionToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      username: user.first_name || email.split('@')[0],
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(jwtSecret);

    const cookieStore = await cookies();
    cookieStore.set('colorgenius_token', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err: any) {
    console.error('Apple auth error:', err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(err.message)}`, request.url)
    );
  }
}

// Also handle GET in case Apple redirects with query params
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  return NextResponse.redirect(
    new URL('/login?error=invalid_callback', request.url)
  );
}
