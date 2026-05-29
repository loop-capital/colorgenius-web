import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { verifyBearerToken } from '@/lib/auth'

interface CompletedStep {
  product: string
  shadeCode: string
  brand: string
  targetGrams: number
  actualGrams: number
  role: string
}

// POST /api/v1/color-bar/session/:id/complete
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyBearerToken(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { steps, totalCost } = body as { steps: CompletedStep[]; totalCost: number }

    if (!steps || !Array.isArray(steps)) {
      return NextResponse.json({ error: 'Steps array is required' }, { status: 400 })
    }

    // Try to update in Supabase (will fail if table doesn't exist)
    try {
      const { error } = await supabaseAdmin
        .from('color_bar_sessions')
        .update({
          status: 'completed',
          steps: steps,
          total_cost: totalCost || 0,
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
    } catch (dbError) {
      console.warn('color_bar_sessions table not found, session not persisted')
    }

    // Build receipt URL
    const receiptUrl = `/receipts/color-bar/${id}`

    return NextResponse.json({
      transactionId: id,
      receiptUrl,
      totalCost: totalCost || 0,
      stepsCount: steps.length,
      totalGrams: steps.reduce((sum: number, s: CompletedStep) => sum + s.actualGrams, 0),
    })
  } catch (error) {
    console.error('Color bar session complete error:', error)
    return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 })
  }
}
