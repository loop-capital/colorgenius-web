'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame,
  Clock,
  Sparkles,
  MessageCircle,
  Star,
  Filter,
  ChevronDown,
  TrendingUp,
  Loader2,
  X,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { HairSwatch } from '@/components/ui/hair-swatch'

// TONE_OPTIONS from library page
const TONE_OPTIONS = [
  { value: 'N', label: 'Natural', color: '#9C8B7A' },
  { value: 'A', label: 'Ash', color: '#8A7D6E' },
  { value: 'G', label: 'Gold', color: '#C4A35A' },
  { value: 'K', label: 'Copper', color: '#B87333' },
  { value: 'R', label: 'Red', color: '#A03030' },
  { value: 'V', label: 'Violet', color: '#7B68A6' },
  { value: 'P', label: 'Pearl', color: '#B8B0C4' },
  { value: 'B', label: 'Beige', color: '#C4B5A0' },
  { value: 'M', label: 'Mahogany', color: '#6B3A3A' },
  { value: 'Ch', label: 'Chocolate', color: '#4A2C2A' },
  { value: 'W', label: 'Warm', color: '#D4A574' },
  { value: 'C', label: 'Cool', color: '#7D8B9A' },
]

const LEVELS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `Level ${i + 1}`,
}))

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending', icon: Flame },
  { value: 'recent', label: 'Recent', icon: Clock },
  { value: 'featured', label: 'Featured', icon: Sparkles },
]

interface GalleryPhoto {
  id: string
  beforeImage: string
  afterImage: string
  score: number
  commentCount: number
  stylistName: string
  tags: string[]
  tone?: string
  level?: number
  createdAt: string
  featured?: boolean
  formulaId?: string
}

interface GalleryFeedProps {
  onPhotoClick?: (photo: GalleryPhoto) => void
}

/* ---- shimmer skeleton card ---- */
function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--cg-surface)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <div className="absolute inset-0 bg-white/[0.03] animate-pulse" />
        <div className="absolute inset-0 skeleton-shimmer" />
        <div className="absolute inset-0 flex">
          <div className="w-1/2 h-full border-r border-white/[0.04]" />
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/[0.04] animate-pulse" />
          <div className="h-2.5 w-24 rounded bg-white/[0.04] animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-8 rounded bg-white/[0.04] animate-pulse" />
          <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse" />
        </div>
        <div className="flex gap-1">
          <div className="h-4 w-10 rounded-full bg-white/[0.04] animate-pulse" />
          <div className="h-4 w-12 rounded-full bg-white/[0.04] animate-pulse" />
        </div>
      </div>
    </motion.div>
  )
}

/* ---- photo card ---- */
function PhotoCard({
  photo,
  index,
  onClick,
}: {
  photo: GalleryPhoto
  index: number
  onClick: () => void
}) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const tone = TONE_OPTIONS.find((t) => t.value === photo.tone)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), type: 'spring', stiffness: 300, damping: 24 }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer rounded-2xl overflow-hidden"
      style={{
        background: 'var(--cg-surface)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      onClick={onClick}
    >
      {/* Thumbnail: before / after split */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* After image (full) */}
        <img
          src={photo.afterImage}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />

        {/* Before image (left half, clipped) */}
        <div
          className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"
          style={{ borderRight: '2px solid rgba(255,255,255,0.15)' }}
        >
          <img
            src={photo.beforeImage}
            alt="Before"
            className="absolute inset-0 w-[200%] h-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ maxWidth: 'none' }}
            loading="lazy"
          />
          <div
            className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
            style={{
              background: 'rgba(10,10,15,0.8)',
              color: '#F59E0B',
              backdropFilter: 'blur(4px)',
            }}
          >
            Before
          </div>
        </div>

        <div
          className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
          style={{
            background: 'rgba(10,10,15,0.8)',
            color: '#9333EA',
            backdropFilter: 'blur(4px)',
          }}
        >
          After
        </div>

        {/* Featured badge */}
        {photo.featured && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{
              background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
            }}
          >
            <Sparkles size={10} style={{ color: '#0A0A0F' }} />
            <span className="text-[9px] font-bold" style={{ color: '#0A0A0F' }}>
              Featured
            </span>
          </motion.div>
        )}

        {/* Hover overlay with stats */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(147,51,234,0.2)' }}>
                <Star size={12} fill="#F59E0B" color="#F59E0B" />
                <span className="text-[11px] font-bold" style={{ color: '#F5F5F7' }}>
                  {photo.score.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <MessageCircle size={12} style={{ color: 'var(--cg-text-secondary)' }} />
                <span className="text-[11px] font-medium" style={{ color: 'var(--cg-text-secondary)' }}>
                  {photo.commentCount}
                </span>
              </div>
            </div>
            {tone && (
              <HairSwatch
                color={tone.color}
                label={tone.label}
                size="sm"
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom meta */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
            style={{
              background: 'linear-gradient(135deg, #9333EA, #EC4899)',
              color: '#fff',
            }}
          >
            {photo.stylistName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--cg-text-primary)' }}>
            {photo.stylistName}
          </span>
          {photo.level && (
            <span
              className="text-[10px] font-medium ml-auto px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--cg-text-tertiary)' }}
            >
              Level {photo.level}
            </span>
          )}
        </div>

        {photo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {photo.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--cg-text-tertiary)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {tag}
              </span>
            ))}
            {photo.tags.length > 4 && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ color: 'var(--cg-text-tertiary)' }}
              >
                +{photo.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ---- empty state ---- */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-20"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <TrendingUp size={28} style={{ color: 'rgba(255,255,255,0.1)' }} />
      </div>
      <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--cg-text-primary)' }}>
        No formulas found
      </h3>
      <p className="text-sm" style={{ color: 'var(--cg-text-tertiary)' }}>
        Try adjusting your filters or check back later.
      </p>
    </motion.div>
  )
}

