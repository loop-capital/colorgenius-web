'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Eye, TrendingUp, Clock, Star, Filter } from 'lucide-react'
import Link from 'next/link'

interface Photo {
  id: string
  beforeUrl: string
  afterUrl: string
  caption: string
  hairType: string
  porosity: string
  level: number
  developer: string
  stylistName: string
  stylistAvatar: string
  voteCount: number
  commentCount: number
  viewCount: number
  createdAt: string
  formulaId?: string
  brand?: string
  shades?: string[]
}

interface PhotoGalleryProps {
  formulaId?: string
  stylistId?: string
}

export default function PhotoGallery({ formulaId, stylistId }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('trending')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchPhotos()
  }, [sortBy, filterLevel, filterBrand, page])

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('sort', sortBy)
      params.append('page', page.toString())
      if (filterLevel) params.append('level', filterLevel)
      if (filterBrand) params.append('brand', filterBrand)
      if (formulaId) params.append('formulaId', formulaId)
      if (stylistId) params.append('stylistId', stylistId)

      const res = await fetch(`/api/v1/gallery/photos?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')

      const data = await res.json()
      if (page === 1) {
        setPhotos(data.photos || [])
      } else {
        setPhotos(prev => [...prev, ...(data.photos || [])])
      }
      setHasMore(data.hasMore || false)
    } catch (err) {
      console.error('Failed to load photos:', err)
      // Fallback to empty state
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (photoId: string, direction: 'up' | 'down') => {
    try {
      const res = await fetch(`/api/v1/gallery/photos/${photoId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      })

      if (res.ok) {
        // Optimistically update UI
        setPhotos(prev => prev.map(p => {
          if (p.id === photoId) {
            return { ...p, voteCount: p.voteCount + (direction === 'up' ? 1 : -1) }
          }
          return p
        }))
      }
    } catch (err) {
      console.error('Vote failed:', err)
    }
  }

  const brands = ['Davines', 'Wella', 'Redken', 'Lanza', 'Goldwell', 'Matrix']
  const levels = Array.from({ length: 10 }, (_, i) => (i + 1).toString())

  if (loading && page === 1) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white/5 rounded-2xl h-80 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters & Sort */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-white/40" />
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9333EA]/50"
          >
            <option value="trending"><TrendingUp size={14} className="inline mr-1" />Trending</option>
            <option value="recent"><Clock size={14} className="inline mr-1" />Recent</option>
            <option value="top"><Star size={14} className="inline mr-1" />Top Rated</option>
          </select>
        </div>

        <select
          value={filterLevel}
          onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9333EA]/50"
        >
          <option value="">All Levels</option>
          {levels.map(l => (
            <option key={l} value={l}>Level {l}</option>
          ))}
        </select>

        <select
          value={filterBrand}
          onChange={(e) => { setFilterBrand(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9333EA]/50"
        >
          <option value="">All Brands</option>
          {brands.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40 text-lg">No photos yet</p>
          <p className="text-white/20 text-sm mt-2">Be the first to share your results!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map(photo => (
              <Link
                key={photo.id}
                href={`/gallery/${photo.id}`}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#9333EA]/30 transition-all duration-300"
              >
                {/* Before/After Comparison */}
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 flex"
003e
                    <div className="w-1/2 relative">
                      <img
                        src={photo.beforeUrl || '/placeholder-before.jpg'}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">Before</span>
                    </div>
                    <div className="w-1/2 relative">
                      <img
                        src={photo.afterUrl}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white text-xs px-2 py-1 rounded-full">After</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-sm font-medium line-clamp-2">{photo.caption}</p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9333EA] to-[#EC4899] flex items-center justify-center text-white text-xs font-bold">
                        {photo.stylistName?.charAt(0) || 'S'}
                      </div>
                      <span className="text-sm text-white/70">{photo.stylistName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/40 text-xs">
                      <span className="flex items-center gap-1">
                        <Eye size={14} /> {photo.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={14} /> {photo.commentCount}
                      </span>
                    </div>
                  </div>

                  {/* Hair Details */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded-full">Level {photo.level}</span>
                    <span className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded-full capitalize">{photo.hairType}</span>
                    <span className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded-full capitalize">{photo.porosity} porosity</span>
                    {photo.developer && <span className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded-full">{photo.developer}</span>}
                  </div>

                  {/* Formula Tag */}
                  {photo.brand && (
                    <div className="text-xs text-[#9333EA] font-medium">
                      {photo.brand} {photo.shades?.join(' + ')}
                    </div>
                  )}

                  {/* Vote & Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleVote(photo.id, 'up')
                      }}
                      className="flex items-center gap-1 text-white/40 hover:text-[#EC4899] transition-colors"
                    >
                      <Heart size={16} />
                      <span className="text-sm">{photo.voteCount}</span>
                    </button>

                    <span className="text-xs text-white/20">
                      {new Date(photo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-8">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
