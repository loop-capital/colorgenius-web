import { prisma } from '@/lib/prisma'

export interface CostPlusConfig {
  costPlusMode: boolean
  markupPercent: number
  applyToColor: boolean
  applyToDeveloper: boolean
}

const DEFAULT_CONFIG: CostPlusConfig = {
  costPlusMode: true,
  markupPercent: 100, // 2x
  applyToColor: true,
  applyToDeveloper: true,
}

export async function getMarkupConfig(salonId: string): Promise<CostPlusConfig> {
  const salon = await prisma.salons.findUnique({
    where: { id: salonId },
    select: { settings: true },
  })
  const settings = (salon?.settings as any) || {}
  return { ...DEFAULT_CONFIG, ...(settings.costPlusPricing || {}) }
}

export interface PricedStep {
  brand: string
  shadeCode: string
  role: string
  gramsUsed: number
  costPerGram: number | null
  wholesaleCost: number
  clientCost: number
}

export interface PricedSession {
  steps: PricedStep[]
  wholesaleCost: number
  totalCost: number
  markupPercent: number
  /** Products weighed that have no cost_per_unit set yet — charged $0 for that portion. */
  missingCost: { brand: string; shadeCode: string }[]
}

/**
 * The server-side source of truth for what a completed Color Bar session
 * costs — this is what gets stored on the session AND what gets pushed to
 * the salon's POS as a ticket line item. Never trust a client-supplied
 * total for either of those; the client only knows what grams were weighed.
 */
export async function priceCompletedSession(
  salonId: string,
  steps: { brand: string; shadeCode: string; role: string; actualGrams: number; targetGrams?: number }[]
): Promise<PricedSession> {
  const config = await getMarkupConfig(salonId)
  const multiplier = 1 + config.markupPercent / 100
  const missingCost: { brand: string; shadeCode: string }[] = []

  const priced: PricedStep[] = []
  for (const step of steps) {
    const gramsUsed = Math.max(step.actualGrams || step.targetGrams || 0, 0)
    if (gramsUsed <= 0 || !step.brand || !step.shadeCode) continue

    const item = await prisma.inventory_items.findUnique({
      where: {
        salon_id_brand_shade_code: {
          salon_id: salonId,
          brand: step.brand,
          shade_code: step.shadeCode,
        },
      },
      select: { cost_per_unit: true },
    })

    const costPerGram = item?.cost_per_unit != null ? Number(item.cost_per_unit) : null
    if (costPerGram == null) missingCost.push({ brand: step.brand, shadeCode: step.shadeCode })

    const wholesaleCost = (costPerGram || 0) * gramsUsed
    const isDeveloper = step.role === 'developer'
    const applyMarkup = isDeveloper ? config.applyToDeveloper : config.applyToColor
    const clientCost = applyMarkup ? wholesaleCost * multiplier : wholesaleCost

    priced.push({ brand: step.brand, shadeCode: step.shadeCode, role: step.role, gramsUsed, costPerGram, wholesaleCost, clientCost })
  }

  const wholesaleCost = priced.reduce((sum, p) => sum + p.wholesaleCost, 0)
  const totalCost = priced.reduce((sum, p) => sum + p.clientCost, 0)

  return { steps: priced, wholesaleCost, totalCost, markupPercent: config.markupPercent, missingCost }
}
