# ColorGenius Vish Features — UI/UX Implementation Spec

**Date:** 2026-04-27
**Prepared by:** che-ui (Frontend Implementation)
**Status:** Draft — pending review by Iris (colorgenius-ceo)

---

## 1. Objective

Implement the frontend components, user interface design, and user experience flow for Vish-style business operations features within the ColorGenius platform. This transforms ColorGenius from an AI formulation engine into a complete salon color management platform.

**Scope:** Phase 1 features (Client Formula History, Cost Calculator, Basic Inventory, Pricing Rules)

---

## 2. Design System

### 2.1 Color Palette (Extended from ColorGenius Brand)

| Token | Hex | Usage |
|-------|-----|-------|
| `cg-primary` | `#6B46C1` | Primary actions, brand accent |
| `cg-primary-dark` | `#553C9A` | Hover states |
| `cg-secondary` | `#F6AD55` | Secondary actions, warnings |
| `cg-success` | `#48BB78` | Success states, confirmations |
| `cg-danger` | `#F56565` | Errors, destructive actions |
| `cg-bg` | `#F7FAFC` | Page backgrounds |
| `cg-surface` | `#FFFFFF` | Cards, modals |
| `cg-border` | `#E2E8F0` | Dividers, borders |
| `cg-text-primary` | `#1A202C` | Headings, primary text |
| `cg-text-secondary` | `#4A5568` | Body text, descriptions |
| `cg-text-muted` | `#718096` | Placeholders, hints |

### 2.2 Typography

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| H1 (Page Title) | Inter | 28px | 700 | 1.2 |
| H2 (Section) | Inter | 20px | 600 | 1.3 |
| H3 (Card Title) | Inter | 16px | 600 | 1.4 |
| Body | Inter | 14px | 400 | 1.5 |
| Caption | Inter | 12px | 500 | 1.4 |
| Mono (Data) | JetBrains Mono | 13px | 400 | 1.4 |

### 2.3 Spacing Scale

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |

### 2.4 Component Primitives

All components built on top of:
- **Base:** shadcn/ui primitives (already in ColorGenius stack)
- **Icons:** Lucide React
- **Animations:** Framer Motion for transitions
- **Tables:** TanStack Table v8
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts (for analytics)

---

## 3. Feature Screens

### 3.1 Client Formula History

**Purpose:** Store, search, and reuse past color formulas per client — the core Vish-style feature.

**Screen: `/clients/[clientId]/formulas`**

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Client                          [+ New Formula] [📷 AI]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  CLIENT: Sarah Johnson                    [Search formulas...]      │
│  ├─ Last visit: Mar 15, 2026                                        │
│  ├─ Hair: Level 6, Fine, Normal porosity                          │
│  └─ Preferences: Cool tones, No ammonia                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ FORMULA HISTORY (12 formulas)                                  │ │
│  │                                                                 │ │
│  │ ┌─────────┬────────────┬──────────┬──────────┬──────┬────────┐ │ │
│  │ │ Date    │ Service    │ Formula  │ Result   │ Cost │ Actions│ │ │
│  │ ├─────────┼────────────┼──────────┼──────────┼──────┼────────┤ │ │
│  │ │ 03/15   │ Root touch │ 6N + 20v │ ✓ Match  │ $8.40│ ↻ 📝 🗑│ │ │
│  │ │ 02/01   │ Full color │ 5A + 30v │ ✓ Match  │ $12.20│↻ 📝 🗑│ │ │
│  │ │ 12/10   │ Highlights │ Blnd+40v │ ⚠ Warm   │ $18.50│↻ 📝 🗑│ │ │
│  │ │ ...     │ ...        │ ...      │ ...      │ ...  │ ...   │ │ │
│  │ └─────────┴────────────┴──────────┴──────────┴──────┴────────┘ │ │
│  │                                                                 │ │
│  │ [View All]  [Filter by: ▼ All Time] [Service: ▼ All]          │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ 📊 FORMULA INSIGHTS                                              │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │
│  │ │ Avg Cost    │ │ Most Used   │ │ Success Rate│ │ Trending    │ │ │
│  │ │ $11.20/svc  │ │ 6N + 20v    │ │ 92% (11/12) │ │ Cooler    │ │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Interactions:**
1. **Tap formula row** → Expand detail panel (ingredients, timing, stylist notes, before/after photos)
2. **Tap ↻ (Reuse)** → Pre-fill new formula form with this formula
3. **Tap 📝 (Edit)** → Adjust and save as new version
4. **Tap 📷 AI** → Launch AI photo analysis for new formula
5. **Pull to refresh** → Sync latest from server

