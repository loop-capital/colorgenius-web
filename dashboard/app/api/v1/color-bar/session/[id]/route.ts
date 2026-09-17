import { NextRequest, NextResponse } from 'next/server'
import { verifyBearerToken } from '@/lib/auth'
import { getSalonIdForUser } from '@/lib/stylist'
import { prisma } from '@/lib/prisma'

// GET /api/v1/color-bar/session/:id — used by the iPad once a pairing code
// reports status "linked", to hydrate the client + planned formula steps a
// phone generated remotely into the local weigh-and-mix screen.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyBearerToken(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const salonId = await getSalonIdForUser(user.userId)
  if (!salonId) {
    return NextResponse.json({ error: 'Your account isn’t linked to a salon yet.' }, { status: 400 })
  }

  const { id } = await params
  const session = await prisma.color_bar_sessions.findUnique({ where: { id } })

  if (!session || session.salon_id !== salonId) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const client = session.client_id
    ? await prisma.clients.findUnique({
        where: { id: session.client_id },
        select: { id: true, first_name: true, last_name: true, phone: true },
      })
    : null

  return NextResponse.json({
    id: session.id,
    status: session.status,
    client: client
      ? {
          id: client.id,
          name: [client.first_name, client.last_name].filter(Boolean).join(' ') || 'Client',
          phone: client.phone || undefined,
        }
      : null,
    formulaId: session.formula_id,
    steps: session.steps || [],
    totalCost: session.total_cost != null ? Number(session.total_cost) : 0,
  })
}
