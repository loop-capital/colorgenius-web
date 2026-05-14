'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface RatingProps {
  formulaId: string
  userRating?: {
    execution: number
    effectiveness: number
  }
  averageRatings?: {
    execution: number
    effectiveness: number
    total: number
  }
  onRate?: (execution: number, effectiveness: number) => void
}

export default function Rating({ formulaId, userRating, averageRatings, onRate }: RatingProps) {
  const [executionHover, setExecutionHover] = useState(0)
  const [effectivenessHover, setEffectivenessHover] = useState(0)
  const [execution, setExecution] = useState(userRating?.execution || 0)
  const [effectiveness, setEffectiveness] = useState(userRating?.effectiveness || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRate = async (axis: 'execution' | 'effectiveness', value: number) => {
    const newExecution = axis === 'execution' ? value : execution
    const newEffectiveness = axis === 'effectiveness' ? value : effectiveness

    setExecution(newExecution)
    setEffectiveness(newEffectiveness)

    if (onRate) {
      onRate(newExecution, newEffectiveness)
      return
    }

    // Submit to API
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/v1/gallery/formulas/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formulaId,
          execution: newExecution,
          effectiveness: newEffectiveness,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit rating')
    } catch (err) {
      console.error('Rating failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (
    axis: 'execution' | 'effectiveness',
    value: number,
    hoverValue: number,
    setHoverValue: (v: number) => void
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => {
          const filled = star <= (hoverValue || value)
          return (
            <button
              key={star}
              onMouseEnter={() => setHoverValue(star)}
              onMouseLeave={() => setHoverValue(0)}
              onClick={() => handleRate(axis, star)}
              disabled={isSubmitting}
              className="transition-colors disabled:opacity-50"
            >
              <Star
                size={20}
                className={`${
                  filled
                    ? 'fill-[#EC4899] text-[#EC4899]'
                    : 'text-white/20'
                } hover:scale-110 transition-transform`}
              />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Rate This Formula</h3>

      <div className="space-y-6">
        {/* Execution Rating */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">Execution (Stylist Skill)</span>
            {averageRatings && (
              <span className="text-sm text-white/40">
                Avg: {averageRatings.execution.toFixed(1)}/5
              </span>
            )}
          </div>
          {renderStars('execution', execution, executionHover, setExecutionHover)}
          <p className="text-xs text-white/30 mt-1">
            {execution === 0 ? 'Click to rate' : execution >= 4 ? 'Excellent application' : execution >= 3 ? 'Good application' : execution >= 2 ? 'Average application' : 'Needs improvement'}
          </p>
        </div>

        {/* Effectiveness Rating */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">Effectiveness (Formula Worked)</span>
            {averageRatings && (
              <span className="text-sm text-white/40">
                Avg: {averageRatings.effectiveness.toFixed(1)}/5
              </span>
            )}
          </div>
          {renderStars('effectiveness', effectiveness, effectivenessHover, setEffectivenessHover)}
          <p className="text-xs text-white/30 mt-1">
            {effectiveness === 0 ? 'Click to rate' : effectiveness >= 4 ? 'Perfect color match' : effectiveness >= 3 ? 'Good color result' : effectiveness >= 2 ? 'Acceptable result' : 'Did not achieve desired result'}
          </p>
        </div>

        {/* Overall Score */}
        {averageRatings && (
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Overall Score</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#EC4899]">
                  {((averageRatings.execution + averageRatings.effectiveness) / 2).toFixed(1)}
                </span>
                <span className="text-sm text-white/40">/5</span>
              </div>
            </div>
            <p className="text-xs text-white/30 mt-1">
              Based on {averageRatings.total} rating{averageRatings.total !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
