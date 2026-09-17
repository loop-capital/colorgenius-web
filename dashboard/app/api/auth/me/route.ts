import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const authUser = await getUserFromRequest(request);
  
  if (!authUser) {
    return NextResponse.json({ 
      user: null, 
      debug: { 
        cookie: '***', 
        bearer: request.headers.get('authorization') ? 'present' : 'missing',
        message: 'No valid auth token found'
      }
    }, { status: 200 }); // Return 200 so sidebar can read debug info
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: authUser.userId },
      select: { id: true, first_name: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ 
        user: null, 
        debug: { userId: authUser.userId, found: false }
      }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.first_name || user.email,
        email: user.email,
        salonName: user.first_name || user.email,
        role: user.role,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ user: null, debug: { error: err.message } }, { status: 200 });
  }
}
