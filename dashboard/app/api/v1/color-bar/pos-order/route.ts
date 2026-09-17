import { NextRequest, NextResponse } from 'next/server'
import { verifyBearerToken } from '@/lib/auth'
import { getSalonIdForUser } from '@/lib/stylist'
import { pushSessionToConnectedPos } from '@/lib/pos-push'

// POST /api/v1/color-bar/pos-order
// Provider-agnostic version of /square-order — pushes a completed session
// to whichever POS the salon has connected (Square or Clover today). Mobile
// should call this instead of /square-order going forward so the client
// doesn't need to know or care which POS a given salon uses.
export async function POST(req: NextRequest) {
  try {
    const user = await verifyBearerToken(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = (await req.json()) as { sessionId: string }
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    const salonId = await getSalonIdForUser(user.userId)
    if (!salonId) {
      return NextResponse.json({ error: 'Your account isn’t linked to a salon yet.' }, { status: 400 })
    }

    const result = await pushSessionToConnectedPos(salonId, sessionId)
    if (!result.ok) {
      const status = result.code === 'NOT_CONNECTED' ? 400 : result.code === 'ALREADY_PUSHED' ? 409 : 400
      return NextResponse.json({ error: result.message, code: result.code, orderId: result.existingOrderId }, { status })
    }

    return NextResponse.json({
      orderId: result.orderId,
      provider: result.provider,
      totalCost: result.totalCost,
      pricingWarnings: result.pricingWarnings,
      message: `Order pushed to ${result.provider === 'square' ? 'Square Register' : 'Clover'}. Complete payment there.`,
    })
  } catch (error: any) {
    console.error('POS order push error:', error)
    return NextResponse.json({ error: 'Failed to push order', details: error?.message || String(error) }, { status: 500 })
  }
}
