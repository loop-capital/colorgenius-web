'use client';

import React from 'react';
import BeforeAfterSwatch from './BeforeAfterSwatch';
import WarmthExposureBar from './WarmthExposureBar';
import ZoneRiskBars from './ZoneRiskBars';
import FadePreviewSwatch from './FadePreviewSwatch';
import ConfidenceRing from './ConfidenceRing';
import MultiSessionPlanVisual from './MultiSessionPlanVisual';
import { HexagonIcon } from '@/components/icons/HexagonIcon'
import type { FormulationInput, FormulationResult } from '@/lib/formulation';

interface VisualOutcomeSimulatorProps {
  input: FormulationInput;
  result: FormulationResult;
}

export default function VisualOutcomeSimulator({ input, result }: VisualOutcomeSimulatorProps) {
  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gap: 24,
    padding: 24,
    background: 'rgba(30, 30, 45, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
  };

  // Desktop: 3-column grid for swatches, stack for everything else
  const swatchRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 24,
    alignItems: 'start',
  };

  return (
    <div style={containerStyle}>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7', margin: '0 0 4px 0' }}>
        <HexagonIcon size={16} /> Visual Outcome Simulator
      </p>
      <p style={{ fontSize: 12, color: '#71717A', margin: '0 0 8px 0' }}>
        Predicted result based on hair state, formulation, and color science.
      </p>

      {/* Swatch row: Before/After + Fade Preview */}
      <div style={swatchRowStyle}>
        <BeforeAfterSwatch input={input} result={result} />
        <FadePreviewSwatch input={input} />
      </div>

      {/* Warmth Exposure Bar */}
      <WarmthExposureBar input={input} result={result} />

      {/* Zone Risk Bars */}
      <ZoneRiskBars input={input} result={result} />

      {/* Confidence Ring */}
      <ConfidenceRing
        confidence={result.adjustedConfidence ?? 0.85}
        adjustments={result.confidenceAdjustments}
      />

      {/* Multi-Session Plan (conditional) */}
      {result.multiSessionPlan && result.multiSessionPlan.length > 0 && (
        <MultiSessionPlanVisual
          plan={result.multiSessionPlan}
          targetTone={input.targetTone}
          hasHardStops={result.hardStops && result.hardStops.length > 0}
        />
      )}
    </div>
  );
}
