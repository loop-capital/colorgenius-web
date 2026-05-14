import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/v1/gallery/photos/[id]/vote — Upvote or downvote a photo
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { voterId, vote } = await req.json() // vote: 1 or -1

    if (!voterId || ![-1, 1].includes(vote)) {
      return NextResponse.json({ error: 'voterId and vote (1 or -1) required' }, { status: 400 })
    }

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