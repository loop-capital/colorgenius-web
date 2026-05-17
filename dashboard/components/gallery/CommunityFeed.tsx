'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Plus, ChevronLeft, ChevronRight, X, Upload, Image as ImageIcon,
  Loader2, Hash, AtSign, Palette, FlaskConical, Sparkles,
  HelpCircle, Trophy, Camera, Grid3X3, Search, TrendingUp,
  CircleUserRound
} from 'lucide-react'
import Link from 'next/link'
import { BadgeRow } from './ProfileBadges'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeedPhoto {
  id: string
  url: string
  label?: 'before' | 'after' | 'process' | 'detail' | 'result'
  order: number
}

interface FeedItem {
  id: string
  type: 'transformation' | 'tip' | 'question' | 'milestone' | 'inspiration'
  author: string
  authorAvatar: string
  authorHandle?: string
  authorTier?: 'community' | 'pro' | 'elite' | 'signature'
  authorBadges?: string[]
  content: string
  photos: FeedPhoto[]
  formulaId?: string
  formulaLabel?: string
  brand?: string
  shades?: string[]
  voteCount: number
  commentCount: number
  bookmarkCount: number
  isLiked: boolean
  isBookmarked: boolean
  createdAt: string
  tags?: string[]
}

// ─── Photo Carousel (Instagram-style) ─────────────────────────────────────────

