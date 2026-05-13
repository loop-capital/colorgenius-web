'use client'

import { cn } from '@/lib/utils'

interface HairSwatchProps {
  color: string
  label?: string
  level?: number
  isActive?: boolean
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-10 h-10 rounded-lg',
  md: 'w-14 h-14 rounded-xl',
  lg: 'w-20 h-20 rounded-2xl',
}

export function HairSwatch({
  color,
  label,
  level,
  isActive = false,
  onClick,
  className,
  size = 'md',
}: HairSwatchProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center gap-1.5 transition-all duration-200',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div
        className={cn(
          sizeMap[size],
          'border-2 transition-all duration-200 shadow-sm',
          isActive
            ? 'border-[#9333EA] shadow-[0_0_0_3px_rgba(20,184,166,0.2)] scale-105'
            : 'border-white/[0.08] hover:border-[#9333EA]/40 hover:scale-105'
        )}
        style={{ backgroundColor: color }}
      >
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white drop-shadow-md"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      {(label || level !== undefined) && (
        <div className="text-center">
          {label && (
            <span
              className={cn(
                'text-xs font-medium block',
                isActive ? 'text-[#9333EA]' : 'text-[#A3A3A3] group-hover:text-[#F5F5F5]'
              )}
            >
              {label}
            </span>
          )}
          {level !== undefined && (
            <span className="text-[11px] text-[#737373] block">Level {level}</span>
          )}
        </div>
      )}
    </button>
  )
}
