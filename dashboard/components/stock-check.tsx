'use client'

import { useState, useEffect } from 'react'
import { Check, AlertTriangle, X, RefreshCw, Package } from 'lucide-react'

interface FormulaStep {
  productName?: string
  shadeCode?: string
  brand?: string
  grams: number
  role: string
}

interface StockItem {
  id: string
  shadeCode: string
  shadeName: string
  brand: string
  quantity: number
  lowStockThreshold?: number | null
}

interface StockCheckProps {
  steps: FormulaStep[]
  salonId?: string
  onAcceptAlternative?: (originalCode: string, altCode: string) => void
}

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'unknown'

interface StepStatus {
  step: FormulaStep
  status: StockStatus
  quantity: number
  alternatives: StockItem[]
}

function findAlternatives(shadeCode: string, brand: string, inventory: StockItem[]): StockItem[] {
  if (!shadeCode) return []
  // Match same brand, same tone family (e.g. 6/1 → 6/11, 6/12)
  const codeMatch = shadeCode.match(/^(\d+)\/?(\d+)?/)
  if (!codeMatch) return []
  const level = codeMatch[1]
  const tone = codeMatch[2] || ''

  return inventory
    .filter(item => {
      if (item.shadeCode === shadeCode) return false // not an alternative
      if (item.quantity <= 0) return false
      const itemMatch = item.shadeCode.match(/^(\d+)\/?(\d+)?/)
      if (!itemMatch) return false
      // Same level, same first digit of tone family
      return itemMatch[1] === level && (!tone || itemMatch[2]?.[0] === tone[0])
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3)
}

function getStockStatus(qty: number, threshold?: number | null): StockStatus {
  if (qty <= 0) return 'out_of_stock'
  if (threshold && qty <= threshold) return 'low_stock'
  return 'in_stock'
}

const statusConfig = {
  in_stock: { icon: Check, color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', label: 'In Stock' },
  low_stock: { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', label: 'Low Stock' },
  out_of_stock: { icon: X, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', label: 'Out of Stock' },
  unknown: { icon: Package, color: '#71717A', bg: 'rgba(113,113,122,0.1)', border: 'rgba(113,113,122,0.2)', label: 'Not Tracked' },
}

export function StockCheck({ steps, salonId = 'default', onAcceptAlternative }: StockCheckProps) {
  const [inventory, setInventory] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/v1/inventory?salonId=${salonId}&limit=200`)
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setInventory(data.items || [])
        }
      } catch (e) {
        console.error('Failed to fetch inventory:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [salonId])

  useEffect(() => {
    if (loading) return
    const statuses: StepStatus[] = steps.map(step => {
      const match = inventory.find(item =>
        item.shadeCode?.toLowerCase() === step.shadeCode?.toLowerCase()
      )
      if (match) {
        return {
          step,
          status: getStockStatus(match.quantity, match.lowStockThreshold),
          quantity: match.quantity,
          alternatives: match.quantity <= 0 ? findAlternatives(step.shadeCode || '', step.brand || '', inventory) : [],
        }
      }
      return { step, status: 'unknown', quantity: 0, alternatives: [] }
    })
    setStepStatuses(statuses)
  }, [steps, inventory, loading])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs" style={{ color: '#71717A' }}>
        <RefreshCw className="w-3 h-3 animate-spin" /> Checking inventory...
      </div>
    )
  }

  const hasIssues = stepStatuses.some(s => s.status === 'low_stock' || s.status === 'out_of_stock')

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Package className="w-4 h-4" style={{ color: hasIssues ? '#F59E0B' : '#10B981' }} />
        <span className="text-xs font-medium" style={{ color: hasIssues ? '#F59E0B' : '#10B981' }}>
          {hasIssues ? 'Stock issues detected' : 'All products in stock'}
        </span>
      </div>
      {stepStatuses.map((ss, i) => {
        const cfg = statusConfig[ss.status]
        const Icon = cfg.icon
        return (
          <div key={i} className="rounded-lg p-3" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: '#F5F5F7' }}>
                    {ss.step.shadeCode || ss.step.productName || 'Unknown'}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                </div>
                {ss.status !== 'unknown' && (
                  <span className="text-xs" style={{ color: '#71717A' }}>{ss.quantity} in stock · {ss.step.grams}g needed</span>
                )}
              </div>
            </div>
            {/* Alternatives */}
            {ss.alternatives.length > 0 && (
              <div className="mt-2 pl-7 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: '#71717A' }}>Alternatives:</span>
                {ss.alternatives.map((alt, j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => onAcceptAlternative?.(ss.step.shadeCode || '', alt.shadeCode)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg w-full text-left transition-colors hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <span className="text-xs font-mono font-bold" style={{ color: '#10B981' }}>{alt.shadeCode}</span>
                    <span className="text-xs truncate" style={{ color: '#A1A1AA' }}>{alt.shadeName}</span>
                    <span className="text-[10px] ml-auto" style={{ color: '#71717A' }}>{alt.quantity} avail</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StockCheck
