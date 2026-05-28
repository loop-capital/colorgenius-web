import { NextResponse } from 'next/server';
import { generateToken, setAuthCookie } from '@/lib/auth';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://beuiayrnzbgvvqfgsenc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&email=eq.${encodeURIComponent(email)}&is_active=eq.true&limit=1`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });

    // Handle non-OK responses from Supabase
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[login] Supabase error:', errorText);
      return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
    }

    const users = await res.json();
    // Supabase returns error objects on some failures (e.g. invalid key) — those aren't arrays
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];
    const storedHash: string = user.password_hash;

    // Support bcrypt hashes ($2b$) and legacy SHA256 hashes during migration
    let passwordValid = false;
    if (storedHash.startsWith('$2')) {
      passwordValid = await bcrypt.compare(password, storedHash);
    } else {
      // Legacy SHA256 — check and upgrade to bcrypt on success
      const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
      passwordValid = storedHash === sha256Hash;
      if (passwordValid) {
        const newHash = await bcrypt.hash(password, 12);
        await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
          method: 'PATCH',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ password_hash: newHash }),
        });
      }
    }

    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await generateToken({
      id: user.id,
      username: user.first_name || email.split('@')[0],
      email: user.email,
    } as any);

    await setAuthCookie(token);
    return NextResponse.json({ success: true, user: { email: user.email, username: user.first_name } });
  } catch (error: any) {
    return NextResponse.json({ error: 'Login failed: ' + error.message }, { status: 500 });
  }
}
