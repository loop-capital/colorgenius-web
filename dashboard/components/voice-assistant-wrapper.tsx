'use client'

import { usePathname } from 'next/navigation'
import { VoiceAssistant } from '@/components/custom/voice-assistant'

// Don't show on auth pages
const EXCLUDED_PATHS = ['/login', '/register', '/api']

export function VoiceAssistantWrapper() {
  const pathname = usePathname()

  // Hide on auth pages
  if (EXCLUDED_PATHS.some(p => pathname.startsWith(p))) {
    return null
  }

  return <VoiceAssistant position="bottom-right" />
}
