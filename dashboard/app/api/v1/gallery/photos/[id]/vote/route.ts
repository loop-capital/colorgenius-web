import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth'

const prisma = new PrismaClient()

// POST /api/v1/gallery/photos/[id]/vote — Upvote or downvote a photo
// Previously took voterId straight from the request body (unauthenticated —
// anyone could vote as any id, repeatedly) AND expected {voterId, vote: 1|-1}
// while the mobile app has only ever sent {direction: 'up'|'down'} — every
// real vote tap has been failing with 400 since the app shipped this button.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const direction = body.direction === 'down' ? -1 : body.direction === 'up' ? 1 : null
    const vote = direction ?? (body.vote === -1 || body.vote === 1 ? body.vote : null)
    if (vote === null) {
      return NextResponse.json({ error: "direction ('up'|'down') is required" }, { status: 400 })
    }

    const voterId = user.userId

    // Check photo exists
    const photo = await prisma.formula_photos.findUnique({ where: { id } })
    if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

    // Upsert vote
    const existing = await prisma.formula_photo_votes.findUnique({
      where: { photo_id_voter_id: { photo_id: id, voter_id: voterId } },
    })

    let scoreDelta = vote
    if (existing) {
      if (existing.vote === vote) {
        // Same vote = remove it (toggle off)
        await prisma.formula_photo_votes.delete({
          where: { photo_id_voter_id: { photo_id: id, voter_id: voterId } },
        })
        scoreDelta = -vote // undo previous vote
      } else {
        // Different vote = change it
        await prisma.formula_photo_votes.update({
          where: { photo_id_voter_id: { photo_id: id, voter_id: voterId } },
          data: { vote },
        })
        scoreDelta = vote * 2 // e.g. from -1 to +1 = +2 swing
      }
    } else {
      await prisma.formula_photo_votes.create({
        data: { photo_id: id, voter_id: voterId, vote },
      })
    }

    // Update photo counters
    const upvotes = (photo.upvotes || 0) + (scoreDelta > 0 ? (vote === 1 ? 1 : 0) : (existing?.vote === 1 ? -1 : 0))
    const downvotes = (photo.downvotes || 0) + (scoreDelta < 0 ? (vote === -1 ? 1 : 0) : (existing?.vote === -1 ? -1 : 0))
    const newScore = Math.max(0, (photo.score as any) + scoreDelta)

    await prisma.formula_photos.update({
      where: { id },
      data: { upvotes: Math.max(0, upvotes), downvotes: Math.max(0, downvotes), score: newScore },
    })

    return NextResponse.json({ score: newScore, upvotes: Math.max(0, upvotes), downvotes: Math.max(0, downvotes) })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
