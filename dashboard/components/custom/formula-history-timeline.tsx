'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './glass-card'

export interface FormulaHistoryItem {
  id: string
  clientId: string
  stylistId: string
  salonId: string
  brand: string
  shadeCode: string
  shadeName: string
  developerVolume: number
  mixingRatio: string
  processingTime: number
  applicationTechnique?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

interface FormulaHistoryTimelineProps {
  clientId: string
  className?: string
}

interface FormulaHistoryResponse {
  items: FormulaHistoryItem[]
  total: number
  page: number
  limit: number
  pages: number
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffDays > 30) return formatDate(dateStr)
  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'Just now'
}

function ShadeSwatch({ shadeCode, shadeName }: { shadeCode: string; shadeName: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-md border border-white/[0.08] bg-gradient-to-br from-[#14B8A6]/30 to-[#2DD4BF]/10 flex items-center justify-center">
        <span className="text-[9px] font-mono font-semibold text-[#14B8A6]">
          {shadeCode.slice(0, 4)}
        </span>
      </div>
      <span className="text-[11px] text-[#A1A1AA]">{shadeName}</span>
    </div>
  )
}

function TimelineNode({ index, isLast }: { index: number; isLast: boolean }) {
  return (
    <div className="flex flex-col items-center mr-4">
      <motion.div
        className="w-3 h-3 rounded-full border-2 border-[#14B8A6] bg-[#0F0F1A] z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 300, damping: 20 }}
      />
      {!isLast && (
        <motion.div
          className="w-px flex-1 bg-gradient-to-b from-[#14B8A6]/30 to-transparent min-h-[40px]"
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
        />
      )}
    </div>
  )
}

function FormulaHistoryCard({
  item,
  index,
  isLast,
}: {
  item: FormulaHistoryItem
  index: number
  isLast: boolean
}) {
  return (
    <motion.div
      className="flex"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <TimelineNode index={index} isLast={isLast} />
      <div className="flex-1 pb-6">
        <GlassCard className="p-4" hover>
          {/* Date header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#14B8A6]"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="text-xs font-medium text-[#F5F5F7]">{formatDate(item.createdAt)}</span>
            </div>
            <span className="text-[10px] text-[#71717A]">{formatTimeAgo(item.createdAt)}</span>
          </div>

          {/* Brand badge */}
          <div className="mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#14B8A6]/10 text-[10px] font-semibold uppercase tracking-[0.05em] text-[#14B8A6]">
              {item.brand}
            </span>
          </div>

          {/* Shade & Developer */}
          <div className="space-y-2 mb-3">
            <ShadeSwatch shadeCode={item.shadeCode} shadeName={item.shadeName} />
            <div className="flex items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#F59E0B]"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span className="text-[11px] text-[#F5F5F7]">
                {item.developerVolume}vol Developer
              </span>
              <span className="text-[10px] text-[#71717A]">· {item.mixingRatio}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#A78BFA]"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-[11px] text-[#A1A1AA]">
                {item.processingTime} min processing
              </span>
            </div>
          </div>

          {/* Application technique */}
          {item.applicationTechnique && (
            <div className="flex items-center gap-2 mb-3">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#10B981]"
              >
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
              </svg>
              <span className="text-[11px] text-[#A1A1AA]">{item.applicationTechnique}</span>
            </div>
          )}

          {/* Notes */}
          {item.notes && (
            <motion.div
              className="mt-3 pt-3 border-t border-white/[0.06]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.08 + 0.3 }}
            >
              <div className="flex items-start gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#71717A] mt-0.5 shrink-0"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <p className="text-[11px] text-[#71717A] leading-relaxed">{item.notes}</p>
              </div>
            </motion.div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex">
          <div className="flex flex-col items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-white/[0.06] animate-pulse" />
            <div className="w-px flex-1 bg-white/[0.04] min-h-[40px]" />
          </div>
          <div className="flex-1 pb-6">
            <div className="rounded-2xl bg-[#1E1E2D]/60 backdrop-blur-xl border border-white/[0.06] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-white/[0.06] rounded animate-pulse" />
                <div className="h-3 w-12 bg-white/[0.06] rounded animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-[#14B8A6]/10 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse" />
                <div className="h-4 w-28 bg-white/[0.06] rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#14B8A6]/10 flex items-center justify-center mb-4">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#14B8A6]"
        >
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-[#F5F5F7] mb-1">No formula history</h3>
      <p className="text-[11px] text-[#71717A] text-center max-w-[240px]">
        This client hasn't had any formulas recorded yet. Create a new formulation to see it here.
      </p>
    </motion.div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-400"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-[#F5F5F7] mb-1">Failed to load history</h3>
      <p className="text-[11px] text-[#71717A] text-center max-w-[240px] mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-lg bg-[#14B8A6]/10 text-[11px] font-medium text-[#14B8A6] hover:bg-[#14B8A6]/20 transition-colors"
      >
        Try again
      </button>
    </motion.div>
  )
}

export function FormulaHistoryTimeline({ clientId, className }: FormulaHistoryTimelineProps) {
  const [data, setData] = useState<FormulaHistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/v1/formulas/list?clientId=${encodeURIComponent(clientId)}&limit=50`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const json = (await res.json()) as FormulaHistoryResponse
      setData(json)
    } catch (e: any) {
      setError(e?.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!clientId) {
      setError('No client ID provided')
      setLoading(false)
      return
    }
    fetchHistory()
  }, [clientId])

  if (loading) {
    return (
      <div className={className}>
        <LoadingSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorState message={error} onRetry={fetchHistory} />
      </div>
    )
  }

  const items = data?.items || []

  if (items.length === 0) {
    return (
      <div className={className}>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-0">
        <AnimatePresence>
          {items.map((item, index) => (
            <FormulaHistoryCard
              key={item.id}
              item={item}
              index={index}
              isLast={index === items.length - 1}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Summary footer */}
      {data && data.total > items.length && (
        <motion.div
          className="flex items-center justify-center mt-4 pt-4 border-t border-white/[0.06]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-[10px] text-[#71717A]">
            Showing {items.length} of {data.total} formulas
          </span>
        </motion.div>
      )}
    </div>
  )
}
