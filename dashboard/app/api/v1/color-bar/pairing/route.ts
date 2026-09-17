import { NextRequest, NextResponse } from 'next/server'
import { verifyBearerToken } from '@/lib/auth'
import { getSalonIdForUser } from '@/lib/stylist'
import { prisma } from '@/lib/prisma'

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no 0/O/1/I
const CODE_LENGTH = 6
const EXPIRES_MINUTES = 10

function generateCode(): string {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return code
}

// POST /api/v1/color-bar/pairing — the iPad calls this to start waiting for
// a phone to link. Returns a short code to display; the phone enters it via
// POST /api/v1/color-bar/pairing/:code/claim.
export async function POST(req: NextRequest) {
  const user = await verifyBearerToken(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const salonId = await getSalonIdForUser(user.userId)
  if (!salonId) {
    return NextResponse.json({ error: 'Your account isn’t linked to a salon yet.' }, { status: 400 })
  }

  let code = generateCode()
  for (let i = 0; await prisma.colorbar_pairing_codes.findUnique({ where: { code } }); i++) {
    if (i > 5) return NextResponse.json({ error: 'Failed to generate a pairing code' }, { status: 500 })
    code = generateCode()
  }

  const expiresAt = new Date(Date.now() + EXPIRES_MINUTES * 60_000)
  await prisma.colorbar_pairing_codes.create({
    data: { code, salon_id: salonId, expires_at: expiresAt },
  })

  return NextResponse.json({ code, expiresAt: expiresAt.toISOString() })
}
