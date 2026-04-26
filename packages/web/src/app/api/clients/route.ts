import { NextRequest, NextResponse } from 'next/server'
// ─────────────────────────────────────────────
// Types & Validation Schemas
// ─────────────────────────────────────────────

interface ClientInput {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  notes?: string
  preferred_brand?: string
  hair_type?: string
}

function validateClient(input: unknown): { success: true; data: ClientInput } | { success: false; issues: string[] } {
  const obj = input as Record<string, unknown>
  const issues: string[] = []

  if (!obj.first_name || typeof obj.first_name !== 'string' || obj.first_name.trim().length === 0) {
    issues.push('first_name: First name is required')
  }
  if (obj.first_name && typeof obj.first_name === 'string' && obj.first_name.length > 100) {
    issues.push('first_name: Max 100 characters')
  }
  if (!obj.last_name || typeof obj.last_name !== 'string' || obj.last_name.trim().length === 0) {
    issues.push('last_name: Last name is required')
  }
  if (obj.last_name && typeof obj.last_name === 'string' && obj.last_name.length > 100) {
    issues.push('last_name: Max 100 characters')
  }
  if (obj.email !== undefined && obj.email !== '' && (typeof obj.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj.email))) {
    issues.push('email: Invalid email')
  }
  if (obj.phone !== undefined && typeof obj.phone === 'string' && obj.phone.length > 50) {
    issues.push('phone: Max 50 characters')
  }
  if (obj.notes !== undefined && typeof obj.notes === 'string' && obj.notes.length > 5000) {
    issues.push('notes: Max 5000 characters')
  }
  if (obj.preferred_brand !== undefined && typeof obj.preferred_brand === 'string' && obj.preferred_brand.length > 100) {
    issues.push('preferred_brand: Max 100 characters')
  }
  if (obj.hair_type !== undefined && typeof obj.hair_type === 'string' && obj.hair_type.length > 50) {
    issues.push('hair_type: Max 50 characters')
  }

  if (issues.length > 0) return { success: false, issues }

  return {
    success: true,
    data: {
      first_name: String(obj.first_name).trim(),
      last_name: String(obj.last_name).trim(),
      email: obj.email !== undefined ? String(obj.email) : undefined,
      phone: obj.phone !== undefined ? String(obj.phone) : undefined,
      notes: obj.notes !== undefined ? String(obj.notes) : undefined,
      preferred_brand: obj.preferred_brand !== undefined ? String(obj.preferred_brand) : undefined,
      hair_type: obj.hair_type !== undefined ? String(obj.hair_type) : undefined,
    }
  }
}

// NOTE: ClientSchema removed (unused — was breaking build)
// const ClientSchema = z.object({
//   first_name: z.string().min(1, 'First name is required').max(100),
//   ...
// });

// ─────────────────────────────────────────────
// Mock Data Store (In-Memory for Beta)
// ─────────────────────────────────────────────

interface Client {
  id: string
  first_name: string
  last_name: string
  name: string
  email: string
  phone: string
  notes: string
  preferred_brand: string
  hair_type: string
  formulations: number
  lastVisit: string | null
  avgScore: number | null
  nextAppt: string | null
  created_at: string
  updated_at: string
}

