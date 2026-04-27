'use client'

import { cn } from '@/lib/utils'

interface ColorCircleProps {
  color: string
  label?: string
  isActive?: boolean
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-11 h-11',
  lg: 'w-16 h-16',
}

export function ColorCircle({
  color,
  label,
  isActive = false,
  onClick,
  className,
  size = 'md',
}: ColorCircleProps) {
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
          'rounded-full border-2 transition-all duration-200 shadow-sm',
          isActive
            ? 'border-[#F59E0B] shadow-[0_0_0_3px_rgba(245,158,11,0.2)] scale-110'
            : 'border-white/[0.08] hover:border-[#F59E0B]/40 hover:scale-110'
        )}
        style={{ backgroundColor: color }}
      >
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white drop-shadow-md"
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
      {label && (
        <span
          className={cn(
            'text-[10px] font-medium transition-colors',
            isActive ? 'text-[#F59E0B]' : 'text-[#737373] group-hover:text-[#A3A3A3]'
          )}
        >
          {label}
        </span>
      )}
    </button>
  )
}
