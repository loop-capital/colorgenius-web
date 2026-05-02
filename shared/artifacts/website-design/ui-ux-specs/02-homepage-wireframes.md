# COLORgenius Homepage — Wireframes & Mockups

## Overview
Mobile-first homepage design featuring COLORgenius AI hair color formulation value proposition. Target: 60-second service entry for mobile users. Premium beauty-tech aesthetic with warm, approachable tones.

---

## Section 1: Hero

```
┌─────────────────────────────────────────┐
│ [Header - see motion-header-spec.md]    │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  AI-Powered Hair Color          │   │
│   │  Formulation                    │   │
│   │  ─────────────────────────────  │   │
│   │  Get salon-perfect color        │   │
│   │  matched to your unique         │   │
│   │  hair profile in seconds        │   │
│   │                                 │   │
│   │  [📸 Analyze My Hair Now →]     │   │
│   │                                 │   │
│   │  ★★★★★ Trusted by 10,000+       │   │
│   │  stylists worldwide             │   │
│   └─────────────────────────────────┘   │
│                                         │
│   [Animated color swatches orbiting]    │
│                                         │
└─────────────────────────────────────────┘
```

### Elements
| Element | Description | Animation |
|---------|-------------|-----------|
| Headline | "AI-Powered Hair Color Formulation" | Word-by-word reveal, stagger 0.15s |
| Subheadline | Value prop text | Fade up, delay 0.6s |
| CTA | Primary action button | Pulse animation, scale on hover |
| Social Proof | Star rating + count | Counter animation 0→10,000 |
| Visual | Orbiting color swatches | Continuous rotation, 20s cycle |

---

## Section 2: How It Works (60-Second Flow)

```
┌─────────────────────────────────────────┐
│         HOW IT WORKS                    │
│    Perfect color in 3 simple steps        │
│                                         │
│   ┌─────┐    ┌─────┐    ┌─────┐        │
│   │ 📸  │ →  │ 🔬  │ →  │ ✨  │        │
│   │     │    │     │    │     │        │
│   │Scan │    │AI   │    │Your │        │
│   │Hair │    │Match│    │Match│        │
│   └─────┘    └─────┘    └─────┘        │
│    10s        30s        20s           │
│                                         │
│  [────────── Progress Bar ──────────]   │
│                                         │
└─────────────────────────────────────────┘
```

### Step Details
| Step | Action | Time | Icon | Color |
|------|--------|------|------|-------|
| 1 | Upload or take hair photo | 10s | Camera | Warm beige |
| 2 | AI analyzes undertone, texture, condition | 30s | Microscope | Soft coral |
| 3 | Receive custom color formula | 20s | Sparkles | Rose gold |

### Progress Indicator
- Horizontal progress bar filling as user scrolls
- Active step: scale 1.1, full opacity
- Inactive steps: scale 1.0, 50% opacity
- Connector line animates between steps

---

## Section 3: AI Technology

```
┌─────────────────────────────────────────┐
│     THE SCIENCE BEHIND THE COLOR        │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │                                 │   │
│   │   [Hair Strand Analysis Viz]    │   │
│   │   • Undertone detection         │   │
│   │   • Porosity mapping            │   │
│   │   • Damage assessment           │   │
│   │                                 │   │
│   └─────────────────────────────────┘   │
│                                         │
│   Our AI has analyzed:                  │
│   ┌──────────┐  ┌──────────┐           │
│   │ 500K+    │  │ 99.2%    │           │
│   │ Hair     │  │ Accuracy │           │
│   │ Profiles │  │ Rate     │           │
│   └──────────┘  └──────────┘           │
│                                         │
└─────────────────────────────────────────┘
```

### Stats Animation
- Numbers count up from 0 when in viewport
- Duration: 2s
- Easing: ease-out
- Format: "500K+", "99.2%"

---

## Section 4: Color Gallery (UpLook Integration Preview)

