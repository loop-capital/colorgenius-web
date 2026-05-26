/**
 * POST /api/square/webhook
 * Handle Square webhook events (inventory updates, payment notifications, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySquareWebhookSignature } from '@/lib/square';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-square-hmacsha256-signature') || '';
    const url = request.url;

    // Verify webhook signature (skip in development)
    if (process.env.NODE_ENV === 'production') {
      const isValid = await verifySquareWebhookSignature(signature, body, url);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    const eventType = event.type;

    switch (eventType) {
      case 'inventory.count.updated':
        // Product inventory changed
        console.log('Inventory updated:', event.data?.object);
        // TODO: Update local inventory cache, trigger low-stock alerts
        break;

      case 'catalog.version.updated':
        // Catalog items changed (new products, price changes)
        console.log('Catalog updated:', event.data?.object);
        // TODO: Trigger re-sync of catalog
        break;

      case 'payment.created':
        // Payment completed (could be a formula license payment)
        console.log('Payment completed:', event.data?.object);
        break;

      case 'payment.updated':
        // Payment failed
        console.log('Payment failed:', event.data?.object);
        break;

      default:
        console.log('Unhandled Square webhook:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
