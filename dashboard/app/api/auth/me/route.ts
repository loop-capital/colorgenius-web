import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const authUser = await getUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: authUser.userId },
      select: { id: true, first_name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.first_name || user.email,
        email: user.email,
        salonName: user.first_name || user.email,
      }
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
