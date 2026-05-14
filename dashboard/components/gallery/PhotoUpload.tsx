'use client'

import { useState, useCallback } from 'react'
import { X, Upload, ImageIcon, Loader2 } from 'lucide-react'

interface PhotoUploadProps {
  formulaId?: string
  formulaData?: {
    brand?: string
    line?: string
    shades?: string[]
    developer?: string
    ratio?: string
  }
  onClose?: () => void
  onSuccess?: () => void
}

export default function PhotoUpload({ formulaId, formulaData, onClose, onSuccess }: PhotoUploadProps) {
  const [beforeImage, setBeforeImage] = useState<File | null>(null)
  const [afterImage, setAfterImage] = useState<File | null>(null)
  const [beforePreview, setBeforePreview] = useState('')
  const [afterPreview, setAfterPreview] = useState('')
  const [caption, setCaption] = useState('')
  const [hairType, setHairType] = useState('')
  const [porosity, setPorosity] = useState('medium')
  const [level, setLevel] = useState('')
  const [developer, setDeveloper] = useState(formulaData?.developer || '')
  const [processingTime, setProcessingTime] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (type: 'before' | 'after', file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'before') {
        setBeforeImage(file)
        setBeforePreview(reader.result as string)
      } else {
        setAfterImage(file)
        setAfterPreview(reader.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: React.DragEvent, type: 'before' | 'after') => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileChange(type, file)
    }
  }, [])

  const handleSubmit = async () => {
    if (!afterImage) {
      setError('After photo is required')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      if (beforeImage) formData.append('beforePhoto', beforeImage)
      formData.append('afterPhoto', afterImage)
      if (formulaId) formData.append('formulaId', formulaId)
      formData.append('caption', caption)
      formData.append('hairType', hairType)
      formData.append('porosity', porosity)
      formData.append('level', level)
      formData.append('developer', developer)
      formData.append('processingTime', processingTime)

      const res = await fetch('/api/v1/gallery/photos/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      onSuccess?.()
      onClose?.()
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#161620] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold">Share Your Results</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Photo Upload Area */}
          <div className="grid grid-cols-2 gap-4">
            {/* Before Photo */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'before')}
              className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-[#9333EA]/40 transition-colors"
            >
              {beforePreview ? (
                <img src={beforePreview} alt="Before" className="w-full h-32 object-cover rounded-lg" />
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="mx-auto mb-2 text-white/30" size={24} />
                  <span className="text-sm text-white/40">Before</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange('before', e.target.files?.[0] || null)}
                  />
                </label>
              )}
            </div>

            {/* After Photo */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'after')}
              className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-[#9333EA]/40 transition-colors"
            >
              {afterPreview ? (
                <img src={afterPreview} alt="After" className="w-full h-32 object-cover rounded-lg" />
              ) : (
                <label className="cursor-pointer block">
                  <ImageIcon className="mx-auto mb-2 text-white/30" size={24} />
                  <span className="text-sm text-white/40">After *</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange('after', e.target.files?.[0] || null)}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe the transformation..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-[#9333EA]/50 min-h-[80px] resize-none"
            />
          </div>

          {/* Formula Info (if provided) */}
          {formulaData && (
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#9333EA] mb-2">Formula Used</h3>
              <div className="space-y-1 text-sm text-white/60">
                {formulaData.brand && <p>Brand: {formulaData.brand}</p>}
                {formulaData.line && <p>Line: {formulaData.line}</p>}
                {formulaData.shades && <p>Shades: {formulaData.shades.join(', ')}</p>}
                {formulaData.developer && <p>Developer: {formulaData.developer}</p>}
                {formulaData.ratio && <p>Ratio: {formulaData.ratio}</p>}
              </div>
            </div>
          )}

          {/* Hair Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Hair Type</label>
              <select
                value={hairType}
                onChange={(e) => setHairType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#9333EA]/50"
              >
                <option value="">Select...</option>
                <option value="straight">Straight</option>
                <option value="wavy">Wavy</option>
                <option value="curly">Curly</option>
                <option value="coily">Coily</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Porosity</label>
              <select
                value={porosity}
                onChange={(e) => setPorosity(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#9333EA]/50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Natural Level</label>
              <input
                type="number"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="1-10"
                min="1"
                max="10"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-[#9333EA]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Developer Vol</label>
              <input
                type="text"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                placeholder="e.g. 20vol"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-[#9333EA]/50"
              />
            </div>
          </div>

          {/* Processing Time */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Processing Time (minutes)</label>
            <input
              type="number"
              value={processingTime}
              onChange={(e) => setProcessingTime(e.target.value)}
              placeholder="e.g. 35"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-[#9333EA]/50"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isUploading || !afterImage}
            className="w-full py-3 px-6 bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              'Share Results'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
