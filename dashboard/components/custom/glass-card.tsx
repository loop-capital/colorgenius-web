'use client'

import { motion } from 'framer-motion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden ${className || ''}`}
      whileHover={hover ? { y: -2, transition: { type: 'spring', stiffness: 400, damping: 25 } } : undefined}
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-[#1E1E2D]/60 backdrop-blur-xl border border-white/[0.06]" />

      {/* Content */}
      <div className="relative">{children}</div>
    </motion.div>
  )
}

interface StatCardProps {
  label: string
  value: string
  change?: string
  icon: React.ReactNode
  accent?: string
}

export function StatCard({ label, value, change, icon, accent = '#9333EA' }: StatCardProps) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accent}15` }}
        >
          <div style={{ color: accent }}>{icon}</div>
        </motion.div>
        {change && (
          <motion.span
            className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{
              color: change.startsWith('+') ? '#10B981' : '#EF4444',
              backgroundColor: change.startsWith('+') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {change}
          </motion.span>
        )}
      </div>
      <motion.div
        className="text-2xl font-bold text-[#F5F5F7] tracking-tight"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {value}
      </motion.div>
      <div className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#71717A] mt-1">{label}</div>
    </GlassCard>
  )
}