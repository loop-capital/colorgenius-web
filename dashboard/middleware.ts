import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'colorgenius-prod-secret-2026'
);

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/privacy',
  '/api',           // All API routes are public (handle own auth via Bearer token)
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/apple',
  '/api/auth/apple/callback',
  '/api/auth/google',
  '/api/auth/google/callback',
  '/api/health',
  '/monitoring',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (!isPublic) {
    // Check for cookie-based auth (web dashboard)
    const token = request.cookies.get('colorgenius_token')?.value;
    // Check for Bearer token auth (mobile app)
    const authHeader = request.headers.get('authorization')?.replace('Bearer ', '');
    
    const authToken = token || authHeader;
    
    if (!authToken) {
      return redirectToLogin(request);
    }
    try {
      await jwtVerify(authToken, JWT_SECRET);
    } catch {
      return redirectToLogin(request);
    }
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=0, must-revalidate');
  return response;
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
