'use client'

import Link from 'next/link'
import {
  LayoutDashboard, FlaskConical, Camera, ImageIcon, MessageCircle, BookOpen,
  Users, History, ClipboardList, Sparkles,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/formulate', label: 'Formulate', icon: FlaskConical },
  { href: '/analyze', label: 'Analyze', icon: Camera },
  { href: '/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/community', label: 'Community', icon: MessageCircle },
  { href: '/library', label: 'Library', icon: BookOpen },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/history', label: 'History', icon: History },
  { href: '/questionnaire', label: 'Consultation', icon: ClipboardList },
]

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed h-screen z-40"
        style={{ background: '#0F0F1A', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #14B8A6, #2DD4BF)', borderRadius: '10px' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#0A0A0F' }} />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: '#F5F5F7' }}>ColorGenius</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-[#161620] hover:text-[#F5F5F7]"
              style={{ color: '#A1A1AA', borderRadius: '10px' }}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="p-3" style={{ background: '#161620', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: '#71717A' }}>Pleij Salon</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full cg-pulse-glow" style={{ background: '#10B981' }} />
              <span className="text-xs" style={{ color: '#A1A1AA' }}>Connected</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50"
        style={{ background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #14B8A6, #2DD4BF)', borderRadius: '8px' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#0A0A0F' }} />
            </div>
            <span className="font-bold text-sm" style={{ color: '#F5F5F7' }}>ColorGenius</span>
          </Link>
          <div className="flex items-center gap-3 overflow-x-auto">
            {navItems.slice(0, 5).map((item) => (
              <Link key={item.href} href={item.href}
                className="p-2 transition-colors hover:text-[#14B8A6] hover:bg-[#161620]"
                style={{ color: '#A1A1AA', borderRadius: '8px' }}
              >
                <item.icon className="w-[18px] h-[18px]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}