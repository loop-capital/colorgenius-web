import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const registerSchema = z.object({
  handle: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores'),
  email: z.string().email(),
  password: z.string().min(8),
  display_name: z.string().min(2).max(100),
});

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://beuiayrnzbgvvqfgsenc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const data = registerSchema.parse(body);

    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };

    // Check if email is already taken
    const existingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=id&email=eq.${encodeURIComponent(data.email)}&limit=1`,
      { headers }
    );
    const existing = await existingRes.json();
    if (existing && existing.length > 0) {
      return NextResponse.json({ success: false, error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists' } }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: data.email,
        password_hash: passwordHash,
        first_name: data.display_name,
        last_name: '',
        role: 'stylist',
        is_active: true,
        created_at: new Date().toISOString(),
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error('[register] Supabase error:', err);
      return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
    }

    const created = await createRes.json();
    const user = Array.isArray(created) ? created[0] : created;

    return NextResponse.json({
      success: true,
      data: {
        id: user?.id,
        handle: data.handle,
        display_name: data.display_name,
        message: 'Account created! Complete your profile to start publishing formulas.',
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
