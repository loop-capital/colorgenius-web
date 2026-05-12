'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  className?: string
  showIcon?: boolean
}

export function LogoutButton({ className = '', showIcon = true }: LogoutButtonProps) {
  const router = useRouter()

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 text-[13px] font-medium text-[#A1A1AA] hover:text-[#EF4444] transition-colors ${className}`}
      title="Sign out"
    >
      {showIcon && <LogOut className="w-4 h-4" />}
      <span>Sign out</span>
    </button>
  )
}
