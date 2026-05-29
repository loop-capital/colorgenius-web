import { NextRequest, NextResponse } from 'next/server'
import { verifyBearerToken } from '@/lib/auth'

// GET /api/v1/color-bar/pricing
// Returns salon pricing rules for cost calculation
export async function GET(req: NextRequest) {
  try {
    const user = await verifyBearerToken(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Default pricing rules — in production these come from salon settings DB
    const rules = [
      { brand: 'Davines', productType: 'permanent', pricePerGram: 0.12, markup: 2.5 },
      { brand: 'Davines', productType: 'demi-permanent', pricePerGram: 0.10, markup: 2.5 },
      { brand: 'Davines', productType: 'developer', pricePerGram: 0.04, markup: 2.0 },
      { brand: 'Redken', productType: 'permanent', pricePerGram: 0.11, markup: 2.5 },
      { brand: 'Redken', productType: 'demi-permanent', pricePerGram: 0.09, markup: 2.5 },
      { brand: 'Redken', productType: 'developer', pricePerGram: 0.04, markup: 2.0 },
      { brand: 'Wella', productType: 'permanent', pricePerGram: 0.13, markup: 2.5 },
      { brand: 'Wella', productType: 'demi-permanent', pricePerGram: 0.11, markup: 2.5 },
      { brand: 'Wella', productType: 'developer', pricePerGram: 0.05, markup: 2.0 },
      { brand: 'Schwarzkopf', productType: 'permanent', pricePerGram: 0.12, markup: 2.5 },
      { brand: 'Schwarzkopf', productType: 'developer', pricePerGram: 0.04, markup: 2.0 },
      { brand: 'Olaplex', productType: 'additive', pricePerGram: 0.40, markup: 3.0 },
      { brand: 'K18', productType: 'additive', pricePerGram: 0.50, markup: 3.0 },
      { brand: 'Generic', productType: 'developer', pricePerGram: 0.03, markup: 2.0 },
    ]

    return NextResponse.json({ rules })
  } catch (error) {
    console.error('Color bar pricing GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 })
  }
}
