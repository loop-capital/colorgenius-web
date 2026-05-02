# COLORgenius Motion Header — UI/UX Specification

## Overview
Premium animated header for COLORgenius website featuring smooth entrance animations, scroll-triggered effects, and interactive hover states. Designed for a beauty-tech brand that positions AI-powered hair color formulation.

---

## 1. Header Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO]  COLORgenius                    [Nav]  [CTA Btn]    │
│   ↕ scroll-glass effect                                     │
└─────────────────────────────────────────────────────────────┘
```

### Components
| Element | Purpose | Animation |
|---------|---------|-----------|
| Logo mark | Brand recognition | Fade-in + scale from 0.8 → 1.0 |
| Logo text | Brand name | Letter-by-letter reveal |
| Nav links | Wayfinding | Staggered fade-in (0.1s delay each) |
| CTA button | Conversion | Pulse glow on idle, scale on hover |
| Mobile toggle | Responsive nav | Hamburger → X morph |

---

## 2. Entrance Animations

### Sequence (on page load)
| Step | Element | Animation | Duration | Delay | Easing |
|------|---------|-----------|----------|-------|--------|
| 1 | Background | Fade from transparent | 600ms | 0ms | ease-out |
| 2 | Logo mark | Scale 0.8→1 + opacity 0→1 | 500ms | 100ms | cubic-bezier(0.22, 1, 0.36, 1) |
| 3 | Logo text | Letter stagger reveal | 400ms | 200ms | ease-out |
| 4 | Nav links | Fade up y:10→0 | 350ms | 300ms+100ms stagger | ease-out |
| 5 | CTA button | Scale 0.9→1 + glow | 400ms | 600ms | spring(100, 15) |

### Code Reference
```tsx
// Framer Motion variants
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1
    }
  }
};

const logoVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const letterVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3 }
  })
};
```

---

## 3. Scroll Effects

### Scroll-Triggered State Changes
| Scroll Position | Effect | CSS/Implementation |
|-----------------|--------|-------------------|
| 0px (top) | Transparent background, no blur | `bg-transparent backdrop-blur-none` |
| > 50px | Glassmorphism background | `bg-white/80 backdrop-blur-xl border-b border-white/20` |
| > 100px | Compact mode (reduced padding) | `py-2` (from `py-4`) |
| > 200px | Shadow appears | `shadow-lg shadow-black/5` |

### Scroll Animation Code
```tsx
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 50);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// Conditional classes
className={cn(
  "fixed top-0 w-full z-50 transition-all duration-500",
  scrolled 
    ? "bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg py-3"
    : "bg-transparent py-5"
)}
```

---

## 4. Hover Interactions

### Nav Link Hover
| Property | Value |
|----------|-------|
| Underline width | 0% → 100% |
| Duration | 300ms |
| Easing | cubic-bezier(0.22, 1, 0.36, 1) |
| Color shift | `text-gray-600` → `text-indigo-600` |

### CTA Button Hover
| Property | Value |
|----------|-------|
| Scale | 1.0 → 1.05 |
| Glow | `box-shadow: 0 0 20px rgba(99, 102, 241, 0.4)` |
| Background | Gradient shift |
| Duration | 200ms |

```tsx
<motion.button
  whileHover={{ 
    scale: 1.05,
    boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)"
  }}
  whileTap={{ scale: 0.98 }}
  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-medium"
>
  Get Started
</motion.button>
```

---

## 5. Mobile Menu Animation

### Hamburger → X Morph
```
State: Closed          State: Open
┌─────────┐           ┌─────────┐
│  ────   │           │  ╲   ╱  │
│  ────   │    →      │   ╲ ╱   │
│  ────   │           │    ╳    │
└─────────┘           └─────────┘
```

| Line | Closed | Open | Duration |
|------|--------|------|----------|
| Top | y:0, rotate:0 | y:6, rotate:45 | 300ms |
| Middle | opacity:1 | opacity:0 | 150ms |
| Bottom | y:0, rotate:0 | y:-6, rotate:-45 | 300ms |

### Menu Panel
| Animation | Value |
|-----------|-------|
| Origin | top-right |
| Scale | 0.95 → 1 |
| Opacity | 0 → 1 |
| Duration | 300ms |
| Easing | spring(300, 25) |

---

## 6. Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--header-bg` | `#ffffff` | Solid background |
| `--header-bg-transparent` | `rgba(255,255,255,0)` | Top state |
| `--header-bg-glass` | `rgba(255,255,255,0.8)` | Scrolled state |
| `--text-primary` | `#1a1a2e` | Logo, nav links |
| `--text-hover` | `#4f46e5` | Indigo-600 |
| `--cta-gradient-start` | `#4f46e5` | Indigo |
| `--cta-gradient-end` | `#7c3aed` | Purple |
| `--border-glass` | `rgba(255,255,255,0.2)` | Subtle border |

---

## 7. Typography

| Element | Font | Size | Weight | Letter-spacing |
|---------|------|------|--------|----------------|
| Logo | Inter/System | 1.5rem (24px) | 700 | -0.02em |
| Nav links | Inter/System | 0.875rem (14px) | 500 | 0 |
| CTA button | Inter/System | 0.875rem (14px) | 600 | 0.01em |

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Logo only, hamburger menu, CTA hidden |
| Tablet | 640-1024px | Logo + 3 nav items, CTA visible |
| Desktop | > 1024px | Full nav, all items visible |

---

## 9. Performance Considerations

- Use `transform` and `opacity` only for animations (GPU-accelerated)
- Implement `will-change: transform` on animated elements
- Debounce scroll listener (16ms = 60fps)
- Use CSS `contain: layout style paint` for header
- Lazy load mobile menu animation code

---

## 10. Accessibility

- Respect `prefers-reduced-motion` — disable animations
- Focus states: visible outline on all interactive elements
- ARIA labels on mobile toggle button
- Keyboard navigation support for dropdown
- Sufficient color contrast (WCAG AA)

---

## File Location
`shared/artifacts/website-design/ui-ux-specs/01-motion-header-spec.md`
