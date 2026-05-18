'use client';

import React from 'react';
import ColorBlock from './ColorBlock';
import { blendColor, getPigmentHex } from '@/lib/color-utils';
import { HAIR_LEVELS } from '@/lib/products';
import type { ToneFamily } from '@/lib/products';
import type { FormulationInput, FormulationResult } from '@/lib/formulation';

interface BeforeAfterSwatchProps {
  input: FormulationInput;
  result: FormulationResult;
}

const TONE_LABELS: Record<string, string> = {
  N: 'Natural', A: 'Ash', G: 'Gold', K: 'Copper', R: 'Red',
  V: 'Violet', P: 'Pearl', B: 'Beige', M: 'Mahogany',
  Ch: 'Chocolate', W: 'Warm', C: 'Cool',
};

function getToneLabel(tone: ToneFamily | string): string {
  return TONE_LABELS[tone as string] || (tone as string);
}

function getToneHexFromInput(toneCode: string): string {
  const toneMap: Record<string, string> = {
    N: '#9C8B7A', A: '#8A7D6E', G: '#C4A35A', K: '#B87333', R: '#A03030',
    V: '#7B68A6', P: '#B8B0C4', B: '#C4B5A0', M: '#6B3A3A',
    Ch: '#4A2C2A', W: '#D4A574', C: '#7D8B9A',
  };
  return toneMap[toneCode] || '#9C8B7A';
}

export default function BeforeAfterSwatch({ input, result }: BeforeAfterSwatchProps) {
  const currentToneCode = typeof input.currentTone === 'string' ? input.currentTone : 'N';
  const targetToneCode = typeof input.targetTone === 'string' ? input.targetTone : 'N';

  const beforeHex = blendColor(
    HAIR_LEVELS[input.currentLevel]?.hex || '#7D5038',
    getToneHexFromInput(currentToneCode),
    0.35
  );

  const afterHex = blendColor(
    HAIR_LEVELS[input.targetLevel]?.hex || '#C08C5A',
    getToneHexFromInput(targetToneCode),
    0.45
  );

  // Underlying pigment peek-through: show gradient if lifting to cool tone
  const isLifting = input.targetLevel > input.currentLevel;
  const coolTones = ['ash', 'cool', 'violet', 'pearl'];
  const isCoolTarget = coolTones.includes(input.targetTone as string);
  const underlying = result.underlyingPigment;

  let gradientOverlay: string | null = null;
  if (isLifting && isCoolTarget && underlying?.exposed) {
    const pigmentHex = getPigmentHex(underlying.exposed);
    gradientOverlay = `linear-gradient(135deg, ${afterHex} 60%, ${pigmentHex} 100%)`;
  }

  return (
    <div>
      <p style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 12 }}>
        Before → After
      </p>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        <ColorBlock
          hex={beforeHex}
          label={`Level ${input.currentLevel} — ${getToneLabel(input.currentTone)}`}
          ariaLabel={`Before: Level ${input.currentLevel} ${getToneLabel(input.currentTone)}`}
          size={120}
        />
        <div style={{ fontSize: 24, color: '#71717A' }}>→</div>
        <ColorBlock
          hex={afterHex}
          label={`Level ${input.targetLevel} — ${getToneLabel(input.targetTone)}`}
          ariaLabel={`After: Level ${input.targetLevel} ${getToneLabel(input.targetTone)}`}
          size={120}
          gradientOverlay={gradientOverlay}
        />
      </div>
    </div>
  );
}