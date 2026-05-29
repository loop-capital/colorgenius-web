import { NextResponse } from 'next/server';
import { verifyBearerToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const bearer = await verifyBearerToken(request);
  const token = bearer?.userId ? bearer : null;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: token.userId },
      select: { id: true, first_name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.first_name || token.username,
        email: user.email || token.email,
        salonName: user.first_name || token.username,
      }
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
