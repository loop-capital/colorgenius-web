'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { FlaskConical, Clock, Droplets, ChevronRight } from 'lucide-react'

export interface FormulaCardProps {
  name: string
  brand: string
  line: string
  shades: { code: string; name: string; hex: string }[]
  developer: string
  developerVolume: string
  mixRatio: string
  processingTime: string
  application: string
  confidence: number
  notes?: string
  onClick?: () => void
  className?: string
}

export function FormulaCard({
  name,
  brand,
  line,
  shades,
  developer,
  developerVolume,
  mixRatio,
  processingTime,
  application,
  confidence,
  notes,
  onClick,
  className,
}: FormulaCardProps) {
  const confidenceColor =
    confidence >= 90 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
    confidence >= 70 ? 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20' :
    'text-red-400 bg-red-400/10 border-red-400/20'

  return (
    <Card
      onClick={onClick}
      className={cn(
        'group bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#14B8A6]/30 transition-all duration-300 cursor-pointer overflow-hidden',
        className
      )}
    >
      <CardContent className="p-0">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#14B8A6] to-[#2DD4BF] opacity-60 group-hover:opacity-100 transition-opacity" />

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-[#F5F5F5] truncate group-hover:text-[#14B8A6] transition-colors">{name}</h3>
              <p className="text-xs text-[#737373] mt-0.5">{brand} · {line}</p>
            </div>
            <div className={cn('shrink-0 px-2 py-1 rounded-full text-xs font-semibold border', confidenceColor)}>
              {confidence}%
            </div>
          </div>

          {/* Shade swatches */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#737373] uppercase tracking-wider font-medium">Shades</span>
            <div className="flex items-center gap-1.5">
              {shades.map((shade) => (
                <div key={shade.code} className="flex items-center gap-1">
                  <div
                    className="w-6 h-6 rounded-md border border-white/[0.08]"
                    style={{ backgroundColor: shade.hex }}
                    title={shade.name}
                  />
                  <span className="text-[10px] text-[#A3A3A3] font-mono">{shade.code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formula details grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span className="text-[#A3A3A3]">Dev:</span>
              <span className="text-[#F5F5F5] font-medium">{developer} {developerVolume}</span>
            </div>
            <div className="flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-[#A3A3A3]">Mix:</span>
              <span className="text-[#F5F5F5] font-medium">{mixRatio}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span className="text-[#A3A3A3]">Time:</span>
              <span className="text-[#F5F5F5] font-medium">{processingTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-[#A3A3A3]">App:</span>
              <span className="text-[#F5F5F5] font-medium">{application}</span>
            </div>
          </div>

          {notes && (
            <p className="text-xs text-[#737373] leading-relaxed line-clamp-2">{notes}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
