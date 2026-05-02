# COLORgenius Hair Gallery — UpLook Integration Design

## Overview
Hair transformation gallery with search, filter, review, and ranking features. Inspired by UpLook's pro directory design, adapted for COLORgenius's color transformation showcase.

---

## 1. Gallery Layout

```
┌─────────────────────────────────────────────┐
│  EXPLORE COLOR TRANSFORMATIONS              │
│  Real results from real clients             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🔍 Search colors, styles...         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │All ▼ │ │Blonde│ │Brunet│ │Red ▼ │     │
│  │      │ │ ▼    │ │te ▼  │ │      │     │
│  └──────┘ └──────┘ └──────┘ └──────┘     │
│                                             │
│  Sort: [Top Rated ▼]  [Grid ▦] [List ☰]    │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │  [🖼️ Before/After Slider]              │ │
│  │                                        │ │
│  │  Before → After (drag to compare)      │ │
│  │                                        │ │
│  ├────────────────────────────────────────┤ │
│  │  💇 Ash Blonde Transformation          │ │
│  │  ⭐ 4.9  💬 47 reviews  ❤️ 234         │ │
│  │  by Sarah M. | ColorGenius AI Match      │ │
│  │  📍 New York, NY | 💰 $120-180         │ │
│  │                                        │ │
│  │  [View Formula] [Book Similar]          │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │  [🖼️ Before/After Slider]              │ │
│  │  ...                                   │ │
│  └────────────────────────────────────────┘ │
│                                             │
│        ←  1  2  3  4  5  →                │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 2. Search Component

### Search Bar Spec
| Property | Value |
|----------|-------|
| Height | 56px (mobile) / 48px (desktop) |
| Border radius | 28px (pill shape) |
| Background | `bg-gray-50` / `bg-white` |
| Border | `border-gray-200`, focus: `border-indigo-500` |
| Icon | Search (lucide) left-aligned |
| Placeholder | "Search colors, styles, stylists..." |
| Shadow | `shadow-sm`, focus: `shadow-md shadow-indigo-100` |

### Auto-Suggest Dropdown
```
┌─────────────────────────────┐
│ 🔍 ash blo...               │
├─────────────────────────────┤
│ 💄 Ash Blonde (trending)    │
│ 💄 Ash Brown                │
│ 💄 Cool Blonde              │
│ ─────────────────────────   │
│ 👤 Sarah M. - Ash specialist│
│ 👤 Mike T. - Blonde expert  │
└─────────────────────────────┘
```

### Implementation
```tsx
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  className="relative"
>
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
  <input
    type="text"
    placeholder="Search colors, styles..."
    className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 
               focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
               transition-all duration-300"
  />
  {suggestions.length > 0 && (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100"
    >
      {suggestions.map(suggestion => (
        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer" >
          {suggestion.icon} {suggestion.text}
        </div>
      ))}
    </motion.div>
  )}
</motion.div>
```

---

## 3. Filter System

### Filter Categories
| Category | Options | Type |
|----------|---------|------|
| Color Family | All, Blonde, Brunette, Red, Black, Fantasy | Multi-select chips |
| Tone | Warm, Cool, Neutral, Ash | Toggle buttons |
| Service | Full Color, Balayage, Highlights, Root Touch-up | Checkboxes |
| Price Range | $, $$, $$$, $$$$ | Range slider |
| Location | Near me, City, State | Location picker |
| Rating | 4.0+, 4.5+, 4.8+ | Star rating filter |

### Active Filter Chips
```
┌─────────────────────────────────────────┐
│ Active: [Blonde ✕] [Cool ✕] [$$ ✕] [✕ All]│
└─────────────────────────────────────────┘
```
| Property | Value |
|----------|-------|
| Background | `bg-indigo-100 text-indigo-700` |
| Border radius | 16px (pill) |
| Remove icon | × with hover scale |
| Animation | Fade in/out |

---

## 4. Before/After Slider Component

### Interaction Design
```
┌─────────────────────────────────────────┐
│                                         │
│   [Before Image]  |  [After Image]      │
│        ↑                                │
│    Draggable divider with handle        │
│    ← → cursor on hover                  │
│                                         │
│   Labels: "Before" / "After"            │
│   Position: bottom corners              │
│                                         │
└─────────────────────────────────────────┘
```

### Slider Behavior
| Interaction | Behavior |
|-------------|----------|
| Drag | Move divider left/right |
| Click | Jump divider to cursor X |
| Touch | Single finger drag |
| Labels | Fade in on hover |
| Transition | Smooth 300ms ease-out |

### Code Structure
```tsx
<div className="relative overflow-hidden rounded-xl aspect-[4/3]" ref={containerRef}>
  {/* After image (full) */}
  <img src={after} className="absolute inset-0 w-full h-full object-cover" />
  
  {/* Before image (clipped) */}
  <div 
    className="absolute inset-0 overflow-hidden"
    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
  >
    <img src={before} className="w-full h-full object-cover" />
  </div>
  
  {/* Divider handle */}
  <motion.div
    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
    style={{ left: `${sliderPosition}%` }}
    whileHover={{ scaleX: 2 }}
  >
    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 
                    w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
      <MoveHorizontal className="w-4 h-4 text-gray-600" />
    </div>
  </motion.div>