```
┌─────────────────────────────────────────┐
│   EXPLORE REAL TRANSFORMATIONS          │
│                                         │
│  [🔍 Search colors, styles...]          │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Filter: [All ▼] [Blonde ▼]     │    │
│  │ [Top Rated ▼] [Recent ▼]       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │ [🖼️] │  │ [🖼️] │  │ [🖼️] │         │
│  │Before│  │Before│  │Before│         │
│  │After │  │After │  │After │         │
│  │After │  │After │  │After │         │
│  ├──────┤  ├──────┤  ├──────┤         │
│  │❤️ 4.9│  │❤️ 4.8│  │❤️ 4.9│         │
│  │💬 128│  │💬 96 │  │💬 156│         │
│  └──────┘  └──────┘  └──────┘         │
│                                         │
│        ←  [●] [○] [○]  →              │
│                                         │
└─────────────────────────────────────────┘
```

---

## Section 5: Testimonials

```
┌─────────────────────────────────────────┐
│     WHAT STYLISTS SAY                   │
│                                         │
│   ┌───────────────────────────────┐     │
│   │ "COLORgenius cut my color      │     │
│   │  formulation time by 80%.      │     │
│   │  My clients love the results." │     │
│   │                                │     │
│   │  ★★★★★                         │     │
│   │  — Sarah M., Master Stylist    │     │
│   │    New York, NY                │     │
│   └───────────────────────────────┘     │
│                                         │
│   [Stylist portrait with verified badge]│
│                                         │
└─────────────────────────────────────────┘
```

---

## Section 6: Pricing

```
┌─────────────────────────────────────────┐
│        SIMPLE PRICING                   │
│                                         │
│   ┌───────────────┐ ┌───────────────┐   │
│   │   STARTER     │ │   PRO         │   │
│   │   $29/mo      │ │   $79/mo      │   │
│   │   ─────────   │ │   ─────────   │   │
│   │   ✓ 50 scans  │ │   ✓ Unlimited │   │
│   │   ✓ Basic     │ │   ✓ Advanced  │   │
│   │   ✓ Email     │ │   ✓ Priority  │   │
│   │               │ │   ✓ API       │   │
│   │  [Start Free] │ │  [Go Pro →]   │   │
│   │   Trial       │ │               │   │
│   └───────────────┘ └───────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Pricing Card Animation
- Cards fade in with stagger (0.2s)
- Pro card: subtle glow animation
- Hover: card lifts (translateY: -8px), shadow increases

---

## Section 7: CTA / Footer

```
┌─────────────────────────────────────────┐
│                                         │
│     READY TO PERFECT YOUR COLOR?        │
│                                         │
│    [📸 Upload Photo & Get Started]      │
│                                         │
│    No credit card required • 60s setup  │
│                                         │
├─────────────────────────────────────────┤
│  [LOGO]    Product    Company    Support │
│  AI Color  • How it   • About  • Help  │
│  Match     • Gallery  • Blog   • API   │
│  Platform  • Pricing  • Careers  • Chat │
│                                         │
│  © 2026 COLORgenius  Privacy  Terms     │
└─────────────────────────────────────────┘
```

---

## Animation Timeline (Page Load)

| Time | Element | Animation |
|------|---------|-----------|
| 0ms | Header | Slide down + fade |
| 200ms | Hero headline | Word reveal |
| 500ms | Hero subhead | Fade up |
| 700ms | CTA button | Scale + glow |
| 900ms | Social proof | Fade in |
| 1200ms | Orbiting swatches | Start rotation |
| Scroll | Sections | Fade up + scale (scroll-triggered) |

---

## Mobile-Specific (60-Second Target)

| Requirement | Implementation |
|-------------|----------------|
| One-thumb navigation | CTA at bottom of viewport |
| Large touch targets | 48px minimum tap area |
| No horizontal scroll | Vertical stacking only |
| Fast load | Lazy load below-fold |
| Quick action | "Analyze My Hair" sticky at bottom |

---

## File Location
`shared/artifacts/website-design/ui-ux-specs/02-homepage-wireframes.md`