let CLIENTS: Client[] = [
  { id: 'c1', first_name: 'Sarah', last_name: 'Mitchell', name: 'Sarah Mitchell', email: 'sarah@email.com', phone: '(555) 123-4567', notes: '', preferred_brand: 'Wella', hair_type: 'medium', formulations: 8, lastVisit: '2026-04-20', avgScore: 91, nextAppt: '2026-05-18', created_at: '2025-01-15T00:00:00Z', updated_at: '2025-01-15T00:00:00Z' },
  { id: 'c2', first_name: 'Jessica', last_name: 'Torres', name: 'Jessica Torres', email: 'jess@email.com', phone: '(555) 234-5678', notes: '', preferred_brand: 'Redken', hair_type: 'coarse', formulations: 12, lastVisit: '2026-04-19', avgScore: 88, nextAppt: '2026-05-17', created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'c3', first_name: 'Amanda', last_name: 'Brooks', name: 'Amanda Brooks', email: 'amanda@email.com', phone: '(555) 345-6789', notes: '', preferred_brand: 'Schwarzkopf', hair_type: 'fine', formulations: 6, lastVisit: '2026-04-18', avgScore: 85, nextAppt: '2026-05-16', created_at: '2025-02-10T00:00:00Z', updated_at: '2025-02-10T00:00:00Z' },
  { id: 'c4', first_name: 'Maria', last_name: 'Chen', name: 'Maria Chen', email: 'maria@email.com', phone: '(555) 456-7890', notes: '', preferred_brand: 'Davines', hair_type: 'medium', formulations: 4, lastVisit: '2026-04-17', avgScore: 94, nextAppt: '2026-05-15', created_at: '2025-03-05T00:00:00Z', updated_at: '2025-03-05T00:00:00Z' },
  { id: 'c5', first_name: 'Emma', last_name: 'Wilson', name: 'Emma Wilson', email: 'emma@email.com', phone: '(555) 567-8901', notes: '', preferred_brand: 'Wella', hair_type: 'fine', formulations: 3, lastVisit: '2026-04-15', avgScore: 90, nextAppt: null, created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z' },
  { id: 'c6', first_name: 'Priya', last_name: 'Patel', name: 'Priya Patel', email: 'priya@email.com', phone: '(555) 678-9012', notes: '', preferred_brand: 'Redken', hair_type: 'coarse', formulations: 7, lastVisit: '2026-04-12', avgScore: 87, nextAppt: '2026-05-10', created_at: '2024-12-08T00:00:00Z', updated_at: '2024-12-08T00:00:00Z' },
  { id: 'c7', first_name: 'Lisa', last_name: 'Rodriguez', name: 'Lisa Rodriguez', email: 'lisa@email.com', phone: '(555) 789-0123', notes: '', preferred_brand: 'Schwarzkopf', hair_type: 'medium', formulations: 5, lastVisit: '2026-04-10', avgScore: 89, nextAppt: '2026-05-08', created_at: '2025-01-22T00:00:00Z', updated_at: '2025-01-22T00:00:00Z' },
  { id: 'c8', first_name: 'Rachel', last_name: 'Kim', name: 'Rachel Kim', email: 'rachel@email.com', phone: '(555) 890-1234', notes: '', preferred_brand: 'Wella', hair_type: 'fine', formulations: 2, lastVisit: '2026-04-08', avgScore: 92, nextAppt: '2026-05-05', created_at: '2025-03-18T00:00:00Z', updated_at: '2025-03-18T00:00:00Z' },
  { id: 'c9', first_name: 'Olivia', last_name: 'Brown', name: 'Olivia Brown', email: 'olivia@email.com', phone: '(555) 901-2345', notes: '', preferred_brand: 'Matrix', hair_type: 'coarse', formulations: 9, lastVisit: '2026-04-05', avgScore: 86, nextAppt: '2026-05-02', created_at: '2024-10-14T00:00:00Z', updated_at: '2024-10-14T00:00:00Z' },
  { id: 'c10', first_name: 'Daniel', last_name: 'Lee', name: 'Daniel Lee', email: 'daniel@email.com', phone: '(555) 012-3456', notes: '', preferred_brand: 'Redken', hair_type: 'medium', formulations: 4, lastVisit: '2026-04-03', avgScore: 88, nextAppt: null, created_at: '2025-02-28T00:00:00Z', updated_at: '2025-02-28T00:00:00Z' },
]

// ─────────────────────────────────────────────
// Helper: Format client for response (legacy shape compatibility)
// ─────────────────────────────────────────────

function formatClient(c: Client): Record<string, unknown> {
  return {
    ...c,
    // Keep legacy `name` field for backward compat
    name: `${c.first_name} ${c.last_name}`,
  }
}

function findClientById(id: string): Client | undefined {
  return CLIENTS.find((c) => c.id === id)
}

// ─────────────────────────────────────────────
// GET /api/clients — List clients with pagination + search
// ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const search = searchParams.get('search') || ''

    // Simulate DB query delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Validate pagination params
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

    let filtered = CLIENTS
    if (search) {
      const s = search.toLowerCase()
      filtered = CLIENTS.filter(
        (c) =>
          c.first_name.toLowerCase().includes(s) ||
          c.last_name.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s) ||
          c.phone.includes(search)
      )
    }

    // Sort by lastVisit desc, then created_at desc
    filtered.sort((a, b) => {
      if (a.lastVisit && b.lastVisit) return b.lastVisit.localeCompare(a.lastVisit)
      if (a.lastVisit) return -1
      if (b.lastVisit) return 1
      return b.created_at.localeCompare(a.created_at)
    })

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const data = filtered.slice(offset, offset + limit).map(formatClient)

    return NextResponse.json({
      success: true,
      data: {
        clients: data,
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
    console.error('[GET /api/clients] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load clients' },
      { status: 500 }
    )
  }
}

// ─────────────────────────────────────────────
// POST /api/clients — Create new client
// ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = validateClient(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.issues },
        { status: 400 }
      )
    }

    const data = parsed.data
    const now = new Date().toISOString()
    const id = `c${Date.now()}`

    const newClient: Client = {
      id,
      first_name: data.first_name,
      last_name: data.last_name,
      name: `${data.first_name} ${data.last_name}`,
      email: data.email || '',
      phone: data.phone || '',
      notes: data.notes || '',
      preferred_brand: data.preferred_brand || '',
      hair_type: data.hair_type || '',
      formulations: 0,
      lastVisit: null,
      avgScore: null,
      nextAppt: null,
      created_at: now,
      updated_at: now,
    }

    CLIENTS.push(newClient)

    return NextResponse.json(
      { success: true, data: formatClient(newClient) },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/clients] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    )
  }
}
