import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyBearerToken } from '@/lib/auth'

interface FeedbackBody {
  rating: number
  notes?: string
  convertedToBrand?: boolean
  sentToTraining?: boolean
}

// POST /api/v1/color-bar/session/:id/feedback
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyBearerToken(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = (await req.json()) as FeedbackBody

    // Validate rating
    if (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      )
    }

    // feedback_submitted_at was referenced here but never existed as a real
    // column — every update() threw, and the catch below silently claimed
    // success anyway ("stored locally; sync pending") with nothing actually
    // stored anywhere. Removed the phantom field; let real failures surface
    // as a real error instead of a fabricated success.
    const updateData = {
      feedback_submitted: true,
      feedback_rating: body.rating,
      feedback_notes: body.notes ?? null,
      feedback_converted_to_brand: body.convertedToBrand ?? false,
      feedback_used_for_training: body.sentToTraining ?? false,
    }

    await prisma.color_bar_sessions.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(
      {
        success: true,
        sessionId: id,
        feedback: {
          rating: body.rating,
          notes: body.notes ?? null,
          convertedToBrand: body.convertedToBrand ?? false,
          sentToTraining: body.sentToTraining ?? false,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Color bar feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
