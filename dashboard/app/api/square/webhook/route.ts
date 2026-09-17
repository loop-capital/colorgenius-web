/**
 * POST /api/square/webhook
 * Handle Square webhook events (inventory updates, payment notifications, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySquareWebhookSignature, squareClient, listCustomerCards } from '@/lib/square';
import { prisma } from '@/lib/prisma';

/**
 * A payment.created/payment.updated event only tells us Square processed
 * SOME payment — we have to fetch the order it belongs to and read back the
 * referenceId we set at checkout-link creation time to know what this
 * payment was actually for. Dispatches on the referenceId's shape:
 *   - "bs:<salonId>" — a card-verification charge; save the
 *     card Square captured against the salon's customer.
 *   - a formula_purchases.id (bare UUID) — legacy path from when
 *     marketplace purchases went through Checkout Links directly; kept for
 *     any purchase still mid-flight, though acquiring a license no longer
 *     creates one of these.
 */
async function handleSquarePayment(payment: any) {
  const status = payment?.status; // 'COMPLETED' | 'FAILED' | 'CANCELED' | ...
  const orderId = payment?.order_id || payment?.orderId;
  if (!orderId) return;

  const orderResponse = await squareClient.orders.get({ orderId });
  const referenceId = orderResponse.order?.referenceId;
  if (!referenceId) return;

  if (referenceId.startsWith('bs:')) {
    if (status !== 'COMPLETED') return;
    const salonId = referenceId.slice('bs:'.length);
    const salon = await prisma.salons.findUnique({ where: { id: salonId } });
    if (!salon?.square_customer_id) return;

    const cards = await listCustomerCards(salon.square_customer_id);
    const card = cards?.[0];
    if (!card?.id) return;

    await prisma.salons.update({
      where: { id: salonId },
      data: {
        square_card_id: card.id,
        billing_card_last4: card.last4 || null,
        billing_card_brand: card.cardBrand || null,
      },
    });
    return;
  }

  const purchase = await prisma.formula_purchases.findUnique({ where: { id: referenceId } }).catch(() => null);
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
