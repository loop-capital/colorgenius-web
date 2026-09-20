'use client'

import { usePathname } from 'next/navigation'
import { VoiceAssistant } from '@/components/custom/voice-assistant'

// Only the actual bowl-side workflow pages — every question costs real
// OpenAI money, so this doesn't render globally across the whole
// dashboard (admin pages, settings, subscription, etc. never needed it).
const INCLUDED_PATHS = ['/service', '/formulate']

export function VoiceAssistantWrapper() {
  const pathname = usePathname()

  if (!INCLUDED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return null
  }

  return <VoiceAssistant position="bottom-right" />
}
