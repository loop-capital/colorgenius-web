import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyBearerToken } from '@/lib/auth'

const PRICE_RULES: Record<string, { color: number; developer: number; markup: number }> = {
  davines:      { color: 0.12, developer: 0.04, markup: 2.5 },
  redken:       { color: 0.11, developer: 0.04, markup: 2.5 },
  wella:        { color: 0.13, developer: 0.05, markup: 2.5 },
  schwarzkopf:  { color: 0.12, developer: 0.04, markup: 2.5 },
  olaplex:      { color: 0.40, developer: 0.04, markup: 3.0 },
  k18:          { color: 0.50, developer: 0.04, markup: 3.0 },
  default:      { color: 0.10, developer: 0.03, markup: 2.0 },
}

function parseMixingRatio(ratio: string | null | undefined): [number, number] {
  if (!ratio) return [1, 1.5]
  const parts = ratio.split(':').map(Number)
  if (parts.length !== 2 || parts.some(isNaN) || parts.some(n => n <= 0)) return [1, 1.5]
  return [parts[0], parts[1]]
}

// GET /api/v1/color-bar/formulas/:clientId?limit=10&totalWeight=90
export async function GET(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  try {
    const user = await verifyBearerToken(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clientId } = await params
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50)
    const totalWeight = Math.min(Math.max(parseInt(searchParams.get('totalWeight') || '90', 10), 10), 500)

    const visits = await prisma.client_visits.findMany({
      where: { client_id: clientId },
      orderBy: { visit_date: 'desc' },
      take: limit,
    })

    const formulas = await prisma.formulas.findMany({
      where: { client_id: clientId },
      orderBy: { created_at: 'desc' },
      take: limit,
    })

    const formattedFormulas = (visits ?? []).map((visit) => {
      const formula = formulas?.find(f => f.id === visit.formula_id)

      const [colorRatio, devRatio] = parseMixingRatio(formula?.mixing_ratio)
      const colorGrams = Math.round(totalWeight * colorRatio / (colorRatio + devRatio))
      const devGrams = totalWeight - colorGrams

      const prices = PRICE_RULES[(formula?.product_brand ?? '').toLowerCase()] ?? PRICE_RULES.default
      const totalCost = Math.round(
        (colorGrams * prices.color + devGrams * prices.developer) * prices.markup * 100
      ) / 100

      const colorSteps = formula
        ? [
            {
              product: [formula.product_brand, formula.product_line, formula.product_shade]
                .filter(Boolean)
                .join(' '),
              shadeCode: formula.product_shade || '',
              brand: formula.product_brand || '',
              targetGrams: colorGrams,
              actualGrams: 0,
              completed: false,
              role: 'color',
            },
            {
              product: `${formula.developer_vol || 20}vol Developer`,
              shadeCode: `${formula.developer_vol || 20}V`,
              brand: formula.product_brand || '',
              targetGrams: devGrams,
              actualGrams: 0,
              completed: false,
              role: 'developer',
            },
          ]
        : []

      const totalGrams = colorSteps.reduce((sum, s) => sum + s.targetGrams, 0)

      return {
        id: visit.id,
        createdAt: visit.visit_date,
        steps: colorSteps,
        developerVolume: formula?.developer_vol || 20,
        processingTime: formula?.processing_time || 30,
        totalGrams,
        totalCost,
        notes: formula?.notes || '',
      }
    })

    return NextResponse.json({ formulas: formattedFormulas })
  } catch (error) {
    console.error('Color bar formulas GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch formulas' }, { status: 500 })
  }
}
