import { NextRequest } from 'next/server'
import { successResponse, Errors, getCurrentStylist } from '@/lib/api/response'

export async function GET(req: NextRequest) {
  const stylist = getCurrentStylist(req)
  if (!stylist) return Errors.UNAUTHORIZED()

  return successResponse({
    stylist_id: stylist.id,
    total_templates: 5,
    total_sales: 127,
    total_earnings_cents: 190500,
    avg_rating: 4.7,
    this_month: { sales: 23, earnings_cents: 34500 },
    top_templates: [
      { title: 'Balayage Masterclass', sales: 45, earnings_cents: 67500 },
      { title: 'Root Touch-Up Protocol', sales: 32, earnings_cents: 32000 },
      { title: 'Gray Coverage System', sales: 28, earnings_cents: 56000 },
    ],
    pending_payout_cents: 45000,
  })
}
