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

    // Use Square SDK to create order
    const { squareClient } = await import('@/lib/square')
    
    const lineItems = items.map(item => ({
      name: item.name,
      quantity: item.quantity.toString(),
      basePriceMoney: { 
        amount: BigInt(Math.round(item.price * 100)), 
        currency: 'USD' as const,
      },
    }))

    const idempotencyKey = `colorbar-${sessionId}-${Date.now()}`

    const response = await squareClient.orders.create({
      order: {
        locationId: process.env.SQUARE_LOCATION_ID || '',
        lineItems,
        state: 'OPEN',
        source: { name: 'COLORgenius Color Bar' },
      },
      idempotencyKey,
    })

    const order = response.order
    if (!order) {
      throw new Error('Square order creation returned no order')
    }

    return NextResponse.json({
      squareOrderId: order.id,
      status: order.state,
      totalMoney: order.totalMoney,
      message: 'Order pushed to Square Register. Complete payment at the register.',
    })
  } catch (error: any) {
    console.error('Square order POST error:', error)
    return NextResponse.json({ 
      error: 'Failed to create Square order', 
      details: error?.message || String(error),
    }, { status: 500 })
  }
}
