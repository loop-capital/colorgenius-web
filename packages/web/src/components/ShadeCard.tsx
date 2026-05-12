import React from 'react';
type Shade = any;

interface ShadeCardProps {
  shade: Shade;
  onClick?: (shade: Shade) => void;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#1e293b';
  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1e293b' : '#ffffff';
}

const TONE_LABELS: Record<string, string> = {
  N: 'Natural',
  A: 'Ash',
  G: 'Gold',
  GA: 'Gold Ash',
  AG: 'Ash Gold',
  R: 'Red',
  V: 'Violet',
  B: 'Brown',
  W: 'Warm',
  C: 'Copper',
  M: 'Mahogany',
};

export default function ShadeCard({ shade, onClick }: ShadeCardProps) {
  const colorHex = shade.color_hex || '#888888';
  const textColor = getContrastColor(colorHex);

  return (
    <div
      style={styles.card}
      onClick={() => onClick?.(shade)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick(shade); }}
    >
      {/* Color preview */}
      <div style={{ ...styles.colorBlock, background: colorHex }}>
        <span style={{ ...styles.colorCode, color: textColor }}>
          {shade.level}{shade.tone}
        </span>
      </div>

      {/* Info */}
      <div style={styles.info}>
        <div style={styles.nameRow}>
          <span style={styles.code}>{shade.code}</span>
          {shade.brand && <span style={styles.brand}>{shade.brand}</span>}
        </div>
        <p style={styles.name}>{shade.name}</p>
        <div style={styles.tags}>
          <span className="badge badge-muted" style={{ fontSize: '0.6875rem' }}>
            Level {shade.level}
          </span>
          <span className="badge badge-muted" style={{ fontSize: '0.6875rem' }}>
            {TONE_LABELS[shade.tone] || shade.tone}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all var(--transition-base)',
  },
  colorBlock: {
    height: 72,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: '0.5rem',
  },
  colorCode: {
    fontSize: '0.75rem',
    fontWeight: 700,
    opacity: 0.9,
  },
  info: {
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.25rem',
  },
  code: {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
    fontFamily: 'monospace',
  },
  brand: {
    fontSize: '0.6875rem',
    color: 'var(--color-text-muted)',
  },
  name: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tags: {
    display: 'flex',
    gap: '0.25rem',
    marginTop: '0.125rem',
  },
};