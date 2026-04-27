import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  centered?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  label,
  centered = false,
}: LoadingSpinnerProps) {
  const spinnerSizes = { sm: 24, md: 40, lg: 56 };
  const px = spinnerSizes[size];

  const content = (
    <div style={styles.wrapper}>
      <div
        style={{
          width: px,
          height: px,
          border: `${size === 'sm' ? 2 : size === 'md' ? 3 : 4}px solid var(--color-border)`,
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          flexShrink: 0,
        }}
      />
      {label && (
        <p style={styles.label}>{label}</p>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (centered) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
        {content}
      </div>
    );
  }

  return content;
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  label: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: 'var(--color-text-muted)',
  },
};