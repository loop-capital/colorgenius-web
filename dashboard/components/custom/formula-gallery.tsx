'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, Heart, MessageCircle, Share2, ChevronLeft, ChevronRight,
  Plus, TrendingUp, Clock, Loader2, Eye, AlertCircle, Trash2,
} from 'lucide-react'
import { GlassCard } from './glass-card'
import { BeforeAfterSlider } from './before-after-slider'
import { useToast } from '@/components/ui/use-toast'

/* ─── Types ────────────────────────────────────────────────────── */

export interface GalleryPhoto {
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
}

export interface FormulaGalleryProps {
  formulaId: string
  stylistId?: string
  onPhotoClick?: (photo: GalleryPhoto) => void
  onUploadClick?: () => void
  className?: string
}

/* ─── Inline Components ────────────────────────────────────────── */

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

function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold"
      style={{ background: 'rgba(147,51,234,0.15)', color: '#9333EA' }}
    >
      {initials}
    </div>
  )
}

function ActionIcon({
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
      className="flex items-center gap-1.5 text-[11px] font-medium transition-colors"
      style={{
        color: active ? activeColor : 'var(--cg-text-tertiary)',
      }}
    >
      {children}
      {count !== undefined && <span>{count}</span>}
    </motion.button>
  )
}

function SkeletonPhotoCard() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-24 bg-white/[0.04] rounded animate-pulse" />
            <div className="h-2.5 w-16 bg-white/[0.04] rounded animate-pulse" />
          </div>
        </div>
        <div className="h-48 bg-white/[0.03] rounded-xl animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-3 w-12 bg-white/[0.04] rounded animate-pulse" />
            <div className="h-3 w-12 bg-white/[0.04] rounded animate-pulse" />
          </div>
          <div className="h-3 w-14 bg-white/[0.04] rounded animate-pulse" />
        </div>
      </div>
    </GlassCard>
  )
}

/* ─── Photo Card ───────────────────────────────────────────────── */

