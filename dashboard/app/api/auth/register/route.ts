import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { generateToken, setAuthCookie } from '@/lib/auth';

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

    // Check if email or handle is already taken
    const [existingEmail, existingHandle] = await Promise.all([
      prisma.users.findFirst({ where: { email: data.email }, select: { id: true } }),
      prisma.stylists.findFirst({ where: { handle: data.handle }, select: { id: true } }),
    ]);
    if (existingEmail) {
      return NextResponse.json({ success: false, error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists' } }, { status: 400 });
    }
    if (existingHandle) {
      return NextResponse.json({ success: false, error: { code: 'HANDLE_TAKEN', message: 'That handle is already taken' } }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create the login identity (users) and the public creator profile (stylists)
    // together — community/marketplace features key off stylists.id via stylists.user_id,
    // so a user with no linked stylists row can't post, like, comment, or sell.
    const { user, stylist } = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
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

      const stylist = await tx.stylists.create({
        data: {
          user_id: user.id,
          handle: data.handle,
          email: data.email,
          password_hash: passwordHash,
          first_name: data.display_name,
          last_name: '',
          display_name: data.display_name,
        },
      });

      return { user, stylist };
    });

    // Log the new account in immediately — previously nothing did this, which is
    // why the register page's "Complete Your Profile" step (right after this
    // call) had to fabricate a fake `Bearer <handle>:temp` header of its own.
    const token = await generateToken({ id: user.id, username: data.display_name, email: user.email });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      token,
      data: {
        id: user.id,
        stylistId: stylist.id,
        handle: stylist.handle,
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
