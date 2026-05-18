/**
 * GET /api/profile — Get current user's profile
 * PATCH /api/profile — Update profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

function getUserFromAuth(request: NextRequest): { id: string } | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const [id] = token.split(':');
  if (!id) return null;
  return { id };
}

// Shared with register route — in production this would be a database
const profiles: Map<string, any> = new Map();

// Seed a test profile
profiles.set('buyer-1', {
  id: 'buyer-1',
  handle: 'pleijsalon',
  display_name: 'Pleij Salon',
  email: 'tiche@pleijsalon.com',
  profile_photo: null,
  instagram: '@pleijsalon',
  bio: 'Premier color salon in Columbus, OH. Specializing in balayage, color correction, and fashion colors.',
  salon: 'Pleij Salon',
  location: 'Columbus, OH',
  specialties: ['Balayage', 'Color Correction', 'Vivids'],
  years_experience: 15,
  certifications: ['Wella Master Colorist', 'Redken Certified'],
  privacy: { client_portal: true, affiliate_products: true, profile_visibility: 'public' },
  is_verified: true,
  badge: 'founding_member',
});

export async function GET(request: NextRequest) {
  const user = getUserFromAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const profile = profiles.get(user.id);
  if (!profile) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: profile });
}

const updateSchema = z.object({
  display_name: z.string().min(2).max(100).optional(),
  profile_photo: z.string().url().optional().nullable(),
  instagram: z.string().max(50).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  salon: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  specialties: z.array(z.string()).max(10).optional(),
  years_experience: z.number().min(0).max(60).optional().nullable(),
  certifications: z.array(z.string()).max(10).optional(),
  privacy: z.object({
    client_portal: z.boolean().optional(),
    affiliate_products: z.boolean().optional(),
    profile_visibility: z.enum(['public', 'private']).optional(),
  }).optional(),
});

export async function PATCH(request: NextRequest) {
  const user = getUserFromAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const data = updateSchema.parse(body);

    const existing = profiles.get(user.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    }

    // Merge updates
    const updated = { ...existing, ...data };
    if (data.privacy) {
      updated.privacy = { ...existing.privacy, ...data.privacy };
    }

    profiles.set(user.id, updated);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
