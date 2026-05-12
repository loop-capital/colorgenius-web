import { NextResponse } from 'next/server';
import { getTokenFromCookie } from '@/lib/auth';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode('colorgenius-prod-secret-2026');

export async function GET() {
  const token = await getTokenFromCookie();
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
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
