'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface RatingData {
  execution: number
  effectiveness: number
  overall: number
}

interface ExistingRatings {
  executionAvg: number
  effectivenessAvg: number
  overallAvg: number
  count: number
  userRating?: RatingData
}

interface FormulaRatingProps {
  formulaId: string
  raterId: string
}

const STAR_COLORS = {
  execution: '#14B8A6',
  effectiveness: '#F59E0B',
  overall: '#9333EA',
}

const AXIS_LABELS = {
  execution: 'Execution',
  effectiveness: 'Effectiveness',
  overall: 'Overall',
}

function StarButton({
  value,
  hoverValue,
  onHover,
  onClick,
  color,
  size = 20,
}: {
  value: number
  hoverValue: number
  onHover: (v: number) => void
  onClick: () => void
  color: string
  size?: number
}) {
  const isFilled = value <= hoverValue

  return (
    <motion.button
      type="button"
      onMouseEnter={() => onHover(value)}
      onMouseLeave={() => onHover(0)}
      onClick={onClick}
      whileHover={{ scale: 1.25 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      style={{ lineHeight: 0 }}
    >
      <Star
        size={size}
        fill={isFilled ? color : 'transparent'}
        color={isFilled ? color : 'rgba(255,255,255,0.15)'}
        strokeWidth={1.5}
      />
    </motion.button>
  )
}

function RatingAxis({
  label,
  value,
  hoverValue,
  setHoverValue,
  onRate,
  color,
  avg,
}: {
  label: string
  value: number
  hoverValue: number
  setHoverValue: (v: number) => void
  onRate: (v: number) => void
  color: string
  avg?: number
}) {
  const displayValue = hoverValue || value

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--cg-text-secondary)' }}>
          {label}
        </span>
        {avg !== undefined && avg > 0 && (
          <span className="text-[10px]" style={{ color: 'var(--cg-text-tertiary)' }}>
            avg {avg.toFixed(1)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarButton
            key={star}
            value={star}
            hoverValue={displayValue}
            onHover={setHoverValue}
            onClick={() => onRate(star)}
            color={color}
          />
        ))}
        <span
          className="ml-2 text-xs font-semibold min-w-[1.2rem]"
          style={{ color: displayValue > 0 ? color : 'var(--cg-text-tertiary)' }}
        >
          {displayValue > 0 ? displayValue : '-'}
        </span>
      </div>
    </div>
  )
}

export function FormulaRating({ formulaId, raterId }: FormulaRatingProps) {
  const { toast } = useToast()
  const [ratings, setRatings] = useState<RatingData>({ execution: 0, effectiveness: 0, overall: 0 })
  const [hover, setHover] = useState<RatingData>({ execution: 0, effectiveness: 0, overall: 0 })
  const [existing, setExisting] = useState<ExistingRatings | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fetch existing ratings
  useEffect(() => {
    let cancelled = false
    const fetchRatings = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/v1/gallery/formulas/ratings?formulaId=${encodeURIComponent(formulaId)}`)
        if (!res.ok) {
          console.warn('Ratings API returned', res.status)
          return
        }
        const data = await res.json()
        if (!cancelled) {
          setExisting({
            executionAvg: data.executionAvg ?? 0,
            effectivenessAvg: data.effectivenessAvg ?? 0,
            overallAvg: data.overallAvg ?? 0,
            count: data.count ?? 0,
            userRating: data.userRating,
          })
          if (data.userRating) {
            setRatings(data.userRating)
          }
        }
      } catch (e) {
        console.error('Failed to fetch ratings:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchRatings()
    return () => { cancelled = true }
  }, [formulaId])

  const submitRating = useCallback(
    async (axis: keyof RatingData, value: number) => {
      const newRatings = { ...ratings, [axis]: value }
      setRatings(newRatings)
      setHover({ execution: 0, effectiveness: 0, overall: 0 })

      try {
        setSubmitting(true)
        const res = await fetch('/api/v1/gallery/formulas/ratings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formulaId,
            raterId,
            execution: newRatings.execution,
            effectiveness: newRatings.effectiveness,
            overall: newRatings.overall,
          }),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(err || `HTTP ${res.status}`)
        }

        const data = await res.json()
        setExisting({
          executionAvg: data.executionAvg ?? 0,
          effectivenessAvg: data.effectivenessAvg ?? 0,
          overallAvg: data.overallAvg ?? 0,
          count: data.count ?? 0,
          userRating: newRatings,
        })

        if (axis === 'overall') {
          toast({ title: 'Rating submitted', description: `Overall rated ${value}/5` })
        }
      } catch (e) {
        console.error('Failed to submit rating:', e)
        toast({
          title: 'Failed to submit rating',
          description: e instanceof Error ? e.message : 'Please try again',
          variant: 'destructive',
        })
        // Revert
        setRatings(ratings)
      } finally {
        setSubmitting(false)
      }
    },
    [formulaId, raterId, ratings, toast]
  )

  const allRated = ratings.execution > 0 && ratings.effectiveness > 0 && ratings.overall > 0

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'var(--cg-surface)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--cg-text-primary)' }}>
          Rate This Formula
        </h3>
        {existing && existing.count > 0 && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(147,51,234,0.1)', color: '#9333EA' }}>
            {existing.count} rating{existing.count !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <AnimatePresence>
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="h-3 w-20 rounded bg-white/[0.04] animate-pulse" />
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="w-5 h-5 rounded bg-white/[0.04] animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <RatingAxis
              label={AXIS_LABELS.execution}
              value={ratings.execution}
              hoverValue={hover.execution}
              setHoverValue={(v) => setHover((h) => ({ ...h, execution: v }))}
              onRate={(v) => submitRating('execution', v)}
              color={STAR_COLORS.execution}
              avg={existing?.executionAvg}
            />
            <RatingAxis
              label={AXIS_LABELS.effectiveness}
              value={ratings.effectiveness}
              hoverValue={hover.effectiveness}
              setHoverValue={(v) => setHover((h) => ({ ...h, effectiveness: v }))}
              onRate={(v) => submitRating('effectiveness', v)}
              color={STAR_COLORS.effectiveness}
              avg={existing?.effectivenessAvg}
            />

            <div
              className="my-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            />

            <RatingAxis
              label={AXIS_LABELS.overall}
              value={ratings.overall}
              hoverValue={hover.overall}
              setHoverValue={(v) => setHover((h) => ({ ...h, overall: v }))}
              onRate={(v) => submitRating('overall', v)}
              color={STAR_COLORS.overall}
              avg={existing?.overallAvg}
            />

            {allRated && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-3"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#10B981' }}
                />
                <span className="text-[11px] font-medium" style={{ color: '#10B981' }}>
                  Thanks for rating!
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
