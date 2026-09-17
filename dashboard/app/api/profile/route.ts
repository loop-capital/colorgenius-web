/**
 * GET /api/profile — Get current user's profile
 * PATCH /api/profile — Update profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getOrCreateStylistForUser } from '@/lib/stylist';

function serializeProfile(stylist: NonNullable<Awaited<ReturnType<typeof getOrCreateStylistForUser>>>) {
  return {
    id: stylist.id,
    handle: stylist.handle,
    display_name: stylist.display_name || stylist.first_name,
    email: stylist.email,
    profile_photo: stylist.avatar_url,
    instagram: stylist.instagram_handle,
    bio: stylist.bio,
    salon: stylist.salon_name,
    location: stylist.location,
    specialties: stylist.specialties,
    years_experience: stylist.years_experience,
    certifications: stylist.certifications,
    privacy: {
      client_portal: stylist.portal_enabled,
      affiliate_products: stylist.portal_show_products,
      profile_visibility: stylist.portal_privacy,
    },
    is_verified: stylist.is_verified,
    badges: stylist.badges,
  };
}

export async function GET(request: NextRequest) {
  const authUser = await getUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const stylist = await getOrCreateStylistForUser(authUser.userId);
  if (!stylist) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: serializeProfile(stylist) });
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
  const authUser = await getUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const data = updateSchema.parse(body);

    const stylist = await getOrCreateStylistForUser(authUser.userId);
    if (!stylist) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    }

    const updated = await prisma.stylists.update({
      where: { id: stylist.id },
      data: {
        ...(data.display_name !== undefined && { display_name: data.display_name }),
        ...(data.profile_photo !== undefined && { avatar_url: data.profile_photo }),
        ...(data.instagram !== undefined && { instagram_handle: data.instagram }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.salon !== undefined && { salon_name: data.salon }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.specialties !== undefined && { specialties: data.specialties }),
        ...(data.years_experience !== undefined && { years_experience: data.years_experience }),
        ...(data.certifications !== undefined && { certifications: data.certifications }),
        ...(data.privacy?.client_portal !== undefined && { portal_enabled: data.privacy.client_portal }),
        ...(data.privacy?.affiliate_products !== undefined && { portal_show_products: data.privacy.affiliate_products }),
        ...(data.privacy?.profile_visibility !== undefined && { portal_privacy: data.privacy.profile_visibility }),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: serializeProfile(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