function PhotoCarousel({ photos }: { photos: FeedPhoto[] }) {
  const [current, setCurrent] = useState(0)

  if (photos.length === 0) return null

  return (
    <div className="relative aspect-square bg-black/30 overflow-hidden">
      <img
        src={photos[current].url}
        alt={photos[current].label || 'Post photo'}
        className="w-full h-full object-cover"
      />

      {/* Label badge */}
      {photos[current].label && (
        <span
          className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={{
            background: photos[current].label === 'before'
              ? 'rgba(0,0,0,0.6)'
              : photos[current].label === 'after'
                ? 'linear-gradient(135deg, #9333EA, #EC4899)'
                : 'rgba(0,0,0,0.6)',
            color: 'white',
          }}
        >
          {photos[current].label}
        </span>
      )}

      {/* Navigation dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{
                background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
                transform: i === current ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      )}

      {/* Arrow buttons */}
      {photos.length > 1 && (
        <>
          {current > 0 && (
            <button
              onClick={() => setCurrent(c => c - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {current < photos.length - 1 && (
            <button
              onClick={() => setCurrent(c => c + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </>
      )}

      {/* Photo count badge */}
      {photos.length > 1 && (
        <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white/80">
          {current + 1}/{photos.length}
        </span>
      )}
    </div>
  )
}

// ─── Photo Picker (multi-select with labels) ──────────────────────────────────

interface StagedPhoto {
  id: string
  file: File
  preview: string
  label: 'before' | 'after' | 'process' | 'detail' | 'result'
}

function PhotoPicker({ photos, onChange }: { photos: StagedPhoto[]; onChange: (p: StagedPhoto[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const newPhotos: StagedPhoto[] = []
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      if (photos.length + newPhotos.length >= 10) return
      const reader = new FileReader()
      reader.onloadend = () => {
        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          preview: reader.result as string,
          label: photos.length === 0 && newPhotos.length === 0 ? 'before' : photos.length + newPhotos.length === 1 ? 'after' : 'detail',
        })
        if (newPhotos.length === Array.from(files).filter(f => f.type.startsWith('image/')).length || photos.length + newPhotos.length >= 10) {
          onChange([...photos, ...newPhotos])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (id: string) => {
    onChange(photos.filter(p => p.id !== id))
  }

  const cycleLabel = (id: string) => {
    const labels: StagedPhoto['label'][] = ['before', 'after', 'process', 'detail', 'result']
    onChange(photos.map(p => {
      if (p.id !== id) return p
      const idx = labels.indexOf(p.label)
      return { ...p, label: labels[(idx + 1) % labels.length] }
    }))
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {photos.map((photo) => (
          <div key={photo.id} className="relative flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden group">
            <img src={photo.preview} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <button
              onClick={() => removePhoto(photo.id)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
            <button
              onClick={() => cycleLabel(photo.id)}
              className="absolute bottom-1 left-1 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-white/80 hover:text-white transition-colors"
            >
              {photo.label}
            </button>
          </div>
        ))}
        {photos.length < 10 && (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex-shrink-0 w-28 h-28 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1.5 hover:border-[#9333EA]/40 transition-colors cursor-pointer"
          >
            <Camera size={20} className="text-white/30" />
            <span className="text-[10px] text-white/30">Add photo</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {photos.length > 0 && (
        <p className="text-[10px] text-white/30 mt-1">
          {photos.length}/10 photos · Tap label to change (before/after/process/detail/result)
        </p>
      )}
    </div>
  )
}

// ─── Create Post Modal ────────────────────────────────────────────────────────

interface NewPost {
  type: FeedItem['type']
  content: string
  photos: StagedPhoto[]
  formulaId: string
  formulaLabel: string
  tags: string[]
}

function CreatePostModal({ onClose, onCreated }: { onClose: () => void; onCreated: (item: FeedItem) => void }) {
  const [post, setPost] = useState<NewPost>({
    type: 'transformation',
    content: '',
    photos: [],
    formulaId: '',
    formulaLabel: '',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'photos' | 'details'>('photos')

  const POST_TYPES = [
    { value: 'transformation', label: 'Transformation', icon: Sparkles, color: '#9333EA' },
    { value: 'tip', label: 'Pro Tip', icon: FlaskConical, color: '#14b8a6' },
    { value: 'question', label: 'Question', icon: HelpCircle, color: '#F59E0B' },
    { value: 'inspiration', label: 'Inspiration', icon: Palette, color: '#EC4899' },
  ]

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (tag && !post.tags.includes(tag) && post.tags.length < 10) {
      setPost(p => ({ ...p, tags: [...p.tags, tag] }))
      setTagInput('')
    }
  }

  const handleSubmit = async () => {
    if (post.photos.length === 0 && !post.content.trim()) {
      setError('Add a photo or write something')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('type', post.type)
      formData.append('content', post.content)
      formData.append('tags', JSON.stringify(post.tags))
      if (post.formulaId) formData.append('formulaId', post.formulaId)
      if (post.formulaLabel) formData.append('formulaLabel', post.formulaLabel)

      post.photos.forEach((photo, i) => {
        formData.append(`photo_${i}`, photo.file)
        formData.append(`photo_${i}_label`, photo.label)
      })
      formData.append('photoCount', post.photos.length.toString())

      const res = await fetch('/api/v1/gallery/photos/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()

      // Build the new feed item optimistically
      const newItem: FeedItem = {
        id: data.id || `temp-${Date.now()}`,
        type: post.type,
        author: 'You',
        authorAvatar: '',
        content: post.content,
        photos: post.photos.map((p, i) => ({
          id: p.id,
          url: p.preview,
          label: p.label,
          order: i,
        })),
        voteCount: 0,
        commentCount: 0,
        bookmarkCount: 0,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date().toISOString(),
        tags: post.tags,
      }
      onCreated(newItem)
    } catch (err: any) {
      setError(err.message || 'Failed to post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-[#161620] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 flex-shrink-0">
          {step === 'details' ? (
            <button onClick={() => setStep('photos')} className="text-white/60 hover:text-white">
              <ChevronLeft size={20} />
            </button>
          ) : (
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X size={20} />
            </button>
          )}
          <h3 className="text-sm font-semibold text-white">
            {step === 'photos' ? 'New Post' : 'Post Details'}
          </h3>
          {step === 'photos' ? (
            <button
              onClick={() => post.photos.length > 0 || post.content ? setStep('details') : null}
              className="text-sm font-medium text-[#9333EA] hover:text-[#EC4899] transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="text-sm font-semibold text-[#9333EA] hover:text-[#EC4899] transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Share'}
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {step === 'photos' ? (
            <div className="p-5 space-y-5">
              {/* Post Type Selector */}
              <div className="flex gap-2">
                {POST_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    onClick={() => setPost(p => ({ ...p, type: pt.value as FeedItem['type'] }))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: post.type === pt.value ? `${pt.color}15` : 'var(--cg-surface)',
                      border: `1px solid ${post.type === pt.value ? pt.color + '40' : 'rgba(255,255,255,0.06)'}`,
                      color: post.type === pt.value ? pt.color : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <pt.icon size={12} />
                    {pt.label}
                  </button>
                ))}
              </div>

              {/* Photo Picker */}
              <PhotoPicker
                photos={post.photos}
                onChange={(photos) => setPost(p => ({ ...p, photos }))}
              />

              {/* Quick caption on photo step */}
              <textarea
                value={post.content}
                onChange={(e) => setPost(p => ({ ...p, content: e.target.value }))}
                placeholder="Write a caption..."
                className="w-full bg-transparent border-none text-white placeholder-white/25 focus:outline-none resize-none text-sm min-h-[60px]"
              />
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Caption (full) */}
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-white/30 mb-2 block">Caption</label>
                <textarea
                  value={post.content}
                  onChange={(e) => setPost(p => ({ ...p, content: e.target.value }))}
                  placeholder="Tell the story behind this color..."
                  className="w-full bg-white/[0.03] border border-white/6 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#9333EA]/30 min-h-[100px] resize-none text-sm"
                />
                <div className="flex items-center gap-3 mt-2 text-white/20">
                  <button className="flex items-center gap-1 text-[11px] hover:text-white/50 transition-colors">
                    <AtSign size={12} /> Mention
                  </button>
                  <button className="flex items-center gap-1 text-[11px] hover:text-white/50 transition-colors">
                    <Hash size={12} /> Hashtag
                  </button>
                </div>
              </div>

              {/* Formula Link */}
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-white/30 mb-2 block">Attach Formula</label>
                <input
                  type="text"
                  value={post.formulaLabel}
                  onChange={(e) => setPost(p => ({ ...p, formulaLabel: e.target.value }))}
                  placeholder="e.g. Wella 7/73 + 8/73, 30vol 1:1.5"
                  className="w-full bg-white/[0.03] border border-white/6 rounded-xl p-3 text-white placeholder-white/20 focus:outline-none focus:border-[#9333EA]/30 text-sm"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-white/30 mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.05] border border-white/6 text-white/60">
                      #{tag}
                      <button onClick={() => setPost(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))}>
                        <X size={10} className="text-white/30" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() } }}
                    placeholder="Add tag..."
                    className="flex-1 bg-white/[0.03] border border-white/6 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-[#9333EA]/30 text-sm"
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                    className="px-3 py-2 bg-white/[0.05] border border-white/6 rounded-lg text-white/40 hover:text-white/60 text-sm disabled:opacity-30"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Thumbnail preview */}
              {post.photos.length > 0 && (
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-white/30 mb-2 block">Preview</label>
                  <div className="flex gap-2 overflow-x-auto">
                    {post.photos.map(p => (
                      <div key={p.id} className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                        <img src={p.preview} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="px-5 py-2 border-t border-white/5">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Feed Card (Instagram-style) ──────────────────────────────────────────────

function FeedCard({ item, onLike, onBookmark }: {
  item: FeedItem
  onLike: (id: string) => void
  onBookmark: (id: string) => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [liked, setLiked] = useState(item.isLiked)
  const [likeCount, setLikeCount] = useState(item.voteCount)
  const [bookmarked, setBookmarked] = useState(item.isBookmarked)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(c => liked ? c - 1 : c + 1)
    onLike(item.id)
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
    onBookmark(item.id)
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'now'
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="bg-white/[0.03] border border-white/6 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#9333EA] to-[#EC4899] flex items-center justify-center text-white text-sm font-bold overflow-hidden">
            {item.authorAvatar ? (
              <img src={item.authorAvatar} alt={item.author} className="w-full h-full object-cover" />
            ) : (
              item.author.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-white">{item.author}</p>
              <BadgeRow badges={item.authorBadges} tier={item.authorTier} />
            </div>
            {item.authorHandle && (
              <p className="text-[11px] text-white/30">@{item.authorHandle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/20">{timeAgo(item.createdAt)}</span>
          <button className="text-white/20 hover:text-white/40 transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Photos */}
      <PhotoCarousel photos={item.photos} />

      {/* Content */}
      <div className="px-4 pt-3 pb-1">
        {/* Formula card if attached */}
        {item.formulaLabel && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-gradient-to-r from-[#9333EA]/8 to-[#EC4899]/8 border border-[#9333EA]/15">
            <div className="flex items-center gap-1.5 mb-0.5">
              <FlaskConical size={11} className="text-[#9333EA]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9333EA]/70">Formula</span>
            </div>
            <p className="text-xs text-white/70 font-mono">{item.formulaLabel}</p>
          </div>
        )}

        <p className="text-sm text-white/80 leading-relaxed">
          <span className="font-semibold text-white mr-1.5">{item.author}</span>
          {item.content}
        </p>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.tags.map(tag => (
              <span key={tag} className="text-[11px] text-[#9333EA]/80">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="flex items-center gap-1.5 transition-colors">
            <Heart
              size={20}
              style={{ color: liked ? '#EC4899' : 'rgba(255,255,255,0.3)', fill: liked ? '#EC4899' : 'none' }}
            />
            {likeCount > 0 && (
              <span className="text-xs text-white/40">{likeCount}</span>
            )}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-white/30 hover:text-white/50 transition-colors"
          >
            <MessageCircle size={20} />
            {item.commentCount > 0 && (
              <span className="text-xs">{item.commentCount}</span>
            )}
          </button>
          <button className="text-white/30 hover:text-white/50 transition-colors">
            <Share2 size={20} />
          </button>
        </div>
        <button onClick={handleBookmark} className="transition-colors">
          <Bookmark
            size={20}
            style={{ color: bookmarked ? '#F59E0B' : 'rgba(255,255,255,0.3)', fill: bookmarked ? '#F59E0B' : 'none' }}
          />
        </button>
      </div>

      {/* Inline Comment Thread */}
      {showComments && (
        <CommentThread postId={item.id} commentCount={item.commentCount} />
      )}
    </div>
  )
}

// ─── Inline Comment Thread ────────────────────────────────────────────────────

interface Comment {
  id: string
  content: string
  createdAt: string
  isApproved: boolean
  author: {
    id: string
    name: string
    handle?: string
    avatar?: string
    isVerified?: boolean
  }
}

function CommentThread({ postId, commentCount }: { postId: string; commentCount: number }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/v1/community/posts/${postId}/comments`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.items || [])
      }
    } catch {}
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!newComment.trim() || submitting) return
    setSubmitting(true)
    try {
      // TODO: get userId from auth
      const res = await fetch(`/api/v1/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user-id', content: newComment.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setNewComment('')
        // If auto-approved, add to list; otherwise show pending message
        if (data.isApproved) {
          fetchComments() // refresh
        } else {
          // Optimistic: show pending
          setComments(prev => [...prev, {
            id: data.id,
            content: newComment.trim(),
            createdAt: new Date().toISOString(),
            isApproved: false,
            author: { id: 'current', name: 'You' },
          }])
        }
      }
    } catch {}
    setSubmitting(false)
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'now'
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    return `${Math.floor(hrs / 24)}d`
  }

  return (
    <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
      {/* Comment input */}
      <div className="flex items-center gap-2 px-4 py-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent text-sm text-white placeholder-white/20 focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!newComment.trim() || submitting}
          className="text-sm font-semibold text-[#9333EA] hover:text-[#EC4899] transition-colors disabled:opacity-30"
        >
          {submitting ? '...' : 'Post'}
        </button>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="px-4 pb-3">
          <p className="text-xs text-white/20">Loading comments...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="px-4 pb-3 space-y-2.5 max-h-60 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9333EA]/60 to-[#EC4899]/60 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 mt-0.5">
                {c.author?.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs">
                  <span className="font-semibold text-white">{c.author?.name}</span>
                  {c.author?.handle && <span className="text-white/25 ml-1">@{c.author.handle}</span>}
                  {c.author?.isVerified && (
                    <span className="ml-1 text-[8px] text-[#14b8a6]">✓</span>
                  )}
                  <span className="text-white/70 ml-1.5">{c.content}</span>
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-white/15">{timeAgo(c.createdAt)}</span>
                  {!c.isApproved && (
                    <span className="text-[9px] text-[#F59E0B]/60">Pending review</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : commentCount > 0 ? (
        <div className="px-4 pb-3">
          <p className="text-xs text-white/15">{commentCount} comment{commentCount > 1 ? 's' : ''}</p>
        </div>
      ) : null}
    </div>
  )
}

// ─── Main Community Feed ──────────────────────────────────────────────────────

const TABS = [
  { id: 'all', label: 'For You', icon: CircleUserRound },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'following', label: 'Following', icon: AtSign },
  { id: 'my_posts', label: 'My Posts', icon: Grid3X3 },
]

export default function CommunityFeed() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchFeed()
  }, [activeTab, page])

  const fetchFeed = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/gallery/feed?tab=${activeTab}&page=${page}`)
      if (!res.ok) {
        setItems([])
        return
      }
      const data = await res.json()
      const feedItems: FeedItem[] = (data.items || []).map((item: any) => ({
        ...item,
        photos: item.photos || (item.afterUrl ? [{ id: '1', url: item.afterUrl, label: 'after' as const, order: 0 }] : []),
      }))
      if (page === 1) {
        setItems(feedItems)
      } else {
        setItems(prev => [...prev, ...feedItems])
      }
      setHasMore(data.hasMore || false)
    } catch (err) {
      console.error('Feed load error:', err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreated = (newItem: FeedItem) => {
    setItems(prev => [newItem, ...prev])
    setShowCreate(false)
  }

  const handleLike = async (id: string) => {
    fetch(`/api/community/posts/${id}/like`, { method: 'POST' }).catch(() => {})
  }

  const handleBookmark = async (id: string) => {
    // TODO: bookmark API
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1) }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
            style={{
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #9333EA, #EC4899)'
                : 'rgba(255,255,255,0.04)',
              color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.4)',
              border: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}

        <button
          onClick={() => setShowCreate(true)}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus size={14} />
          Post
        </button>
      </div>

      {/* Create Post Modal */}
      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Feed */}
      {loading && page === 1 ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/[0.03] rounded-2xl h-[400px] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={24} className="text-white/10" />
          </div>
          <p className="text-white/30 text-lg">No posts yet</p>
          <p className="text-white/15 text-sm mt-1">Share your first transformation</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 px-5 py-2.5 bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus size={14} className="inline mr-1.5" />
            Create Post
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map(item => (
              <FeedCard
                key={item.id}
                item={item}
                onLike={handleLike}
                onBookmark={handleBookmark}
              />
            ))}
          </div>
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-2.5 bg-white/[0.04] border border-white/6 rounded-xl text-sm text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-all"
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
