import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const category = searchParams.get('category')
  const sort = searchParams.get('sort') || 'trending'
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 50)

  const templates = Array.from({ length: pageSize }, (_, i) => ({
    id: `template-${(page-1)*pageSize + i}`,
    title: ['Balayage Masterclass Formula', 'Root Touch-Up Protocol', 'Gray Coverage System', 'Blonde Transformation Kit'][(i) % 4],
    description: 'Professional formulation template with step-by-step instructions.',
    category: category || 'formulation',
    price_cents: [1500, 1000, 2000, 2500][i % 4],
    avg_rating: 4.5 + (i % 5) * 0.1,
    review_count: 20 + i * 3,
    sales_count: 50 + i * 12,
    tags: ['balayage', 'professional', 'beginner-friendly'],
    stylist_name: ['Eiza', 'Maria', 'Jen', 'Sam'][i % 4],
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
  }))

  return successResponse(templates, { page, pageSize, total: 200 })
}
