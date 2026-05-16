import { NextResponse } from 'next/server'

interface MockClient {
  id: string
  name: string
  email?: string
  phone?: string
  lastVisit?: string
  hairProfile?: unknown
}

const MOCK_CLIENTS: MockClient[] = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
    id: 'cl_ava_thompson_04',
    name: 'Ava Thompson',
    email: 'ava.t@email.com',
    lastVisit: '2025-03-15T11:30:00Z',
    hairProfile: null,
  },
  {
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
  },
]

function computeCompleteness(profile: unknown): number {
  if (!profile || typeof profile !== 'object') return 0
  const p = profile as Record<string, unknown>
  const fields = [
    'texture', 'hairPattern', 'density', 'porosity',
    'naturalLevel', 'naturalTone', 'scalpCondition',
    'chemicalHistory', 'sensitivities',
    'lastObservedLevel', 'lastObservedTone', 'notes',
  ]
  const filled = fields.filter((f) => {
    const v = p[f]
    return v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
  })
  return Math.round((filled.length / fields.length) * 100)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').toLowerCase().trim()
  const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50)

  let results = MOCK_CLIENTS

  if (q) {
    results = MOCK_CLIENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
    )
  }

  const clients = results.slice(0, limit).map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email || null,
    phone: c.phone || null,
    lastVisit: c.lastVisit || null,
    profileCompleteness: computeCompleteness(c.hairProfile),
  }))

  return NextResponse.json({ clients, total: results.length })
}
