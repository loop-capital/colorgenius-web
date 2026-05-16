import { NextResponse } from 'next/server'
import { normalizeHairProfile, type HairProfile } from '@/lib/client-profile'

interface MockClient {
  id: string
  name: string
  email?: string
  phone?: string
  lastVisit?: string
  hairProfile?: HairProfile | null
}

const MOCK_CLIENTS: Map<string, MockClient> = new Map([
  ['cl_maya_rodriguez_01', {
    id: 'cl_maya_rodriguez_01',
    name: 'Maya Rodriguez',
    email: 'maya.r@email.com',
    phone: '212-555-0142',
    lastVisit: '2025-05-01T14:30:00Z',
    hairProfile: {
      texture: 'fine',
      hairPattern: 'wavy',
      density: 'medium',
      porosity: 'high',
      naturalLevel: 6,
      naturalTone: 'warm',
      scalpCondition: 'sensitive',
      chemicalHistory: { boxDye: true, metallicSalts: false, henna: false, keratinTreatment: false, relaxer: false, lastService: '3-4_weeks', hardWater: true, medicationBuildup: false },
      sensitivities: { ppdAllergy: true, ammoniaSensitivity: false, fragranceSensitivity: false, isPregnant: false, isBreastfeeding: false, activeChemo: false, other: [] },
      lastObservedLevel: 7,
      lastObservedTone: 'ash',
      lastObservedCondition: 'previously_colored',
      lastServiceDate: '2025-05-01T14:30:00Z',
      lastFormulaId: 'fm_abc123',
      notes: 'Prefers ammonia-free. Scalp gets irritated easily.',
      updatedAt: '2025-05-01T14:30:00Z',
      updatedBy: 'stylist_01',
    },
  }],
  ['cl_sarah_james_02', {
    id: 'cl_sarah_james_02',
    name: 'Sarah James',
    email: 'sarah.james@email.com',
    phone: '347-555-0198',
    lastVisit: '2025-04-20T10:00:00Z',
    hairProfile: {
      texture: 'coarse',
      hairPattern: 'coily',
      density: 'thick',
      porosity: 'low',
      naturalLevel: 2,
      naturalTone: 'cool',
      scalpCondition: 'normal',
      chemicalHistory: { boxDye: false, metallicSalts: false, henna: true, keratinTreatment: false, relaxer: false, lastService: '3-6_months', hardWater: false, medicationBuildup: false },
      sensitivities: null,
      lastObservedLevel: 2,
      lastObservedTone: 'cool',
      lastObservedCondition: 'virgin',
      lastServiceDate: '2025-04-20T10:00:00Z',
      lastFormulaId: null,
      notes: '',
      updatedAt: '2025-04-20T10:00:00Z',
      updatedBy: null,
    },
  }],
  ['cl_jenny_kim_03', {
    id: 'cl_jenny_kim_03',
    name: 'Jenny Kim',
    email: 'jenny@kim.co',
    phone: '917-555-0177',
    lastVisit: '2025-05-10T16:00:00Z',
    hairProfile: {
      texture: 'medium',
      hairPattern: 'straight',
      density: 'thin',
      porosity: 'normal',
      naturalLevel: 8,
      naturalTone: 'neutral',
      scalpCondition: 'oily',
      chemicalHistory: { boxDye: false, metallicSalts: false, henna: false, keratinTreatment: true, relaxer: false, lastService: '1-2_weeks', hardWater: false, medicationBuildup: true },
      sensitivities: { ppdAllergy: false, ammoniaSensitivity: true, fragranceSensitivity: false, isPregnant: false, isBreastfeeding: false, activeChemo: false, other: ['gluten'] },
      lastObservedLevel: 9,
      lastObservedTone: 'pearl',
      lastObservedCondition: 'damaged',
      lastServiceDate: '2025-05-10T16:00:00Z',
      lastFormulaId: 'fm_def456',
      notes: 'Keratin treatment 2 weeks ago. Avoid sulfates.',
      updatedAt: '2025-05-10T16:00:00Z',
      updatedBy: 'stylist_02',
    },
  }],
  ['cl_ava_thompson_04', {
    id: 'cl_ava_thompson_04',
    name: 'Ava Thompson',
    email: 'ava.t@email.com',
    lastVisit: '2025-03-15T11:30:00Z',
    hairProfile: null,
  }],
  ['cl_lisa_wong_05', {
    id: 'cl_lisa_wong_05',
    name: 'Lisa Wong',
    phone: '646-555-0133',
    lastVisit: '2025-05-12T09:00:00Z',
    hairProfile: {
      texture: 'fine',
      hairPattern: 'curly',
      density: 'medium',
      porosity: 'high',
      naturalLevel: 4,
      naturalTone: 'warm',
      scalpCondition: 'dry',
      chemicalHistory: null,
      sensitivities: { ppdAllergy: false, ammoniaSensitivity: false, fragranceSensitivity: true, isPregnant: true, isBreastfeeding: false, activeChemo: false, other: [] },
      lastObservedLevel: 5,
      lastObservedTone: 'golden',
      lastObservedCondition: 'previously_colored',
      lastServiceDate: '2025-05-12T09:00:00Z',
      lastFormulaId: 'fm_ghi789',
      notes: 'Pregnant — avoid ammonia.',
      updatedAt: '2025-05-12T09:00:00Z',
      updatedBy: 'stylist_01',
    },
  }],
])

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const { hairProfile: rawProfile } = body as { hairProfile?: unknown }

    if (!rawProfile || typeof rawProfile !== 'object') {
      return NextResponse.json({ error: 'hairProfile is required' }, { status: 400 })
    }

    const client = MOCK_CLIENTS.get(id)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const normalized = normalizeHairProfile(rawProfile)
    client.hairProfile = {
      ...normalized,
      updatedAt: new Date().toISOString(),
      updatedBy: 'stylist_current', // mock
    }

    MOCK_CLIENTS.set(id, client)

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        hairProfile: client.hairProfile,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    )
  }
}
