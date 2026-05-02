# Vish Features Research — ColorGenius Competitive Analysis

**Date:** 2026-04-27
**Purpose:** Define what Jason means by "Vish Features" for ColorGenius scope planning

---

## 1. Vish Core Features (Complete Breakdown)

Vish is an **intelligent hair color management platform** consisting of three components: **Color Bar app** (iPad for stylists), **Front Desk** (reception/POS integration), and **Dashboard** (analytics/management). It pairs with a **Bluetooth scale ($195)** to track color by weight.

### 1A. Color Bar App (Stylist-Facing)
| Feature | Description |
|---------|-------------|
| **Formula Tracking** | Weighs and records every formula down to 1/10th gram via Bluetooth scale |
| **Formula History** | Stores all past formulas per client — searchable and reusable |
| **Reweigh/Refine** | After service, weigh leftovers; Vish auto-adjusts the stored formula for next visit |
| **Plan Ahead™** | Pre-build day based on appointment schedule — see what colors you'll need before clients arrive |
| **Client Notes** | Color notes, preferences, and service history attached to client record |
| **Mix from Scratch or History** | Create new formula or pull from saved client history |

### 1B. Front Desk (POS Integration)
| Feature | Description |
|---------|-------------|
| **Auto-Charge Capture** | Exact product usage + pricing sent to POS automatically — no paper tickets |
| **Pricing Rule Enforcement** | Custom rules for how color is charged (per gram, tiered, flat + excess, etc.) |
| **15% Revenue Increase** | Salons capture previously missed color charges |
| **Eliminates Undercharging** | No more "average bowl" pricing — charge for actual product used |
| **POS Integrations** | Phorest, SalonBiz, Shortcuts, Zenoti, Insight, Meevo, saloniQ, Envision |

### 1C. Dashboard (Management/Analytics)
| Feature | Description |
|---------|-------------|
| **Employee Performance** | Per-stylist waste, cost-per-service, efficiency rankings |
| **Waste Tracking** | Identify which stylists over-dispense or over-apply |
| **Profitability Reports** | Revenue per service, cost per service, margin analysis |
| **Company-Wide Analytics** | Multi-location data aggregation |
| **Coaching Insights** | Data-driven recommendations for improving team performance |

### 1D. Inventory Module (NEW — recently launched)
| Feature | Description |
|---------|-------------|
| **Real-Time Stock Levels** | Tracks every gram mixed — auto-calculates remaining inventory |
| **Predictive Ordering** | Forecasts what you'll need based on usage patterns and seasonality |
| **SalonCentric Integration** | Direct order to SalonCentric via SalonInteractive (USA) |
| **Seasonal Adjustments** | Auto-adjusts for busy December, slow summer, seasonal tone trends |
| **Manual Stock Count** | Option to verify/override estimated levels |

### 1E. Business Model
- **Pricing:** Starts at $30/month (subscription) + $195 per Bluetooth scale
- **Onboarding:** Dedicated Customer Success rep + 30-day check-in
- **ROI Claims:** 20% ROI, 30%+ reduction in supply costs, 10%+ increase in service revenue

---

## 2. What Jason Likely Means by "Vish Features" for ColorGenius

ColorGenius is an **AI hair color formulation platform** — it tells stylists WHAT to mix. Vish is a **color management and profitability platform** — it tracks HOW MUCH was mixed and charges for it. They're complementary, not competing.

Jason likely wants ColorGenius to incorporate the **business operations layer** that Vish provides, making ColorGenius a more complete salon tool rather than just a formulation engine. Specifically:

