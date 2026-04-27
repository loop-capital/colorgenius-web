import { NextRequest } from 'next/server'
import { successResponse, errorResponse, Errors, getCurrentStylist } from '@/lib/api/response'

export async function POST(req: NextRequest) {
  const stylist = getCurrentStylist(req)
  if (!stylist) return Errors.UNAUTHORIZED()

  try {
    const { template_id } = await req.json()
    if (!template_id) return Errors.VALIDATION('template_id required')

    // Mock purchase
    return successResponse({
      purchase_id: crypto.randomUUID(),
      template_id,
      buyer_stylist_id: stylist.id,
      price_paid_cents: 1500,
      status: 'purchased',
      purchased_at: new Date().toISOString(),
    })
  } catch {
    return Errors.VALIDATION('Invalid request body')
  }
}
