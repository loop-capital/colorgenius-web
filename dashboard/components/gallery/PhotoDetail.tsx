'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, X, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import Link from 'next/link'

interface Comment {
  id: string
  author: string
  authorAvatar: string
  text: string
  createdAt: string
  likes: number
  replies?: Comment[]
}

interface Photo {
  id: string
  beforeUrl: string
  afterUrl: string
  caption: string
  hairType: string
  porosity: string
  level: number
  developer: string
  processingTime: string
  stylistName: string
  stylistAvatar: string
  stylistInstagram?: string
  voteCount: number
  commentCount: number
  viewCount: number
  createdAt: string
  formulaId?: string
  brand?: string
  line?: string
  shades?: string[]
  ratio?: string
}

interface PhotoDetailProps {
  photoId: string
}

export default function PhotoDetail({ photoId }: PhotoDetailProps) {
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    fetchPhotoDetail()
  }, [photoId])

  const fetchPhotoDetail = async () => {
    try {
      setLoading(true)
      const [photoRes, commentsRes] = await Promise.all([
        fetch(`/api/v1/gallery/photos/${photoId}`),
        fetch(`/api/v1/gallery/photos/${photoId}/comments`),
      ])

      if (photoRes.ok) {
        const photoData = await photoRes.json()
        setPhoto(photoData)
      }

      if (commentsRes.ok) {
        const commentsData = await commentsRes.json()
        setComments(commentsData.comments || [])
      }
    } catch (err) {
      console.error('Failed to load photo detail:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (direction: 'up' | 'down') => {
    try {
      const res = await fetch(`/api/v1/gallery/photos/${photoId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      })

      if (res.ok && photo) {
        setPhoto({
          ...photo,
          voteCount: photo.voteCount + (direction === 'up' ? 1 : -1),
        })
      }
    } catch (err) {
      console.error('Vote failed:', err)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const res = await fetch(`/api/v1/gallery/photos/${photoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment }),
      })

      if (res.ok) {
        const comment = await res.json()
        setComments(prev => [comment, ...prev])
        setNewComment('')
        if (photo) {
          setPhoto({ ...photo, commentCount: photo.commentCount + 1 })
        }
      }
    } catch (err) {
      console.error('Comment failed:', err)
    }
  }

  const handleSliderMove = (e: React.MouseEvent < HTMLDivElement > | React.TouchEvent < HTMLDivElement >) => {
    if (!isDragging) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    const pos = ((x - rect.left) / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, pos)))
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-96 bg-white/5 rounded-2xl" />
        <div className="h-20 bg-white/5 rounded-xl" />
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="text-center py-20">
        <p className="text-white/40 text-lg">Photo not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Before/After Slider */}
      <div
        className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden cursor-ew-resize select-none"
        onMouseMove={handleSliderMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={handleSliderMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        {/* After Image (full width, shown on right side of slider) */}
        <img
          src={photo.afterUrl}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Before Image (clipped to left side of slider) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={photo.beforeUrl || '/placeholder-before.jpg'}
            alt="Before"
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
            <ChevronLeft size={16} className="text-black" />
            <ChevronRight size={16} className="text-black" />
          </div>
        </div>

        {/* Labels */}
        <span className="absolute top-4 left-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">Before</span>
        <span className="absolute top-4 right-4 bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white text-xs px-3 py-1 rounded-full">After</span>
      </div>

      {/* Photo Info */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9333EA] to-[#EC4899] flex items-center justify-center text-white font-bold">
              {photo.stylistName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-white">{photo.stylistName}</p>
              {photo.stylistInstagram && (
                <a
                  href={`https://instagram.com/${photo.stylistInstagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#EC4899] hover:underline"
                >
                  @{photo.stylistInstagram}
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleVote('up')}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            >
              <Heart size={18} className="text-[#EC4899]" />
              <span className="text-white font-medium">{photo.voteCount}</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
              <Share2 size={18} className="text-white/60" />
            </button>
          </div>
        </div>

        <p className="text-white/80 text-lg mb-4">{photo.caption}</p>

        {/* Hair Details */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm bg-white/10 text-white/70 px-3 py-1.5 rounded-full">Level {photo.level}</span>
          <span className="text-sm bg-white/10 text-white/70 px-3 py-1.5 rounded-full capitalize">{photo.hairType}</span>
          <span className="text-sm bg-white/10 text-white/70 px-3 py-1.5 rounded-full capitalize">{photo.porosity} porosity</span>
          {photo.developer && <span className="text-sm bg-white/10 text-white/70 px-3 py-1.5 rounded-full">{photo.developer}</span>}
          {photo.processingTime && <span className="text-sm bg-white/10 text-white/70 px-3 py-1.5 rounded-full">{photo.processingTime} min</span>}
        </div>

        {/* Formula Card */}
        {(photo.brand || photo.shades) && (
          <Link
            href={photo.formulaId ? `/formulas/${photo.formulaId}` : '#'}
            className="block bg-gradient-to-r from-[#9333EA]/10 to-[#EC4899]/10 border border-[#9333EA]/20 rounded-xl p-4 hover:border-[#9333EA]/40 transition-colors"
          >
            <p className="text-sm text-[#9333EA] font-medium mb-1">Formula Used</p>
            <p className="text-white font-semibold">
              {photo.brand} {photo.line}
            </p>
            {photo.shades && (
              <p className="text-white/60 text-sm mt-1">Shades: {photo.shades.join(' + ')}</p>
            )}
            {photo.ratio && (
              <p className="text-white/60 text-sm">Ratio: {photo.ratio}</p>
            )}
          </Link>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MessageCircle size={20} />
          Comments ({comments.length})
        </h3>

        {/* Add Comment */}
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9333EA] to-[#EC4899] flex-shrink-0" />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-[#9333EA]/50 min-h-[80px] resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold flex-shrink-0">
                {comment.author.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{comment.author}</span>
                    <span className="text-xs text-white/30">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white/70">{comment.text}</p>
                </div>
                <div className="flex items-center gap-4 mt-2 ml-2">
                  <button className="flex items-center gap-1 text-xs text-white/40 hover:text-[#EC4899] transition-colors">
                    <Heart size={14} /> {comment.likes}
                  </button>
                  <button className="text-xs text-white/40 hover:text-white transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-center text-white/30 py-8">No comments yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  )
}
