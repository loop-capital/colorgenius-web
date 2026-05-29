import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { verifyBearerToken } from '@/lib/auth'

export type AccountType =
  | 'stylist'
  | 'beta_tester'
  | 'brand_ambassador'
  | 'brand_account'

export interface StylistMeResponse {
  id: string
  email: string
  name: string
  type: AccountType
  brandId?: string
  permissions: {
    canConvertToBrand: boolean
    canSendToTraining: boolean
    canManageAmbassadors: boolean
    canExportTrainingData: boolean
  }
}

// GET /api/v1/stylists/me
export async function GET(req: NextRequest) {
  try {
    const user = await verifyBearerToken(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch stylist profile from Supabase
    const { data: stylist, error } = await supabaseAdmin
      .from('stylists')
      .select('id, email, name, account_type, brand_id')
      .eq('id', user.userId)
      .single()

    if (error || !stylist) {
      // Fallback: if no stylist row, infer from auth user
      const type: AccountType = 'stylist'
      const response: StylistMeResponse = {
        id: user.userId,
        email: user.email,
        name: user.username || user.email.split('@')[0],
        type,
        permissions: buildPermissions(type),
      }
      return NextResponse.json(response, { status: 200 })
    }

    const type: AccountType =
      (stylist.account_type as AccountType) || 'stylist'

    const response: StylistMeResponse = {
      id: stylist.id,
      email: stylist.email || user.email,
      name: stylist.name || user.username || user.email.split('@')[0],
      type,
      brandId: stylist.brand_id || undefined,
      permissions: buildPermissions(type),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Stylists me error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stylist profile' },
      { status: 500 }
    )
  }
}

function buildPermissions(type: AccountType): StylistMeResponse['permissions'] {
  return {
    canConvertToBrand: type === 'brand_ambassador',
    canSendToTraining: type === 'beta_tester',
    canManageAmbassadors: type === 'brand_account',
    canExportTrainingData: type === 'brand_account' || type === 'beta_tester',
  }
}