**Mobile-First:** Table becomes card stack on <640px

---

### 3.2 Formula Detail / Reuse Flow

**Screen: `/clients/[clientId]/formulas/[formulaId]`**

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to History                           [Reuse] [Edit] [Share] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ FORMULA: Root Touch-Up — March 15, 2026                        ││
│  │                                                                 ││
│  │  ┌─────────────┐  ┌─────────────────────────────────────┐    ││
│  │  │ 📷 Before   │  │ FORMULA COMPONENTS                    │    ││
│  │  │             │  │ ┌─────────────────────────────────┐  │    ││
│  │  │ [PHOTO]     │  │ │ Redken Shades EQ 6N     30g     │  │    ││
│  │  │             │  │ │ 20 Volume Developer     30g     │  │    ││
│  │  │             │  │ │ Redken pH Bonder        3g      │  │    ││
│  │  │             │  │ └─────────────────────────────────┘  │    ││
│  │  │             │  │                                     │    ││
│  │  │             │  │ PROCESSING: 30 min at room temp   │    ││
│  │  │             │  │ APPLICATION: Roots → 1" out       │    ││
│  │  └─────────────┘  └─────────────────────────────────────┘    ││
│  │                                                                 ││
│  │  RESULT: ✅ Color matched perfectly                             ││
│  │  ├─ Coverage: 100% gray coverage achieved                       ││
│  │  ├─ Tone: Neutral, no brass                                     ││
│  │  └─ Client satisfaction: 5/5 ⭐                               ││
│  │                                                                 ││
│  │  💰 COST BREAKDOWN:                                             ││
│  │  ├─ Product cost: $6.80                                        ││
│  │  ├─ Salon markup (2.5x): $10.20 → $17.00 charged              ││
│  │  └─ Margin: $10.20 (60%)                                       ││
│  │                                                                 ││
│  │  📝 STYLIST NOTES:                                              ││
│  │  "Sarah's roots lift easily. Added pH Bonder for integrity.     ││
│  │   Next time: could go 5 min shorter on processing."              ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.3 Cost Calculator

**Screen: `/formulas/cost-calculator`**

