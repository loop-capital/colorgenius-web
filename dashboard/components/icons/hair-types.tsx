import React from 'react';

interface HairIconProps {
  className?: string;
  size?: number;
}

// Straight hair: horizontal line
export const StraightHairIcon: React.FC<HairIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Wavy hair: gentle S-curve
export const WavyHairIcon: React.FC<HairIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 12 Q6 6, 8 12 T14 12 T20 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// Curly hair: loose spiral curls with smooth rounded edges
export const CurlyHairIcon: React.FC<HairIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Loose curl - smooth wave pattern */}
    <path
      d="M2 12 Q4 8, 6 12 Q8 16, 10 12 Q12 8, 14 12 Q16 16, 18 12 Q20 8, 22 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M2 16 Q4 12, 6 16 Q8 20, 10 16 Q12 12, 14 16 Q16 20, 18 16 Q20 12, 22 16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Coily hair: tight zigzag coils
export const CoilyHairIcon: React.FC<HairIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Tight coil - zigzag pattern */}
    <path
      d="M4 4 L6 8 L8 4 L10 8 L12 4 L14 8 L16 4 L18 8 L20 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M4 10 L6 14 L8 10 L10 14 L12 10 L14 14 L16 10 L18 14 L20 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M4 16 L6 20 L8 16 L10 20 L12 16 L14 20 L16 16 L18 20 L20 16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Map for easy use
export const HairTypeIcons = {
  straight: StraightHairIcon,
  wavy: WavyHairIcon,
  curly: CurlyHairIcon,
  coily: CoilyHairIcon,
};
