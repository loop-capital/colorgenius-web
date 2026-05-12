import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode('colorgenius-prod-secret-2026');

// Public paths that don't require auth
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/privacy',
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/health',
  '/api/clients',
  '/api/v1/formulas',
  '/api/v1/inventory',
  '/api/v1/pricing',
  '/api/formulas',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg')
  ) {
    return NextResponse.next();
  }

  // Check for JWT cookie
  const token = request.cookies.get('colorgenius_token')?.value;
  if (!token) {
    return redirectToLogin(request);
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
