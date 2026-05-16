'use client';

import React from 'react';
import { gradientToCss } from '@/lib/color-utils';
import type { FormulationInput, FormulationResult } from '@/lib/formulation';
import { computeWarmthExposure, computeWarmthGradientHex } from '@/lib/color-utils';

interface WarmthExposureBarProps {
  input: FormulationInput;
  result: FormulationResult;
}

export default function WarmthExposureBar({ input, result }: WarmthExposureBarProps) {
  const exposure = computeWarmthExposure(input, result);
  const gradientHex = computeWarmthGradientHex(input, result);
  const isPreviouslyColored = input.condition.type === 'previously_colored';

  return (
    <div>
      <p style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 12 }}>
        Warmth Exposure
      </p>
      <div
        role="img"
        aria-label={`Warmth exposure from root ${exposure.root} through midshaft ${exposure.midshaft} to ends ${exposure.ends}`}
        style={{
          width: '100%',
          height: 32,
          borderRadius: 16,
          background: gradientToCss(gradientHex),
          border: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {isPreviouslyColored && (
          <>
            <div style={{
              position: 'absolute',
              left: '33%',
              top: 0,
              bottom: 0,
              width: 1,
              background: 'rgba(255,255,255,0.2)',
            }} />
            <div style={{
              position: 'absolute',
              left: '66%',
              top: 0,
              bottom: 0,
              width: 1,
              background: 'rgba(255,255,255,0.2)',
            }} />
          </>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 11, color: '#A1A1AA' }}>Root</span>
        <span style={{ fontSize: 11, color: '#A1A1AA' }}>Midshaft</span>
        <span style={{ fontSize: 11, color: '#A1A1AA' }}>Ends</span>
      </div>
      {isPreviouslyColored && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: '#71717A' }}>New growth</span>
          <span style={{ fontSize: 10, color: '#71717A' }}>Old color</span>
          <span style={{ fontSize: 10, color: '#71717A' }}>Faded</span>
        </div>
      )}
    </div>
  );
}
