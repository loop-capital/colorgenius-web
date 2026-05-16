export function HexagonIcon({ size = 24, color = '#C4A35A', style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <g clipPath="url(#clip0_hex)">
        <path opacity="0.4" d="M17 3.34H7L2 12L7 20.66H17L22 12L17 3.34Z" fill={color} />
        <path d="M10.87 14H7.03L5.1 17.33L7.03 20.66H10.87L12.8 17.33L10.87 14Z" fill={color} />
        <path opacity="0.6" d="M14.34 8H7.03L3.38 14.33L7.03 20.66H14.34L18 14.33L14.34 8Z" fill={color} />
      </g>
      <defs>
        <clipPath id="clip0_hex">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}