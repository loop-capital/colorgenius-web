import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/v1/portal/[token] — fetch client portal data
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const client = await prisma.clients.findUnique({
      where: { portal_token: token },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        phone: true,
        portal_enabled: true,
        portal_view_count: true,
        primary_stylist_id: true,
        hair_profile: true,
        conditions: true,
        total_visits: true,
        last_visit_at: true,
        next_appointment_at: true,
        created_at: true,
        // Get stylist info
        stylists: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            display_name: true,
            instagram_handle: true,
            avatar_url: true,
            portal_privacy: true,
          },
        },
        // Get visit history with formulas and photos
        visits: {
          orderBy: { visit_date: 'desc' },
          take: 20,
          include: {
            formulations: {
              select: {
                id: true,
                created_at: true,
                input_data: true,
                output_data: true,
                confidence: true,
              },
            },
          },
        },
        // Get formula photos
        formula_photos: {
          orderBy: { created_at: 'desc' },
          take: 20,
          select: {
            id: true,
            before_url: true,
            after_url: true,
            caption: true,
            created_at: true,
            level_before: true,
            level_after: true,
            tone_before: true,
            tone_after: true,
            developer_vol: true,
            processing_time: true,
            formulas: {
              select: {
                id: true,
                name: true,
                brand: true,
                line: true,
              },
            },
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 })
    }

    if (!client.portal_enabled) {
      return NextResponse.json({ error: 'Portal is currently unavailable' }, { status: 403 })
    }

    // Increment view count
    await prisma.clients.update({
      where: { id: client.id },
      data: {
        portal_view_count: { increment: 1 },
        portal_last_viewed: new Date(),
      },
    }).catch(() => {}) // non-critical

    // Check if portal requires phone verification
    const isPrivate = client.stylists?.portal_privacy === 'private'

    // Build response
    const portalData = {
      client: {
        name: `${client.first_name} ${client.last_name}`,
        firstName: client.first_name,
        totalVisits: client.total_visits || 0,
        lastVisit: client.last_visit_at,
        nextAppointment: client.next_appointment_at,
        memberSince: client.created_at,
      },
      stylist: client.stylists ? {
        name: client.stylists.display_name || `${client.stylists.first_name} ${client.stylists.last_name}`,
        handle: client.stylists.instagram_handle,
        avatar: client.stylists.avatar_url,
      } : null,
      hairProfile: client.hair_profile,
      conditions: client.conditions,
      privacy: isPrivate ? 'private' : 'public',
      photos: client.formula_photos.map((p) => ({
        id: p.id,
        beforeUrl: p.before_url,
        afterUrl: p.after_url,
        caption: p.caption,
        date: p.created_at,
        levelBefore: p.level_before,
        levelAfter: p.level_after,
        toneBefore: p.tone_before,
        toneAfter: p.tone_after,
        developer: p.developer_vol,
        processingTime: p.processing_time,
        formula: p.formulas ? {
          name: p.formulas.name,
          brand: p.formulas.brand,
          line: p.formulas.line,
        } : null,
      })),
      visits: client.visits.map((v) => ({
        id: v.id,
        date: v.visit_date,
        serviceType: v.service_type,
        notes: v.notes,
        formulations: v.formulations.map((f) => ({
          id: f.id,
          date: f.created_at,
          confidence: f.confidence,
          output: f.output_data,
        })),
      })),
    }

    return NextResponse.json(portalData)
  } catch (error: any) {
    console.error('Portal fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
