'use client'

import { cn } from '@/lib/utils'

interface PhotoOverlayProps {
  className?: string
  showGuides?: boolean
}

export function PhotoOverlay({ className, showGuides = true }: PhotoOverlayProps) {
  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {/* Hair region oval guide */}
      {showGuides && (
        <>
          {/* Top head guide */}
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[55%] h-[45%] border-2 border-dashed border-[#14B8A6]/40 rounded-[40%]" />
          
          {/* Face center line */}
          <div className="absolute top-0 left-1/2 w-px h-full bg-[#14B8A6]/20" />
          
          {/* Horizontal eye line */}
          <div className="absolute top-[42%] left-[20%] right-[20%] h-px bg-[#14B8A6]/20" />
          
          {/* Corner markers */}
          <div className="absolute top-[12%] left-[20%] w-6 h-6 border-l-2 border-t-2 border-[#14B8A6]/50" />
          <div className="absolute top-[12%] right-[20%] w-6 h-6 border-r-2 border-t-2 border-[#14B8A6]/50" />
          <div className="absolute bottom-[38%] left-[20%] w-6 h-6 border-l-2 border-b-2 border-[#14B8A6]/50" />
          <div className="absolute bottom-[38%] right-[20%] w-6 h-6 border-r-2 border-b-2 border-[#14B8A6]/50" />

          {/* Label */}
          <div className="absolute top-[8%] left-1/2 -translate-x-1/2 bg-[#0F0F0F]/80 backdrop-blur-sm text-[#14B8A6] text-[10px] font-medium px-2.5 py-1 rounded-full border border-[#14B8A6]/20"
          >
            Position hair within frame
          </div>
        </>
      )}
    </div>
  )
}
