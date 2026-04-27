/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme palette — slate/gray with teal accent
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Semantic colors
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        // Brand hair colors
        rose: {
          50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
          400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c',
          800: '#9f1239', 900: '#881337',
        },
        cream: {
          50: '#fdfcfb', 100: '#faf5f3', 200: '#f5ebe7', 300: '#eadcd4',
          400: '#dcc8be', 500: '#c9aca1', 600: '#b08d7c', 700: '#9a7265',
          800: '#816055', 900: '#6d5046',
        },
        gold: {
          50: '#fef9ec', 100: '#fdf0d1', 200: '#fce09f', 300: '#f9cd6a',
          400: '#f5b93e', 500: '#e8a21a', 600: '#cc8811', 700: '#a96c0e',
          800: '#895510', 900: '#714413',
        },
        mahogany: {
          50: '#fdf2f0', 100: '#fae5e1', 200: '#f5cbc4', 300: '#eeaaa1',
          400: '#e07f73', 500: '#cc5f52', 600: '#b5463a', 700: '#963a30',
          800: '#7d322a', 900: '#6b2d25',
        },
        violet: {
          50: '#f8f5ff', 100: '#eee6ff', 200: '#ddd0ff', 300: '#c4aeff',
          400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
          800: '#5b21b6', 900: '#4c1d95',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}