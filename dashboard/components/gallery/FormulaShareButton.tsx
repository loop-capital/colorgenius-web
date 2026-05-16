'use client'

import { useState } from 'react'
import { Share2, Camera } from 'lucide-react'
import PhotoUpload from './PhotoUpload'

interface FormulaData {
  id: string
  brand?: string
  line?: string
  shades?: string[]
  developer?: string
  ratio?: string
}

interface FormulaShareButtonProps {
  formula: FormulaData
  variant?: 'button' | 'icon'
}

export default function FormulaShareButton({ formula, variant = 'button' }: FormulaShareButtonProps) {
  const [showUpload, setShowUpload] = useState(false)

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-[#EC4899] transition-colors"
          title="Share results with this formula"
        >
          <Share2 size={16} />
          <span>Share Results</span>
        </button>

        {showUpload && (
          <PhotoUpload
            formulaId={formula.id}
            formulaData={{
              brand: formula.brand,
              line: formula.line,
              shades: formula.shades,
              developer: formula.developer,
              ratio: formula.ratio,
            }}
            onClose={() => setShowUpload(false)}
            onSuccess={() => {
              setShowUpload(false)
              // Could trigger a toast or refresh
            }}
          />
        )}
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowUpload(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
      >
        <Camera size={16} />
        <span>Share Your Results</span>
      </button>

      {showUpload && (
        <PhotoUpload
          formulaId={formula.id}
          formulaData={{
            brand: formula.brand,
            line: formula.line,
            shades: formula.shades,
            developer: formula.developer,
            ratio: formula.ratio,
          }}
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false)
            // Could trigger a toast or refresh
          }}
        />
      )}
    </>
  )
}
