/**
 * GET /api/clover/oauth/callback
 * Clover OAuth callback — exchanges auth code for an access token and
 * stores the connection. Same flow shape as /api/square/oauth/callback.
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeAuthCode, saveConnection } from '@/lib/clover-multi';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // salon_id
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL(`/settings?clover_error=${encodeURIComponent(error)}`, request.url));
    }
    if (!code || !state) {
      return NextResponse.redirect(new URL('/settings?clover_error=missing_params', request.url));
    }

    const salon = await prisma.salons.findUnique({ where: { id: state } });
    if (!salon) {
      return NextResponse.redirect(new URL('/settings?clover_error=salon_not_found', request.url));
    }

    const { access_token, merchant_id } = await exchangeAuthCode(code);
    if (!access_token || !merchant_id) {
      return NextResponse.redirect(new URL('/settings?clover_error=connection_failed', request.url));
    }

    await saveConnection({
      salon_id: state,
      access_token,
      merchant_id,
      merchant_name: salon.name,
    });

    return NextResponse.redirect(new URL('/settings?clover_connected=true', request.url));
  } catch (error) {
    console.error('Clover OAuth callback error:', error);
    return NextResponse.redirect(new URL('/settings?clover_error=connection_failed', request.url));
  }
}
