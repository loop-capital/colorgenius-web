'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/custom/glass-card'
import { PostCard } from './_components/post-card'
import { CreatePostModal } from './_components/create-post-modal'
import { SearchBar } from './_components/search-bar'
import {
  MessageSquare, TrendingUp, Award, Plus, Loader2, Hash,
  Users, ImageOff, RefreshCw, Search,
} from 'lucide-react'
import { CommunityPost } from '@/lib/api/types'
import { useToast } from '@/components/ui/use-toast'

const tabs = [
  { id: 'feed', label: 'Feed', icon: MessageSquare },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'experts', label: 'Educators', icon: Award },
]

// Mock fallback data (from lib/api/mock-data)
const FALLBACK_POSTS: CommunityPost[] = []

function timeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function CommunityPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('feed')
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set())
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchPosts = useCallback(async (append = false, newSearch?: string) => {
    if (!append) setLoading(true)
    else setLoadingMore(true)
    setError(null)

    try {
      const endpoint = activeTab === 'trending' ? '/api/community/trending' : '/api/community/feed'
      const params = new URLSearchParams()
      params.set('limit', '20')
      if (!append && newSearch !== undefined) {
        if (newSearch) params.set('search', newSearch)
      } else if (search) {
        params.set('search', search)
      }
      if (append && cursor) params.set('cursor', cursor)
      if (activeTab === 'feed') params.set('filter', 'newest')
      else if (activeTab === 'trending') params.set('filter', 'trending')

      const res = await fetch(`${endpoint}?${params.toString()}`)
      const data = await res.json()

      if (data.success && data.data) {
        const items = data.data as CommunityPost[]
        const newLiked = new Set<string>()
        const newSaved = new Set<string>()
        items.forEach(p => {
          if (p.user_liked) newLiked.add(p.id)
          if (p.user_saved) newSaved.add(p.id)
        })

        if (append) {
          setPosts(prev => [...prev, ...items])
        } else {
          setPosts(items)
          setLikedPosts(prev => {
            const merged = new Set(prev)
            newLiked.forEach(id => merged.add(id))
            return merged
          })
          setSavedPosts(prev => {
            const merged = new Set(prev)
            newSaved.forEach(id => merged.add(id))
            return merged
          })
        }
        setCursor(data.meta?.cursor || null)
        setHasMore(!!data.meta?.cursor)
      } else {
        if (!append) setError(data.error?.message || 'Failed to load feed')
        // If API fails on append, just keep existing posts
      }
    } catch (e) {
      if (!append) setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [activeTab, search, cursor])

  // Initial load
  useEffect(() => {
    fetchPosts(false, search)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(false, search)
    }, 300)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function handleLike(postId: string) {
    const currentlyLiked = likedPosts.has(postId)
    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes: currentlyLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ))
    setLikedPosts(prev => {
      const next = new Set(prev)
      if (currentlyLiked) next.delete(postId)
      else next.add(postId)
      return next
    })

    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, { method: 'POST' })
      const data = await res.json()
      if (!data.success) throw new Error(data.error?.message)
    } catch (err) {
      // Revert on error
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes: currentlyLiked ? p.likes : p.likes - 1 }
          : p
      ))
      setLikedPosts(prev => {
        const next = new Set(prev)
        if (currentlyLiked) next.add(postId)
        else next.delete(postId)
        return next
      })
      toast({ title: 'Like failed', description: 'Please try again', variant: 'destructive' })
    }
  }

  async function handleSave(postId: string) {
    const currentlySaved = savedPosts.has(postId)
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, saves: currentlySaved ? p.saves - 1 : p.saves + 1 }
        : p
    ))
    setSavedPosts(prev => {
      const next = new Set(prev)
      if (currentlySaved) next.delete(postId)
      else next.add(postId)
      return next
    })

    try {
      const res = await fetch(`/api/community/posts/${postId}/save`, { method: 'POST' })
      const data = await res.json()
      if (!data.success) throw new Error(data.error?.message)
    } catch {
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, saves: currentlySaved ? p.saves : p.saves - 1 }
          : p
      ))
      setSavedPosts(prev => {
        const next = new Set(prev)
        if (currentlySaved) next.add(postId)
        else next.delete(postId)
        return next
      })
    }
  }

  async function handleComment(postId: string, content: string) {
    const res = await fetch(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error?.message || 'Comment failed')
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p))
  }

  const filteredPosts = posts

  return (
    <div className="min-h-screen bg-[#0A0A0F]" style={{ backgroundImage: 'linear-gradient(135deg, #0A0A0F 0%, #1A1033 50%, #0F1A2E 100%)' }}>
      <div className="p-4 md:p-8 max-w-2xl mx-auto pb-28">
        {/* Header */}
        <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[11px] text-[#71717A] uppercase tracking-[0.1em] font-semibold mb-2">Connect</p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F7]">Community</h1>
              <p className="text-sm text-[#A1A1AA] mt-1">Share formulas, ask questions, learn from pros worldwide</p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <SearchBar value={search} onChange={setSearch} />
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#9333EA]/15 text-[#9333EA] border border-[#9333EA]/20'
                  : 'bg-white/[0.03] text-[#71717A] border border-white/[0.04] hover:bg-white/[0.06] hover:text-[#A1A1AA]'
              }`}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.97 }}
            >
              <tab.icon className="w-4 h-4" />{tab.label}
            </motion.button>
          ))}
        </div>

        {/* Loading state */}
        {loading && filteredPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-[#9333EA] animate-spin" />
            <p className="text-[13px] text-[#71717A]">Loading community feed...</p>
          </div>
        )}

        {/* Error state */}
        {error && filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 gap-3"
          >
            <ImageOff className="w-10 h-10 text-[#52525B]" />
            <p className="text-[14px] text-[#A1A1AA]">{error}</p>
            <button
              type="button"
              onClick={() => fetchPosts(false, search)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9333EA]/15 text-[#9333EA] text-[13px] font-medium hover:bg-[#9333EA]/25 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 gap-3"
          >
            <Search className="w-10 h-10 text-[#52525B]" />
            <p className="text-[14px] text-[#A1A1AA]">{search ? `No results for "${search}"` : 'No posts yet'}</p>
            <p className="text-[12px] text-[#71717A]">{search ? 'Try different keywords' : 'Be the first to share!'}</p>
          </motion.div>
        )}

        {/* Feed */}
        <div className="space-y-4">
          {filteredPosts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onSave={handleSave}
              onComment={handleComment}
              liked={likedPosts.has(post.id)}
              saved={savedPosts.has(post.id)}
              index={i}
            />
          ))}
        </div>

        {/* Load more */}
        {hasMore && !loading && (
          <div className="flex justify-center pt-4 pb-2">
            <button
              type="button"
              onClick={() => fetchPosts(true)}
              disabled={loadingMore}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[13px] text-[#A1A1AA] hover:bg-white/[0.06] hover:text-[#F5F5F7] transition-colors disabled:opacity-40"
            >
              {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load more'}
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <motion.button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-[#9333EA] text-white shadow-lg shadow-[#9333EA]/20 flex items-center justify-center hover:bg-[#7C3AED] hover:shadow-xl hover:shadow-[#9333EA]/30 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Create Post Modal */}
      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => fetchPosts(false, search)}
      />
    </div>
  )
}
