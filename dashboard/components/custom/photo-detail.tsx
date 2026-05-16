'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Heart, MessageCircle, Share2, Send, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Bookmark, Trash2, Edit3, Clock,
  ChevronDown, ChevronUp, MoreHorizontal, ImageIcon,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { GlassCard } from './glass-card'
import { BeforeAfterSlider } from './before-after-slider'

/* ─── Types ────────────────────────────────────────────────────── */

export interface Comment {
  id: string
  photoId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  createdAt: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
}

export interface PhotoDetailProps {
  photoId: string
  onClose: () => void
  onNavigate?: (direction: 'prev' | 'next') => void
  hasPrev?: boolean
  hasNext?: boolean
  canEdit?: boolean
  canDelete?: boolean
  className?: string
  /* Optional pre-filled photo data to skip fetch */
  beforeUrl?: string | null
  afterUrl?: string | null
  caption?: string
  tags?: string[]
  likes?: number
  comments?: number
  isLiked?: boolean
  isSaved?: boolean
  createdAt?: string
  stylistName?: string
  salonName?: string
  avatarUrl?: string
  confidence?: number
  formulaId?: string
  stylistId?: string
}

export interface PhotoDetail {
  id: string
  formulaId: string
  stylistId: string
  beforeUrl: string | null
  afterUrl: string | null
  caption: string
  tags: string[]
  likes: number
  comments: number
  isLiked: boolean
  isSaved: boolean
  createdAt: string
  stylistName: string
  salonName: string
  avatarUrl?: string
  confidence?: number
  formulaSnapshot?: {
    brand: string
    line: string
    shades: { code: string; name: string; hex: string }[]
  }
}

/* ─── Inline Components ──────────────────────────────────────────── */

function AvatarFallback({ name, size = 8 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div
      className="rounded-lg flex items-center justify-center text-[10px] font-bold"
      style={{
        width: size * 4,
        height: size * 4,
        background: 'rgba(147,51,234,0.15)',
        color: '#9333EA',
      }}
    >
      {initials}
    </div>
  )
}

function TagPill({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border"
      style={{
        color: 'var(--cg-text-tertiary)',
        borderColor: 'rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      {label}
    </span>
  )
}

function ActionButton({
  children,
  onClick,
  active = false,
  activeColor = '#EF4444',
  count,
}: {
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  activeColor?: string
  count?: number
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      className="flex items-center gap-1.5 text-[11px] font-medium transition-colors rounded-lg px-2 py-1 hover:bg-white/[0.04]"
      style={{ color: active ? activeColor : 'var(--cg-text-tertiary)' }}
    >
      {children}
      {count !== undefined && <span>{count}</span>}
    </motion.button>
  )
}

function SkeletonComment() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 bg-white/[0.04] rounded" />
        <div className="h-3 w-full bg-white/[0.04] rounded" />
      </div>
    </div>
  )
}

/* ─── Comment Item ──────────────────────────────────────────────── */

