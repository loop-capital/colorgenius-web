import { NextRequest } from 'next/server'
import { successResponse, errorResponse, Errors, getCurrentStylist } from '@/lib/api/response'

const MOCK_TEMPLATES: any[] = []

export async function POST(req: NextRequest) {
  const stylist = getCurrentStylist(req)
  if (!stylist) return Errors.UNAUTHORIZED()

  try {
    const body = await req.json()
    const template = {
      id: crypto.randomUUID(),
      stylist_id: stylist.id,
      ...body,
      status: 'pending_review',
      review_count: 0,
      avg_rating: 0,
      sales_count: 0,
      total_earnings_cents: 0,
      created_at: new Date().toISOString(),
    }
    MOCK_TEMPLATES.push(template)
    return successResponse(template)
  } catch {
    return Errors.VALIDATION('Invalid request body')
  }
}

export async function GET() {
  return successResponse(MOCK_TEMPLATES)
}
