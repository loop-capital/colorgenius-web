# COLORgenius UI Components

Premium React components for the COLORgenius AI hair color formulation website.

## Components

### ColorgeniusHeader
Animated header with scroll-triggered glassmorphism effect, mobile menu, and interactive hover states.

```tsx
import { ColorgeniusHeader } from '@colorgenius/ui-components';

<ColorgeniusHeader />
```

**Features:**
- Logo entrance animation (scale + letter stagger)
- Scroll-triggered background transition (transparent → glassmorphism)
- Nav link hover underline animation
- Mobile hamburger → X morph
- CTA button with glow effect

### ColorgeniusHero
Hero section with rotating text, animated color swatches, and dual CTAs.

```tsx
import { ColorgeniusHero } from '@colorgenius/ui-components';

<ColorgeniusHero />
```

**Features:**
- Word rotation animation (3-second cycle)
- Orbiting color swatches (8 swatches, 20s rotation)
- Floating background decorations
- Social proof with avatar stack
- Dual CTA buttons with hover effects

### BeforeAfterSlider
Interactive before/after comparison slider for hair transformations.

```tsx
import { BeforeAfterSlider } from '@colorgenius/ui-components';

<BeforeAfterSlider
  beforeImage="/images/before.jpg"
  afterImage="/images/after.jpg"
  beforeLabel="Before"
  afterLabel="After"
/>
```

**Features:**
- Drag/touch slider with handle
- Smooth 300ms transitions
- Responsive design
- Accessibility labels

### ColorgeniusGallery
Full-featured hair transformation gallery with search, filters, and sorting.

```tsx
import { ColorgeniusGallery } from '@colorgenius/ui-components';

const items = [
  {
    id: '1',
    title: 'Ash Blonde Transformation',
    beforeImage: '/images/before1.jpg',
    afterImage: '/images/after1.jpg',
    colorFamily: 'Blonde',
    tone: 'Cool',
    service: 'Balayage',
    rating: 4.9,
    reviews: 47,
    likes: 234,
    stylist: 'Sarah M.',
    location: 'New York, NY',
    priceRange: '$120-180',
    badges: ['Trending', "Editor's Pick"],
  },
  // ...more items
];

<ColorgeniusGallery items={items} />
```

**Features:**
- Real-time search with auto-suggest
- Multi-category filters (color, tone, service)
- Sort options (rating, reviews, trending, recent)
- Grid/list view toggle
- Like/save functionality
- Before/After slider in cards
- Badge system (Trending, Editor's Pick, Top Rated, New)
- Empty state
- Active filter chips with clear all

### ColorgeniusPricing
Pricing section with tier cards and annual/monthly toggle.

```tsx
import { ColorgeniusPricing } from '@colorgenius/ui-components';

<ColorgeniusPricing />
```

**Features:**
- 3 pricing tiers (Starter, Professional, Enterprise)
- Annual/monthly billing toggle (20% savings)
- Highlighted "Most Popular" tier
- Feature checklist with icons
- Hover lift animation

## Installation

```bash
npm install framer-motion lucide-react tailwindcss clsx
```

## Dependencies

- `react` ^18.0.0
- `react-dom` ^18.0.0
- `framer-motion` ^11.0.0
- `lucide-react` ^0.300.0
- `tailwindcss` ^3.4.0
- `clsx` ^2.0.0

## Usage

All components are designed to work with Tailwind CSS. Ensure your project has Tailwind configured.

```tsx
import {
  ColorgeniusHeader,
  ColorgeniusHero,
  ColorgeniusGallery,
  ColorgeniusPricing,
} from '@colorgenius/ui-components';

export default function ColorgeniusPage() {
  return (
    <div className="min-h-screen bg-white">
      <ColorgeniusHeader />
      <ColorgeniusHero />
      <ColorgeniusGallery items={galleryData} />
      <ColorgeniusPricing />
    </div>
  );
}
```

## Design System

### Colors
- Primary: `#4f46e5` (indigo-600)
- Secondary: `#7c3aed` (purple-600)
- Accent: `#ec4899` (pink-500)
- Background: `#ffffff`
- Surface: `#f9fafb`
- Text: `#111827`

### Typography
- Font: Inter / system-ui
- Scale: Mobile 16px → Desktop 18px
- Weights: 400, 500, 600, 700

### Animation Easing
- Default: `cubic-bezier(0.22, 1, 0.36, 1)`
- Spring: `spring(100, 15)`

## License
MIT
