'use client';

import React from 'react';

interface ColorBlockProps {
  hex: string;
  label?: string;
  ariaLabel?: string;
  size?: number;
  gradientOverlay?: string | null;
}

/**
 * Shared swatch component — solid color block with optional gradient overlay.
 * 120×120 desktop, 80×80 mobile (responsive via parent).
 */
export default function ColorBlock({
  hex,
  label,
  ariaLabel,
  size = 120,
  gradientOverlay = null,
}: ColorBlockProps) {
  const backgroundStyle = gradientOverlay
    ? { background: gradientOverlay }
    : { backgroundColor: hex };

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        role="img"
        aria-label={ariaLabel || label || `Color swatch ${hex}`}
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          border: '2px solid rgba(255,255,255,0.08)',
          ...backgroundStyle,
        }}
      />
      {label && (
        <p style={{ fontSize: 12, color: '#A1A1AA', marginTop: 8, marginBottom: 0 }}>
          {label}
        </p>
      )}
    </div>
  );
}
