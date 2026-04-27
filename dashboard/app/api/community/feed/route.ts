import { NextRequest } from 'next/server'
import { successResponse, Errors } from '@/lib/api/response'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const cursor = searchParams.get('cursor')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  // Mock feed
  const posts = Array.from({ length: limit }, (_, i) => ({
    id: `post-${i}`,
    stylist_id: `stylist-${i % 5}`,
    caption: ['Summer balayage transformation', 'Root touch-up result', 'Ash blonde correction', 'Golden highlights'][i % 4],
    before_photo_url: `https://picsum.photos/400/500?random=${i*2}`,
    after_photo_url: `https://picsum.photos/400/500?random=${i*2+1}`,
    likes_count: Math.floor(Math.random() * 100),
    saves_count: Math.floor(Math.random() * 30),
    comments_count: Math.floor(Math.random() * 15),
    trend_score: Math.floor(Math.random() * 1000),
    tags: ['balayage', 'blonde', 'transformation'],
    created_at: new Date(Date.now() - i * 3600000).toISOString(),
  }))

  return successResponse(posts, {
    cursor: cursor ? String(parseInt(cursor) + limit) : String(limit),
    total: 1000,
  })
}
