'use client';

import React from 'react';
import ColorBlock from './ColorBlock';
import { blendColor } from '@/lib/color-utils';
import { HAIR_LEVELS } from '@/lib/products';
import type { ToneFamily } from '@/lib/products';

interface MultiSessionPlanVisualProps {
  plan: string[];
  targetTone: ToneFamily;
  hasHardStops?: boolean;
}

const TONE_HEX_MAP: Record<string, string> = {
  neutral: '#9C8B7A', warm: '#D4A574', cool: '#7D8B9A',
  ash: '#8A7D6E', golden: '#C4A35A', copper: '#B87333',
  red: '#A03030', violet: '#7B68A6', pearl: '#B8B0C4',
  beige: '#C4B5A0', mahogany: '#6B3A3A', chocolate: '#4A2C2A',
};

function getToneHex(tone: ToneFamily): string {
  return TONE_HEX_MAP[tone] || TONE_HEX_MAP.neutral;
}

function parseSessionLevel(sessionString: string): number {
  const match = sessionString.match(/Level\s+(\d+)/g);
  if (!match) return 5;
  const levels = match.map(m => parseInt(m.replace('Level ', '')));
  return levels[levels.length - 1];
}

function computeSessionHex(sessionString: string, targetTone: ToneFamily): string {
  const level = parseSessionLevel(sessionString);
  const levelHex = HAIR_LEVELS[level]?.hex || '#7D5038';
  const toneHex = getToneHex(targetTone);
  return blendColor(levelHex, toneHex, 0.40);
}

export default function MultiSessionPlanVisual({ plan, targetTone, hasHardStops }: MultiSessionPlanVisualProps) {
  if (!plan || plan.length === 0) return null;

  // Filter out non-session lines like "Wait 1-2 weeks..."
  const sessions = plan.filter(p => p.toLowerCase().includes('session'));
  if (sessions.length === 0) return null;

  return (
    <div>
      <p style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 12 }}>
        Multi-Session Plan
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {sessions.map((session, idx) => {
          const isLast = idx === sessions.length - 1;
          const sessionHex = computeSessionHex(session, targetTone);
          return (
            <React.Fragment key={idx}>
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <ColorBlock
                  hex={sessionHex}
                  label={session}
                  ariaLabel={session}
                  size={80}
                />
                {isLast && hasHardStops && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(0,0,0,0.5)',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                    }}
                    title="Hard stop — professional assessment required"
                  >
                    🔒
                  </div>
                )}
              </div>
              {idx < sessions.length - 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, color: '#9333EA' }}>→</span>
                  <span style={{ fontSize: 10, color: '#71717A', whiteSpace: 'nowrap' }}>4+ weeks</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
