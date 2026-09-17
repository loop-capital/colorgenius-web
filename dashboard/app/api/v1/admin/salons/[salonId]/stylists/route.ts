import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

function slugifyHandle(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]+/g, '')
    .slice(0, 25) || 'stylist';
}

function generatePassword(): string {
  // 12 random bytes, base64url — readable enough to hand off, no ambiguous
  // characters problem since it's copy-pasted, not hand-typed off a screen.
  return crypto.randomBytes(12).toString('base64url');
}

const createStylistSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2).max(100),
  handle: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  role: z.enum(['owner', 'stylist']).default('stylist'),
  // Omit to auto-generate — the common case, since the admin is creating
  // this account for someone else to log into, not choosing their password.
  password: z.string().min(8).optional(),
});

/**
 * POST /api/v1/admin/salons/:salonId/stylists — admin creates a real login
 * for a stylist at a salon they're onboarding manually (these accounts
 * don't sign up through the app). Returns the password in the response
 * body ONCE — it's not recoverable after this, same as any other secret
 * shown at creation time; the admin is expected to hand it to the stylist
 * directly (in person, a call, however) and have them change it after
 * first login.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ salonId: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const { salonId } = await params;
    const salon = await prisma.salons.findUnique({ where: { id: salonId } });
    if (!salon) {
      return NextResponse.json({ success: false, error: { code: 'SALON_NOT_FOUND' } }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const data = createStylistSchema.parse(body);

    const existingEmail = await prisma.users.findFirst({ where: { email: data.email }, select: { id: true } });
    if (existingEmail) {
      return NextResponse.json({ success: false, error: { code: 'EMAIL_TAKEN' } }, { status: 400 });
    }

    let handle = data.handle ?? slugifyHandle(data.displayName);
    for (let i = 0; await prisma.stylists.findUnique({ where: { handle } }); i++) {
      if (i > 5) return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
      handle = `${data.handle ?? slugifyHandle(data.displayName)}${Math.floor(Math.random() * 10000)}`;
    }

    const password = data.password ?? generatePassword();
    const passwordHash = await bcrypt.hash(password, 12);

    const { user, stylist } = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          email: data.email,
          password_hash: passwordHash,
          first_name: data.displayName,
          last_name: '',
          role: data.role,
          salon_id: salonId,
          is_active: true,
          created_at: new Date(),
        },
      });
      const stylist = await tx.stylists.create({
        data: {
          user_id: user.id,
          handle,
          email: data.email,
          password_hash: passwordHash,
          first_name: data.displayName,
          last_name: '',
          display_name: data.displayName,
          salon_id: salonId,
        },
      });
      return { user, stylist };
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        stylistId: stylist.id,
        email: user.email,
        handle: stylist.handle,
        role: user.role,
        salon: { id: salon.id, name: salon.name },
        // Only ever returned here, at creation. Hand it to the stylist now.
        temporaryPassword: data.password ? undefined : password,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message } }, { status: 400 });
    }
    console.error('Admin create stylist error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
