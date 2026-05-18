import { NextResponse } from 'next/server';
import { getTokenFromCookie, JWT_SECRET_KEY } from '@/lib/auth';
import { jwtVerify } from 'jose';

export async function GET() {
  const token = await getTokenFromCookie();
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return NextResponse.json({
      user: {
        id: payload.userId,
        username: payload.username,
        email: payload.email,
        salonName: payload.username,
      }
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
