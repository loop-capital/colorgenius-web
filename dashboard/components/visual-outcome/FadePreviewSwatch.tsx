'use client';

import React from 'react';
import ColorBlock from './ColorBlock';
import { computeFadePreview } from '@/lib/color-utils';
import type { FormulationInput } from '@/lib/formulation';

interface FadePreviewSwatchProps {
  input: FormulationInput;
}

const TONE_LABELS: Record<string, string> = {
  neutral: 'Natural',
  warm: 'Warm',
  golden: 'Golden',
  copper: 'Copper',
  red: 'Red',
  ash: 'Ash',
  cool: 'Cool',
  violet: 'Violet',
  pearl: 'Pearl',
  beige: 'Beige',
  mahogany: 'Mahogany',
  chocolate: 'Chocolate',
};

export default function FadePreviewSwatch({ input }: FadePreviewSwatchProps) {
  const fade = computeFadePreview(input);

  return (
    <div>
      <p style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 12 }}>
        Fade Preview
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ColorBlock
          hex={fade.hex}
          label={`Level ${fade.level} ${TONE_LABELS[fade.tone] || fade.tone}`}
          ariaLabel={`Expected fade: Level ${fade.level} ${TONE_LABELS[fade.tone] || fade.tone} in 4 to 6 weeks`}
          size={120}
        />
        <div>
          <p style={{ fontSize: 14, color: '#F5F5F7', margin: '0 0 4px 0', fontWeight: 500 }}>
            Expected fade: Level {fade.level} {TONE_LABELS[fade.tone] || fade.tone} in 4–6 weeks
          </p>
          <p style={{ fontSize: 12, color: '#71717A', margin: 0 }}>
            Based on wash frequency and porosity
          </p>
        </div>
      </div>
    </div>
  );
}
