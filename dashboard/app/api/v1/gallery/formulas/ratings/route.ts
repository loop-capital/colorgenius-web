import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/v1/gallery/formulas/ratings?formulaId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const formulaId = searchParams.get('formulaId')

    if (!formulaId) {
      return NextResponse.json({ error: 'formulaId required' }, { status: 400 })
    }

    const ratings = await prisma.formula_ratings.findMany({
      where: { formula_id: formulaId },
    })

    const avgExecution = ratings.reduce((sum, r) => sum + (r.execution || 0), 0) / (ratings.filter(r => r.execution).length || 1)
    const avgEffectiveness = ratings.reduce((sum, r) => sum + (r.effectiveness || 0), 0) / (ratings.filter(r => r.effectiveness).length || 1)
    const avgOverall = ratings.reduce((sum, r) => sum + r.overall, 0) / (ratings.length || 1)

    return NextResponse.json({
      totalRatings: ratings.length,
      averageExecution: Math.round(avgExecution * 10) / 10,
      averageEffectiveness: Math.round(avgEffectiveness * 10) / 10,
      averageOverall: Math.round(avgOverall * 10) / 10,
      breakdown: {
        5: ratings.filter(r => r.overall === 5).length,
        4: ratings.filter(r => r.overall === 4).length,
        3: ratings.filter(r => r.overall === 3).length,
        2: ratings.filter(r => r.overall === 2).length,
        1: ratings.filter(r => r.overall === 1).length,
      },
    })
  } catch (error) {
    console.error('Formula ratings GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
  }
}

// POST /api/v1/gallery/formulas/ratings — Rate a formula
export async function POST(req: NextRequest) {
  try {
    const { formulaId, raterId, execution, effectiveness, overall } = await req.json()

    if (!formulaId || !raterId || !overall) {
      return NextResponse.json({ error: 'formulaId, raterId, and overall (1-5) required' }, { status: 400 })
    }

    if (overall < 1 || overall > 5) {
      return NextResponse.json({ error: 'overall must be 1-5' }, { status: 400 })
    }

    const rating = await prisma.formula_ratings.upsert({
      where: { formula_id_rater_id: { formula_id: formulaId, rater_id: raterId } },
      update: {
        execution: execution || null,
        effectiveness: effectiveness || null,
        overall,
        updated_at: new Date(),
      },
      create: {
        formula_id: formulaId,
        rater_id: raterId,
        execution: execution || null,
        effectiveness: effectiveness || null,
        overall,
      },
    })

    return NextResponse.json({ id: rating.id, overall: rating.overall })
  } catch (error) {
    console.error('Formula ratings POST error:', error)
    return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 })
  }
}