import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface FormulationRecord {
  id: string
  date: string
  brand: string
  product_line: string
  service_type: string
  current: { level: number; tone: string }
  target: { level: number; tone: string }
  components: { code: string; name: string; amount_g: number }[]
  developer: { volume: number; amount_ml: number }
  mixing_ratio: string
  processing_minutes: number
  score: number | null
  stylist_notes: string
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────
// Mock store — keyed by client ID
// ─────────────────────────────────────────────

const CLIENT_HISTORY: Record<string, FormulationRecord[]> = {
  c1: [
    { id: 'f1', date: '2026-04-20', brand: 'Wella Koleston Perfect ME', product_line: 'Koleston Perfect ME', service_type: 'Full Color', current: { level: 6, tone: 'N' }, target: { level: 7, tone: 'G' }, components: [{ code: '7/3', name: 'Gold Medium Blonde', amount_g: 60 }], developer: { volume: 20, amount_ml: 60 }, mixing_ratio: '1:1', processing_minutes: 35, score: 91, stylist_notes: 'Great result, slight warmth in front.', created_at: '2026-04-20T00:00:00Z', updated_at: '2026-04-20T00:00:00Z' },
    { id: 'f2', date: '2026-03-23', brand: 'Wella Koleston Perfect ME', product_line: 'Koleston Perfect ME', service_type: 'Full Color', current: { level: 6, tone: 'N' }, target: { level: 7, tone: 'G' }, components: [{ code: '7/3', name: 'Gold Medium Blonde', amount_g: 60 }], developer: { volume: 20, amount_ml: 60 }, mixing_ratio: '1:1', processing_minutes: 35, score: 93, stylist_notes: '', created_at: '2026-03-23T00:00:00Z', updated_at: '2026-03-23T00:00:00Z' },
    { id: 'f3', date: '2026-02-25', brand: 'Wella Koleston Perfect ME', product_line: 'Koleston Perfect ME', service_type: 'Root Touch-up', current: { level: 6, tone: 'N' }, target: { level: 7, tone: 'N' }, components: [{ code: '7/0', name: 'Natural Medium Blonde', amount_g: 30 }], developer: { volume: 20, amount_ml: 30 }, mixing_ratio: '1:1', processing_minutes: 30, score: 89, stylist_notes: '', created_at: '2026-02-25T00:00:00Z', updated_at: '2026-02-25T00:00:00Z' },
  ],
  c2: [
    { id: 'f4', date: '2026-04-19', brand: 'Redken Color Gels', product_line: 'Color Gels Lacquers', service_type: 'Root Touch-up', current: { level: 5, tone: 'A' }, target: { level: 6, tone: 'N' }, components: [{ code: '6N', name: 'Natural Dark Blonde', amount_g: 45 }], developer: { volume: 20, amount_ml: 45 }, mixing_ratio: '1:1', processing_minutes: 30, score: 88, stylist_notes: '', created_at: '2026-04-19T00:00:00Z', updated_at: '2026-04-19T00:00:00Z' },
    { id: 'f5', date: '2026-03-22', brand: 'Redken Color Gels', product_line: 'Color Gels Lacquers', service_type: 'Full Color', current: { level: 5, tone: 'A' }, target: { level: 6, tone: 'N' }, components: [{ code: '6N', name: 'Natural Dark Blonde', amount_g: 60 }], developer: { volume: 20, amount_ml: 60 }, mixing_ratio: '1:1', processing_minutes: 35, score: 86, stylist_notes: 'Gray coverage perfect.', created_at: '2026-03-22T00:00:00Z', updated_at: '2026-03-22T00:00:00Z' },
  ],
  c3: [
    { id: 'f6', date: '2026-04-18', brand: 'Schwarzkopf Igora Royal', product_line: 'Igora Royal', service_type: 'Full Color', current: { level: 7, tone: 'G' }, target: { level: 8, tone: 'N' }, components: [{ code: '8-0', name: 'Natural Light Blonde', amount_g: 60 }], developer: { volume: 30, amount_ml: 60 }, mixing_ratio: '1:1', processing_minutes: 40, score: 85, stylist_notes: 'Some fading after 2 weeks.', created_at: '2026-04-18T00:00:00Z', updated_at: '2026-04-18T00:00:00Z' },
  ],
  c4: [
    { id: 'f7', date: '2026-04-17', brand: 'Davines TODOS', product_line: 'TODOS', service_type: 'Highlights', current: { level: 4, tone: 'N' }, target: { level: 5, tone: 'G' }, components: [{ code: '5.0', name: 'Natural Light Brown', amount_g: 50 }], developer: { volume: 20, amount_ml: 50 }, mixing_ratio: '1:1', processing_minutes: 30, score: 94, stylist_notes: 'Excellent coverage.', created_at: '2026-04-17T00:00:00Z', updated_at: '2026-04-17T00:00:00Z' },
  ],
  c5: [
    { id: 'f8', date: '2026-04-15', brand: 'Wella Koleston Perfect ME', product_line: 'Koleston Perfect ME', service_type: 'Full Color', current: { level: 6, tone: 'N' }, target: { level: 7, tone: 'A' }, components: [{ code: '7/1', name: 'Ash Medium Blonde', amount_g: 60 }], developer: { volume: 20, amount_ml: 60 }, mixing_ratio: '1:1', processing_minutes: 35, score: 90, stylist_notes: '', created_at: '2026-04-15T00:00:00Z', updated_at: '2026-04-15T00:00:00Z' },
  ],
  c6: [
    { id: 'f9', date: '2026-04-12', brand: 'Redken Color Gels', product_line: 'Color Gels Lacquers', service_type: 'Full Color', current: { level: 5, tone: 'N' }, target: { level: 6, tone: 'R' }, components: [{ code: '6R', name: 'Red Dark Blonde', amount_g: 60 }], developer: { volume: 20, amount_ml: 60 }, mixing_ratio: '1:1', processing_minutes: 35, score: 87, stylist_notes: '', created_at: '2026-04-12T00:00:00Z', updated_at: '2026-04-12T00:00:00Z' },
  ],
  c7: [
    { id: 'f10', date: '2026-04-10', brand: 'Schwarzkopf Igora Royal', product_line: 'Igora Royal', service_type: 'Root Touch-up', current: { level: 7, tone: 'N' }, target: { level: 6, tone: 'N' }, components: [{ code: '6-0', name: 'Natural Dark Blonde', amount_g: 40 }], developer: { volume: 10, amount_ml: 40 }, mixing_ratio: '1:1', processing_minutes: 25, score: 89, stylist_notes: '', created_at: '2026-04-10T00:00:00Z', updated_at: '2026-04-10T00:00:00Z' },
  ],
}

// ─────────────────────────────────────────────
// GET /api/clients/[id]/history
// ─────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Validate pagination
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid page number' },
        { status: 400 }
      )
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Limit must be between 1 and 100' },
        { status: 400 }
      )
    }

    await new Promise((resolve) => setTimeout(resolve, 200))

    const history = CLIENT_HISTORY[id] || []
    const total = history.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const data = history.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        client_id: id,
        history: data,
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      },
    })
  } catch (error) {
    console.error(`[GET /api/clients/${params.id}/history] error:`, error)
    return NextResponse.json(
      { success: false, error: 'Failed to load history' },
      { status: 500 }
    )
  }
}
