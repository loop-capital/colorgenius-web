import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://beuiayrnzbgvvqfgsenc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

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

    // Exchange code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://colorgenius.co/api/auth/google/callback';

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('[Google OAuth] Token exchange failed:', err);
      return NextResponse.redirect(
        new URL('/login?error=token_exchange_failed', request.url)
      );
    }

    const tokens = await tokenRes.json();

    // Get user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      console.error('[Google OAuth] Failed to fetch user info');
      return NextResponse.redirect(
        new URL('/login?error=userinfo_failed', request.url)
      );
    }

    const userInfo = await userInfoRes.json();
    const googleUserId = userInfo.sub;
    const email = userInfo.email;
    const firstName = userInfo.given_name || '';
    const lastName = userInfo.family_name || '';

    const supabaseHeaders = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };

    // Check if user exists by google_id
    let user = null;
    const existingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=*&google_id=eq.${encodeURIComponent(googleUserId)}&limit=1`,
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
        // Link Google ID to existing account
        const updateRes = await fetch(
          `${SUPABASE_URL}/rest/v1/users?id=eq.${emailUsers[0].id}`,
          {
            method: 'PATCH',
            headers: supabaseHeaders,
            body: JSON.stringify({ google_id: googleUserId }),
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
          google_id: googleUserId,
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
    console.error('[Google OAuth] Error:', err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(err.message)}`, request.url)
    );
  }
}
