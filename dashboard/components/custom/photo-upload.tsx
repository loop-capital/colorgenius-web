'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Upload, Image as ImageIcon, Trash2, Loader2, Camera,
  Tag, Send, AlertCircle, Check, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { GlassCard } from './glass-card'

/* ─── Types ────────────────────────────────────────────────────── */

export interface PhotoUploadProps {
  formulaId: string
  stylistId: string
  onClose: () => void
  onSuccess?: (photo: UploadedPhoto) => void
  className?: string
}

export interface UploadedPhoto {
  id: string
  formulaId: string
  stylistId: string
  beforeUrl: string | null
  afterUrl: string | null
  caption: string
  tags: string[]
  createdAt: string
}

/* ─── Constants ────────────────────────────────────────────────── */

const MAX_FILE_SIZE_MB = 10
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_TAGS = 8

/* ─── Helpers ──────────────────────────────────────────────────── */

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Unsupported format: ${file.type}. Use JPG, PNG, or WebP.`
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File too large (${formatFileSize(file.size)}). Max: ${MAX_FILE_SIZE_MB}MB.`
  }
  return null
}

/* ─── Upload Drop Zone ───────────────────────────────────────────── */

function UploadDropZone({
  onFileSelect,
  label,
  previewUrl,
  onClear,
}: {
  onFileSelect: (file: File) => void
  label: string
  previewUrl: string | null
  onClear: () => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) onFileSelect(file)
    },
    [onFileSelect]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) onFileSelect(file)
      // Reset input so same file can be selected again
      if (inputRef.current) inputRef.current.value = ''
    },
    [onFileSelect]
  )

  if (previewUrl) {
    return (
      <motion.div
        className="relative rounded-xl overflow-hidden group cursor-pointer"
        style={{ height: 200 }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <img
          src={previewUrl}
          alt={label}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => inputRef.current?.click()}
            className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
          >
            <Upload className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClear}
            className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-red-500/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="absolute top-2 left-2">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md"
            style={{ background: 'rgba(10,10,15,0.8)', color: '#F59E0B' }}
          >
            {label}
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="relative rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
      style={{
        height: 200,
        background: isDragOver ? 'rgba(147,51,234,0.08)' : 'rgba(255,255,255,0.02)',
        border: isDragOver
          ? '2px dashed rgba(147,51,234,0.4)'
          : '2px dashed rgba(255,255,255,0.08)',
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        animate={isDragOver ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <Camera className="w-8 h-8 text-[#71717A] mb-2" />
      </motion.div>
      <p className="text-xs text-[#A1A1AA] font-medium">Click or drag &amp; drop {label.toLowerCase()}</p>
      <p className="text-[10px] text-[#71717A] mt-1">JPG, PNG, WebP · Max {MAX_FILE_SIZE_MB}MB</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </motion.div>
  )
}

/* ─── Tag Input ────────────────────────────────────────────────── */

function TagInput({
  tags,
  onAdd,
  onRemove,
  maxTags,
  suggestions = [],
}: {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (tag: string) => void
  maxTags: number
  suggestions?: string[]
}) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        const tag = input.trim().toLowerCase().replace(/,/g, '')
        if (tag && !tags.includes(tag) && tags.length < maxTags) {
          onAdd(tag)
          setInput('')
        }
      }
      if (e.key === 'Backspace' && !input && tags.length > 0) {
        onRemove(tags[tags.length - 1])
      }
    },
    [input, tags, maxTags, onAdd, onRemove]
  )

  const filteredSuggestions = suggestions
    .filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s.toLowerCase()))
    .slice(0, 6)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tag className="w-3.5 h-3.5 text-[#71717A]" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#71717A]">Tags</span>
        <span className="text-[10px] text-[#71717A]">{tags.length}/{maxTags}</span>
      </div>

      <div
        className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl min-h-[44px] transition-all"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <motion.span
            key={tag}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium border"
            style={{
              background: 'rgba(147,51,234,0.1)',
              borderColor: 'rgba(147,51,234,0.2)',
              color: '#9333EA',
            }}
          >
            {tag}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => onRemove(tag)}
              className="ml-0.5 hover:text-[#EC4899] transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </motion.button>
          </motion.span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length < maxTags ? 'Add tag...' : 'Max tags reached'}
          disabled={tags.length >= maxTags}
          className="flex-1 min-w-[80px] bg-transparent text-[13px] text-[#F5F5F7] placeholder:text-[#71717A] outline-none disabled:opacity-50"
        />
      </div>

      <AnimatePresence>
        {showSuggestions && input && filteredSuggestions.length > 0 && tags.length < maxTags && (
          <motion.div
            className="flex flex-wrap gap-1.5"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {filteredSuggestions.map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.95 }}
                onClick={() => { onAdd(s.toLowerCase()); setInput('') }}
                className="text-[11px] px-2 py-0.5 rounded-md border transition-colors hover:border-[#9333EA]/30"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.06)',
                  color: 'var(--cg-text-secondary)',
                }}
              >
                {s}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Main Component ───────────────────────────────────────────── */