/* ---- main component ---- */
export function GalleryFeed({ onPhotoClick }: GalleryFeedProps) {
  const { toast } = useToast()
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)

  const [toneFilter, setToneFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [sortBy, setSortBy] = useState('trending')
  const [showFilters, setShowFilters] = useState(false)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const buildQuery = useCallback(
    (nextCursor?: string | null) => {
      const params = new URLSearchParams()
      if (toneFilter) params.append('tone', toneFilter)
      if (levelFilter) params.append('level', levelFilter)
      params.append('sort', sortBy)
      params.append('limit', '20')
      if (nextCursor) params.append('cursor', nextCursor)
      return `/api/v1/gallery/feed?${params.toString()}`
    },
    [toneFilter, levelFilter, sortBy]
  )

  const fetchFeed = useCallback(
    async (isLoadMore = false) => {
      const nextCursor = isLoadMore ? cursor : null
      try {
        if (isLoadMore) setLoadingMore(true)
        else setLoading(true)

        const res = await fetch(buildQuery(nextCursor))
        if (!res.ok) {
          console.warn('Gallery feed API returned', res.status)
          if (!isLoadMore) setPhotos([])
          setHasMore(false)
          return
        }
        const data = await res.json()

        const mapped: GalleryPhoto[] = (data.items || []).map((item: any) => ({
          id: item.id,
          beforeImage: item.beforeImage || item.before_image || '',
          afterImage: item.afterImage || item.after_image || '',
          score: item.score ?? item.rating ?? 0,
          commentCount: item.commentCount ?? item.comment_count ?? 0,
          stylistName: item.stylistName || item.stylist_name || 'Unknown',
          tags: item.tags || [],
          tone: item.tone,
          level: item.level,
          createdAt: item.createdAt || item.created_at || new Date().toISOString(),
          featured: item.featured,
          formulaId: item.formulaId || item.formula_id,
        }))

        if (isLoadMore) {
          setPhotos((prev) => {
            const seen = new Set(prev.map((p) => p.id))
            const unique = mapped.filter((p) => !seen.has(p.id))
            return [...prev, ...unique]
          })
        } else {
          setPhotos(mapped)
        }

        setCursor(data.nextCursor || data.next_cursor || null)
        setHasMore(!!(data.nextCursor || data.next_cursor) || (data.items || []).length === 20)
      } catch (e) {
        console.error('Failed to fetch gallery feed:', e)
        toast({
          title: 'Failed to load gallery',
          description: e instanceof Error ? e.message : 'Please try again',
          variant: 'destructive',
        })
        if (!isLoadMore) setPhotos([])
        setHasMore(false)
      } finally {
        if (isLoadMore) setLoadingMore(false)
        else setLoading(false)
      }
    },
    [buildQuery, cursor, toast]
  )

  // Initial fetch
  useEffect(() => {
    setCursor(null)
    setHasMore(true)
    fetchFeed(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toneFilter, levelFilter, sortBy])

  // Infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchFeed(true)
        }
      },
      { rootMargin: '200px' }
    )
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current)
    return () => observerRef.current?.disconnect()
  }, [hasMore, loadingMore, loading, fetchFeed])

  const activeFilterCount = [toneFilter, levelFilter].filter(Boolean).length

  return (
    <div className="min-h-screen" style={{ background: 'var(--cg-bg-deep)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--cg-text-primary)' }}>
            Gallery
          </h1>
          <p className="text-sm" style={{ color: 'var(--cg-text-secondary)' }}>
            Discover top formulas and transformations from the community
          </p>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort */}
            <div className="relative">
              {SORT_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const active = sortBy === opt.value
                return (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSortBy(opt.value)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors mr-2"
                    style={{
                      background: active ? 'linear-gradient(135deg, #9333EA, #EC4899)' : 'rgba(255,255,255,0.04)',
                      color: active ? '#fff' : 'var(--cg-text-secondary)',
                      border: active ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Icon size={14} />
                    {opt.label}
                  </motion.button>
                )
              })}
            </div>

            <div className="w-px h-6 bg-white/[0.06]" />

            {/* Toggle filters */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
              style={{
                background: activeFilterCount > 0 ? 'rgba(147,51,234,0.1)' : 'rgba(255,255,255,0.04)',
                color: activeFilterCount > 0 ? '#9333EA' : 'var(--cg-text-secondary)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Filter size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span
                  className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: '#9333EA', color: '#fff' }}
                >
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                size={14}
                className="transition-transform"
                style={{ transform: showFilters ? 'rotate(180deg)' : undefined }}
              />
            </motion.button>

            {/* Active filter pills */}
            {toneFilter && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setToneFilter('')}
                className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full"
                style={{
                  background: 'rgba(147,51,234,0.1)',
                  color: '#9333EA',
                  border: '1px solid rgba(147,51,234,0.15)',
                }}
              >
                {TONE_OPTIONS.find((t) => t.value === toneFilter)?.label || toneFilter}
                <X size={10} />
              </motion.button>
            )}
            {levelFilter && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLevelFilter('')}
                className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full"
                style={{
                  background: 'rgba(147,51,234,0.1)',
                  color: '#9333EA',
                  border: '1px solid rgba(147,51,234,0.15)',
                }}
              >
                Level {levelFilter}
                <X size={10} />
              </motion.button>
            )}
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-3 p-4 rounded-xl space-y-4"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Tone filter */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: 'var(--cg-text-tertiary)' }}>
                      Tone
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TONE_OPTIONS.map((tone) => (
                        <HairSwatch
                          key={tone.value}
                          color={tone.color}
                          label={tone.label}
                          isActive={toneFilter === tone.value}
                          onClick={() => setToneFilter(toneFilter === tone.value ? '' : tone.value)}
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Level filter */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: 'var(--cg-text-tertiary)' }}>
                      Level
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {LEVELS.map((lvl) => (
                        <motion.button
                          key={lvl.value}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setLevelFilter(levelFilter === lvl.value ? '' : lvl.value)}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors"
                          style={{
                            background: levelFilter === lvl.value ? 'linear-gradient(135deg, #9333EA, #EC4899)' : 'rgba(255,255,255,0.04)',
                            color: levelFilter === lvl.value ? '#fff' : 'var(--cg-text-secondary)',
                            border: levelFilter === lvl.value ? 'none' : '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          {lvl.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>
            {!loading && (
              <>
                Showing <span className="font-medium" style={{ color: 'var(--cg-text-primary)' }}>{photos.length}</span> photos
              </>
            )}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading && photos.length === 0 ? (
            Array.from({ length: 8 }, (_, i) => <SkeletonCard key={`sk-${i}`} index={i} />)
          ) : photos.length === 0 ? (
            <EmptyState />
          ) : (
            photos.map((photo, i) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={i}
                onClick={() => onPhotoClick?.(photo)}
              />
            ))
          )}
        </div>

        {/* Load more sentinel */}
        <div ref={loadMoreRef} className="h-4" />

        {/* Loading more indicator */}
        <AnimatePresence>
          {loadingMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 py-6"
            >
              <Loader2 size={16} className="animate-spin" style={{ color: 'var(--cg-text-tertiary)' }} />
              <span className="text-xs" style={{ color: 'var(--cg-text-tertiary)' }}>
                Loading more...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
