/**
 * POST /api/auth/register
 * Create a new stylist account
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const registerSchema = z.object({
  handle: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores'),
  email: z.string().email(),
  password: z.string().min(8),
  display_name: z.string().min(2).max(100),
});

// In-memory user store — in production this would be Supabase
const users: Map<string, any> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const data = registerSchema.parse(body);

    // Check if handle is taken
    const handleTaken = Array.from(users.values()).some(u => u.handle.toLowerCase() === data.handle.toLowerCase());
    if (handleTaken) {
      return NextResponse.json({ success: false, error: { code: 'HANDLE_TAKEN', message: 'This handle is already taken' } }, { status: 400 });
    }

    // Check if email is taken
    const emailTaken = Array.from(users.values()).some(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (emailTaken) {
      return NextResponse.json({ success: false, error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists' } }, { status: 400 });
    }

    const crypto = await import('crypto');
    const user = {
      id: `sty_${crypto.randomUUID().slice(0, 12)}`,
      handle: data.handle,
      email: data.email,
      password_hash: crypto.createHash('sha256').update(data.password).digest('hex'),
      display_name: data.display_name,
      profile_photo: null,
      instagram: null,
      bio: null,
      salon: null,
      location: null,
      specialties: [],
      years_experience: null,
      certifications: [],
      privacy: {
        client_portal: true,
        affiliate_products: false,
        profile_visibility: 'public',
      },
      is_verified: false,
      badge: null, // 'educator', 'beta_tester', 'founding_member'
      created_at: new Date().toISOString(),
    };

    users.set(user.id, user);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        handle: user.handle,
        display_name: user.display_name,
        message: 'Account created! Complete your profile to start publishing formulas.',
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
