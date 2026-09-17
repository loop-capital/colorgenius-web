import { NextRequest, NextResponse } from 'next/server'
import { verifyBearerToken } from '@/lib/auth'
import { getSalonIdForUser } from '@/lib/stylist'
import { prisma } from '@/lib/prisma'

// GET /api/v1/color-bar/pairing/:code — the iPad polls this while waiting.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const user = await verifyBearerToken(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const salonId = await getSalonIdForUser(user.userId)
  if (!salonId) {
    return NextResponse.json({ error: 'Your account isn’t linked to a salon yet.' }, { status: 400 })
  }

  const { code } = await params
  const pairing = await prisma.colorbar_pairing_codes.findUnique({ where: { code: code.toUpperCase() } })
  if (!pairing || pairing.salon_id !== salonId) {
    return NextResponse.json({ error: 'Pairing code not found' }, { status: 404 })
  }

  if (pairing.status !== 'linked' && pairing.expires_at < new Date()) {
    if (pairing.status !== 'expired') {
      await prisma.colorbar_pairing_codes.update({ where: { id: pairing.id }, data: { status: 'expired' } }).catch(() => {})
    }
    return NextResponse.json({ status: 'expired' })
  }

  return NextResponse.json({ status: pairing.status, sessionId: pairing.session_id })
}