**Purpose:** Real-time cost estimation as formula is built.

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Formula                         [💾 Save to Client]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FORMULA COST CALCULATOR                                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ADD PRODUCTS                                                    ││
│  │ ┌─────────────────────────────────────────────────────────┐    ││
│  │ │ Product: [Redken Shades EQ ▼] Shade: [6N ▼]            │    ││
│  │ │ Amount: [____30____] g       Unit cost: $0.12/g           │    ││
│  │ │                                          [+ Add Product]  │    ││
│  │ └─────────────────────────────────────────────────────────┘    ││
│  │                                                                 ││
│  │ ┌─────────────────────────────────────────────────────────┐    ││
│  │ │ CURRENT FORMULA                                         │    ││
│  │ │ ┌────────────┬─────────┬────────┬──────────┬─────────┐ │    ││
│  │ │ │ Product    │ Shade   │ Amount │ Unit $   │ Total $ │ │    ││
│  │ │ ├────────────┼─────────┼────────┼──────────┼─────────┤ │    ││
│  │ │ │ Shades EQ  │ 6N      │ 30g    │ $0.12/g  │ $3.60   │ │    ││
│  │ │ │ Developer  │ 20 Vol  │ 30g    │ $0.08/g  │ $2.40   │ │    ││
│  │ │ │ pH Bonder  │ —       │ 3g     │ $0.25/g  │ $0.75   │ │    ││
│  │ │ ├────────────┼─────────┼────────┼──────────┼─────────┤ │    ││
│  │ │ │ TOTAL PRODUCT COST                          │ $6.75   │ │    ││
│  │ │ └────────────┴─────────┴────────┴──────────┴─────────┘ │    ││
│  │ └─────────────────────────────────────────────────────────┘    ││
│  │                                                                 ││
│  │ ┌─────────────────────────────────────────────────────────┐    ││
│  │ │ PRICING RULES                                           │    ││
│  │ │                                                         │    ││
│  │ │ Markup method: [▼ Flat multiplier]                       │    ││
│  │ │ Multiplier: [____2.5____] x                             │    ││
│  │ │                                                         │    ││
│  │ │ Service price: $6.75 × 2.5 = $16.88 → $17.00          │    ││
│  │ │ Salon margin: $10.25 (60.3%)                            │    ││
│  │ │                                                         │    ││
│  │ │ [▼ Advanced: Tiered pricing | Per-gram | Flat + excess]  │    ││
│  │ └─────────────────────────────────────────────────────────┘    ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  💡 SMART SUGGESTIONS                                               │
│  ├─ "Shades EQ 6N at $0.12/g is $0.03/g cheaper than Wella"       │
│  ├─ "This formula costs 15% less than salon average for root touch"│
│  └─ "Consider pH Bonder for clients with processed hair"           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Pricing Rule Types:**
1. **Flat Multiplier** — Cost × N = Service price
2. **Tiered** — First 20g at 3x, additional at 2x
3. **Per-Gram** — Fixed $/g rate (e.g., $0.50/g)
4. **Flat + Excess** — Base $15 + $0.30/g over 20g

---

### 3.4 Inventory Dashboard

**Screen: `/salon/inventory`**

**Purpose:** Track product stock levels, set alerts, view usage trends.

