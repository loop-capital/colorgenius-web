# COLORgenius Responsive Layout — Mobile-First Design

## Overview
Mobile-first responsive layout specification achieving 60-second service entry target. All designs prioritize thumb-friendly interactions, fast load times, and immediate value delivery on mobile before scaling up to desktop.

---

## 1. Breakpoint System

| Name | Min Width | Max Width | Target Devices |
|------|-----------|-----------|----------------|
| Mobile | 0px | 639px | Phones (iPhone, Android) |
| Tablet | 640px | 1023px | iPad, small tablets |
| Desktop | 1024px | 1399px | Laptops, monitors |
| Wide | 1400px | ∞ | Large monitors, ultrawide |

---

## 2. Mobile Layout (Primary)

### Viewport Configuration
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### Base Grid
```
┌─────────────────────────┐  ← 100vw
│  margin: 16px (1rem)   │
│  ┌───────────────────┐   │
│  │   content area    │   │
│  │   max-width: 100% │   │
│  └───────────────────┘   │
│  margin: 16px (1rem)     │
└─────────────────────────┘
```

### Touch Targets
| Element | Minimum Size | Target Size |
|---------|-------------|-------------|
| Buttons | 44×44px | 48×48px |
| Links | 44×44px | 48×48px |
| Form inputs | 44px height | 56px height |
| Cards | Full width | 16px margins |
| Icons | 24×24px | 32×32px (tap) |

---

## 3. Hero Section (Mobile)

```
┌─────────────────────────┐
│ [Header - 56px]          │
│ ────────────────────────  │
│                         │
│   AI-Powered           │
│   Hair Color            │
│   Formulation          │
│                         │
│   Get salon-perfect    │
│   color in 60 seconds  │
│                         │
│ ┌─────────────────────┐│
│ │ 📸 Analyze My Hair  ││
│ │                    →  ││
│ └─────────────────────┘│
│                         │
│   ★★★★★ 10K+ stylists │
│                         │
│ [Color swatches orbit] │
│                         │
└─────────────────────────┘
```

### Mobile Hero Specs
| Property | Value |
|----------|-------|
| Padding top | 80px (below fixed header) |
| Text alignment | Center |
| Headline size | 2.25rem (36px) |
| Headline weight | 700 |
| Line height | 1.1 |
| CTA width | 100% - 32px |
| CTA height | 56px |
| CTA border radius | 28px |
| Swatch size | 48px diameter |
| Swatch orbit | 150px radius |

---

## 4. Sticky CTA (Mobile-First Pattern)

```
┌─────────────────────────┐
│                         │
│   [Page content...]     │
│                         │
│                         │
├─────────────────────────┤  ← Sticky bottom
│ ┌─────────────────────┐ │
│ │ 📸 Analyze My Hair →│ │  ← Fixed bottom
│ └─────────────────────┘ │
└─────────────────────────┘
```

### Sticky CTA Behavior
| Trigger | Behavior |
|---------|----------|
| Scroll > 100px | CTA becomes sticky bottom |
| Scroll < 100px | CTA in normal flow |
| Tap CTA | Smooth scroll to upload section |
| Keyboard open | CTA hides (prevents overlap) |

```tsx
const [showStickyCTA, setShowStickyCTA] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setShowStickyCTA(window.scrollY > 100);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

{showStickyCTA && (
  <motion.div
    initial={{ y: 100 }}
    animate={{ y: 0 }}
    exit={{ y: 100 }}
    className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50"
  >
    <Button className="w-full h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600">
      📸 Analyze My Hair Now →
    </Button>
  </motion.div>
)}
```

---

## 5. How It Works (Mobile)

```
┌─────────────────────────┐
│ HOW IT WORKS            │
│ In 3 simple steps       │
│                         │
│ ┌─────────────────────┐ │
│ │  ①  📸             │ │
│ │                     │ │
│ │  Scan Your Hair    │ │
│ │  Take a photo or   │ │
│ │  upload existing   │ │
│ │                     │ │
│ │  ─── 10 seconds ─── │ │
│ └─────────────────────┘ │
│          ↓              │
│ ┌─────────────────────┐ │
│ │  ②  🔬             │ │
│ │                     │ │
│ │  AI Analysis       │ │
│ │  Our AI detects    │ │
│ │  undertones & more │ │
│ │                     │ │
│ │  ─── 30 seconds ─── │ │
│ └─────────────────────┘ │
│          ↓              │
│ ┌─────────────────────┐ │
│ │  ③  ✨             │ │
│ │                     │ │
│ │  Get Your Match    │ │
│ │  Personalized      │ │
│ │  color formula     │ │
│ │                     │ │
│ │  ─── 20 seconds ─── │ │
│ └─────────────────────┘ │
│                         │
│  Total: 60 seconds ⏱️  │
│                         │
└─────────────────────────┘
```

### Step Card Animation
- Cards stack vertically
- Each card: full width, 16px margin
- Entrance: slide up + fade (stagger 0.2s)
- Connector: animated line between cards
- Number: pulse animation on scroll into view

---

## 6. Gallery Section (Mobile)

