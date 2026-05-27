'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CheckCircle, Palette, FlaskConical, ExternalLink } from 'lucide-react'

interface MatchResultProps {
  data: {
    success: boolean
    extractedColor: {
      primaryHex: string
      colorFamily: string
      level: number
      toneFamily: string
      secondaryTone?: string
    }
    matchedFormula: {
      id: string
      brand: string
      line: string
      shadeCode: string
      shadeName: string
      level: number
      tone: string
      secondaryTone?: string
      mixingRatio: string
      developerRequired: string
    } | null
    confidence: number
    matchDetails: {
      levelDistance: number
      toneMatch: boolean
      brand?: string
      colorName: string
    }
    prefillQuery?: string
  }
  onReset?: () => void
}

export function ColorMatchResult({ data, onReset }: MatchResultProps) {
  const { extractedColor, matchedFormula, confidence, matchDetails, prefillQuery } = data

  const confidenceLabel = confidence >= 90 ? 'Excellent Match' : confidence >= 70 ? 'Good Match' : confidence >= 50 ? 'Fair Match' : 'Low Confidence'
  const confidenceColor = confidence >= 90 ? '#4ADE80' : confidence >= 70 ? '#A78BFA' : confidence >= 50 ? '#FBBF24' : '#EF4444'

  const formulateUrl = matchedFormula && prefillQuery
    ? `/formulate?${prefillQuery}`
    : '/formulate'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Extracted Color Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 16,
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Palette size={16} color="#9333EA" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Extracted Color</span>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {/* Color Swatch */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 14,
              background: extractedColor.primaryHex,
              border: '2px solid rgba(255,255,255,0.1)',
              boxShadow: `0 0 30px ${extractedColor.primaryHex}33`,
              flexShrink: 0,
            }}
          />

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
              {extractedColor.colorFamily}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(147,51,234,0.15)', color: '#C084FC', fontWeight: 600 }}>
                Level {extractedColor.level}
              </span>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(236,72,153,0.15)', color: '#F9A8D4', fontWeight: 600 }}>
                {extractedColor.toneFamily}
              </span>
              {extractedColor.secondaryTone && (
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                  {extractedColor.secondaryTone}
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8, fontFamily: 'monospace' }}>
              {extractedColor.primaryHex.toUpperCase()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Confidence Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 16,
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color={confidenceColor} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Match Confidence</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: confidenceColor }}>
            {confidence}%
          </span>
        </div>

        <div style={{ width: '100%', height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: 999,
              background: `linear-gradient(90deg, ${confidenceColor}66, ${confidenceColor})`,
            }}
          />
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
          {confidenceLabel} — {matchDetails.toneMatch ? 'Tone aligned' : 'Tone approximate'} · Level off by {matchDetails.levelDistance}
        </p>
      </motion.div>

      {/* Matched Formula */}
      {matchedFormula && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            border: '1px solid rgba(147,51,234,0.2)',
            background: 'linear-gradient(135deg, rgba(147,51,234,0.1), rgba(236,72,153,0.05))',
            borderRadius: 16,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FlaskConical size={16} color="#EC4899" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Matched Formula</span>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            {/* Formula Color Indicator */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: extractedColor.primaryHex,
                border: '1px solid rgba(255,255,255,0.1)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle size={20} color="rgba(255,255,255,0.8)" />
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
                {matchedFormula.brand} {matchedFormula.shadeName}
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
                {matchedFormula.line} · {matchedFormula.shadeCode}
              </p>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(147,51,234,0.15)', color: '#C084FC', fontWeight: 600 }}>
                  {matchedFormula.mixingRatio}
                </span>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(236,72,153,0.15)', color: '#F9A8D4', fontWeight: 600 }}>
                  {matchedFormula.developerRequired}
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <a
            href={formulateUrl}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              padding: '14px 24px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #9333EA, #EC4899)',
              color: 'white',
              fontSize: 15,
              fontWeight: 700,
              textDecoration: 'none',
              marginTop: 8,
              transition: 'opacity 0.2s',
            }}
          >
            Get This Formula
            <ArrowRight size={18} />
          </a>
        </motion.div>
      )}

      {/* No match state */}
      {!matchedFormula && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 12 }}>
            No exact formula match found. Try uploading a clearer photo or browse our shade library.
          </p>
          <a
            href="/formulate"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 999,
              border: '1px solid rgba(147,51,234,0.3)',
              color: '#9333EA',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={14} />
            Browse Shades
          </a>
        </motion.div>
      )}
    </div>
  )
}
