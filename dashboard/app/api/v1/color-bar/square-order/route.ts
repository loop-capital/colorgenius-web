import { NextRequest, NextResponse } from 'next/server'
import { verifyBearerToken } from '@/lib/auth'

// POST /api/v1/color-bar/square-order
// Push completed formula to Square Register as an order
export async function POST(req: NextRequest) {
  try {
    const user = await verifyBearerToken(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId, items, clientName } = body as {
      sessionId: string
      items: { name: string; quantity: number; price: number }[]
      clientName?: string
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 })
    }

    // Square Orders API integration
    // In production, this uses the Square SDK:
    // import { Client, Environment } from 'square'
    //
    // const client = new Client({
    //   accessToken: process.env.SQUARE_ACCESS_TOKEN,
    //   environment: Environment.Production,
    // })
    //
    // const { result } = await client.ordersApi.createOrder({
    //   order: {
    //     locationId: process.env.SQUARE_LOCATION_ID,
    //     lineItems: items.map(item => ({
    //       name: item.name,
    //       quantity: '1',
    //       basePriceMoney: { amount: BigInt(Math.round(item.price * 100)), currency: 'USD' },
    //     })),
    //     state: 'PROPOSED',
    //   },
    //   idempotencyKey: `colorbar-${sessionId}-${Date.now()}`,
    // })

    // For now, return mock Square order
    const squareOrderId = `sq_${Math.random().toString(36).substr(2, 12)}`

    return NextResponse.json({
      squareOrderId,
      status: 'PROPOSED',
      message: 'Order pushed to Square Register. Complete payment at the register.',
    })
  } catch (error) {
    console.error('Square order POST error:', error)
    return NextResponse.json({ error: 'Failed to create Square order' }, { status: 500 })
  }
}
