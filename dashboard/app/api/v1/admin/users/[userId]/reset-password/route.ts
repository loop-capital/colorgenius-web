import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { requireAdmin, generatePassword } from '@/lib/admin';

/**
 * POST /api/v1/admin/users/:userId/reset-password — admin generates a fresh
 * password for an account whose login the admin created (they don't sign up
 * or reset for themselves through the app). Same trust model as account
 * creation: returned once here, not recoverable after, hand it to the
 * stylist directly and have them change it after login.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const { userId } = await params;
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true, stylist: { select: { id: true } } },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND' } }, { status: 404 });
    }

    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction(async (tx) => {
      await tx.users.update({ where: { id: userId }, data: { password_hash: passwordHash } });
      if (user.stylist) {
        await tx.stylists.update({ where: { id: user.stylist.id }, data: { password_hash: passwordHash } });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        // Only ever returned here, at reset time.
        temporaryPassword: password,
      },
    });
  } catch (error) {
    console.error('Admin reset password error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
