import { NextRequest } from 'next/server'
import { successResponse, errorResponse, Errors, getCurrentStylist } from '@/lib/api/response'

const MOCK_POSTS: any[] = []

export async function POST(req: NextRequest) {
  const stylist = getCurrentStylist(req)
  if (!stylist) return Errors.UNAUTHORIZED()

  try {
    const body = await req.json()
    const post = {
      id: crypto.randomUUID(),
      stylist_id: stylist.id,
      ...body,
      likes_count: 0,
      saves_count: 0,
      comments_count: 0,
      trend_score: 0,
      moderation_status: 'pending',
      created_at: new Date().toISOString(),
    }
    MOCK_POSTS.push(post)
    return successResponse(post)
  } catch {
    return Errors.VALIDATION('Invalid request body')
  }
}
