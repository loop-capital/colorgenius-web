import { NextResponse } from 'next/server';
import { generateToken, setAuthCookie } from '@/lib/auth';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://beuiayrnzbgvvqfgsenc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const crypto = await import('crypto');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&email=eq.${encodeURIComponent(email)}&is_active=eq.true&limit=1`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });

    const users = await res.json();
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];
    if (user.password_hash !== passwordHash) {
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
