import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

const registerSchema = z.object({
  handle: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores'),
  email: z.string().email(),
  password: z.string().min(8),
  display_name: z.string().min(2).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const data = registerSchema.parse(body);

    // Check if email is already taken
    const existing = await prisma.users.findFirst({
      where: { email: data.email },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists' } }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.users.create({
      data: {
        email: data.email,
        password_hash: passwordHash,
        first_name: data.display_name,
        last_name: '',
        role: 'stylist',
        is_active: true,
        created_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
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