```
┌─────────────────────────────────────────────────────────────────────┐
│ INVENTORY MANAGEMENT                          [+ Add Product] ⚙️   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐       │
│  │ LOW STOCK       │ │ MONTHLY USAGE   │ │ EST. RUNOUT     │       │
│  │ 4 items         │ │ $1,240          │ │ 3 items <7 days │       │
│  │ [View All →]    │ │ [Details →]     │ │ [Reorder →]   │       │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ PRODUCT INVENTORY                                                ││
│  │                                                                  ││
│  │ [Search...] [Brand: ▼ All] [Status: ▼ All] [Sort: ▼ Name]     ││
│  │                                                                  ││
│  │ ┌──────────────────────────────────────────────────────────────┐││
│  │ │ │ Redken Shades EQ 6N │ 245g │ ─────██░░░░ 60% │ 14 days │ ● │││
│  │ │ │ Redken Shades EQ 7A │ 89g  │ ───░░░░░░░░ 30% │ 5 days  │ 🔴│││
│  │ │ │ Wella Koleston 5/0  │ 320g │ ──────███░░ 75% │ 21 days │ ● │││
│  │ │ │ 20 Vol Developer    │ 1.2L │ ──────────█ 95% │ 45 days │ ● │││
│  │ │ │ pH Bonder           │ 45g  │ ───░░░░░░░░ 25% │ 4 days  │ 🔴│││
│  │ │ └──────────────────────────────────────────────────────────────┘││
│  │ │                                                                  ││
│  │ │ Legend: ● Healthy  🟡 Reorder soon  🔴 Critical                ││
│  │ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  USAGE TRENDS (Last 30 Days)                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  $ Usage                                                        │ │
│  │  800 ┤    ╭─╮                                                   │ │
│  │  600 ┤   ╭╯ ╰╮  ╭─╮                                              │ │
│  │  400 ┤  ╭╯   ╰──╯ ╰╮                                             │ │
│  │  200 ┤ ╭╯           ╰╮                                            │ │
│  │    0 ┼─┴──┴──┴──┴──┴──┴──┴──┴── Week                            │ │
│  │        1   2   3   4   5                                        │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Stock Status Logic:**
- **Healthy** — >30% remaining, >14 days until empty
- **Reorder Soon** — 15-30% remaining, 7-14 days
- **Critical** — <15% remaining, <7 days

**Auto-calculation:** Based on formula usage logged per service.

---

### 3.5 Pricing Rules Manager

**Screen: `/salon/pricing-rules`**

**Purpose:** Configure how the salon charges for color services.

```
┌─────────────────────────────────────────────────────────────────────┐
│ PRICING RULES                                     [+ New Rule] ⚙️   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ACTIVE RULES                                                      │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ #1: Standard Color Services                                     ││
│  │ ├─ Applies to: Root touch, Full color, Partial highlights     ││
│  │ ├─ Method: Flat multiplier (2.5x product cost)               ││
│  │ ├─ Minimum charge: $25.00                                       ││
│  │ ├─ Effective: Jan 1, 2026 — Present                             ││
│  │ └─ [Edit] [Duplicate] [Archive]                                 ││
│  │                                                                 ││
│  │ #2: Premium Services (Bleach, Corrective)                       ││
│  │ ├─ Applies to: Full bleach, Color correction, Balayage          ││
│  │ ├─ Method: Flat + excess ($40 base + $0.50/g over 50g)          ││
│  │ ├─ Minimum charge: $65.00                                       ││
│  │ ├─ Effective: Jan 1, 2026 — Present                             ││
│  │ └─ [Edit] [Duplicate] [Archive]                                 ││
│  │                                                                 ││
│  │ #3: Express Services (Toner, Glaze)                            ││
│  │ ├─ Applies to: Toner, Glaze, Gloss                              ││
│  │ ├─ Method: Flat rate ($20.00)                                   ││
│  │ ├─ Effective: Feb 15, 2026 — Present                            ││
│  │ └─ [Edit] [Duplicate] [Archive]                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ RULE TEMPLATE: Tiered Pricing                                 ││
│  │                                                                 ││
│  │ Base amount: [____20____] g at [____3.0____] x                ││
│  │ Additional: [____$0.40____] /g                                ││
│  │ Cap at: [____$150____] maximum                                 ││
│  │                                                                 ││
│  │ Example: 35g formula = $20×3.0 + 15×$0.40 = $66.00             ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.6 Service Entry / "Color Bar" Mode

**Screen: `/service/new`**

**Purpose:** The primary workflow for stylists — enter a service, build formula, capture cost, save to client history.

