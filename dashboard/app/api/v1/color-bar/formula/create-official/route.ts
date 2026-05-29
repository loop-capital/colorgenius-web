import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { verifyBearerToken } from '@/lib/auth'

interface CreateOfficialBody {
  formulaId: string
  brandId: string
  name: string
  notes?: string
}

// POST /api/v1/color-bar/formula/create-official
// Creates a NEW official brand formula from an existing personal formula
export async function POST(req: NextRequest) {
  try {
    const user = await verifyBearerToken(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as CreateOfficialBody

    // Validate required fields
    if (!body.formulaId || !body.brandId || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields: formulaId, brandId, name' },
        { status: 400 }
      )
    }

    // Fetch the original formula to copy from
    const { data: original, error: fetchError } = await supabaseAdmin
      .from('formulas')
      .select('*')
      .eq('id', body.formulaId)
      .single()

    if (fetchError || !original) {
      return NextResponse.json(
        { error: 'Original formula not found' },
        { status: 404 }
      )
    }

    // Create the new official brand formula
    const { data: official, error: insertError } = await supabaseAdmin
      .from('formulas')
      .insert({
        client_id: original.client_id,
        formula_data: original.formula_data,
        formula_type: original.formula_type,
        name: body.name,
        notes: body.notes ?? `Official ${body.name} formula`,
        is_archived: false,
        brand_id: body.brandId,
        is_official: true,
        created_by: user.userId,
        owned_by: body.brandId,
        visibility: 'public',
        tier: 'verified',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Create official formula error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create official formula' },
        { status: 500 }
      )
    }

    // Create formula_versions entry linking original → official
    await supabaseAdmin.from('formula_versions').insert({
      formula_id: official.id,
      version_number: 1,
      formula_data: original.formula_data,
      created_by: user.userId,
      change_summary: `Created from personal formula ${body.formulaId}`,
    })

    return NextResponse.json(
      {
        success: true,
        officialFormula: {
          id: official.id,
          name: official.name,
          brandId: body.brandId,
          isOfficial: true,
          visibility: 'public',
          tier: 'verified',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create official formula error:', error)
    return NextResponse.json(
      { error: 'Failed to create official formula' },
      { status: 500 }
    )
  }
}
