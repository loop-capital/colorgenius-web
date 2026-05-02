'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DollarSign, Calculator, Check, AlertTriangle } from 'lucide-react'

export interface CostCalculatorProps {
  formula: {
    brand: string
    productLine: string
    components: Array<{
      shade: {
        name: string
        code: string
        rgb: [number, number, number]
        level: number
        primaryTone: string
      }
      amountOz: number
      purpose: string
    }>
    developer: {
      volume: number
      amountOz: number
    }
    mixingRatio: string
    processingTimeMinutes: number
    applicationTechnique: string
  }
  pricingRule?: {
    basePrice: number
    pricePerOz?: number
    minimumPrice?: number
    serviceType: string
  }
  className?: string
}

export interface CostBreakdown {
  productCost: number
  servicePrice: number
  margin: number
  marginPercentage: number
  costPerOunce: number
  totalOunces: number
  breakdown: Array<{
    product: string
    cost: number
    amountOz: number
    costPerOunce: number
  }>
}

export function CostCalculator({
  formula,
  pricingRule,
  className,
}: CostCalculatorProps) {
  // Calculate total product cost based on component costs
  const productCost = calculateProductCost(formula)
  const totalOunces = calculateTotalOunces(formula)
  const costPerOunce = totalOunces > 0 ? productCost / totalOunces : 0
  
  // Calculate service price based on pricing rule
  const servicePrice = calculateServicePrice(formula, pricingRule)
  const margin = servicePrice - productCost
  const marginPercentage = servicePrice > 0 ? (margin / servicePrice) * 100 : 0
  
  const breakdown = calculateCostBreakdown(formula)

  return (
    <Card
      className={cn(
        'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#14B8A6]/30 transition-all duration-300',
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between space-x-3">
          <h2 className="text-xl font-semibold text-[#F5F5F5]">
            Cost Calculator
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <Calculator className="w-4 h-4 text-[#14B8A6]" />
            <span className="text-[#A3A3A3]">Estimate costs & pricing</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Formula Summary */}
        <div className="bg-[#2A2A2A] rounded-lg p-4">
          <h3 className="font-medium text-[#F5F5F5] mb-3">Formula Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#A3A3A3]">Brand:</span>
              <span className="text-[#F5F5F5] font-medium">{formula.brand}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A3A3A3]">Product Line:</span>
              <span className="text-[#F5F5F5] font-medium">{formula.productLine}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A3A3A3]">Developer:</span>
              <span className="text-[#F5F5F5] font-medium">
                {formula.developer.volume}vol ({formula.developer.amountOz} oz)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A3A3A3]">Mix Ratio:</span>
              <span className="text-[#F5F5F5] font-medium">{formula.mixingRatio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A3A3A3]">Processing Time:</span>
              <span className="text-[#F5F5F5] font-medium">
                {formula.processingTimeMinutes} min
              </span>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3">
          <h3 className="font-medium text-[#F5F5F5] mb-3">Product Cost Breakdown</h3>
          <div className="space-y-2">
            {breakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                <div>
                  <p className="text-[#F5F5F5] font-medium">{item.product}</p>
                  <p className="text-xs text-[#737373]">{item.amountOz} oz @ ${item.costPerOunce.toFixed(2)}/oz</p>
                </div>
                <p className="text-[#F5F5F5] font-bold">${item.cost.toFixed(2)}</p>
              </div>
            ))}
            <div className="pt-3 border-t border-[#2A2A2A]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A3A3A3]">Total Product Cost:</span>
                <span className="text-[#F5F5F5] font-bold">${productCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-[#A3A3A3]">Cost per Ounce:</span>
                <span className="text-[#F5F5F5]">${costPerOunce.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Calculation */}
        <div className="space-y-3">
          <h3 className="font-medium text-[#F5F5F5] mb-3">Service Pricing</h3>
          {pricingRule ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                  <span className="text-[#A3A3A3]">Base Price:</span>
                  <span className="text-[#F5F5F5] font-bold">${pricingRule.basePrice.toFixed(2)}</span>
                </div>
                {pricingRule.pricePerOz && (
                  <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                    <span className="text-[#A3A3A3]">Price per Oz:</span>
                    <span className="text-[#F5F5F5] font-bold">${pricingRule.pricePerOz.toFixed(2)}</span>
                  </div>
                )}
                {pricingRule.minimumPrice && (
                  <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                    <span className="text-[#A3A3A3]">Minimum Price:</span>
                    <span className="text-[#F5F5F5] font-bold">${pricingRule.minimumPrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                  <span className="text-[#A3A3A3]">Service Type:</span>
                  <span className="text-[#F5F5F5] font-medium">{pricingRule.serviceType}</span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-[#2A2A2A] rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A3A3A3]">Calculated Service Price:</span>
                    <span className="text-[#14B8A6] font-bold text-lg">${servicePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#A3A3A3]">Margin:</span>
                    <span className={margin >= 0 ? 'text-[#14B8A6] font-bold' : 'text-red-400 font-bold'}>
                      ${margin.toFixed(2)} ({marginPercentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-6 h-6 mx-auto mb-3 text-[#F59E0B]" />
              <p className="text-[#A3A3A3]">No pricing rule provided</p>
              <p className="text-xs text-[#737373] mt-1">
                Provide a pricing rule to calculate service price and margins
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t border-[#2A2A2A]">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#A3A3A3]">Product Cost:</p>
              <p className="text-[#F5F5F5] font-bold">${productCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[#A3A3A3]">Service Price:</p>
              <p className={servicePrice > 0 ? 'text-[#14B8A6] font-bold' : 'text-[#A3A3A3]'}>
                ${servicePrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-[#A3A3A3]">Margin:</p>
              <p className={margin >= 0 ? 'text-[#14B8A6] font-bold' : 'text-red-400 font-bold'}>
                ${margin.toFixed(2)} ({marginPercentage.toFixed(1)}%)
              </p>
            </div>
            <div>
              <p className="text-[#A3A3A3]">ROI:</p>
              <p className={margin >= 0 ? 'text-[#14B8A6] font-bold' : 'text-red-400 font-bold'}>
                {marginPercentage.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions
function calculateProductCost(formula: CostCalculatorProps['formula']): number {
  // Mock cost calculation - in reality this would come from a pricing database or API
  // For now, using simplified estimates based on volume and type
  let totalCost = 0
  
  // Color cost estimates ($/oz)
  const colorCostPerOz = 2.50
  const developerCostPerOz = 0.75
  
  // Calculate color cost
  const totalColorOz = formula.components.reduce(
    (sum, comp) => sum + comp.amountOz, 0
  )
  totalCost += totalColorOz * colorCostPerOz
  
  // Calculate developer cost
  totalCost += formula.developer.amountOz * developerCostPerOz
  
  return totalCost
}

function calculateTotalOunces(formula: CostCalculatorProps['formula']): number {
  const totalColorOz = formula.components.reduce(
    (sum, comp) => sum + comp.amountOz, 0
  )
  return totalColorOz + formula.developer.amountOz
}

function calculateServicePrice(
  formula: CostCalculatorProps['formula'],
  pricingRule: CostCalculatorProps['pricingRule'] | undefined
): number {
  if (!pricingRule) return 0
  
  let price = pricingRule.basePrice
  
  // Add price per ounce if applicable
  if (pricingRule.pricePerOz) {
    const totalOz = calculateTotalOunces(formula)
    price += totalOz * pricingRule.pricePerOz
  }
  
  // Apply minimum price
  if (pricingRule.minimumPrice && price < pricingRule.minimumPrice) {
    price = pricingRule.minimumPrice
  }
  
  return price
}

function calculateCostBreakdown(formula: CostCalculatorProps['formula']): Array<{
  product: string
  cost: number
  amountOz: number
  costPerOunce: number
}> {
  const breakdown: Array<{
    product: string
    cost: number
    amountOz: number
    costPerOunce: number
  }> = []
  
  // Color components
  formula.components.forEach(comp => {
    // Mock cost per ounce for color ($2.50/oz)
    const costPerOz = 2.50
    const cost = comp.amountOz * costPerOz
    breakdown.push({
      product: `${comp.shade.name} (${comp.shade.code})`,
      cost,
      amountOz: comp.amountOz,
      costPerOunce: costPerOz
    })
  })
  
  // Developer
  const developerCostPerOz = 0.75
  const developerCost = formula.developer.amountOz * developerCostPerOz
  breakdown.push({
    product: `Developer ${formula.developer.volume}vol`,
    cost: developerCost,
    amountOz: formula.developer.amountOz,
    costPerOunce: developerCostPerOz
  })
  
  return breakdown
}