export function PhotoUpload({
  formulaId,
  stylistId,
  onClose,
  onSuccess,
  className,
}: PhotoUploadProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [beforeFile, setBeforeFile] = useState<File | null>(null)
  const [afterFile, setAfterFile] = useState<File | null>(null)
  const [beforePreview, setBeforePreview] = useState<string | null>(null)
  const [afterPreview, setAfterPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { toast } = useToast()

  const suggestedTags = [
    'balayage', 'ombre', 'highlights', 'root-touch-up', 'gray-coverage',
    'vivid', 'pastel', 'natural', 'correction', 'before-after',
    'blonde', 'brunette', 'red', 'copper', 'ash',
  ]

  const handleFileSelect = useCallback(
    (type: 'before' | 'after', file: File) => {
      const err = validateFile(file)
      if (err) {
        setError(err)
        toast?.({ title: 'Invalid file', description: err, variant: 'destructive' })
        return
      }

      setError(null)
      const url = URL.createObjectURL(file)
      if (type === 'before') {
        setBeforeFile(file)
        setBeforePreview(url)
      } else {
        setAfterFile(file)
        setAfterPreview(url)
      }
    },
    [toast]
  )

  const handleClear = useCallback((type: 'before' | 'after') => {
    if (type === 'before') {
      if (beforePreview) URL.revokeObjectURL(beforePreview)
      setBeforeFile(null)
      setBeforePreview(null)
    } else {
      if (afterPreview) URL.revokeObjectURL(afterPreview)
      setAfterFile(null)
      setAfterPreview(null)
    }
  }, [beforePreview, afterPreview])

  const canProceedToStep2 = beforeFile || afterFile
  const canSubmit = caption.trim().length > 0 || beforeFile || afterFile

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return

    try {
      setUploading(true)
      setError(null)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('formulaId', formulaId)
      formData.append('stylistId', stylistId)
      formData.append('caption', caption.trim())
      tags.forEach((tag) => formData.append('tags[]', tag))
      if (beforeFile) formData.append('before', beforeFile)
      if (afterFile) formData.append('after', afterFile)

      // Simulate progress for better UX (if no native progress available)
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + Math.random() * 15, 85))
      }, 400)

      const res = await fetch('/api/v1/gallery/photos/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `Upload failed: ${res.status}`)
      }

      const data = await res.json()
      const uploaded: UploadedPhoto = {
        id: data.id || String(Date.now()),
        formulaId,
        stylistId,
        beforeUrl: data.before_url || beforePreview || null,
        afterUrl: data.after_url || afterPreview || null,
        caption: caption.trim(),
        tags: [...tags],
        createdAt: new Date().toISOString(),
      }

      toast?.({
        title: 'Upload complete!',
        description: 'Your photo has been added to the gallery.',
      })

      onSuccess?.(uploaded)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      setUploadProgress(0)
      toast?.({
        title: 'Upload failed',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }, [canSubmit, formulaId, stylistId, caption, tags, beforeFile, afterFile, beforePreview, afterPreview, toast, onSuccess, onClose])

  // Cleanup object URLs on unmount
  useRef(() => {
    return () => {
      if (beforePreview) URL.revokeObjectURL(beforePreview)
      if (afterPreview) URL.revokeObjectURL(afterPreview)
    }
  })

  const steps = [
    { num: 1 as const, label: 'Photos' },
    { num: 2 as const, label: 'Details' },
    { num: 3 as const, label: 'Review' },
  ]

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className || ''}`}>
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70"
        style={{ backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!uploading ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{
          background: 'var(--cg-bg-primary)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      >
        {/* Header */}
        <div
          className="sticky top-0 px-6 py-4 flex items-center justify-between z-10"
          style={{
            background: 'var(--cg-bg-primary)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div>
            <h2 className="text-base font-bold text-[#F5F5F7]">Upload Photos</h2>
            <p className="text-[11px] text-[#71717A]">Share your transformation</p>
          </div>
          {!uploading && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/[0.04] text-[#71717A] transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Stepper */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <motion.div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border"
                  style={{
                    background:
                      step >= s.num
                        ? 'rgba(147,51,234,0.15)'
                        : 'rgba(255,255,255,0.02)',
                    borderColor:
                      step >= s.num
                        ? 'rgba(147,51,234,0.3)'
                        : 'rgba(255,255,255,0.06)',
                    color: step >= s.num ? '#9333EA' : 'var(--cg-text-tertiary)',
                  }}
                  animate={{ scale: step === s.num ? 1.05 : 1 }}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{
                      background:
                        step > s.num ? '#9333EA' : 'transparent',
                      color:
                        step > s.num ? '#fff' : 'inherit',
                    }}
                  >
                    {step > s.num ? <Check className="w-2.5 h-2.5" /> : s.num}
                  </span>
                  {s.label}
                </motion.div>
                {i < steps.length - 1 && (
                  <div
                    className="w-4 h-px"
                    style={{
                      background:
                        step > s.num
                          ? 'rgba(147,51,234,0.4)'
                          : 'rgba(255,255,255,0.06)',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-5">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs text-[#A1A1AA]">
                  Upload before and after photos to showcase the transformation. At least one photo is required.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <UploadDropZone
                    label="Before"
                    previewUrl={beforePreview}
                    onFileSelect={(f) => handleFileSelect('before', f)}
                    onClear={() => handleClear('before')}
                  />
                  <UploadDropZone
                    label="After"
                    previewUrl={afterPreview}
                    onFileSelect={(f) => handleFileSelect('after', f)}
                    onClear={() => handleClear('after')}
                  />
                </div>

                {error && (
                  <motion.div
                    className="flex items-center gap-2 p-3 rounded-xl"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.15)',
                    }}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                    <p className="text-xs text-[#EF4444]">{error}</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                className="space-y-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-[#71717A]" />
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#71717A]">Caption</span>
                  </div>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Describe the transformation, technique used, client goals..."
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F5F5F7] placeholder:text-[#71717A] outline-none resize-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(147,51,234,0.4)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147,51,234,0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[#71717A]">
                      {caption.length} characters
                    </span>
                    <span className="text-[10px] text-[#71717A]">Optional</span>
                  </div>
                </div>

                <TagInput
                  tags={tags}
                  onAdd={(tag) => setTags((t) => [...t, tag])}
                  onRemove={(tag) => setTags((t) => t.filter((x) => x !== tag))}
                  maxTags={MAX_TAGS}
                  suggestions={suggestedTags}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard className="overflow-hidden">
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {beforePreview ? (
                        <div className="relative rounded-xl overflow-hidden" style={{ height: 160 }}>
                          <img src={beforePreview} alt="Before" className="w-full h-full object-cover" />
                          <span
                            className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md"
                            style={{ background: 'rgba(10,10,15,0.8)', color: '#F59E0B' }}
                          >
                            Before
                          </span>
                        </div>
                      ) : (
                        <div
                          className="rounded-xl flex items-center justify-center"
                          style={{ height: 160, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
                        >
                          <span className="text-[11px] text-[#71717A]">No before photo</span>
                        </div>
                      )}

                      {afterPreview ? (
                        <div className="relative rounded-xl overflow-hidden" style={{ height: 160 }}>
                          <img src={afterPreview} alt="After" className="w-full h-full object-cover" />
                          <span
                            className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md"
                            style={{ background: 'rgba(10,10,15,0.8)', color: '#9333EA' }}
                          >
                            After
                          </span>
                        </div>
                      ) : (
                        <div
                          className="rounded-xl flex items-center justify-center"
                          style={{ height: 160, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
                        >
                          <span className="text-[11px] text-[#71717A]">No after photo</span>
                        </div>
                      )}
                    </div>

                    {caption && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-medium text-[#71717A]">Caption</span>
                        <p className="text-sm text-[#A1A1AA] leading-relaxed">{caption}</p>
                      </div>
                    )}

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] px-2 py-0.5 rounded-md border"
                            style={{
                              background: 'rgba(147,51,234,0.1)',
                              borderColor: 'rgba(147,51,234,0.2)',
                              color: '#9333EA',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </GlassCard>

                {uploading && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9333EA]" />
                        Uploading...
                      </span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'var(--cg-gradient-teal)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                      />
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    className="flex items-center gap-2 p-3 rounded-xl"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.15)',
                    }}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                    <p className="text-xs text-[#EF4444]">{error}</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div
          className="sticky bottom-0 px-6 py-4 flex items-center justify-between"
          style={{
            background: 'var(--cg-bg-primary)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <motion.button
            onClick={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3)}
            disabled={step === 1 || uploading}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--cg-text-secondary)',
            }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </motion.button>

          {step < 3 ? (
            <motion.button
              onClick={() => setStep((s) => Math.min(3, s + 1) as 1 | 2 | 3)}
              disabled={step === 1 && !canProceedToStep2}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1 px-5 py-2 rounded-xl text-sm font-semibold text-[#0A0A0A] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--cg-gradient-teal)' }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleSubmit}
              disabled={!canSubmit || uploading}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-[#0A0A0A] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--cg-gradient-teal)' }}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Publish
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
