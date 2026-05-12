# ADR-004: Client Formula History + Inventory Tracking System

## Status
**Proposed**

## Context
ColorGenius is evolving from a standalone formulation engine into a full salon workflow platform. Stylists need three connected capabilities: (1) per-client formula history they can reference and reuse, (2) inventory tracking that depletes stock as products are mixed, and (3) profit visibility derived from actual product consumption rather than gut feel. This ADR records the architecture decisions for these systems.

## Decision

### 1. Track inventory at the formula level, not just salon-level

We decompose every formula into `FormulaLine` records (each product + amount), and record actual consumption in a `UsageLog` table that links a product to a specific formula, staff member, and client. This gives us exact per-service cost and per-product depletion, rather than estimating from bulk salon purchases.

**Schema pattern:**
- `Formula` — the recipe (name, hair state context, target result)
- `FormulaLine` — each product in the recipe (product reference, grams, developer volume, ratio, sort order)
- `UsageLog` — actual consumption event (staff, product, grams used, formula context, cost snapshot)
- `ClientFormulaUsage` — the visit-level container linking a formula to a client visit, with outcome rating and notes

**Why not salon-level only?** Salon-level stock tracking tells you when to reorder. Formula-level tracking tells you *which client cost what*, *which colorist is efficient*, and *which formulas are profitable*. It also enables automatic per-service cost calculation without manual entry.

### 2. Use Acaia Luna/Pearl Bluetooth scales instead of proprietary Vish hardware

Vish markets a $195 Bluetooth scale, but the hardware is a rebranded Acaia Pearl/Luna scale — the same scales used in specialty coffee. Acaia sells the Pearl Model S for $150–220 with an open, documented Bluetooth API.

**Why Acaia over Vish:**
- **Zero switching cost for existing Vish salons** — they already own the hardware; we just connect to it via a different app
- **Open API** — no proprietary lock-in; we control the integration and can extend it (e.g., tare-by-bowl, auto-product detection)
- **Cost advantage** — one-time hardware purchase vs. Vish's $195 scale + $150/month platform fee
- **Laboratory-grade accuracy** — 0.1g precision, 30+ hour battery, proven in high-moisture environments
- **Future flexibility** — if we later build our own scale firmware or partner with a manufacturer, the API contract stays the same

### 3. Separate `ClientVisit` from `Formula` (one visit may trigger multiple formulas)

A single client appointment often requires multiple formulations: base color, root touch-up, toning gloss, or corrective work. We model this as:

- `ClientVisit` — the appointment container (date, service type, stylist, client satisfaction, stylist notes, photos)
- `ClientFormulaUsage` — one per formula applied during that visit, linking to the reusable `Formula` recipe and recording actual outcome
- `UsageLog` — the granular product consumption, tied to `ClientFormulaUsage`

**Why separate?** A reusable formula (e.g., "Eiza's Root Melt") may be used across many visits. A visit may use 2–4 formulas. Without separation, we'd either duplicate formula data per visit (unmaintainable) or lose visit-level context (no outcome tracking, no visit photos). The `ClientFormulaUsage` bridge table captures per-visit tweaks and outcomes without polluting the reusable formula record.

### 4. Derive profit tracking from usage logs, not manual entry

Per-service profit = service price − actual product cost. We compute this automatically:

1. When a formula is saved/applied, `FormulaLine` records predict product amounts
2. When a stylist weighs products on the Acaia scale, `UsageLog` records capture actual grams consumed
3. Each `UsageLog` stores a `unitCostCentsAtUse` snapshot (cost at time of mixing, protecting against later price changes)
4. Profit = `PricingRule.basePrice` + (`PricingRule.pricePerOz` × formula complexity) − Σ(`UsageLog.amountGrams` × `unitCostCentsAtUse`)

**Why not manual entry?** Manual cost entry is forgotten, rounded, and gamed. Weight-based logging is objective, automatic if the scale is used, and creates an immutable audit trail. It also drives the inventory system: stock depletes in real time as usage logs are recorded.

## Consequences

### Positive
- **Accurate per-service profitability** — no guessing; every service has exact cost and margin
- **Inventory auto-depletion** — stock levels update automatically as products are weighed and used
- **Formula reusability** — formulas are independent reference data; visits are event data
- **Zero hardware lock-in** — open scale API means we own the integration, not a vendor
- **Audit trail** — `StockTransaction` + `UsageLog` + `unitCostCentsAtUse` = complete cost history for accounting
- **Competitive moat** — Vish charges $150+/mo for this; we bundle it into ColorGenius's core platform fee

### Negative
- **Requires scale discipline** — profit accuracy depends on stylists actually weighing products; without the scale, we fall back to `FormulaLine` estimates (less accurate but functional)
- **Schema complexity** — five tables (`Formula`, `FormulaLine`, `ClientFormulaUsage`, `UsageLog`, `StockTransaction`) instead of one simple "client history" table
- **Data migration burden** — if salons switch from Vish, they lose historical usage data (Vish doesn't export granular logs); we can import formulas but not past costs
- **Initial cost tracking lag** — until a salon has used a product at least once, `unitCostCentsAtUse` must be estimated from `Product.unitCostCents`

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **Vish proprietary scale + API** | Closed ecosystem; $150/mo minimum; no API access without partnership; rebranded Acaia hardware anyway |
| **Salon-level inventory only** | Cannot compute per-service profit; no per-client cost history; no accountability for waste |
| **Merge ClientVisit into Formula** | Would duplicate formula data for multi-formula visits or lose per-visit outcome context |
| **Manual cost entry per service** | Stylists won't do it consistently; data becomes garbage within weeks |
| **No Bluetooth scale (AI estimate only)** | Interesting long-term, but current AI cannot estimate grams accurately enough for inventory; maybe Phase 2 |

## Future Considerations

- **Smart bowl integration** — Acaia API supports tare-by-bowl; we could auto-detect which product is being weighed by bowl selection in the app
- **Predictive ordering** — With 3+ months of `UsageLog` data, we can forecast reorder points per product per salon
- **Manufacturer data partnerships** — Aggregated, anonymized usage data becomes valuable to manufacturers for trend forecasting (revenue stream)
- **AI quantity estimation** — If on-device photo analysis ever estimates product needs accurately, we could reduce scale dependency for simple services
- **Multi-salon roll-up** — For owners with 2+ locations, `UsageLog` + `StockTransaction` enable consolidated P&L by location

## Related
- ADR-004 (Camera Capture) — photo analysis feeds formula creation, which feeds inventory consumption
- `packages/api/prisma/schema.prisma` — `Formula`, `FormulaLine`, `ClientFormulaUsage`, `UsageLog`, `Product`, `StockTransaction` models
- `memory/2026-05-03.md` — Bluetooth scale research and hardware decision rationale
- `memory/colorscience-bootstrap-spec.md` — original platform vision including end-to-end workflow

## Decision Owner
Iris (colorgenius-ceo) via delegation to colorgenius-architect

## Date
2026-05-03
