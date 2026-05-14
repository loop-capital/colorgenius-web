'use client';

import { CommunityPostType } from '@/lib/api/types';
import { Lightbulb, HelpCircle, Star, FlaskConical } from 'lucide-react';

const config: Record<CommunityPostType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  tip: { label: 'Tip', icon: Lightbulb, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  question: { label: 'Question', icon: HelpCircle, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  review: { label: 'Review', icon: Star, color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
  formula_share: { label: 'Formula', icon: FlaskConical, color: '#9333EA', bg: 'rgba(147,51,234,0.12)' },
};

export function PostTypeBadge({ type }: { type: CommunityPostType }) {
  const c = config[type];
  const Icon = c.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider"
      style={{ color: c.color, backgroundColor: c.bg }}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}
