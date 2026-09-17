import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// Unambiguous alphabet — no 0/O, 1/I/L confusion when read aloud or typed
// from a screen at the color bar.
const INVITE_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateInviteCode(length = 8): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += INVITE_CODE_ALPHABET[Math.floor(Math.random() * INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180) || 'salon';
}

/**
 * GET /api/v1/salons — the authenticated user's own salon, including its
 * invite code (owners need this to actually invite staff).
 */
export async function GET(request: NextRequest) {
  const authUser = await getUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: authUser.userId },
    select: { salon_id: true, role: true },
  });

  if (!user?.salon_id) {
    return NextResponse.json({ success: true, data: { salon: null } });
  }

  const salon = await prisma.salons.findUnique({ where: { id: user.salon_id } });
  if (!salon) {
    return NextResponse.json({ success: true, data: { salon: null } });
  }

  return NextResponse.json({
    success: true,
    data: {
      salon: {
        id: salon.id,
        name: salon.name,
        slug: salon.slug,
        // Only the owner needs to see/share this — everyone else on the
        // salon just needs to know they're linked.
        inviteCode: user.role === 'owner' ? salon.invite_code : undefined,
      },
    },
  });
}

const createSalonSchema = z.object({
  name: z.string().min(2).max(200),
});

/**
 * POST /api/v1/salons — create a new salon (a brand-new business, or an
 * independent pro working solo — same model either way, just one owner and
 * no additional staff). The caller becomes its owner and is linked
 * immediately. Fails if the account is already linked to a salon — use
 * /api/v1/salons/join to switch, not create a second one.
 */
export async function POST(request: NextRequest) {
  const authUser = await getUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const data = createSalonSchema.parse(body);

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

    // Slug and invite code both need real uniqueness, not just optimism —
    // retry on collision rather than trusting a single random draw.
    let slug = slugify(data.name);
    for (let i = 0; await prisma.salons.findUnique({ where: { slug } }); i++) {
      if (i > 5) {
        return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
      }
      slug = `${slugify(data.name)}-${Math.floor(Math.random() * 10000)}`;
    }

    let inviteCode = generateInviteCode();
    for (let i = 0; await prisma.salons.findUnique({ where: { invite_code: inviteCode } }); i++) {
      if (i > 5) {
        return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
      }
      inviteCode = generateInviteCode();
    }

    const [salon] = await prisma.$transaction([
      prisma.salons.create({
        data: { name: data.name, slug, invite_code: inviteCode },
      }),
    ]);
    await prisma.users.update({
      where: { id: authUser.userId },
      data: { salon_id: salon.id, role: 'owner' },
    });
    // Keep the linked stylists row (if any) in sync too — marketplace/
    // community features resolve salon via stylists.salon_id separately.
    await prisma.stylists.updateMany({
      where: { user_id: authUser.userId },
      data: { salon_id: salon.id },
    });

    return NextResponse.json({
      success: true,
      data: { salon: { id: salon.id, name: salon.name, slug: salon.slug, inviteCode: salon.invite_code } },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message } }, { status: 400 });
    }
    console.error('Create salon error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
