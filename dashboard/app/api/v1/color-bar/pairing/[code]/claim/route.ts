import { NextRequest, NextResponse } from 'next/server'
import { verifyBearerToken } from '@/lib/auth'
import { getSalonIdForUser } from '@/lib/stylist'
import { prisma } from '@/lib/prisma'

// POST /api/v1/color-bar/pairing/:code/claim — a stylist's phone enters the
// code shown on the iPad. Requires the phone's account to be in the SAME
// salon as the iPad that generated the code, so a code can't be used to
// link into a different salon's Color Bar station.
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
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
  if (!pairing) {
    return NextResponse.json({ error: 'That code doesn’t exist. Check the iPad and try again.' }, { status: 404 })
  }
  if (pairing.expires_at < new Date()) {
    return NextResponse.json({ error: 'That code expired. Generate a new one on the iPad.' }, { status: 410 })
  }
  if (pairing.salon_id !== salonId) {
    return NextResponse.json({ error: 'That code belongs to a different salon.' }, { status: 403 })
  }
  if (pairing.status !== 'waiting') {
    return NextResponse.json({ error: 'That code has already been used.' }, { status: 409 })
  }

  await prisma.colorbar_pairing_codes.update({
    where: { id: pairing.id },
    data: { status: 'claimed', claimed_by: user.userId },
  })

  return NextResponse.json({ success: true, salonId })
}
