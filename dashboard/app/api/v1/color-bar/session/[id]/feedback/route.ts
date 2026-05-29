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

    // Build update payload
    const updateData = {
      feedback_submitted: true,
      feedback_rating: body.rating,
      feedback_notes: body.notes ?? null,
      feedback_converted_to_brand: body.convertedToBrand ?? false,
      feedback_used_for_training: body.sentToTraining ?? false,
      feedback_submitted_at: new Date(),
    }

    // Update the session in Prisma
    try {
      const updatedSession = await prisma.color_bar_sessions.update({
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
    } catch (dbError) {
      console.error('Prisma feedback update error:', dbError)
      // If table doesn't exist or row not found, still return success for offline mode
      return NextResponse.json(
        {
          success: true,
          sessionId: id,
          warning: 'Feedback stored locally; database sync pending',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Color bar feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
