import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyBearerToken } from '@/lib/auth'
import { getSalonIdForUser } from '@/lib/stylist'

// POST /api/v1/color-bar/session
export async function POST(req: NextRequest) {
  try {
    // Verify authentication (Bearer token from mobile app)
    const user = await verifyBearerToken(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // salon_id/stylist_id here have no DB-enforced FK, so this never *threw*
    // before — it just silently stored user.userId (a users.id) as salon_id,
    // which meant the complete route's inventory lookup could never match
    // the salon's real inventory rows and would create wrongly-scoped
    // duplicates instead of decrementing real stock.
    const salonId = await getSalonIdForUser(user.userId)
    if (!salonId) {
      return NextResponse.json({ error: 'This account is not linked to a salon yet.' }, { status: 400 })
    }

    const body = await req.json()
    const { clientId, formulaId, stylistId, steps, pairingCode } = body

    // If this session is the result of a phone->iPad pairing handoff, the
    // pairing code must be one this same user claimed — otherwise anyone
    // could link a session onto a code they never actually entered.
    let pairing = null as Awaited<ReturnType<typeof prisma.colorbar_pairing_codes.findUnique>> | null
    if (pairingCode) {
      pairing = await prisma.colorbar_pairing_codes.findUnique({ where: { code: String(pairingCode).toUpperCase() } })
      if (!pairing || pairing.salon_id !== salonId || pairing.claimed_by !== user.userId || pairing.status !== 'claimed') {
        return NextResponse.json({ error: 'Invalid or already-used pairing code' }, { status: 400 })
      }
    }

    const session = await prisma.color_bar_sessions.create({
      data: {
        salon_id: salonId,
        client_id: clientId || null,
        stylist_id: stylistId || user.userId,
        formula_id: formulaId || null,
        status: 'active',
        // Planned steps (target grams, brand, shade) up front when known —
        // e.g. a formula generated on a paired phone — so a different
        // device (the iPad) can render the weigh screen for a session it
        // didn't create itself. Actual/weighed grams get filled in and
        // this gets overwritten again at /complete.
        steps: Array.isArray(steps) && steps.length > 0 ? steps : undefined,
        created_at: new Date(),
      },
      select: {
        id: true,
      },
    })

    if (pairing) {
      await prisma.colorbar_pairing_codes.update({
        where: { id: pairing.id },
        data: { status: 'linked', session_id: session.id },
      })
    }

    return NextResponse.json({ sessionId: session.id, createdAt: new Date().toISOString() }, { status: 201 })
  } catch (error) {
    console.error('Color bar session POST error:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
