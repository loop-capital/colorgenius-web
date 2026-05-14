'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Send,
  Reply,
  ChevronDown,
  ChevronUp,
  X,
  Hash,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Comment {
  id: string
  author: string
  content: string
  tags: string[]
  rating?: number
  timestamp: string
  parent_id?: string | null
  replies?: Comment[]
}

interface FormulaCommentsProps {
  formulaId: string
}

const COMMON_TAGS = [
  'vivid',
  'gray-coverage',
  'balayage',
  'root-touch-up',
  'correction',
  'high-lift',
  'fashion-color',
  'natural',
  'blend',
  'tips',
  'question',
  'feedback',
]

function formatRelativeTime(ts: string): string {
  const now = new Date()
  const then = new Date(ts)
  const diff = now.getTime() - then.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return then.toLocaleDateString()
}

function StarRow({ value, max = 5, size = 12 }: { value: number; max?: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < value ? '#F59E0B' : 'transparent'}
          color={i < value ? '#F59E0B' : 'rgba(255,255,255,0.15)'}
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function CommentItem({
  comment,
  depth = 0,
  onReply,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  replyTags,
  setReplyTags,
  tagInput,
  setTagInput,
  onSubmitReply,
  submittingReply,
}: {
  comment: Comment
  depth?: number
  onReply: (parentId: string) => void
  replyingTo: string | null
  setReplyingTo: (id: string | null) => void
  replyContent: string
  setReplyContent: (s: string) => void
  replyTags: string[]
  setReplyTags: (tags: string[]) => void
  tagInput: string
  setTagInput: (s: string) => void
  onSubmitReply: (parentId: string) => void
  submittingReply: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)
  const replyInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (replyingTo === comment.id && replyInputRef.current) {
      replyInputRef.current.focus()
    }
  }, [replyingTo, comment.id])

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase().replace(/^#/, '')
    if (clean && !replyTags.includes(clean)) {
      setReplyTags([...replyTags, clean])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setReplyTags(replyTags.filter((t) => t !== tag))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative"
      style={{ marginLeft: depth > 0 ? 24 : 0 }}
    >
      {depth > 0 && (
        <div
          className="absolute left-[-14px] top-0 bottom-0 w-px"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        />
      )}

      <div
        className="rounded-xl p-4"
        style={{
          background: depth > 0 ? 'rgba(255,255,255,0.02)' : 'var(--cg-surface)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background: 'linear-gradient(135deg, #9333EA, #EC4899)',
                color: '#fff',
              }}
            >
              {comment.author
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--cg-text-primary)' }}>
                {comment.author}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--cg-text-tertiary)' }}>
                {formatRelativeTime(comment.timestamp)}
              </p>
            </div>
          </div>
          {comment.rating !== undefined && comment.rating > 0 && (
            <StarRow value={comment.rating} />
          )}
        </div>

        <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--cg-text-secondary)' }}>
          {comment.content}
        </p>

        {comment.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {comment.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  background: 'rgba(147,51,234,0.1)',
                  color: '#9333EA',
                  border: '1px solid rgba(147,51,234,0.15)',
                }}
              >
                <Hash size={8} />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setReplyingTo(replyingTo === comment.id ? null : comment.id)
            }
            className="flex items-center gap-1 text-[11px] font-medium"
            style={{ color: 'var(--cg-text-tertiary)' }}
          >
            <Reply size={12} />
            Reply
          </motion.button>

          {(comment.replies?.length ?? 0) > 0 && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-1 text-[11px] font-medium"
              style={{ color: 'var(--cg-text-tertiary)' }}
            >
              {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              {comment.replies?.length} repl{comment.replies!.length === 1 ? 'y' : 'ies'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Reply input */}
      <AnimatePresence>
        {replyingTo === comment.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
            style={{ marginLeft: depth > 0 ? 24 : 0 }}
          >
            <div
              className="rounded-xl p-3 mt-2"
              style={{
                background: 'rgba(147,51,234,0.05)',
                border: '1px solid rgba(147,51,234,0.12)',
              }}
            >
              <textarea
                ref={replyInputRef}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="w-full bg-transparent text-sm resize-none focus:outline-none placeholder:text-[#52525B]"
                style={{ color: 'var(--cg-text-primary)' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.metaKey) {
                    onSubmitReply(comment.id)
                  }
                }}
              />

              {replyTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {replyTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        background: 'rgba(147,51,234,0.1)',
                        color: '#9333EA',
                        border: '1px solid rgba(147,51,234,0.15)',
                      }}
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:opacity-70"
                      >
                        <X size={8} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <div className="relative">
                  <div className="flex items-center gap-1">
                    <Hash size={12} style={{ color: 'var(--cg-text-tertiary)' }} />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag(tagInput)
                        }
                      }}
                      placeholder="Add tag..."
                      className="bg-transparent text-[11px] focus:outline-none placeholder:text-[#52525B] w-24"
                      style={{ color: 'var(--cg-text-primary)' }}
                    />
                  </div>

                  {tagInput.trim().length > 0 && (
                    <div
                      className="absolute top-full left-0 mt-1 rounded-lg py-1 z-10 min-w-[140px]"
                      style={{
                        background: 'var(--cg-surface-raised)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {COMMON_TAGS.filter(
                        (t) =>
                          t.includes(tagInput.toLowerCase()) &&
                          !replyTags.includes(t)
                      ).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => addTag(t)}
                          className="block w-full text-left px-3 py-1 text-[11px] hover:bg-white/[0.04] transition-colors"
                          style={{ color: 'var(--cg-text-secondary)' }}
                        >
                          #{t}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => addTag(tagInput)}
                        className="block w-full text-left px-3 py-1 text-[11px] hover:bg-white/[0.04] transition-colors"
                        style={{ color: '#9333EA' }}
                      >
                        Create "#{tagInput}"
                        </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setReplyingTo(null)}
                    className="text-[11px] font-medium px-2 py-1 rounded-lg"
                    style={{ color: 'var(--cg-text-tertiary)' }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSubmitReply(comment.id)}
                    disabled={!replyContent.trim() || submittingReply}
                    className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40"
                    style={{
                      background: 'linear-gradient(135deg, #9333EA, #EC4899)',
                      color: '#fff',
                    }}
                  >
                    {submittingReply ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Send size={12} />
                    )}
                    Reply
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nested replies */}
      <AnimatePresence>
        {!collapsed && comment.replies && comment.replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 space-y-2"
          >
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                onReply={onReply}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                replyTags={replyTags}
                setReplyTags={setReplyTags}
                tagInput={tagInput}
                setTagInput={setTagInput}
                onSubmitReply={onSubmitReply}
                submittingReply={submittingReply}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FormulaComments({ formulaId }: FormulaCommentsProps) {
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newTags, setNewTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyTags, setReplyTags] = useState<string[]>([])
  const [replyTagInput, setReplyTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submittingReply, setSubmittingReply] = useState(false)

  // Fetch comments
  useEffect(() => {
    let cancelled = false
    const fetchComments = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/v1/gallery/formulas/comments?formulaId=${encodeURIComponent(formulaId)}`)
        if (!res.ok) {
          console.warn('Comments API returned', res.status)
          return
        }
        const data = await res.json()
        if (!cancelled && data.comments) {
          // Nest replies
          const nest = (list: Comment[]): Comment[] => {
            const map = new Map<string, Comment>()
            list.forEach((c) => map.set(c.id, { ...c, replies: [] }))
            const roots: Comment[] = []
            list.forEach((c) => {
              if (c.parent_id && map.has(c.parent_id)) {
                map.get(c.parent_id)!.replies!.push(map.get(c.id)!)
              } else {
                roots.push(map.get(c.id)!)
              }
            })
            return roots
          }
          setComments(nest(data.comments))
        }
      } catch (e) {
        console.error('Failed to fetch comments:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchComments()
    return () => { cancelled = true }
  }, [formulaId])

  const addNewTag = (tag: string) => {
    const clean = tag.trim().toLowerCase().replace(/^#/, '')
    if (clean && !newTags.includes(clean)) {
      setNewTags([...newTags, clean])
    }
    setTagInput('')
  }

  const removeNewTag = (tag: string) => {
    setNewTags(newTags.filter((t) => t !== tag))
  }

  const submitComment = useCallback(async () => {
    if (!newContent.trim()) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/v1/gallery/formulas/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formulaId,
          content: newContent.trim(),
          tags: newTags,
        }),
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || `HTTP ${res.status}`)
      }
      const data = await res.json()

      const newComment: Comment = {
        id: data.id || crypto.randomUUID(),
        author: data.author || 'You',
        content: newContent.trim(),
        tags: newTags,
        timestamp: new Date().toISOString(),
        parent_id: null,
        replies: [],
      }
      setComments((prev) => [newComment, ...prev])
      setNewContent('')
      setNewTags([])
      toast({ title: 'Comment posted' })
    } catch (e) {
      console.error('Failed to post comment:', e)
      toast({
        title: 'Failed to post comment',
        description: e instanceof Error ? e.message : 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }, [formulaId, newContent, newTags, toast])

  const submitReply = useCallback(
    async (parentId: string) => {
      if (!replyContent.trim()) return
      try {
        setSubmittingReply(true)
        const res = await fetch('/api/v1/gallery/formulas/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formulaId,
            content: replyContent.trim(),
            tags: replyTags,
            parent_id: parentId,
          }),
        })
        if (!res.ok) {
          const err = await res.text()
          throw new Error(err || `HTTP ${res.status}`)
        }
        const data = await res.json()

        const newReply: Comment = {
          id: data.id || crypto.randomUUID(),
          author: data.author || 'You',
          content: replyContent.trim(),
          tags: replyTags,
          timestamp: new Date().toISOString(),
          parent_id: parentId,
          replies: [],
        }

        setComments((prev) => {
          const insert = (list: Comment[]): Comment[] =>
            list.map((c) => {
              if (c.id === parentId) {
                return { ...c, replies: [...(c.replies || []), newReply] }
              }
              if (c.replies) {
                return { ...c, replies: insert(c.replies) }
              }
              return c
            })
          return insert(prev)
        })

        setReplyContent('')
        setReplyTags([])
        setReplyingTo(null)
        toast({ title: 'Reply posted' })
      } catch (e) {
        console.error('Failed to post reply:', e)
        toast({
          title: 'Failed to post reply',
          description: e instanceof Error ? e.message : 'Please try again',
          variant: 'destructive',
        })
      } finally {
        setSubmittingReply(false)
      }
    },
    [formulaId, replyContent, replyTags, toast]
  )

  const totalCount = comments.reduce((acc, c) => {
    const countReplies = (r: Comment[]): number =>
      r.reduce((sum, c) => sum + 1 + countReplies(c.replies || []), 0)
    return acc + 1 + countReplies(c.replies || [])
  }, 0)

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'var(--cg-surface)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} style={{ color: 'var(--cg-teal)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--cg-text-primary)' }}>
            Comments
          </h3>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--cg-text-tertiary)' }}
          >
            {totalCount}
          </span>
        </div>
      </div>

      {/* New comment input */}
      <div
        className="rounded-xl p-3 mb-5"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="w-full bg-transparent text-sm resize-none focus:outline-none placeholder:text-[#52525B]"
          style={{ color: 'var(--cg-text-primary)' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.metaKey) {
              submitComment()
            }
          }}
        />

        {newTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {newTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  background: 'rgba(147,51,234,0.1)',
                  color: '#9333EA',
                  border: '1px solid rgba(147,51,234,0.15)',
                }}
              >
                #{tag}
                <button type="button" onClick={() => removeNewTag(tag)} className="hover:opacity-70">
                  <X size={8} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="relative">
            <div className="flex items-center gap-1">
              <Hash size={12} style={{ color: 'var(--cg-text-tertiary)' }} />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addNewTag(tagInput)
                  }
                }}
                placeholder="Add tag..."
                className="bg-transparent text-[11px] focus:outline-none placeholder:text-[#52525B] w-24"
                style={{ color: 'var(--cg-text-primary)' }}
              />
            </div>

            {tagInput.trim().length > 0 && (
              <div
                className="absolute top-full left-0 mt-1 rounded-lg py-1 z-10 min-w-[140px]"
                style={{
                  background: 'var(--cg-surface-raised)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {COMMON_TAGS.filter(
                  (t) =>
                    t.includes(tagInput.toLowerCase()) && !newTags.includes(t)
                ).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => addNewTag(t)}
                    className="block w-full text-left px-3 py-1 text-[11px] hover:bg-white/[0.04] transition-colors"
                    style={{ color: 'var(--cg-text-secondary)' }}
                  >
                    #{t}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addNewTag(tagInput)}
                  className="block w-full text-left px-3 py-1 text-[11px] hover:bg-white/[0.04] transition-colors"
                  style={{ color: '#9333EA' }}
                >
                  Create "#{tagInput}"
                </button>
              </div>
            )}
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={submitComment}
            disabled={!newContent.trim() || submitting}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #9333EA, #EC4899)',
              color: '#fff',
            }}
          >
            {submitting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Send size={12} />
            )}
            Post
          </motion.button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        {loading && comments.length === 0 ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl p-4 space-y-2"
                style={{
                  background: 'var(--cg-surface)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/[0.04] animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-2.5 w-20 rounded bg-white/[0.04] animate-pulse" />
                    <div className="h-2 w-12 rounded bg-white/[0.04] animate-pulse" />
                  </div>
                </div>
                <div className="h-3 w-full rounded bg-white/[0.04] animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-white/[0.04] animate-pulse" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10"
          >
            <MessageCircle className="h-8 w-8 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.06)' }} />
            <p className="text-sm" style={{ color: 'var(--cg-text-tertiary)' }}>
              No comments yet. Be the first to share your thoughts.
            </p>
          </motion.div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              onReply={(id) => setReplyingTo(id)}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              replyTags={replyTags}
              setReplyTags={setReplyTags}
              tagInput={replyTagInput}
              setTagInput={setReplyTagInput}
              onSubmitReply={submitReply}
              submittingReply={submittingReply}
            />
          ))
        )}
      </div>
    </div>
  )
}
