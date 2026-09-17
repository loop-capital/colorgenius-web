import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const authUser = await getUserFromRequest(request);
  
  // Debug: log what we got
  console.log('[auth/me] authUser:', authUser ? 'found' : 'null');
  console.log('[auth/me] headers:', Object.fromEntries(request.headers.entries()));
  
  if (!authUser) {
    return NextResponse.json({ 
      user: null, 
      debug: { cookie: 'missing or invalid', bearer: request.headers.get('authorization') ? 'present' : 'missing' }
    }, { status: 401 });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: authUser.userId },
      select: { id: true, first_name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ user: null, debug: { userId: authUser.userId, found: false } }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.first_name || user.email,
        email: user.email,
        salonName: user.first_name || user.email,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ user: null, debug: { error: err.message } }, { status: 500 });
  }
}
