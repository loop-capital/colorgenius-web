import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180) || 'salon';
}

const INVITE_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function generateInviteCode(length = 8): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += INVITE_CODE_ALPHABET[Math.floor(Math.random() * INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

/** GET /api/v1/admin/salons — list every salon with its staff count. */
export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const salons = await prisma.salons.findMany({
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      invite_code: true,
      created_at: true,
      features_enabled: true,
      _count: { select: { users: true } },
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      salons: salons.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        inviteCode: s.invite_code,
        staffCount: s._count.users,
        createdAt: s.created_at,
        voiceAssistantEnabled: (s.features_enabled as Record<string, unknown> | null)?.voice_assistant === true,
      })),
    },
  });
}

const createSalonSchema = z.object({
  name: z.string().min(2).max(200),
});

/**
 * POST /api/v1/admin/salons — admin creates a new salon (a full salon with
 * multiple staff, or a "salon of one" for an independent pro — same model,
 * add one stylist or several). Unlike POST /api/v1/salons (self-serve), this
 * does NOT link the calling admin as owner — the first real stylist added
 * via /stylists below gets that role.
 */
export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const data = createSalonSchema.parse(body);

    let slug = slugify(data.name);
    for (let i = 0; await prisma.salons.findUnique({ where: { slug } }); i++) {
      if (i > 5) return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
      slug = `${slugify(data.name)}-${Math.floor(Math.random() * 10000)}`;
    }

    let inviteCode = generateInviteCode();
    for (let i = 0; await prisma.salons.findUnique({ where: { invite_code: inviteCode } }); i++) {
      if (i > 5) return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
      inviteCode = generateInviteCode();
    }

    const salon = await prisma.salons.create({
      data: { name: data.name, slug, invite_code: inviteCode },
    });

    return NextResponse.json({
      success: true,
      data: { salon: { id: salon.id, name: salon.name, slug: salon.slug, inviteCode: salon.invite_code } },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message } }, { status: 400 });
    }
    console.error('Admin create salon error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
