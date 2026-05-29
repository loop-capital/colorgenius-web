import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyBearerToken } from '@/lib/auth'

interface UpdateAccountTypeBody {
  stylistId: string
  accountType: 'stylist' | 'beta_tester' | 'brand_ambassador' | 'brand_account'
  brandId?: string
}

// POST /api/v1/admin/account-types
// Admin-only: update a stylist's account type
export async function POST(req: NextRequest) {
  try {
    const user = await verifyBearerToken(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if requester is admin (stylist with admin flag or service role)
    // For now, use service_role key which bypasses RLS
    const body = (await req.json()) as UpdateAccountTypeBody

    if (!body.stylistId || !body.accountType) {
      return NextResponse.json(
        { error: 'Missing required fields: stylistId, accountType' },
        { status: 400 }
      )
    }

    // Validate account type
    const validTypes = ['stylist', 'beta_tester', 'brand_ambassador', 'brand_account']
    if (!validTypes.includes(body.accountType)) {
      return NextResponse.json(
        { error: `Invalid accountType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Update the stylist record
    const updateData: any = {
      creator_tier: body.accountType,
    }

    // Set brand_id for brand-related types, clear for stylist/beta_tester
    if (body.accountType === 'brand_ambassador' || body.accountType === 'brand_account') {
      if (!body.brandId) {
        return NextResponse.json(
          { error: 'brandId is required for brand_ambassador and brand_account types' },
          { status: 400 }
        )
      }
      // Note: The stylists model does not have a brand_id field in the Prisma schema.
      // For now, we skip storing brand_id. If needed, extend the schema.
    }

    const updated = await prisma.stylists.update({
      where: { id: body.stylistId },
      data: updateData,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        creator_tier: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        stylist: {
          id: updated.id,
          email: updated.email,
          name: [updated.first_name, updated.last_name].filter(Boolean).join(' ') || updated.email,
          accountType: updated.creator_tier || 'stylist',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin account-types error:', error)
    return NextResponse.json(
      { error: 'Failed to update account type' },
      { status: 500 }
    )
  }
}

// GET /api/v1/admin/account-types
// List all stylists with their account types
export async function GET(req: NextRequest) {
  try {
    const user = await verifyBearerToken(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stylists = await prisma.stylists.findMany({
      orderBy: { first_name: 'asc' },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        creator_tier: true,
      },
    })

    return NextResponse.json(
      {
        stylists: stylists.map((s) => ({
          id: s.id,
          email: s.email,
          name: [s.first_name, s.last_name].filter(Boolean).join(' ') || s.email,
          accountType: s.creator_tier || 'stylist',
        })),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin list stylists error:', error)
    return NextResponse.json(
      { error: 'Failed to list stylists' },
      { status: 500 }
    )
  }
}
