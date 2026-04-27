'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: GridIcon },
  { href: '/formulate', label: 'Formulate', icon: BeakerIcon },
  { href: '/history', label: 'History', icon: ClockIcon },
  { href: '/library', label: 'Color Library', icon: PaletteIcon },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex w-64 flex-col fixed inset-y-0 z-30"
        style={{ background: 'hsl(var(--card))', borderRight: '1px solid hsl(var(--border))' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'hsl(var(--primary))' }}
          >
            <span className="text-sm font-bold" style={{ color: 'hsl(var(--primary-foreground))' }}>CG</span>
          </div>
          <div>
            <span className="font-semibold text-sm" style={{ color: 'hsl(var(--foreground))' }}>ColorGenius</span>
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Pro</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href === '/dashboard' && (pathname === '/' || pathname === '/dashboard'))
            return (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 h-11 px-3 text-sm font-medium rounded-lg transition-colors',
                    active
                      ? 'text-white'
                      : 'text-base'
                  )}
                  style={
                    active
                      ? { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
                      : { color: 'hsl(var(--muted-foreground))', background: 'transparent' }
                  }
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* User / Auth */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          {isAuthenticated ? (
            <div className="px-3 py-2 rounded-lg" style={{ background: 'hsl(var(--muted))' }}>
              <p className="text-sm font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>{user?.name || 'Stylist'}</p>
              <p className="text-xs truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>{user?.email}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/login">
                <Button variant="outline" className="w-full justify-center text-sm h-10" style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="w-full justify-center text-sm h-10" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-1 flex-col md:hidden">
        <header
          className="flex items-center justify-between px-4 py-3 sticky top-0 z-50 w-full"
          style={{ background: 'hsl(var(--card))', borderBottom: '1px solid hsl(var(--border))' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'hsl(var(--primary))' }}>
              <span className="text-sm font-bold" style={{ color: 'hsl(var(--primary-foreground))' }}>CG</span>
            </div>
            <span className="font-semibold text-sm" style={{ color: 'hsl(var(--foreground))' }}>ColorGenius</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-9 w-9 p-0"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            {sidebarOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </Button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'hsl(var(--foreground) / 0.5)' }}
              onClick={() => setSidebarOpen(false)}
            />
            <aside
              className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col shadow-2xl md:hidden"
              style={{ background: 'hsl(var(--card))' }}
            >
              <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'hsl(var(--primary))' }}>
                    <span className="text-sm font-bold" style={{ color: 'hsl(var(--primary-foreground))' }}>CG</span>
                  </div>
                  <span className="font-semibold text-sm" style={{ color: 'hsl(var(--foreground))' }}>ColorGenius</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="h-8 w-8 p-0" style={{ color: 'hsl(var(--foreground))' }}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (href === '/dashboard' && (pathname === '/' || pathname === '/dashboard'))
                  return (
                    <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-11 px-3 text-sm font-medium rounded-lg"
                        style={
                          active
                            ? { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
                            : { color: 'hsl(var(--muted-foreground))' }
                        }
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        {label}
                      </Button>
                    </Link>
                  )
                })}
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>

      {/* Desktop Main Area — offset for fixed sidebar */}
      <div className="hidden md:block flex-1 md:ml-64">
        <main className="p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────
function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function BeakerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6M9 3v11.5a2.5 2.5 0 01-5 0V3ZM5.5 14.5h13a2 2 0 012 2v3a2 2 0 01-2 2H5.5a2 2 0 01-2-2v-3a2 2 0 012-2z" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </svg>
  )
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-.5a4 4 0 00-1.28-2.85A5 5 0 0013 8V7a2 2 0 00-2-2h-2" />
      <circle cx="10" cy="11" r="1" fill="currentColor" />
      <circle cx="15" cy="11" r="1" fill="currentColor" />
    </svg>
  )
}