'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, CheckCheck, MessageCircle, Heart, AlertCircle } from 'lucide-react'

interface NotificationCounts {
  pending: number
  recentComments: number
  recentLikes: number
}

export default function NotificationBell({ userId }: { userId?: string }) {
  const [counts, setCounts] = useState<NotificationCounts>({ pending: 0, recentComments: 0, recentLikes: 0 })
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<any>({ pending: [], recentComments: [], recentLikes: [] })
  const [loading, setLoading] = useState(false)

  // Poll for counts
  useEffect(() => {
    if (!userId) return
    fetchCounts()
    const interval = setInterval(fetchCounts, 30000) // every 30s
    return () => clearInterval(interval)
  }, [userId])

  const fetchCounts = async () => {
    try {
      const res = await fetch(`/api/v1/community/notifications?userId=${userId}`)
      if (!res.ok) return
      const data = await res.json()
      setCounts(data.counts || { pending: 0, recentComments: 0, recentLikes: 0 })
    } catch {}
  }

  const fetchFull = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/community/notifications?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
        setCounts(data.counts || { pending: 0, recentComments: 0, recentLikes: 0 })
      }
    } catch {}
    setLoading(false)
  }

  const handleToggle = () => {
    if (!open) fetchFull()
    setOpen(!open)
  }

  const handleAction = async (postId: string, commentId: string, action: 'approve' | 'reject') => {
    try {
      await fetch(`/api/v1/community/posts/${postId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId }),
      })
      // Remove from pending list
      setNotifications((prev: any) => ({
        ...prev,
        pending: prev.pending.filter((c: any) => c.id !== commentId),
        counts: { ...prev.counts, pending: prev.counts.pending - 1 },
      }))
      setCounts(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1) }))
    } catch {}
  }

  const total = counts.pending + counts.recentComments + counts.recentLikes

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl transition-colors hover:bg-white/[0.04]"
        style={{ color: total > 0 ? '#F5F5F7' : 'rgba(255,255,255,0.3)' }}
      >
        <Bell size={20} />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#EC4899] text-white text-[10px] font-bold flex items-center justify-center px-1">
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Panel */}
          <div
            className="absolute right-0 top-full mt-2 z-50 w-80 max-h-96 overflow-y-auto rounded-xl border"
            style={{ background: '#161620', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60">
                <X size={14} />
              </button>
            </div>

            {loading ? (
              <div className="p-4 text-center text-white/30 text-sm">Loading...</div>
            ) : (
              <div>
                {/* Pending comments — needs action */}
                {notifications.pending?.length > 0 && (
                  <div>
                    <p className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-[#F59E0B]/80 flex items-center gap-1.5">
                      <AlertCircle size={10} />
                      Pending Review
                    </p>
                    {notifications.pending.map((c: any) => (
                      <div key={c.id} className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#9333EA] to-[#EC4899] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5">
                            {c.author?.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/80">
                              <span className="font-semibold text-white">{c.author?.name}</span>
                              {c.author?.handle && <span className="text-white/30 ml-1">@{c.author.handle}</span>}
                            </p>
                            <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{c.content}</p>
                            <p className="text-[10px] text-white/20 mt-1 truncate">on: {c.post?.preview}</p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleAction(c.post?.id, c.id, 'approve')}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-green-400 bg-green-400/10 border border-green-400/20 hover:bg-green-400/20 transition-colors"
                              >
                                <Check size={10} /> Approve
                              </button>
                              <button
                                onClick={() => handleAction(c.post?.id, c.id, 'reject')}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-red-400 bg-red-400/10 border border-red-400/20 hover:bg-red-400/20 transition-colors"
                              >
                                <X size={10} /> Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent comments */}
                {notifications.recentComments?.length > 0 && (
                  <div>
                    <p className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-white/30 flex items-center gap-1.5">
                      <MessageCircle size={10} />
                      Recent Comments
                    </p>
                    {notifications.recentComments.slice(0, 8).map((c: any) => (
                      <div key={c.id} className="px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <p className="text-xs text-white/70">
                          <span className="font-semibold text-white">{c.author?.name}</span>{' '}
                          commented: <span className="text-white/50">{c.content?.substring(0, 60)}{c.content?.length > 60 ? '...' : ''}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent likes */}
                {notifications.recentLikes?.length > 0 && (
                  <div>
                    <p className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-white/30 flex items-center gap-1.5">
                      <Heart size={10} />
                      Recent Likes
                    </p>
                    {notifications.recentLikes.slice(0, 5).map((l: any, i: number) => (
                      <div key={i} className="px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <p className="text-xs text-white/50">
                          <span className="font-semibold text-white">{l.user?.name}</span>{' '}
                          liked your post
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {notifications.pending?.length === 0 && notifications.recentComments?.length === 0 && notifications.recentLikes?.length === 0 && (
                  <div className="p-6 text-center">
                    <Bell size={24} className="mx-auto mb-2 text-white/10" />
                    <p className="text-xs text-white/20">No notifications yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
