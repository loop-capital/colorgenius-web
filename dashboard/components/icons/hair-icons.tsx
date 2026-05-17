export function HairAssessmentIcon({ size = 24, color = '#9333EA' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth="1.5" />
      <rect x="8" y="10" width="3.5" height="7" rx="1" fill={color} />
      <rect x="12.5" y="6" width="3.5" height="11" rx="1" fill={color} />
    </svg>
  );
}

export function HairConditionIcon({ size = 24, color = '#9333EA' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5" fill="none" stroke={color} strokeWidth="1.5" />
      <path d="M10 12 L11.5 13.5 L14.5 10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