```
┌─────────────────────────┐
│ TRANSFORMATIONS         │
│                         │
│ ┌─────────────────────┐ │
│ │ 🔍 Search...        │ │
│ └─────────────────────┘ │
│                         │
│ ┌────┐ ┌────┐ ┌────┐ │
│ │All │ │Blo…│ │Brun│ │  ← Horizontal scroll
│ └────┘ └────┘ └────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ [Before/After]      │ │
│ │                     │ │
│ │ Drag to compare →   │ │
│ │                     │ │
│ ├─────────────────────┤ │
│ │ Ash Blonde          │ │
│ │ ⭐ 4.9 💬 47        │ │
│ │ by Sarah M.         │ │
│ │                     │ │
│ │ [View] [Book]       │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ [Before/After]      │ │
│ │ ...                 │ │
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

### Mobile Gallery Features
| Feature | Mobile Adaptation |
|---------|------------------|
| Filter chips | Horizontal scroll |
| Before/After | Touch-drag slider |
| Cards | Full width, vertical stack |
| Images | 4:3 aspect ratio |
| Buttons | Stack vertically |
| Pagination | Infinite scroll |

---

## 7. Tablet Layout (640px-1023px)

```
┌─────────────────────────────────┐
│ [Header]                        │
│ ─────────────────────────────── │
│                                 │
│   AI-Powered    [Orbit swatches]│
│   Hair Color           ┌───┐   │
│   Formulation          │🟡 │   │
│                        │  🟤│   │
│   Get salon-perfect    └───┘   │
│   color matched...              │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📸 Analyze My Hair Now →  │ │
│ └─────────────────────────────┘ │
│                                 │
│   ★★★★★ Trusted by 10K+       │
│                                 │
└─────────────────────────────────┘
```

### Tablet Changes
| Element | Mobile | Tablet |
|---------|--------|--------|
| Hero layout | Stacked | Side-by-side |
| Headline size | 36px | 48px |
| CTA width | Full | Auto (min 280px) |
| Gallery grid | 1 col | 2 col |
| Filter chips | Horizontal | Wrap |
| Pricing cards | Stacked | Side-by-side |

---

## 8. Desktop Layout (1024px+)

```
┌─────────────────────────────────────────────┐
│ [Header with full nav]                      │
│ ─────────────────────────────────────────── │
│                                             │
│   ┌─────────────────┐  ┌─────────────────┐ │
│   │ AI-Powered      │  │                 │ │
│   │ Hair Color      │  │    [3D Color    │ │
│   │ Formulation     │  │     Swatches    │ │
│   │                 │  │     Orbiting    │ │
│   │ Get salon-      │  │     Animation]  │ │
│   │ perfect color   │  │                 │ │
│   │ in 60 seconds   │  │                 │ │
│   │                 │  │                 │ │
│   │ [Analyze My    │  │                 │ │
│   │  Hair →]        │  │                 │ │
│   │                 │  │                 │ │
│   │ ★★★★★ 10K+     │  │                 │ │
│   │ stylists        │  │                 │ │
│   └─────────────────┘  └─────────────────┘ │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │ HOW IT WORKS                        │  │
│   │                                     │  │
│   │  [📸]      [🔬]      [✨]         │  │
│   │  Scan      AI        Get           │  │
│   │  10s       Match     Match         │  │
│   │  ─────────────────────────────────│  │
│   └─────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### Desktop Enhancements
| Feature | Implementation |
|---------|---------------|
| 3D swatches | Three.js / CSS 3D transforms |
| Parallax scrolling | Multi-layer depth |
| Hover previews | Before/After on hover |
| Full navigation | All links visible |
| Gallery sidebar | Filters on left, content on right |
| Multi-column grid | 3-4 columns |

---

## 9. Typography Scale

### Mobile
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 (Hero) | 36px | 700 | 1.1 |
| H2 (Section) | 28px | 700 | 1.2 |
| H3 (Card) | 20px | 600 | 1.3 |
| Body | 16px | 400 | 1.6 |
| Caption | 14px | 400 | 1.5 |
| Button | 16px | 600 | 1 |

### Desktop
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 (Hero) | 64px | 700 | 1.05 |
| H2 (Section) | 48px | 700 | 1.1 |
| H3 (Card) | 24px | 600 | 1.3 |
| Body | 18px | 400 | 1.6 |
| Caption | 14px | 400 | 1.5 |
| Button | 16px | 600 | 1 |

---

## 10. Spacing Scale

| Token | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| Section padding | 64px | 80px | 120px |
| Content max-width | 100% | 640px | 1200px |
| Grid gap | 16px | 24px | 32px |
| Card padding | 16px | 24px | 32px |
| Header height | 56px | 64px | 72px |

---

## 11. Animation Adaptations

### Mobile (Reduced)
| Animation | Desktop | Mobile |
|-----------|---------|--------|
| Swatch orbit | 3D, 20s | 2D, 30s |
| Parallax layers | 5 layers | 2 layers |
| Hover effects | Full | Tap effects |
| Page transitions | Slide | Fade |
| Scroll animations | Complex | Simplified |

### Performance
- Use `transform` and `opacity` only
- Disable complex animations on low-power mode
- Respect `prefers-reduced-motion`
- Lazy load below-fold animations

---

## 12. 60-Second Service Entry Target

### Entry Flow
```
User lands → See value prop (3s)
    ↓
See CTA → Tap "Analyze My Hair" (5s)
    ↓
Camera opens → Take photo (15s)
    ↓
Photo uploads → Processing (20s)
    ↓
Results display → Color formula shown (17s)
    ↓
Total: ~60 seconds
```

### Optimization Checklist
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Image optimization (WebP, lazy)
- [ ] Code splitting by route
- [ ] Service worker for caching
- [ ] CDN for assets

---

## File Location
`shared/artifacts/website-design/ui-ux-specs/04-responsive-layout.md`
