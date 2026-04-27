'use client'

import { cn } from '@/lib/utils'
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react'

interface ConfidenceBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export function ConfidenceBadge({
  score,
  size = 'md',
  showIcon = true,
  className,
}: ConfidenceBadgeProps) {
  const isHigh = score >= 90
  const isMedium = score >= 70 && score < 90

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }

  const config = isHigh
    ? {
        label: 'High Confidence',
        color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        icon: ShieldCheck,
      }
    : isMedium
      ? {
          label: 'Medium Confidence',
          color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20',
          icon: Shield,
        }
      : {
          label: 'Review Needed',
          color: 'text-red-400 bg-red-400/10 border-red-400/20',
          icon: ShieldAlert,
        }

  const Icon = config.icon

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-semibold',
        sizeClasses[size],
        config.color,
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{score}%</span>
      <span className="opacity-70 hidden sm:inline">· {config.label}</span>
    </div>
  )
}
