import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { getOrCreateStylistForUser } from '@/lib/stylist'
import { uploadToR2 } from '@/lib/r2'

// GET /api/v1/community/posts — fetch feed posts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tab = searchParams.get('tab') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const tag = searchParams.get('tag') // filter by hashtag
    const type = searchParams.get('type') // filter by post type
    const stylistId = searchParams.get('stylistId') // filter by author
    const offset = (page - 1) * limit

    const where: any = { is_approved: true }

    if (tag) where.tags = { has: tag }
    if (type) where.type = type
    if (stylistId) where.stylist_id = stylistId

    // Tab-based sorting
    let orderBy: any = { created_at: 'desc' }
    if (tab === 'trending') orderBy = { score: 'desc' }
    if (tab === 'popular') orderBy = { like_count: 'desc' }

    const [posts, total] = await Promise.all([
      prisma.community_posts.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit + 1, // fetch one extra to check hasMore
        include: {
          photos: { orderBy: { order: 'asc' } },
          stylist: {
            select: {
              id: true,
              display_name: true,
              first_name: true,
              last_name: true,
              instagram_handle: true,
              tiktok_handle: true,
              avatar_url: true,
              creator_tier: true,
              is_verified: true,
              badges: true,
              byondu_profile_url: true,
            },
          },
        },
      }),
      prisma.community_posts.count({ where }),
    ])

    const hasMore = posts.length > limit
    const items = posts.slice(0, limit).map((post) => ({
      id: post.id,
      type: post.type,
      content: post.content,
      formulaId: post.formula_id,
      formulaLabel: post.formula_label,
      tags: post.tags,
      likeCount: post.like_count,
      commentCount: post.comment_count,
      viewCount: post.view_count,
      createdAt: post.created_at,
      author: {
        id: post.stylist.id,
        name: post.stylist.display_name || `${post.stylist.first_name} ${post.stylist.last_name}`,
        handle: post.stylist.instagram_handle,
        tiktokHandle: post.stylist.tiktok_handle,
        avatar: post.stylist.avatar_url,
        tier: post.stylist.creator_tier,
        isVerified: post.stylist.is_verified,
        badges: post.stylist.badges,
        byonduProfileUrl: post.stylist.byondu_profile_url,
      },
      photos: post.photos.map((p) => ({
        id: p.id,
        url: p.url,
        label: p.label,
        order: p.order,
      })),
    }))

    return NextResponse.json({ items, hasMore, total, page })
  } catch (error: any) {
    console.error('Community posts fetch error:', error)
    return NextResponse.json({ items: [], error: error.message }, { status: 500 })
  }
}

// POST /api/v1/community/posts — create a new post
// Previously took stylistId straight from the request (body or form field,
// literally commented "// TODO: get stylist_id from auth session") and
// stored a fake placeholder URL instead of actually uploading photos —
// anyone could post as any stylist, and every posted photo was a broken
// link.
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const stylist = await getOrCreateStylistForUser(user.userId)
    if (!stylist) {
      return NextResponse.json({ error: 'Could not resolve your stylist profile' }, { status: 400 })
    }

    const contentType = req.headers.get('content-type') || ''

    // Handle FormData (with photos)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const type = (formData.get('type') as string) || 'transformation'
      const content = (formData.get('content') as string) || ''
      const formulaLabel = (formData.get('formulaLabel') as string) || null
      const tagsStr = (formData.get('tags') as string) || '[]'
      const tags = JSON.parse(tagsStr)
      const photoCount = parseInt((formData.get('photoCount') as string) || '0')

      // Create post
      const post = await prisma.community_posts.create({
        data: {
          stylist_id: stylist.id,
          type,
          content,
          formula_label: formulaLabel,
          tags,
        },
      })

      // Real photo uploads to R2 — this previously wrote a fake
      // /uploads/community/... path that pointed at nothing.
      for (let i = 0; i < photoCount; i++) {
        const file = formData.get(`photo_${i}`) as File | null
        const label = (formData.get(`photo_${i}_label`) as string) || 'detail'
        if (file) {
          const ext = file.type.split('/')[1] || 'jpg'
          const key = `community/${stylist.id}/${post.id}/${i}-${Date.now()}.${ext}`
          const url = await uploadToR2(key, Buffer.from(await file.arrayBuffer()), file.type)
          await prisma.community_post_photos.create({
            data: { post_id: post.id, url, label, order: i },
          })
        }
      }

      // Increment tag counts for trending
      for (const tag of tags) {
        await prisma.trend_searches.create({
          data: { query: tag, category: 'trend' },
        }).catch(() => {}) // non-critical
      }

      return NextResponse.json({ id: post.id, ok: true })
    }

    // Handle JSON (no photos, text-only post)
    const body = await req.json()
    const { type, content, formulaLabel, tags } = body

    const post = await prisma.community_posts.create({
      data: {
        stylist_id: stylist.id,
        type: type || 'tip',
        content: content || '',
        formula_label: formulaLabel || null,
        tags: tags || [],
      },
    })

    // Track tags for trending
    for (const tag of (tags || [])) {
      await prisma.trend_searches.create({
        data: { query: tag, category: 'trend' },
      }).catch(() => {})
    }

    return NextResponse.json({ id: post.id, ok: true })
  } catch (error: any) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
