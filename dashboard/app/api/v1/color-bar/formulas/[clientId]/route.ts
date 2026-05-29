import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { verifyBearerToken } from '@/lib/auth'

// GET /api/v1/color-bar/formulas/:clientId?limit=10
export async function GET(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  try {
    // Verify authentication (Bearer token from mobile app)
    const user = await verifyBearerToken(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clientId } = await params
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    // Get real client visits from Supabase
    const { data: visits, error } = await supabaseAdmin
      .from('client_visits')
      .select('*')
      .eq('client_id', clientId)
      .order('visit_date', { ascending: false })
      .limit(limit)

    if (error) throw error

    // Get formulas for these visits
    const { data: formulas, error: formulaError } = await supabaseAdmin
      .from('formulas')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (formulaError) throw formulaError

    // Format the response
    const formattedFormulas = visits?.map((visit) => {
      const formula = formulas?.find(f => f.id === visit.formula_id)
      const colorSteps = formula
        ? [
            {
              product: [formula.product_brand, formula.product_line, formula.product_shade]
                .filter(Boolean)
                .join(' '),
              shadeCode: formula.product_shade || '',
              brand: formula.product_brand || '',
              targetGrams: formula.color_grams || 45,
              actualGrams: 0,
              completed: false,
              role: 'color',
            },
            {
              product: `${formula.developer_vol || 20}vol Developer`,
              shadeCode: `${formula.developer_vol || 20}V`,
              brand: formula.product_brand || '',
              targetGrams: formula.developer_grams || 45,
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
        processingTime: formula?.processing_time || 35,
        totalGrams,
        totalCost: formula?.cost || 0,
        notes: formula?.notes || '',
      }
    }) || []

    return NextResponse.json({ formulas: formattedFormulas })
  } catch (error) {
    console.error('Color bar formulas GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch formulas' }, { status: 500 })
  }
}
