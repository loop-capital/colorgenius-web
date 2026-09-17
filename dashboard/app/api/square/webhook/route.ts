/**
 * POST /api/square/webhook
 * Handle Square webhook events (inventory updates, payment notifications, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySquareWebhookSignature, squareClient } from '@/lib/square';
import { prisma } from '@/lib/prisma';

/**
 * A payment.created/payment.updated event only tells us Square processed
 * SOME payment — we have to fetch the order it belongs to and read back the
 * referenceId we set at checkout-link creation time (our own
 * formula_purchases.id) to know which pending purchase to complete. This is
 * the only place a purchase is ever marked 'completed' — never the purchase
 * request itself, which only creates the pending row + checkout link.
 */
async function handleSquarePayment(payment: any) {
  const status = payment?.status; // 'COMPLETED' | 'FAILED' | 'CANCELED' | ...
  const orderId = payment?.order_id || payment?.orderId;
  if (!orderId) return;

  const orderResponse = await squareClient.orders.get({ orderId });
  const referenceId = orderResponse.order?.referenceId;
  if (!referenceId) return;

  const purchase = await prisma.formula_purchases.findUnique({ where: { id: referenceId } });
  if (!purchase || purchase.status === 'completed') return;

  if (status === 'COMPLETED') {
    await prisma.$transaction([
      prisma.formula_purchases.update({
        where: { id: purchase.id },
        data: { status: 'completed', squarePaymentId: payment.id },
      }),
      prisma.formula_listings.update({
        where: { id: purchase.formulaId },
        data: { purchase_count: { increment: 1 } },
      }),
    ]);
  } else if (status === 'FAILED' || status === 'CANCELED') {
    await prisma.formula_purchases.update({
      where: { id: purchase.id },
      data: { status: 'failed', squarePaymentId: payment.id },
    });
  }
}

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
      case 'payment.updated':
        // Was previously a console.log stub — this is the only place a
        // marketplace purchase ever actually gets marked completed.
        await handleSquarePayment(event.data?.object?.payment);
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