1. **Formula Persistence + Client History** — ColorGenius generates formulas but needs to store, recall, and refine them per client across visits (Vish's core value)
2. **Cost Tracking** — Know what each bowl of color costs the salon, not just what's in it
3. **Inventory Management** — Track what's on the shelf, predict what's needed, reduce overordering
4. **POS Integration** — Auto-send charges to front desk so nothing gets missed
5. **Profitability Analytics** — Dashboard showing waste, cost-per-service, stylist performance

**Key insight:** Vish requires a physical Bluetooth scale. ColorGenius's AI photo analysis could potentially ELIMINATE the need for a scale by estimating product quantities digitally — that's a massive competitive advantage if achievable.

---

## 3. Competitive Feature Gap Analysis

### What Vish Does That ColorGenius Should Replicate

| Feature | Priority | Notes |
|---------|----------|-------|
| **Client Formula History** | 🔴 Critical | ColorGenius must store and recall past formulas per client. Without this, stylists will still need Vish or paper notes. |
| **Reweigh/Refine Loop** | 🔴 Critical | After-service adjustment of stored formula is Vish's "magic feature." ColorGenius needs a way to refine formulas based on results. |
| **Cost-per-Service Calculator** | 🟡 High | Show what each formula costs the salon based on product pricing. Essential for profitability pitch. |
| **Auto-Charge to POS** | 🟡 High | Integration with major POS systems to send charges. Eliminates missed revenue. |
| **Inventory Tracking** | 🟡 High | Track product levels based on usage. Reduce overordering. |
| **Employee Performance Dashboard** | 🟢 Medium | Per-stylist analytics. Valuable for salon owners, not individual stylists. |
| **Predictive Ordering** | 🟢 Medium | Seasonal forecasting of inventory needs. Nice-to-have at launch. |
| **Pricing Rule Engine** | 🟡 High | Allow salons to configure how they charge for color (per gram, tiered, etc.) |

### What ColorGenius Does That Vish Cannot

| Feature | Competitive Advantage |
|---------|----------------------|
| **AI Formulation** | Vish can't tell you WHAT to mix — only tracks it. ColorGenius generates the formula. |
| **Photo Analysis** | Snap a photo → analyze hair → generate formula. Vish requires manual entry. |
| **Multi-Brand Formula Library** | ColorGenius works across color lines. Vish is brand-agnostic but doesn't formulate. |
| **Learning System** | ColorGenius improves formulas over time based on outcomes. Vish only records. |
| **No Hardware Required** | Potentially eliminates the $195 Bluetooth scale dependency. |

### The Combined Product Vision

**ColorGenius + Vish Features = The Complete Color Platform**

```
┌─────────────────────────────────────────────────┐
│              COLORGENIUS (FULL STACK)             │
├─────────────────┬───────────────────────────────┤
│  FORMULATION    │  MANAGEMENT (Vish Features)    │
│  ───────────    │  ──────────────────────────    │
│  AI Photo Analysis│  Client Formula History      │
│  Formula Engine   │  Cost-per-Service Tracking   │
│  Multi-Brand      │  POS Integration             │
│  Learning System  │  Inventory Management        │
│  Color Science    │  Employee Performance         │
│                   │  Pricing Rule Engine          │
│                   │  Predictive Ordering          │
└─────────────────┴───────────────────────────────┘
```

### Recommended Build Priority

**Phase 1 (Launch):** AI Formulation + Client Formula History + Cost Calculator
**Phase 2:** POS Integrations + Inventory Tracking + Pricing Rules
**Phase 3:** Employee Dashboard + Predictive Ordering + Seasonal Analytics

---

## 4. Key Competitors in Color Management Space

| Competitor | Focus | Scale Required | Key Differentiator |
|-----------|-------|---------------|-------------------|
| **Vish** | Color measurement + profitability | Yes ($195) | Largest POS integration library |
| **SalonScale** | Color cost tracking | Yes (scale) | Simpler, cheaper alternative to Vish |
| **Meevo** | Full salon management | No | Has basic color tracking built in |
| **Phorest** | Full salon management | No | Partners with Vish for color tracking |

**Market gap:** No one combines AI formulation WITH business operations. ColorGenius filling this gap is a blue ocean opportunity.

---

## 5. Summary for Jason

"Vish Features" = the **business operations layer** around hair color:
- **Track** every formula per client (history + refinement)
- **Charge** accurately for product used (POS integration)
- **Manage** inventory in real time (no more overordering)
- **Analyze** profitability per stylist and per service

ColorGenius currently owns **formulation**. Adding Vish-style **management** features would make it the only platform that both tells stylists what to mix AND tracks what they used. That's a defensible, full-stack position no competitor currently holds.

The $195 Bluetooth scale is Vish's biggest friction point. If ColorGenius can estimate product quantities via AI (replacing the scale), that alone is a game-changer.