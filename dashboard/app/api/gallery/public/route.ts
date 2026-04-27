import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '24'), 50)

  const posts = Array.from({ length: pageSize }, (_, i) => ({
    id: `gallery-${(page-1)*pageSize + i}`,
    before_photo_url: `https://picsum.photos/400/500?random=${i*2}`,
    after_photo_url: `https://picsum.photos/400/500?random=${i*2+1}`,
    caption: ['Before & After: Summer Balayage', 'Root Touch-Up Transformation', 'Ash Blonde Correction', 'Golden Highlights'][i % 4],
    stylist_name: ['Eiza at Pleij', 'Maria at Salon X', 'Jen at Studio Y', 'Sam at Hair Co'][i % 4],
    stylist_uplook_profile_url: 'https://getuplook.com/professional/eiza',
    consumer_likes_count: Math.floor(Math.random() * 500),
    consumer_saves_count: Math.floor(Math.random() * 100),
    tags: ['balayage', 'blonde', 'transformation'],
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
  }))

  return successResponse(posts, { page, pageSize, total: 500 })
}
