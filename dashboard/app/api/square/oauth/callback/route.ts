/**
 * GET /api/square/oauth/callback
 * Square OAuth callback — exchanges auth code for access token
 * 
 * Flow:
 * 1. User clicks "Connect Square" in settings
 * 2. Redirected to Square authorization page
 * 3. User approves access
 * 4. Square redirects here with ?code=xxx&state=salon_id
 * 5. We exchange code for token and store connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeAuthCode, saveConnection } from '@/lib/square-multi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // salon_id
    const error = searchParams.get('error');

    // Handle user denial
    if (error) {
      return NextResponse.redirect(
        new URL(`/settings?square_error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings?square_error=missing_params', request.url)
      );
    }

    // Exchange code for tokens
    const tokenData = await exchangeAuthCode(code);

    // Get merchant info using the new access token
    const { SquareClient, SquareEnvironment } = require('square');
    const client = new SquareClient({
      token: tokenData.access_token,
      environment: process.env.SQUARE_ENVIRONMENT === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
    });

    const merchantResponse = await client.merchants.list();
    const merchant = merchantResponse.merchants?.[0];
    const locations = await client.locations.list();
    const locationIds = (locations.locations || []).map((l: { id?: string }) => l.id || '');

    // Store the connection
    saveConnection({
      salon_id: state,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
      merchant_id: tokenData.merchant_id || merchant?.id || '',
      location_ids: locationIds,
      business_name: merchant?.businessName || 'Unknown',
      connected_at: new Date().toISOString(),
    });

    // Redirect to settings with success
    return NextResponse.redirect(
      new URL('/settings?square_connected=true', request.url)
    );
  } catch (error) {
    console.error('Square OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/settings?square_error=${encodeURIComponent('connection_failed')}`, request.url)
    );
  }
}
