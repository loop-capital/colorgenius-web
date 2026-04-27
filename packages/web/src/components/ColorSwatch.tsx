'use client';

interface ColorSwatchProps {
  rgb: [number, number, number];
  name: string;
  code: string;
  level: number;
  tone: string;
  isNatural?: boolean;
  undertone?: 'warm' | 'neutral' | 'cool';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const TONE_LABELS: Record<string, string> = {
  N: 'Natural',
  A: 'Ash',
  G: 'Gold',
  R: 'Red',
  V: 'Violet',
  B: 'Beige',
  C: 'Chocolate',
  K: 'Copper',
  M: 'Mauve',
  O: 'Orange',
  P: 'Pearl',
  S: 'Silver',
  W: 'Warm',
};

export default function ColorSwatch({
  rgb,
  name,
  code,
  level,
  tone,
  isNatural = false,
  undertone,
  size = 'md',
  onClick,
}: ColorSwatchProps) {
  const [r, g, b] = rgb;
  const bgColor = `rgb(${r}, ${g}, ${b})`;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const toneLabel = TONE_LABELS[tone] || tone;
  const undertoneLabel = undertone ? `· ${undertone.charAt(0).toUpperCase() + undertone.slice(1)}` : '';

  return (
    <div
      onClick={onClick}
      className={`
        group cursor-pointer
        ${onClick ? 'hover:scale-105 transition-transform duration-200' : ''}
      `}
    >
      <div
        className={`
          ${sizeClasses[size]} rounded-xl shadow-md border border-white
          group-hover:shadow-lg group-hover:ring-2 group-hover:ring-gold-400 transition-all duration-200
        `}
        style={{ backgroundColor: bgColor }}
      />
      <div className="mt-2 text-center">
        <p className="font-semibold text-gray-800 text-sm">{code}</p>
        <p className="text-xs text-gray-500">{level}{toneLabel.charAt(0)}</p>
        {size === 'lg' && (
          <p className="text-xs text-gray-400 mt-1 truncate max-w-full">{name}</p>
        )}
        {isNatural && (
          <span className="inline-block mt-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-medium rounded">
            Natural
          </span>
        )}
      </div>
    </div>
  );
}