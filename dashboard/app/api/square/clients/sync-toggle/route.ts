import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/lib/auth';
import { getSalonIdForUser } from '@/lib/stylist';

const prisma = new PrismaClient();

async function getAuthUser(request: Request) {
  const authUser = await getUserFromRequest(request);
  if (!authUser) return null;
  const salon_id = await getSalonIdForUser(authUser.userId);
  return { id: authUser.userId, email: authUser.email, salon_id: salon_id || undefined };
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { enabled, salon_id } = body;

    const targetSalonId = salon_id || user.salon_id;
    if (!targetSalonId) {
      return NextResponse.json({ error: 'Salon ID required' }, { status: 400 });
    }

    // Get current features
    const salon = await prisma.salons.findUnique({
      where: { id: targetSalonId },
      select: { features_enabled: true },
    });

    const currentFeatures = (salon?.features_enabled as Record<string, any>) || {};
    const newFeatures = { ...currentFeatures, square_client_sync: !!enabled };

    await prisma.salons.update({
      where: { id: targetSalonId },
      data: { features_enabled: newFeatures },
    });

    return NextResponse.json({
      success: true,
      data: { square_client_sync: !!enabled },
    });
  } catch (error: any) {
    console.error('[square/clients/sync-toggle] Error:', error);
    return NextResponse.json({ error: error.message || 'Toggle failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const salonId = user.salon_id;
    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID required' }, { status: 400 });
    }

    const salon = await prisma.salons.findUnique({
      where: { id: salonId },
      select: { features_enabled: true },
    });

    const features = (salon?.features_enabled as Record<string, any>) || {};

    return NextResponse.json({
      success: true,
      data: { square_client_sync: features.square_client_sync === true },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