</div>
```

---

## 5. Review & Rating System

### Rating Display
```
┌─────────────────────────────────────────┐
│                                         │
│   ⭐⭐⭐⭐⭐ 4.9 out of 5              │
│   Based on 127 reviews                  │
│                                         │
│   5 ★★★★★ ████████████████████ 89%    │
│   4 ★★★★☆ ████ 7%                     │
│   3 ★★★☆☆ █ 2%                        │
│   2 ★★☆☆☆ █ 1%                        │
│   1 ★☆☆☆☆ █ 1%                        │
│                                         │
└─────────────────────────────────────────┘
```

### Review Card
```
┌─────────────────────────────────────────┐
│  ┌────┐                                 │
│  │ 👩 │  Emily R.              ★★★★★    │
│  │pic │  Verified Client              │
│  └────┘                                 │
│                                         │
│  "The AI matched my ash blonde perfectly│
│   My stylist said the formula was spot  │
│   on. No more guessing!"                │
│                                         │
│  💇 Ash Blonde • 📍 Columbus, OH        │
│  👍 Helpful (23)  💬 Reply              │
│                                         │
│  [Before/After mini thumbnails]          │
│                                         │
└─────────────────────────────────────────┘
```

### Review Interactions
| Element | Hover Effect |
|---------|-------------|
| Helpful button | Scale 1.05, color change |
| Reply button | Underline animation |
| User avatar | Scale 1.1 |
| Photo thumbnails | Expand to lightbox |

---

## 6. Ranking Algorithm Display

### Ranking Badge System
| Badge | Criteria | Icon |
|-------|----------|------|
| 🔥 Trending | >100 likes in 7 days | Flame |
| ⭐ Top Rated | 4.9+ avg, 50+ reviews | Star |
| ✨ Editor's Pick | Curated by COLORgenius | Sparkles |
| 🆕 New | Added in last 7 days | Clock |

### Sort Options
| Option | Description |
|--------|-------------|
| Top Rated | Highest average rating |
| Most Reviewed | Most reviews |
| Trending | Recent engagement velocity |
| Recent | Newest first |
| Color Match | Closest to user's saved profile |

---

## 7. Gallery Card Animations

### Card Entrance
```
Grid load animation:
┌───┬───┬───┐
│ 1 │ 2 │ 3 │  ← Stagger: 0.1s per card
├───┼───┼───┤
│ 4 │ 5 │ 6 │  ← Fade up + scale from 0.95
├───┼───┼───┤
│ 7 │ 8 │ 9 │  ← Duration: 400ms
└───┴───┴───┘
```

### Card Hover
| Property | Default | Hover | Duration |
|----------|---------|-------|----------|
| Transform | scale(1) | scale(1.02) | 300ms |
| Shadow | sm | lg + colored | 300ms |
| Image | - | scale(1.05) inside | 500ms |
| Info overlay | opacity 0 | opacity 1 | 200ms |

### Card Component Code
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1, duration: 0.4 }}
  whileHover={{ 
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
  }}
  className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100"
>
  <div className="relative aspect-[4/3] overflow-hidden">
    <motion.img
      src={image}
      className="w-full h-full object-cover"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.5 }}
    />
    <!-- Overlay on hover -->
    <motion.div 
      className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
    >
      <div className="absolute bottom-4 left-4 right-4">
        <Button variant="secondary" className="w-full">View Formula</Button>
      </div>
    </motion.div>
  </div>
  
  <div className="p-4">
    <h3 className="font-semibold text-gray-900">{title}</h3>
    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      <span>{rating}</span>
      <span>({reviews} reviews)</span>
    </div>
  </div>
</motion.div>
```

---

## 8. Responsive Grid

| Breakpoint | Columns | Gap | Card Aspect |
|------------|---------|-----|-------------|
| Mobile (<640px) | 1 | 16px | 3:4 |
| Tablet (640-1024px) | 2 | 20px | 4:3 |
| Desktop (>1024px) | 3 | 24px | 4:3 |
| Wide (>1400px) | 4 | 24px | 4:3 |

---

## 9. Empty State

```
┌─────────────────────────────────────────┐
│                                         │
│           🔍                          │
│                                         │
│     No results found                    │
│                                         │
│     Try adjusting your filters or       │
│     search with different keywords.     │
│                                         │
│     [Clear All Filters]                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## 10. Loading States

### Skeleton Loader
```tsx
<motion.div
  animate={{ opacity: [0.5, 1, 0.5] }}
  transition={{ duration: 1.5, repeat: Infinity }}
  className="rounded-2xl bg-gray-200 aspect-[4/3]"
/>
```

### Grid Skeleton
- 6 placeholder cards
- Pulse animation
- Shimmer effect (optional)

---

## File Location
`shared/artifacts/website-design/ui-ux-specs/03-hair-gallery-spec.md`
