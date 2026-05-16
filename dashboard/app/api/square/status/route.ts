/**
 * GET /api/square/status
 * Check if a salon has Square connected
 * 
 * DELETE /api/square/status
 * Disconnect Square from a salon
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConnection, removeConnection, isConnected, getAuthUrl } from '@/lib/square-multi';

function getUserFromAuth(request: NextRequest): { id: string } | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const [id] = token.split(':');
  if (!id) return null;
  return { id };
}

export async function GET(request: NextRequest) {
  const user = getUserFromAuth(request);
  const salonId = user?.id || 'default';

  const connected = isConnected(salonId);
  const connection = getConnection(salonId);

  if (connected && connection) {
    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        business_name: connection.business_name,
        merchant_id: connection.merchant_id,
        location_ids: connection.location_ids,
        connected_at: connection.connected_at,
        catalog_synced_at: connection.catalog_synced_at,
      },
    });
  }

  // Return connect URL if not connected
  const redirectUri = `${request.headers.get('origin') || 'https://colorgenius.co'}/api/square/oauth/callback`;
  const authUrl = getAuthUrl(salonId, redirectUri);

  return NextResponse.json({
    success: true,
    data: {
      connected: false,
      connect_url: authUrl,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const user = getUserFromAuth(request);
  const salonId = user?.id || 'default';

  removeConnection(salonId);

  return NextResponse.json({
    success: true,
    data: { message: 'Square disconnected' },
  });
}
