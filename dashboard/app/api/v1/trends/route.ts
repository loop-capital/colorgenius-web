import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/v1/trends — fetch top trending searches
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '16')
    const category = searchParams.get('category') // optional filter

    const since = new Date()
    since.setDate(since.getDate() - days)

    // Build where clause
    const where: any = {
      created_at: { gte: since },
    }
    if (category) where.category = category

    // Aggregate: group by query, count hits, get most recent
    const results = await prisma.trend_searches.groupBy({
      by: ['query'],
      where,
      _count: { query: true },
      _max: { created_at: true },
      orderBy: { _count: { query: 'desc' } },
      take: limit,
    })

    const trends = results.map((r) => ({
      name: r.query,
      count: r._count.query,
      lastSearched: r._max.created_at,
    }))

    return NextResponse.json({ trends, period: { days, since } })
  } catch (error: any) {
    console.error('Trends fetch error:', error)
    return NextResponse.json({ trends: [], error: error.message }, { status: 500 })
  }
}

// POST /api/v1/trends — log a search event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, category, userId } = body

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 })
    }

    await prisma.trend_searches.create({
      data: {
        query: query.trim().toLowerCase(),
        category: category || 'free-text',
        user_id: userId || null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Trend log error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