```
┌─────────────────────────────────────────────────────────────────────┐
│ NEW COLOR SERVICE                             [Cancel] [Save] 💾   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  STEP 1: CLIENT                                                    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ [Search client...] or [+ New Client]                        │ │
│  │                                                               │ │
│  │ Sarah Johnson                    Level 6 • Fine • Last: Mar 15 │ │
│  │ ├─ Preferred: Cool tones, No ammonia                         │ │
│  │ └─ Recent formula: 6N + 20v (✅ match)                       │ │
│  │                                                               │ │
│  │ [Use last formula →]                                           │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  STEP 2: SERVICE TYPE                                              │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ [○] Root touch-up    [○] Full color    [○] Highlights        │ │
│  │ [○] Balayage         [○] Color correction [○] Toner/glaze     │ │
│  │ [○] Bleach           [○] Other: [________]                  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  STEP 3: FORMULA                                                   │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ [📷 Analyze Photo]  OR  [Build Manually →]                  │ │
│  │                                                               │ │
│  │ AI SUGGESTED FORMULA:                                         │ │
│  │ ┌───────────────────────────────────────────────────────────┐ │ │
│  │ │ Redken Shades EQ 6N     30g                               │ │ │
│  │ │ 20 Volume Developer     30g                               │ │ │
│  │ │ pH Bonder               3g                                │ │ │
│  │ │                                                           │ │ │
│  │ │ [✓ Accept]  [✏️ Adjust]  [🔄 Regenerate]                  │ │ │
│  │ └───────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  STEP 4: COST & PRICING                                            │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Product cost: $6.75                                          │ │
│  │ Pricing rule: Standard (2.5x)                               │ │
│  │ Service price: $17.00                                        │ │
│  │ Salon margin: $10.25 (60%)                                   │ │
│  │                                                               │ │
│  │ [Adjust pricing →]                                           │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  [📷 Add before photo]  [📝 Add notes]  [⏱️ Timer: 30 min]        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Post-Service Flow:**
1. Stylist taps "Complete Service"
2. Prompts for result rating (⭐1-5), notes, after photo
3. Option to "Adjust formula for next time" (refine based on result)
4. Auto-updates client history, inventory, cost analytics
5. Charge sent to POS (if integrated)

---

## 4. Component Library

### 4.1 `<FormulaCard />`

```tsx
interface FormulaCardProps {
  formula: {
    id: string;
    date: Date;
    serviceType: string;
    components: Array<{
      product: string;
      shade: string;
      amount: number; // grams
      unitCost: number;
    }>;
    totalCost: number;
    servicePrice: number;
    result: 'match' | 'close' | 'adjust' | 'fail';
    rating: number; // 1-5
    notes?: string;
    beforePhoto?: string;
    afterPhoto?: string;
  };
  onReuse: () => void;
  onEdit: () => void;
  compact?: boolean; // for list view
}
```

**States:**
- Default — Collapsed card showing date, service, cost
- Expanded — Full details with components, photos, notes
- Compact — Single row for table embedding

### 4.2 `<CostCalculator />`

```tsx
interface CostCalculatorProps {
  products: Product[];
  pricingRule: PricingRule;
  onChange: (calculation: CostCalculation) => void;
}

interface CostCalculation {
  components: FormulaComponent[];
  productCost: number;
  servicePrice: number;
  salonMargin: number;
  marginPercent: number;
}
```

### 4.3 `<InventoryItem />`

```tsx
interface InventoryItemProps {
  product: {
    id: string;
    name: string;
    brand: string;
    shade?: string;
    currentStock: number; // grams or ml
    totalCapacity: number;
    unit: 'g' | 'ml' | 'oz';
    status: 'healthy' | 'reorder' | 'critical';
    daysUntilEmpty: number;
    avgDailyUsage: number;
    lastRestocked: Date;
  };
  onRestock: () => void;
  onAdjust: () => void;
}
```

### 4.4 `<PricingRuleEditor />`

```tsx
interface PricingRuleEditorProps {
  rule?: PricingRule; // undefined = new rule
  serviceTypes: string[];
  onSave: (rule: PricingRule) => void;
}

type PricingMethod = 
  | { type: 'multiplier'; factor: number }
  | { type: 'tiered'; baseAmount: number; baseMultiplier: number; perGramRate: number; maxCap?: number }
  | { type: 'perGram'; rate: number }
  | { type: 'flatPlusExcess'; basePrice: number; includedGrams: number; excessRate: number };
```

### 4.5 `<ServiceFlow />` (Wizard)

```tsx
interface ServiceFlowProps {
  clientId?: string; // pre-selected client
  onComplete: (service: CompletedService) => void;
  onCancel: () => void;
}

interface CompletedService {
  clientId: string;
  serviceType: string;
  formula: Formula;
  costCalculation: CostCalculation;
  beforePhoto?: string;
  afterPhoto?: string;
  result: ServiceResult;
  rating: number;
  notes?: string;
  timerDuration?: number;
}
```

### 4.6 `<FormulaInsights />`

```tsx
interface FormulaInsightsProps {
  clientId: string;
  timeRange: '30d' | '90d' | '1y' | 'all';
}

