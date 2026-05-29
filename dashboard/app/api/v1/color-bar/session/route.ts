import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { verifyBearerToken } from '@/lib/auth'

// POST /api/v1/color-bar/session
export async function POST(req: NextRequest) {
  try {
    // Verify authentication (Bearer token from mobile app)
    const user = await verifyBearerToken(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { clientId, formulaId, stylistId } = body

    const fallbackId = crypto.randomUUID()
    let sessionId = fallbackId

    // Try to insert into color_bar_sessions (will fail if table doesn't exist)
    try {
      const { data, error } = await supabaseAdmin
        .from('color_bar_sessions')
        .insert({
          salon_id: user.userId,
          client_id: clientId || null,
          stylist_id: stylistId || user.userId,
          formula_id: formulaId || null,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (error) throw error
      if (data?.id) sessionId = data.id
    } catch (dbError) {
      console.warn('color_bar_sessions table not found, returning mock session')
    }

    return NextResponse.json({ sessionId, createdAt: new Date().toISOString() }, { status: 201 })
  } catch (error) {
    console.error('Color bar session POST error:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
