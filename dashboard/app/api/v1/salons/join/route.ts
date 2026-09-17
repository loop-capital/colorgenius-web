import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

const joinSalonSchema = z.object({
  inviteCode: z.string().min(4).max(12),
});

/**
 * POST /api/v1/salons/join — join an existing salon as staff, using the
 * invite code its owner shares (visible to them via GET /api/v1/salons).
 * The caller is linked with role 'stylist' — ownership isn't transferable
 * through this endpoint.
 */
export async function POST(request: NextRequest) {
  const authUser = await getUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const data = joinSalonSchema.parse(body);

    const existing = await prisma.users.findUnique({
      where: { id: authUser.userId },
      select: { salon_id: true },
    });
    if (existing?.salon_id) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_LINKED', message: 'This account is already linked to a salon.' } },
        { status: 400 }
      );
    }

    const salon = await prisma.salons.findUnique({
      where: { invite_code: data.inviteCode.toUpperCase() },
    });
    if (!salon) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CODE', message: 'Invite code not recognized.' } },
        { status: 404 }
      );
    }

    await prisma.users.update({
      where: { id: authUser.userId },
      data: { salon_id: salon.id, role: 'stylist' },
    });
    await prisma.stylists.updateMany({
      where: { user_id: authUser.userId },
      data: { salon_id: salon.id },
    });

    return NextResponse.json({
      success: true,
      data: { salon: { id: salon.id, name: salon.name, slug: salon.slug } },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message } }, { status: 400 });
    }
    console.error('Join salon error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
