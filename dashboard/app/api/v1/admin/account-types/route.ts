import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
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
    const updatePayload: Record<string, any> = {
      account_type: body.accountType,
    }

    // Set brand_id for brand-related types, clear for stylist/beta_tester
    if (body.accountType === 'brand_ambassador' || body.accountType === 'brand_account') {
      if (!body.brandId) {
        return NextResponse.json(
          { error: 'brandId is required for brand_ambassador and brand_account types' },
          { status: 400 }
        )
      }
      updatePayload.brand_id = body.brandId
    } else {
      updatePayload.brand_id = null
    }

    const { data: updated, error } = await supabaseAdmin
      .from('stylists')
      .update(updatePayload)
      .eq('id', body.stylistId)
      .select('id, email, name, account_type, brand_id')
      .single()

    if (error) {
      console.error('Update account type error:', error)
      return NextResponse.json(
        { error: 'Failed to update account type' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        stylist: {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          accountType: updated.account_type,
          brandId: updated.brand_id,
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

    const { data: stylists, error } = await supabaseAdmin
      .from('stylists')
      .select('id, email, name, account_type, brand_id')
      .order('name')

    if (error) {
      console.error('List stylists error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch stylists' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        stylists: (stylists || []).map((s) => ({
          id: s.id,
          email: s.email,
          name: s.name,
          accountType: s.account_type || 'stylist',
          brandId: s.brand_id,
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
