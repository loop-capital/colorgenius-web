# COLORgenius Website UI/UX Design Specifications

## Overview
Complete design system for COLORgenius — an AI-powered hair color formulation platform. This directory contains all UI/UX specifications, wireframes, component designs, and copy guidelines.

## File Structure

```
ui-ux-specs/
├── README.md                    # This file — design system overview
├── 01-motion-header-spec.md     # Animated header with scroll effects
├── 02-homepage-wireframes.md    # Homepage sections & layouts
├── 03-hair-gallery-spec.md      # UpLook-inspired gallery with search/filter
├── 04-responsive-layout.md      # Mobile-first responsive design
└── 05-persuasive-copy.md        # Conversion-focused microcopy
```

## Design Principles

1. **Mobile-First**: Primary experience optimized for mobile; 60-second service entry target
2. **Motion Delight**: Smooth animations enhance understanding, not distract
3. **Trust-First**: Social proof, stats, and testimonials prominently displayed
4. **Conversion-Focused**: Every element guides toward "Analyze My Hair" CTA

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#4f46e5` | Buttons, links, accents |
| Primary Dark | `#4338ca` | Hover states |
| Secondary | `#7c3aed` | Gradients, highlights |
| Accent | `#ec4899` | Badges, notifications |
| Background | `#ffffff` | Main background |
| Surface | `#f9fafb` | Cards, sections |
| Text Primary | `#111827` | Headlines |
| Text Secondary | `#6b7280` | Body text |

## Typography

- **Font Family**: Inter / system-ui
- **Scale**: Mobile 16px base → Desktop 18px base
- **Weights**: 400 (body), 500 (medium), 600 (semibold), 700 (bold)

## Animation Easing

| Name | Value | Usage |
|------|-------|-------|
| Default | `cubic-bezier(0.22, 1, 0.36, 1)` | Most animations |
| Spring | `spring(100, 15)` | Interactive elements |
| Bounce | `spring(300, 25)` | Buttons, cards |

## Responsive Breakpoints

| Name | Width | Columns | Key Changes |
|------|-------|---------|-------------|
| Mobile | <640px | 1 | Stacked, full-width CTA |
| Tablet | 640-1023px | 2 | Side-by-side hero |
| Desktop | 1024-1399px | 3 | Full nav, multi-column |
| Wide | >1400px | 4 | Maximum content width |

## Component Inventory

| Component | Location | Status |
|-----------|----------|--------|
| ColorgeniusHeader | `../ui-components/ColorgeniusHeader.tsx` | ✅ Complete |
| ColorgeniusHero | `../ui-components/ColorgeniusHero.tsx` | ✅ Complete |
| BeforeAfterSlider | `../ui-components/BeforeAfterSlider.tsx` | ✅ Complete |
| ColorgeniusGallery | `../ui-components/ColorgeniusGallery.tsx` | ✅ Complete |
| ColorgeniusPricing | `../ui-components/ColorgeniusPricing.tsx` | ✅ Complete |
| index.ts | `../ui-components/index.ts` | ✅ Complete |

## Integration Notes

### Dependencies
- `framer-motion` — Animation library
- `lucide-react` — Icons
- `tailwindcss` — Styling
- `clsx` / `cn` — Class merging

### Usage Example
```tsx
import { ColorgeniusHeader, ColorgeniusHero, ColorgeniusGallery, ColorgeniusPricing } from '@/components/ui';

export default function ColorgeniusPage() {
  return (
    <>
      <ColorgeniusHeader />
      <ColorgeniusHero />
      <ColorgeniusGallery items={galleryData} />
      <ColorgeniusPricing />
    </>
  );
}
```

## Next Steps

1. ✅ Design specifications complete
2. ⬜ Implement in Next.js project
3. ⬜ Add real gallery data
4. ⬜ Connect AI analysis API
5. ⬜ User testing & iteration

---

*Last updated: 2026-04-27*
*Designer: che-ui (Website Builder Specialist)*
