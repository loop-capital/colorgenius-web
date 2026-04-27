import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────
// Shared mock store (mirrors /api/clients/route.ts)
// NOTE: In production this is replaced by DB queries.
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
// Validation Helpers (zod-free)
// ─────────────────────────────────────────────

interface UpdateClientInput {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  notes?: string
  preferred_brand?: string
  hair_type?: string
}

function validateUpdateClient(input: unknown): { success: true; data: UpdateClientInput } | { success: false; issues: string[] } {
  const obj = input as Record<string, unknown>
  const issues: string[] = []

  if (obj.first_name !== undefined) {
    if (typeof obj.first_name !== 'string' || obj.first_name.trim().length === 0) {
      issues.push('first_name: First name is required')
    } else if (obj.first_name.length > 100) {
      issues.push('first_name: Max 100 characters')
    }
  }
  if (obj.last_name !== undefined) {
    if (typeof obj.last_name !== 'string' || obj.last_name.trim().length === 0) {
      issues.push('last_name: Last name is required')
    } else if (obj.last_name.length > 100) {
      issues.push('last_name: Max 100 characters')
    }
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

  const data: UpdateClientInput = {}
  if (obj.first_name !== undefined) data.first_name = String(obj.first_name).trim()
  if (obj.last_name !== undefined) data.last_name = String(obj.last_name).trim()
  if (obj.email !== undefined) data.email = String(obj.email)
  if (obj.phone !== undefined) data.phone = String(obj.phone)
  if (obj.notes !== undefined) data.notes = String(obj.notes)
  if (obj.preferred_brand !== undefined) data.preferred_brand = String(obj.preferred_brand)
  if (obj.hair_type !== undefined) data.hair_type = String(obj.hair_type)

  return { success: true, data }
}

function findClientById(id: string): Client | undefined {
  return CLIENTS.find((c) => c.id === id)
}

function formatClient(c: Client): Record<string, unknown> {
  return {
    ...c,
    name: `${c.first_name} ${c.last_name}`,
  }
}

// ─────────────────────────────────────────────
// GET /api/clients/[id] — Retrieve single client
// ─────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const client = findClientById(id)

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    await new Promise((resolve) => setTimeout(resolve, 150))

    return NextResponse.json({
      success: true,
      data: formatClient(client),
    })
  } catch (error) {
    console.error(`[GET /api/clients/${params.id}] error:`, error)
    return NextResponse.json(
      { success: false, error: 'Failed to load client' },
      { status: 500 }
    )
  }
}

// ─────────────────────────────────────────────
// PUT /api/clients/[id] — Full update (also accepts PATCH semantics)
// ─────────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const parsed = validateUpdateClient(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.issues },
        { status: 400 }
      )
    }

    const idx = CLIENTS.findIndex((c) => c.id === id)
    if (idx === -1) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    const data = parsed.data
    const existing = CLIENTS[idx]
    const now = new Date().toISOString()

    const updated: Client = {
      ...existing,
      first_name: data.first_name ?? existing.first_name,
      last_name: data.last_name ?? existing.last_name,
      email: data.email !== undefined ? data.email : existing.email,
      phone: data.phone !== undefined ? data.phone : existing.phone,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      preferred_brand: data.preferred_brand !== undefined ? data.preferred_brand : existing.preferred_brand,
      hair_type: data.hair_type !== undefined ? data.hair_type : existing.hair_type,
      name: `${data.first_name ?? existing.first_name} ${data.last_name ?? existing.last_name}`,
      updated_at: now,
    }

    CLIENTS[idx] = updated

    return NextResponse.json({
      success: true,
      data: formatClient(updated),
    })
  } catch (error) {
    console.error(`[PUT /api/clients/${params.id}] error:`, error)
    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

// ─────────────────────────────────────────────
// PATCH /api/clients/[id] — Alias to PUT for convenience
// ─────────────────────────────────────────────

export { PUT as PATCH }

// ─────────────────────────────────────────────
// DELETE /api/clients/[id] — Remove client
// ─────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const idx = CLIENTS.findIndex((c) => c.id === id)

    if (idx === -1) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    const deleted = CLIENTS[idx]
    CLIENTS.splice(idx, 1)

    return NextResponse.json({
      success: true,
      data: { id: deleted.id, deleted: true },
    })
  } catch (error) {
    console.error(`[DELETE /api/clients/${params.id}] error:`, error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}