// Displays:
// - Average cost per service
// - Most used formulas
// - Success rate (% "match" results)
// - Trending tones/colors
// - Cost trend over time
```

---

## 5. API Integration

### 5.1 Required API Endpoints

Based on existing ColorGenius API spec, new endpoints needed:

```
GET    /v1/clients/:id/formulas           # List formula history
POST   /v1/clients/:id/formulas           # Save new formula
GET    /v1/clients/:id/formulas/:fid      # Get formula detail
PUT    /v1/clients/:id/formulas/:fid      # Update formula
POST   /v1/clients/:id/formulas/:fid/reuse # Create from existing

GET    /v1/salon/inventory                 # List inventory
PUT    /v1/salon/inventory/:id            # Update stock
POST   /v1/salon/inventory/:id/restock    # Log restock

GET    /v1/salon/pricing-rules            # List pricing rules
POST   /v1/salon/pricing-rules            # Create rule
PUT    /v1/salon/pricing-rules/:id       # Update rule

POST   /v1/services                       # Create service entry
PUT    /v1/services/:id/complete          # Complete service

GET    /v1/analytics/cost-per-service     # Cost analytics
GET    /v1/analytics/inventory-usage       # Usage trends
```

### 5.2 Data Models

```typescript
interface Formula {
  id: string;
  clientId: string;
  stylistId: string;
  serviceType: string;
  createdAt: Date;
  components: FormulaComponent[];
  processingTime: number; // minutes
  applicationNotes?: string;
  result?: ServiceResult;
  rating?: number;
  beforePhoto?: string;
  afterPhoto?: string;
  costCalculation: CostCalculation;
}

interface FormulaComponent {
  productId: string;
  productName: string;
  shade?: string;
  amount: number; // grams
  unitCost: number;
}

interface CostCalculation {
  productCost: number;
  servicePrice: number;
  pricingRuleId: string;
  salonMargin: number;
  marginPercent: number;
}

interface InventoryItem {
  id: string;
  salonId: string;
  productId: string;
  currentStock: number;
  minStockThreshold: number;
  reorderPoint: number;
  unit: 'g' | 'ml' | 'oz';
  lastRestocked: Date;
  usageHistory: UsageRecord[];
}

interface PricingRule {
  id: string;
  salonId: string;
  name: string;
  serviceTypes: string[];
  method: PricingMethod;
  minimumCharge?: number;
  maximumCharge?: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
}
```

---

## 6. User Experience Flows

### 6.1 New Service Flow (Primary)

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Start  │───▶│  Select │───▶│  Build  │───▶│ Review  │───▶│ Complete│
│  Service│    │ Client  │    │ Formula │    │ Cost    │    │ & Save  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
    │              │              │              │              │
    │              │              │              │              ▼
    │              │              │              │         ┌─────────┐
    │              │              │              │         │ Result  │
    │              │              │              │         │ Rating  │
    │              │              │              │         │ Photo   │
    │              │              │              │         └─────────┘
    │              │              │              │              │
    │              │              │              │              ▼
    │              │              │              │         ┌─────────┐
    │              │              │              │         │ Update  │
    │              │              │              │         │ History │
    │              │              │              │         │ Deduct  │
    │              │              │              │         │ Inventory│
    │              │              │              │         │ Send POS│
    │              │              │              │         └─────────┘
    ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ SHORTCUTS:                                                          │
│ • [📷 AI Photo] → Skip to formula suggestion                        │
│ • [↻ Reuse] → Use client's last formula                             │
│ • [🕐 Quick] → Pre-set express formulas (toner/glaze)              │
└─────────────────────────────────────────────────────────────────────┘
```

**Target Time:** 60 seconds from start to saved formula

### 6.2 Formula Refinement Flow (Post-Service)

```
Service Complete ──▶ Stylist rates result (1-5) ──▶ Optional notes
       │                                              │
       ▼                                              ▼
┌──────────────┐                              ┌──────────────┐
│ Good Result? │                              │ Adjust for   │
│ (4-5 stars)  │                              │ Next Time    │
└──────────────┘                              └──────────────┘
       │                                              │
       ▼                                              ▼
┌──────────────┐                              ┌──────────────┐
│ Save as-is   │                              │ Modify:      │
│ to history   │                              │ • Processing │
│              │                              │   time       │
│              │                              │ • Amounts    │
│              │                              │ • Add/remove │
│              │                              │   products   │
│              │                              │              │
│              │                              │ Save as v2   │
└──────────────┘                              └──────────────┘
```

