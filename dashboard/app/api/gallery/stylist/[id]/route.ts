import { NextRequest } from 'next/server'
import { successResponse, Errors } from '@/lib/api/response'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return successResponse({
    stylist: {
      id,
      name: 'Eiza at Pleij Salon',
      bio: 'Senior colorist specializing in balayage and dimensional color. 15+ years experience.',
      specialties: ['Balayage', 'Color Correction', 'Gray Coverage'],
      uplook_profile_url: `https://getuplook.com/professional/${id}?ref=colorgenius`,
      total_posts: 47,
      total_likes: 3241,
      follower_count: 892,
    },
    portfolio: Array.from({ length: 6 }, (_, i) => ({
      id: `portfolio-${i}`,
      before_photo_url: `https://picsum.photos/400/500?random=${i*2+200}`,
      after_photo_url: `https://picsum.photos/400/500?random=${i*2+201}`,
      caption: ['Summer balayage', 'Root touch-up', 'Ash blonde', 'Golden highlights', 'Color correction', 'Dimensional color'][i],
      likes_count: Math.floor(Math.random() * 200),
      created_at: new Date(Date.now() - i * 86400000 * 7).toISOString(),
    })),
  })
}