function CommentItem({
  comment,
  onLike,
  onDelete,
  canDelete,
}: {
  comment: Comment
  onLike: (id: string) => void
  onDelete: (id: string) => void
  canDelete: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const isLong = comment.content.length > 200
  const displayContent = isExpanded || !isLong
    ? comment.content
    : comment.content.slice(0, 200) + '...'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex gap-3"
    >
      {comment.authorAvatar ? (
        <img
          src={comment.authorAvatar}
          alt={comment.authorName}
          className="w-8 h-8 rounded-lg object-cover shrink-0"
        />
      ) : (
        <AvatarFallback name={comment.authorName} size={8} />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[#F5F5F7]">{comment.authorName}</span>
            <span className="text-[10px] text-[#71717A]">
              {new Date(comment.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-md hover:bg-white/[0.04] text-[#71717A] transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </motion.button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  className="absolute right-0 top-8 z-10 rounded-xl overflow-hidden shadow-xl"
                  style={{
                    background: 'var(--cg-surface-raised)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {canDelete && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setShowActions(false)
                        onDelete(comment.id)
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-[#EF4444] hover:bg-white/[0.04] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-[13px] text-[#A1A1AA] leading-relaxed mt-0.5">
          {displayContent}
        </p>
        {isLong && (
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-medium mt-1 flex items-center gap-0.5"
            style={{ color: '#9333EA' }}
            whileTap={{ scale: 0.97 }}
          >
            {isExpanded ? (
              <>Show less <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>Show more <ChevronDown className="w-3 h-3" /></>
            )}
          </motion.button>
        )}

        <div className="flex items-center gap-3 mt-1.5">
          <ActionButton
            onClick={() => onLike(comment.id)}
            active={comment.isLiked}
            activeColor="#EF4444"
            count={comment.likes}
          >
            <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
          </ActionButton>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Main Component ───────────────────────────────────────────── */

export function PhotoDetail({
  photoId,
  onClose,
  onNavigate,
  hasPrev = false,
  hasNext = false,
  canEdit = false,
  canDelete = false,
  className,
  beforeUrl: propBeforeUrl,
  afterUrl: propAfterUrl,
  caption: propCaption,
  tags: propTags,
  likes: propLikes,
  comments: propComments,
  isLiked: propIsLiked,
  isSaved: propIsSaved,
  createdAt: propCreatedAt,
  stylistName: propStylistName,
  salonName: propSalonName,
  avatarUrl: propAvatarUrl,
  confidence: propConfidence,
  formulaId: propFormulaId,
  stylistId: propStylistId,
}: PhotoDetailProps) {
  const [photo, setPhoto] = useState<PhotoDetail | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { toast } = useToast()

  // If props are passed, skip the initial fetch and use them directly
  useEffect(() => {
    if (propAfterUrl) {
      const prefill: PhotoDetail = {
        id: photoId,
        formulaId: propFormulaId || '',
        stylistId: propStylistId || '',
        beforeUrl: propBeforeUrl ?? null,
        afterUrl: propAfterUrl ?? null,
        caption: propCaption || '',
        tags: propTags || [],
        likes: propLikes ?? 0,
        comments: propComments ?? 0,
        isLiked: propIsLiked ?? false,
        isSaved: propIsSaved ?? false,
        createdAt: propCreatedAt || new Date().toISOString(),
        stylistName: propStylistName || 'Unknown',
        salonName: propSalonName || '',
        avatarUrl: propAvatarUrl,
        confidence: propConfidence,
      }
      setPhoto(prefill)
      setLoading(false)
    }
  }, [photoId, propAfterUrl, propBeforeUrl, propCaption, propTags, propLikes, propComments, propIsLiked, propIsSaved, propCreatedAt, propStylistName, propSalonName, propAvatarUrl, propConfidence, propFormulaId, propStylistId])

  // Fetch photo details (only if no props provided)
  const fetchPhoto = useCallback(async () => {
    if (!photoId) {
      setError('Invalid photo ID')
      setLoading(false)
      return
    }

    // Skip fetch if photo already loaded from props
    if (photo) return

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/v1/gallery/photos/${photoId}`)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)

      const data = await res.json()
      const detail: PhotoDetail = {
        id: data.id,
        formulaId: data.formula_id || '',
        stylistId: data.stylist_id || '',
        beforeUrl: data.before_url || null,
        afterUrl: data.after_url || null,
        caption: data.caption || '',
        tags: data.tags || [],
        likes: data.likes || 0,
        comments: data.comments || 0,
        isLiked: data.is_liked || false,
        isSaved: data.is_saved || false,
        createdAt: data.created_at || new Date().toISOString(),
        stylistName: data.stylist_name || 'Unknown',
        salonName: data.salon_name || '',
        avatarUrl: data.avatar_url || undefined,
        confidence: data.confidence_score || undefined,
        formulaSnapshot: data.formula_snapshot
          ? {
              brand: data.formula_snapshot.brand || '',
              line: data.formula_snapshot.line || '',
              shades: data.formula_snapshot.shades || [],
            }
          : undefined,
      }
      setPhoto(detail)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load photo'
      setError(message)
      toast?.({
        title: 'Error loading photo',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [photoId, toast])

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!photoId) return
    try {
      setCommentsLoading(true)
      const res = await fetch(`/api/v1/gallery/photos/${photoId}/comments`)
      if (!res.ok) throw new Error(`Failed to fetch comments: ${res.status}`)

      const data = await res.json()
      const items: Comment[] = (data.items || []).map((c: any) => ({
        id: c.id,
        photoId: c.photo_id || photoId,
        authorId: c.author_id || '',
        authorName: c.author_name || 'Unknown',
        authorAvatar: c.author_avatar || undefined,
        content: c.content || '',
        createdAt: c.created_at || new Date().toISOString(),
        likes: c.likes || 0,
        isLiked: c.is_liked || false,
        replies: (c.replies || []).map((r: any) => ({
          id: r.id,
          photoId: photoId,
          authorId: r.author_id || '',
          authorName: r.author_name || 'Unknown',
          authorAvatar: r.author_avatar || undefined,
          content: r.content || '',
          createdAt: r.created_at || new Date().toISOString(),
          likes: r.likes || 0,
          isLiked: r.is_liked || false,
        })),
      }))
      setComments(items)
    } catch (err) {
      console.error('Failed to load comments:', err)
    } finally {
      setCommentsLoading(false)
    }
  }, [photoId])

  useEffect(() => {
    if (!photo) fetchPhoto()
    fetchComments()
  }, [fetchPhoto, fetchComments, photo])

  const handleToggleLike = useCallback(async () => {
    if (!photo) return
    try {
      const res = await fetch(`/api/v1/gallery/photos/${photoId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to toggle like')

      const data = await res.json()
      setPhoto((prev) =>
        prev
          ? {
              ...prev,
              isLiked: data.liked ?? !prev.isLiked,
              likes: data.likes ?? prev.likes,
            }
          : prev
      )
    } catch (err) {
      toast?.({
        title: 'Error',
        description: 'Could not update like. Please try again.',
        variant: 'destructive',
      })
    }
  }, [photo, photoId, toast])

  const handleToggleSave = useCallback(async () => {
    if (!photo) return
    try {
      const res = await fetch(`/api/v1/gallery/photos/${photoId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to toggle save')

      const data = await res.json()
      setPhoto((prev) =>
        prev
          ? {
              ...prev,
              isSaved: data.saved ?? !prev.isSaved,
            }
          : prev
      )
    } catch (err) {
      toast?.({
        title: 'Error',
        description: 'Could not update save. Please try again.',
        variant: 'destructive',
      })
    }
  }, [photo, photoId, toast])

  const handlePostComment = useCallback(async () => {
    if (!newComment.trim() || postingComment) return
    try {
      setPostingComment(true)
      const res = await fetch(`/api/v1/gallery/photos/${photoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      })
      if (!res.ok) throw new Error('Failed to post comment')

      const data = await res.json()
      const comment: Comment = {
        id: data.id || String(Date.now()),
        photoId,
        authorId: data.author_id || '',
        authorName: data.author_name || 'You',
        authorAvatar: data.author_avatar || undefined,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      }

      setComments((prev) => [comment, ...prev])
      setPhoto((prev) => (prev ? { ...prev, comments: prev.comments + 1 } : prev))
      setNewComment('')
      toast?.({ title: 'Comment posted', description: 'Your comment is now visible.' })
    } catch (err) {
      toast?.({
        title: 'Error',
        description: 'Could not post comment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setPostingComment(false)
    }
  }, [newComment, photoId, postingComment, toast])

  const handleLikeComment = useCallback(
    async (commentId: string) => {
      try {
        const res = await fetch(`/api/v1/gallery/photos/${photoId}/comments/${commentId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        if (!res.ok) throw new Error('Failed to like comment')

        const data = await res.json()
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, isLiked: data.liked ?? !c.isLiked, likes: data.likes ?? c.likes }
              : c
          )
        )
      } catch (err) {
        toast?.({
          title: 'Error',
          description: 'Could not like comment.',
          variant: 'destructive',
        })
      }
    },
    [photoId, toast]
  )

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!confirm('Delete this comment?')) return
      try {
        const res = await fetch(`/api/v1/gallery/photos/${photoId}/comments/${commentId}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete')

        setComments((prev) => prev.filter((c) => c.id !== commentId))
        setPhoto((prev) => (prev ? { ...prev, comments: Math.max(0, prev.comments - 1) } : prev))
        toast?.({ title: 'Deleted', description: 'Comment removed.' })
      } catch (err) {
        toast?.({
          title: 'Error',
          description: 'Could not delete comment.',
          variant: 'destructive',
        })
      }
    },
    [photoId, toast]
  )

  const handleDeletePhoto = useCallback(async () => {
    if (!canDelete) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/v1/gallery/photos/${photoId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')

      toast?.({ title: 'Deleted', description: 'Photo removed from gallery.' })
      onClose()
    } catch (err) {
      toast?.({
        title: 'Error',
        description: 'Could not delete photo.',
        variant: 'destructive',
      })
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }, [canDelete, photoId, toast, onClose])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev && onNavigate) onNavigate('prev')
      if (e.key === 'ArrowRight' && hasNext && onNavigate) onNavigate('next')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onNavigate, hasPrev, hasNext])

  // Lock body scroll
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [])

  if (loading) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className || ''}`}>
        <motion.div
          className="absolute inset-0 bg-black/70"
          style={{ backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.div
          className="relative flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-[#9333EA]" />
          <p className="text-sm text-[#A1A1AA]">Loading photo...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !photo) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className || ''}`}>
        <motion.div
          className="absolute inset-0 bg-black/70"
          style={{ backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
        />
        <motion.div
          className="relative w-full max-w-md rounded-2xl p-6 text-center"
          style={{
            background: 'var(--cg-bg-primary)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertCircle className="w-10 h-10 text-[#EF4444] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#F5F5F7] mb-1">Couldn&apos;t load photo</p>
          <p className="text-xs text-[#71717A] mb-4">{error}</p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#0A0A0A]"
            style={{ background: 'var(--cg-gradient-teal)' }}
          >
            Close
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const hasBeforeAfter = photo.beforeUrl && photo.afterUrl
  const hasSingleImage = photo.afterUrl || photo.beforeUrl

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className || ''}`}>
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/75"
        style={{ backdropFilter: 'blur(12px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Navigation arrows */}
      {hasPrev && onNavigate && (
        <motion.button
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full"
          style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('prev')}
        >
          <ChevronLeft className="w-5 h-5 text-[#F5F5F7]" />
        </motion.button>
      )}
      {hasNext && onNavigate && (
        <motion.button
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full"
          style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
          whileHover={{ scale: 1.1, x: 2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('next')}
        >
          <ChevronRight className="w-5 h-5 text-[#F5F5F7]" />
        </motion.button>
      )}

      {/* Main modal */}
      <motion.div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col md:flex-row"
        style={{
          background: 'var(--cg-bg-primary)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Image */}
        <div className="relative flex-1 min-h-[300px] md:min-h-[500px] bg-[#0F0F1A]">
          {hasBeforeAfter ? (
            <BeforeAfterSlider
              beforeImage={photo.beforeUrl!}
              afterImage={photo.afterUrl!}
              autoSweep={false}
              className="w-full h-full"
            />
          ) : hasSingleImage ? (
            <img
              src={hasSingleImage}
              alt="Hair color result"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-[#71717A]" />
            </div>
          )}

          {/* Close button (top right of image) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-lg z-10"
            style={{ background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(8px)' }}
          >
            <X className="w-4 h-4 text-[#F5F5F7]" />
          </motion.button>
        </div>

        {/* Right: Details & Comments */}
        <div
          ref={scrollRef}
          className="w-full md:w-[380px] flex flex-col overflow-y-auto"
          style={{ maxHeight: '90vh' }}
        >
          {/* Header info */}
          <div className="p-5 space-y-4">
            {/* Stylist */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {photo.avatarUrl ? (
                  <img
                    src={photo.avatarUrl}
                    alt={photo.stylistName}
                    className="w-9 h-9 rounded-lg object-cover"
                  />
                ) : (
                  <AvatarFallback name={photo.stylistName} size={9} />
                )}
                <div>
                  <p className="text-[14px] font-medium text-[#F5F5F7]">{photo.stylistName}</p>
                  <p className="text-[11px] text-[#71717A]">{photo.salonName}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {canEdit && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-white/[0.04] text-[#71717A] transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </motion.button>
                )}
                {canDelete && (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-[#71717A] hover:text-[#EF4444] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* Delete confirmation */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl p-3 space-y-2"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.15)',
                  }}
                >
                  <p className="text-xs text-[#EF4444]">
                    Are you sure? This will permanently delete the photo and all comments.
                  </p>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#A1A1AA] hover:bg-white/[0.04] transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleDeletePhoto}
                      disabled={deleting}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: '#EF4444' }}
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Formula snapshot */}
            {photo.formulaSnapshot && (
              <GlassCard className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#71717A]">Formula</span>
                </div>
                <p className="text-[13px] font-medium text-[#F5F5F7]">
                  {photo.formulaSnapshot.brand} · {photo.formulaSnapshot.line}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {photo.formulaSnapshot.shades.map((shade) => (
                    <div key={shade.code} className="flex items-center gap-1.5">
                      <div
                        className="w-6 h-6 rounded-md border border-white/[0.08]"
                        style={{ backgroundColor: shade.hex }}
                        title={shade.name}
                      />
                      <span className="text-[10px] font-mono text-[#A1A1AA]">{shade.code}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Caption */}
            {photo.caption && (
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed">{photo.caption}</p>
            )}

            {/* Tags */}
            {photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {photo.tags.map((tag) => (
                  <TagPill key={tag} label={tag} />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
              <div className="flex items-center gap-1">
                <ActionButton
                  onClick={handleToggleLike}
                  active={photo.isLiked}
                  activeColor="#EF4444"
                  count={photo.likes}
                >
                  <Heart className={`w-4 h-4 ${photo.isLiked ? 'fill-current' : ''}`} />
                </ActionButton>
                <ActionButton
                  onClick={handleToggleSave}
                  active={photo.isSaved}
                  activeColor="#F59E0B"
                >
                  <Bookmark className={`w-4 h-4 ${photo.isSaved ? 'fill-current' : ''}`} />
                </ActionButton>
                <ActionButton>
                  <Share2 className="w-4 h-4" />
                </ActionButton>
              </div>
              <span className="text-[10px] text-[#71717A] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(photo.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Comments section */}
          <div
            className="flex-1 border-t border-white/[0.06] flex flex-col min-h-[200px]"
            style={{ background: 'rgba(255,255,255,0.01)' }}
          >
            {/* Comments header */}
            <div className="px-5 py-3 flex items-center justify-between sticky top-0"
              style={{ background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(8px)' }}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
                Comments <span className="text-[#9333EA]">{photo.comments}</span>
              </span>
            </div>

            {/* Comments list */}
            <div className="flex-1 px-5 py-2 space-y-4">
              {commentsLoading ? (
                <>
                  <SkeletonComment />
                  <SkeletonComment />
                  <SkeletonComment />
                </>
              ) : comments.length === 0 ? (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <MessageCircle className="w-8 h-8 text-[#71717A] mx-auto mb-2" />
                  <p className="text-[13px] text-[#71717A]">No comments yet</p>
                  <p className="text-[11px] text-[#71717A]">Be the first to share your thoughts</p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onLike={handleLikeComment}
                      onDelete={handleDeleteComment}
                      canDelete={canDelete || comment.authorId === photo.stylistId}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Comment input */}
            <div className="px-5 py-3 border-t border-white/[0.06] sticky bottom-0"
              style={{ background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(8px)' }}
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={commentInputRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handlePostComment()
                    }
                  }}
                  placeholder="Add a comment..."
                  rows={1}
                  className="flex-1 px-3 py-2 rounded-xl text-[13px] text-[#F5F5F7] placeholder:text-[#71717A] outline-none resize-none transition-all"
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
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={handlePostComment}
                  disabled={!newComment.trim() || postingComment}
                  className="p-2.5 rounded-xl transition-all disabled:opacity-30"
                  style={{
                    background: newComment.trim()
                      ? 'var(--cg-gradient-teal)'
                      : 'rgba(255,255,255,0.03)',
                    color: newComment.trim() ? '#0A0A0A' : '#71717A',
                  }}
                >
                  {postingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
