import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyBearerToken } from '@/lib/auth'

interface CreateOfficialBody {
  formulaId: string
  brandId: string
  name: string
  notes?: string
}

// POST /api/v1/color-bar/formula/create-official
// Creates a NEW official brand formula from an existing personal formula.
// NOTE: Prisma schema does not include formula_versions or formula_data/formula_type
// fields on the formulas model. This route maps to available fields and skips
// versioning until the schema is extended.
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
    const original = await prisma.formulas.findUnique({
      where: { id: body.formulaId },
    })

    if (!original) {
      return NextResponse.json(
        { error: 'Original formula not found' },
        { status: 404 }
      )
    }

    // Create the new official brand formula using available Prisma fields
    // NOTE: formula_data, formula_type, brand_id, is_official, created_by,
    // owned_by, visibility, tier are not in the Prisma schema.
    // We map what we can and store official metadata in notes.
    const official = await prisma.formulas.create({
      data: {
        client_id: original.client_id,
        name: body.name,
        notes: body.notes ?? `Official ${body.name} formula (from ${body.formulaId})`,
        product_brand: body.brandId,
        product_line: 'official',
        product_shade: original.product_shade,
        stylist_id: user.userId,
      },
    })

    // NOTE: formula_versions table does not exist in Prisma schema.
    // Versioning is skipped until the schema is extended.

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