### 6.3 Inventory Alert Flow

```
Inventory Check (every service save)
       │
       ▼
┌─────────────────────┐
│ Deduct used amounts │
│ from stock          │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│ Check thresholds     │
└─────────────────────┘
       │
       ├──▶ Stock OK ──▶ Continue
       │
       ├──▶ Reorder Soon ──▶ 🟡 Banner: "Redken 7A low — reorder?"
       │
       └──▶ Critical ──▶ 🔴 Alert: "CRITICAL: pH Bonder < 5g remaining"
                              Action: [Order Now] [Dismiss] [Adjust threshold]
```

---

## 7. Responsive Behavior

### 7.1 Breakpoints

| Name | Width | Primary Use |
|------|-------|-------------|
| Mobile | <640px | Stylist handheld (phone) |
| Tablet | 640-1024px | Salon iPad/Tablet |
| Desktop | >1024px | Salon manager desk, reception |

### 7.2 Mobile Adaptations

- **Formula History:** Table → Card stack with swipe actions (Reuse | Edit | Delete)
- **Cost Calculator:** Full-screen modal with bottom sheet for product picker
- **Service Flow:** Single-column wizard with step indicator at bottom
- **Inventory:** List with pull-to-refresh, swipe to adjust stock
- **Charts:** Simplified sparklines instead of full graphs

### 7.3 Tablet Optimizations

- **Split-screen:** Client list left, formula detail right
- **Larger touch targets:** 48px minimum for stylus-friendly interaction
- **Landscape support:** Side-by-side formula components and cost summary

---

## 8. Accessibility

- **Keyboard navigation:** Full tab-order support for stylus-free use
- **Screen reader:** ARIA labels on all cost/metric displays
- **Color-blind safe:** Icons + text for status indicators (not color alone)
- **Touch targets:** Minimum 44px for all interactive elements
- **High contrast mode:** Supported via `prefers-contrast: high`

---

## 9. Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| First Paint | <1.5s | Critical for salon floor use |
| Formula List Load | <500ms | Local cache + server sync |
| Cost Calculation | <50ms | Client-side computation |
| Inventory Update | <200ms | Optimistic UI, background sync |
| Service Save | <1s | Includes history + inventory + POS |
| Offline Support | Full read | Create services offline, sync when connected |

---

## 10. Implementation Order

### Sprint 1: Foundation (Week 1-2)
1. Set up extended design system tokens
2. Build `<FormulaCard />` primitive
3. Build `<CostCalculator />` core logic
4. Client Formula History screen

### Sprint 2: Service Flow (Week 3-4)
1. `<ServiceFlow />` wizard component
2. New Service screen
3. Formula reuse/edit flows
4. Result capture (rating, photos, notes)

### Sprint 3: Business Ops (Week 5-6)
1. Inventory Dashboard
2. Pricing Rules Manager
3. Cost Analytics
4. Formula Insights

### Sprint 4: Polish (Week 7-8)
1. Responsive refinements
2. Offline support (localStorage/sync)
3. POS integration hooks
4. Performance optimization

---

## 11. Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "@tanstack/react-table": "^8.10.0",
    "recharts": "^2.10.0",
    "framer-motion": "^10.16.0",
    "react-hook-form": "^7.47.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "lucide-react": "^0.292.0",
    "date-fns": "^2.30.0",
    "swr": "^2.2.0",
    "zustand": "^4.4.0"
  }
}
```

---

## 12. Next Steps

1. **Review with Iris** (colorgenius-ceo) — confirm scope and priority
2. **che-design review** — visual design refinement
3. **che-dev implementation** — component build sprint
4. **che-devops setup** — API endpoint creation
5. **Pleij Salon beta test** — real-world validation with Tiché's team

---

*Document version: 1.0*
*Author: che-ui*
*Date: 2026-04-27*