function PhotoCard({
  photo,
  onClick,
  onLike,
  onToggleLike,
  onDelete,
  canDelete = false,
}: {
  photo: GalleryPhoto
  onClick: () => void
  onLike: () => void
  onToggleLike: () => void
  onDelete?: (id: string) => void
  canDelete?: boolean
}) {
  const hasBeforeAfter = photo.beforeUrl && photo.afterUrl
  const hasSingleImage = photo.afterUrl || photo.beforeUrl

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 8 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
    >
      <GlassCard className="overflow-hidden" hover={false}>
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {photo.avatarUrl ? (
                <img
                  src={photo.avatarUrl}
                  alt={photo.stylistName}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <AvatarFallback name={photo.stylistName} />
              )}
              <div>
                <p className="text-[13px] font-medium text-[#F5F5F7]">{photo.stylistName}</p>
                <p className="text-[11px] text-[#71717A]">{photo.salonName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {photo.confidence !== undefined && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                  style={{
                    color: '#9333EA',
                    borderColor: 'rgba(147,51,234,0.2)',
                    background: 'rgba(147,51,234,0.08)',
                  }}
                >
                  {photo.confidence}% match
                </span>
              )}
              {canDelete && onDelete && (
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={(e) => { e.stopPropagation(); onDelete(photo.id) }}
                  className="p-1.5 rounded-lg hover:bg-white/[0.04] text-[#71717A] hover:text-[#EF4444] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Image */}
          <motion.div
            className="cursor-pointer group"
            onClick={onClick}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {hasBeforeAfter ? (
              <BeforeAfterSlider
                beforeImage={photo.beforeUrl!}
                afterImage={photo.afterUrl!}
                autoSweep={false}
                className="rounded-xl overflow-hidden"
              />
            ) : hasSingleImage ? (
              <div className="relative rounded-xl overflow-hidden" style={{ height: 280 }}>
                <img
                  src={hasSingleImage}
                  alt="Hair color result"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-medium text-white/70 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
                    Tap to view
                  </span>
                  <Eye className="w-4 h-4 text-white/70" />
                </div>
              </div>
            ) : (
              <div
                className="rounded-xl flex items-center justify-center"
                style={{ height: 280, background: '#0F0F1A' }}
              >
                <div className="text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-[#71717A]" />
                  <p className="text-xs text-[#71717A]">No image available</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Caption */}
          {photo.caption && (
            <p className="text-[13px] text-[#A1A1AA] leading-relaxed line-clamp-2">
              {photo.caption}
            </p>
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
            <div className="flex items-center gap-4">
              <ActionIcon
                onClick={onToggleLike}
                active={photo.isLiked}
                activeColor="#EF4444"
                count={photo.likes}
              >
                <Heart className={`w-4 h-4 ${photo.isLiked ? 'fill-current' : ''}`} />
              </ActionIcon>
              <ActionIcon
                onClick={onClick}
                count={photo.comments}
              >
                <MessageCircle className="w-4 h-4" />
              </ActionIcon>
              <ActionIcon>
                <Share2 className="w-4 h-4" />
              </ActionIcon>
            </div>
            <span className="text-[10px] text-[#71717A] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(photo.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

/* ─── Sort & Filter ────────────────────────────────────────────── */

type SortMode = 'trending' | 'newest' | 'oldest' | 'most-liked'

/* ─── Main Component ───────────────────────────────────────────── */

export function FormulaGallery({
  formulaId,
  stylistId,
  onPhotoClick,
  onUploadClick,
  className,
}: FormulaGalleryProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<SortMode>('trending')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 12

  const { toast } = useToast()

  const fetchPhotos = useCallback(
    async (pageNum: number, append = false) => {
      if (!formulaId) {
        setError('No formula selected')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        params.set('formulaId', formulaId)
        params.set('limit', String(PAGE_SIZE))
        params.set('offset', String((pageNum - 1) * PAGE_SIZE))
        if (stylistId) params.set('stylistId', stylistId)
        if (sortMode === 'most-liked') params.set('sortBy', 'likes')
        if (sortMode === 'newest') params.set('sortBy', 'createdAt')
        if (sortMode === 'oldest') { params.set('sortBy', 'createdAt'); params.set('order', 'asc') }

        const res = await fetch(`/api/v1/gallery/photos?${params.toString()}`)
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)

        const data = await res.json()
        const items: GalleryPhoto[] = (data.items || []).map((item: any) => ({
          id: item.id,
          formulaId: item.formula_id || formulaId,
          stylistId: item.stylist_id || '',
          beforeUrl: item.before_url || null,
          afterUrl: item.after_url || null,
          caption: item.caption || '',
          tags: item.tags || [],
          likes: item.likes || 0,
          comments: item.comments || 0,
          isLiked: item.is_liked || false,
          isSaved: item.is_saved || false,
          createdAt: item.created_at || new Date().toISOString(),
          stylistName: item.stylist_name || 'Unknown Stylist',
          salonName: item.salon_name || '',
          avatarUrl: item.avatar_url || undefined,
          confidence: item.confidence_score || undefined,
        }))

        setPhotos((prev) => (append ? [...prev, ...items] : items))
        setHasMore(items.length === PAGE_SIZE)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load gallery'
        setError(message)
        toast?.({
          title: 'Error loading gallery',
          description: message,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    },
    [formulaId, stylistId, sortMode, toast]
  )

  useEffect(() => {
    setPage(1)
    fetchPhotos(1, false)
  }, [formulaId, stylistId, sortMode, fetchPhotos])

  const handleToggleLike = useCallback(
    async (photoId: string) => {
      try {
        const res = await fetch(`/api/v1/gallery/photos/${photoId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        if (!res.ok) throw new Error('Failed to toggle like')

        const data = await res.json()
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photoId
              ? { ...p, isLiked: data.liked ?? !p.isLiked, likes: data.likes ?? p.likes }
              : p
          )
        )
      } catch (err) {
        toast?.({
          title: 'Error',
          description: 'Could not update like. Please try again.',
          variant: 'destructive',
        })
      }
    },
    [toast]
  )

  const handleDelete = useCallback(
    async (photoId: string) => {
      if (!confirm('Delete this photo from the gallery?')) return
      try {
        const res = await fetch(`/api/v1/gallery/photos/${photoId}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete')

        setPhotos((prev) => prev.filter((p) => p.id !== photoId))
        toast?.({
          title: 'Deleted',
          description: 'Photo removed from gallery.',
        })
      } catch (err) {
        toast?.({
          title: 'Error',
          description: 'Could not delete photo. Please try again.',
          variant: 'destructive',
        })
      }
    },
    [toast]
  )

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchPhotos(nextPage, true)
  }, [loading, hasMore, page, fetchPhotos])

  const sortedPhotos = photos

  const sortTabs: { id: SortMode; label: string; icon: typeof TrendingUp }[] = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'newest', label: 'Newest', icon: Clock },
    { id: 'most-liked', label: 'Most Liked', icon: Heart },
  ]

  if (loading && photos.length === 0) {
    return (
      <div className={`space-y-6 ${className || ''}`}>
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-white/[0.04] rounded animate-pulse" />
          <div className="h-9 w-28 bg-white/[0.04] rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonPhotoCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error && photos.length === 0) {
    return (
      <motion.div
        className={`flex flex-col items-center justify-center py-16 ${className || ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AlertCircle className="w-10 h-10 text-[#EF4444] mb-3" />
        <p className="text-sm font-medium text-[#F5F5F7] mb-1">Couldn&apos;t load gallery</p>
        <p className="text-xs text-[#71717A] mb-4">{error}</p>
        <button
          onClick={() => fetchPhotos(1, false)}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-[#0A0A0A] transition-opacity hover:opacity-90"
          style={{ background: 'var(--cg-gradient-teal)' }}
        >
          Try Again
        </button>
      </motion.div>
    )
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-lg font-bold text-[#F5F5F7]">
            Gallery <span className="text-[#9333EA]">{sortedPhotos.length}</span>
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Before / after photos for this formula
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            {sortTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setSortMode(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: sortMode === tab.id ? 'rgba(147,51,234,0.15)' : 'transparent',
                  color: sortMode === tab.id ? '#9333EA' : 'var(--cg-text-tertiary)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </motion.button>
            ))}
          </div>

          {onUploadClick && (
            <motion.button
              onClick={onUploadClick}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#0A0A0A] transition-opacity hover:opacity-90"
              style={{ background: 'var(--cg-gradient-teal)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Photo
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Grid */}
      {sortedPhotos.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-16 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Camera className="w-12 h-12 text-[#71717A] mb-3" />
          <p className="text-sm font-medium text-[#F5F5F7] mb-1">No photos yet</p>
          <p className="text-xs text-[#71717A] mb-4 text-center max-w-xs">
            Be the first to share a before/after transformation for this formula.
          </p>
          {onUploadClick && (
            <motion.button
              onClick={onUploadClick}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#0A0A0A] transition-opacity hover:opacity-90"
              style={{ background: 'var(--cg-gradient-teal)' }}
            >
              <Plus className="w-4 h-4" />
              Upload First Photo
            </motion.button>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            layout
          >
            <AnimatePresence mode="popLayout">
              {sortedPhotos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onClick={() => onPhotoClick?.(photo)}
                  onLike={() => handleToggleLike(photo.id)}
                  onToggleLike={() => handleToggleLike(photo.id)}
                  onDelete={handleDelete}
                  canDelete={stylistId === photo.stylistId}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <motion.button
                onClick={loadMore}
                disabled={loading}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--cg-text-secondary)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    Load More
                  </>
                )}
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
