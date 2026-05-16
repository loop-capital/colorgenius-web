# ColorGenius — Brand Integration & Commerce Partnership Spec

**Prepared for:** Professional Hair Color Manufacturers
**Date:** May 2026
**Contact:** Jason Opland, Founder — jason@colorgenius.ai
**Confidential:** For intended recipients only

---

## Executive Summary

ColorGenius is an AI-powered formulation platform helping professional stylists create precise, consistent color results. We currently support **3,000+ shades across 18 professional brands** and are preparing for public launch in Q3 2026.

**ColorGenius is brand-agnostic.** Our AI recommends the best formula for each client — regardless of which brand the salon currently uses. That means we make it easy for a salon to switch to a new brand, or to adopt one alongside their existing line. We help stylists and salons move to the brand that delivers the best results.

We're inviting select manufacturers to participate in our beta program and explore a deeper integration that goes beyond shade data — **including direct ordering through our platform.**

---

## The Opportunity

### What ColorGenius Does Today

A stylist photographs a client's hair. Our AI determines:
- Current level and tone
- Hair characteristics (texture, porosity, density)
- Optimal target shade and formula
- Mixing ratios, developer volumes, processing times
- Visual outcome simulation (expected result + fade preview)

**The formula recommendation is the moment of purchase intent.** The stylist decides what to use — and currently has to leave our app, open a separate catalog or POS, and place an order elsewhere.

### Why This Matters for Brands

ColorGenius is **brand-agnostic by design.** Our platform makes it easy for a salon to switch to a new brand — or to adopt a brand they've never used before. We help stylists and salons move to the brand that delivers the best results for each client.

This means:

1. **You're competing on results, not distribution lock-in.** If your formulas perform well in our engine, stylists will use them — even if they've never bought from you before.

2. **We bring you customers you'd never reach.** Salons that currently buy exclusively from SalonCentric or CosmoProf can now order directly from you through our platform.

3. **Switching costs are zero.** A salon using Redken today can try Wella tomorrow with one tap. The brand that wins is the one with the best formulation data in our system.

---

## Three Integration Levels

### Level 1 — Data Partner (Available Now)

**Timeline:** 4–6 weeks to launch

**What you provide:**
- Complete shade catalog (we've already built much of this from public data)
- Technical specifications (mixing ratios, developer volumes, processing times)
- Product images and swatch references

**What you get:**
- Your shade line featured in the ColorGenius formulation engine
- Quarterly usage reports: which shades are recommended most, by region, by service type
- Stylist feedback signals: formula outcomes, corrections requested, repeat usage
- Digital presence at the moment of formulation decision

**Cost to brand:** Nothing. This is foundational partnership.

---

### Level 2 — Commerce Partner + Direct Ordering

**Timeline:** 8–12 weeks from agreement

**Everything in Level 1, plus:**

#### API Integration — Direct Ordering

ColorGenius integrates with your existing e-commerce or distributor systems via API. When a stylist formulates with your products, they can:

1. **One-tap order** from the formula screen — correct shades, developers, quantities auto-calculated
2. **Auto-replenish alerts** — based on salon usage patterns, alert stylists before they run out
3. **Cart validation** — prevents ordering incompatible products (wrong developer volume, etc.)

#### Technical Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  ColorGenius    │────▶│  Integration     │────▶│  Brand/Distributor  │
│  App            │     │  Gateway (API)   │     │  E-Commerce/ERP     │
│                 │◀────│                  │◀────│                     │
│  • Formula      │     │  • Auth (OAuth)  │     │  • Inventory check  │
│  • Cart         │     │  • Order routing │     │  • Order placement  │
│  • Replenish    │     │  • Status sync   │     │  • Tracking/status  │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
```

**Supported integration methods:**
- REST API (preferred) — we call your order endpoint
- Webhook — you notify us of inventory/pricing changes
- EDI — for enterprise distributors (SalonCentric, CosmoProf, etc.)
- Embedded storefront — iframe/widget within ColorGenius

**What brands need to expose:**
- Product catalog endpoint (SKUs, pricing, availability by location)
- Order creation endpoint (or redirect to branded checkout)
- Order status webhook (confirmation, shipped, delivered)
- Inventory levels endpoint (optional, for real-time stock checks)

---

### Level 3 — Preferred Partner + Full Commerce

**Timeline:** Ongoing development

**Everything in Level 2, plus:**

#### Extended Product Ordering

Once stylists are ordering color through ColorGenius, the natural expansion is their full professional inventory:

| Category | Example Products |
|----------|-----------------|
| **Color** | Permanent, demi, semi, toners, lighteners |
| **Developers** | All volumes, dedicated brand developers |
| **Treatments** | Bond builders, protein treatments, deep conditioners |
| **Styling** | Finishing products, heat protectants, hold products |
| **Retail** | Take-home care, color-safe shampoos, conditioners |
| **Tools** | Brushes, bowls, foils, applicators |
| **Backbar** | Shampoo, conditioner, disposables |

#### Advanced Features (Level 3 Partners Only)

- **Smart inventory management** — Predict when salon will need reorder based on formulation history
- **Bundle recommendations** — "You ordered 7/43 + 20vol — add Welloxon Perfect 20vol (auto-calculated quantity)"
- **New product launches** — Targeted to salons that formulate in relevant shade ranges
- **Loyalty integration** — Brand loyalty points accrue through ColorGenius orders
- **Education triggers** — After ordering a new shade, surface relevant tutorial content

---

## Commerce Commission Structure

All commissions are charged to the manufacturer. Stylists pay the product price — no markup.

### Per-Transaction Commission

| Product Category | Standard Rate | Why |
|-----------------|--------------|-----|
| **Color & Chemicals** (permanent, demi, lighteners, toners) | **5–7%** | Core product, high volume, our primary value driver |
| **Developers & Activators** | **5%** | Adjacent to color, typically bundled with formulas |
| **Treatments** (bond builders, protein, masks) | **8–10%** | Higher margins, recommendation-driven purchases |
| **Retail** (take-home care, shampoo, conditioner) | **8–12%** | Highest margins — brands already pay 40%+ to distributors |
| **Reorders** (any category) | **3–5%** | Retention pricing — we already acquired the customer |

### Volume Tiers

Lower rates reward scale. As a brand's monthly GMV through ColorGenius increases, commission decreases:

| Monthly GMV | Color & Chemicals | Retail | Treatments |
|-------------|------------------|--------|------------|
| $0 – $10K | 7% | 12% | 10% |
| $10K – $50K | 6% | 10% | 8% |
| $50K – $200K | 5% | 8% | 7% |
| $200K+ | Custom | Custom | Custom |

### Why Manufacturers Will Pay

| What you currently pay | vs. ColorGenius |
|------------------------|-----------------|
| SalonCentric/CosmoProf: 30–50% margin | Us: 5–12% commission |
| Rep visits: $200–400/visit | Us: $0 (AI handles education) |
| Trade show booths: $50K–200K | Us: Featured placement included |
| No usage data | Us: Real-time formulation analytics |
| Distributor controls the relationship | Us: You own the direct salon relationship |

**You're currently paying 30–50% to distributors who don't tell you which salons use your products. We charge 5–12% and give you the customer data.**

---

## Additional Revenue Layers (Level 3 Partners)

Beyond transaction commissions, we offer value-add services:

| Service | Description | Pricing |
|---------|-------------|---------|
| **Featured Placement** | Top-shelf positioning in formulation results | $500–2,000/mo |
| **Data Licensing** | Formulation trends, shade demand, regional analytics | $1,000–5,000/mo |
| **New Product Launch** | Targeted promotion to salons formulating in relevant ranges | $2,000–10,000/launch |
| **API Access** | Direct integration into brand's own systems | $500–2,000/mo |
| **Co-Branded Education** | AI-driven tutorials triggered after formulation | $1,000–3,000/mo |

---

## What We Need From You

### To Get Started (Level 1)

- [ ] Complete shade catalog (we likely have 70%+ already from public data)
- [ ] Technical data sheet: mixing ratios, developers, processing times
- [ ] Product images / swatch images (for UI)
- [ ] Point of contact for technical questions

### For Ordering Integration (Level 2)

- [ ] API documentation (or preferred integration method)
- [ ] Sandbox/test environment for order flow
- [ ] Pricing and inventory data feed specification
- [ ] Legal/compliance review of order terms
- [ ] Agreement on fulfillment model (drop-ship, distributor, brand-direct)

### For Full Commerce (Level 3)

- [ ] All Level 2 requirements
- [ ] Product catalog beyond color (treatments, styling, retail, tools)
- [ ] Loyalty program API (if applicable)
- [ ] Marketing/promotional calendar for targeted campaigns
- [ ] Co-marketing agreement

---

## Timeline

| Phase | What | When |
|-------|------|------|
| **Beta (current)** | Level 1 integration — shade data in app, usage analytics flowing | Now – Aug 2026 |
| **Launch** | Public launch with Level 1 partners featured | Aug 2026 |
| **Phase 2** | Level 2 ordering integration with early partners | Q4 2026 |
| **Phase 3** | Extended product ordering, Level 3 partnerships | Q1 2027 |

---

## Why Now

1. **Stylists are already buying your products.** We're adding intelligence to a purchase they already make — we're not creating demand, we're routing it.

2. **We make switching easy.** A salon using one brand today can adopt yours tomorrow with zero friction. If your formulas perform well in our engine, you win customers you'd never reach through traditional distribution.

3. **First-mover advantage.** The first brand to integrate ordering gets default placement and co-development input on features.

4. **Data you can't get anywhere else.** We see what stylists formulate, what they correct, what they reorder. That's product development intelligence in real time.

5. **The salon software layer is consolidating.** Whoever owns the formulation moment owns the ordering decision. ColorGenius is building that layer.

---

## Next Steps

1. **Schedule a 20-minute call** to walk through the platform and discuss fit
2. **Review your shade data** — we'll show you what we've already built from public sources
3. **Identify integration level** that matches your goals and timeline
4. **Begin technical scoping** for ordering integration (Level 2+)

---

## Appendix: Current Brand Coverage

| Brand | Lines | Shades | Status |
|-------|-------|--------|--------|
| Wella | Koleston Perfect, Color Touch, Illumina, Shinefinity | 337 | ✅ Integrated |
| L'Oréal Professionnel | Inoa, Majirel, Diacolor, DiaLight | 282 | ✅ Integrated |
| Matrix | SoColor, SoColor Sync, Super Sync, Tonal Control | 358 | ✅ Integrated |
| Redken | Shades EQ, Color Gels Lacquers | 137 | ✅ Integrated |
| Schwarzkopf | IGORA ROYAL | 160 | ✅ Integrated |
| Oligo | Calura, Calura Gloss, CaluraTEN | 253 | ✅ Integrated |
| Moroccanoil | Color Rhapsody, Color Calypso | 159 | ✅ Integrated |
| Kenra | Permanent, Demi, Simply Blonde, Express, Creatives | 217 | ✅ Integrated |
| Joico | LumiShine (3 lines) | 149 | ✅ Integrated |
| Pravana | ChromaSilk, Vivids | 107 | ✅ Integrated |
| Pulp Riot | Faction8, Liquid Demi | 121 | ✅ Integrated |
| Kevin Murphy | COLOR.ME | 94 | ✅ Integrated |
| Davines | View, A New Colour, Mask with Vibrachrom | 56 | ✅ Integrated |
| L'ANZA | Healing Color | 105 | ✅ Integrated |
| Aveda | Full Spectrum | 52 | ✅ Integrated |
| Paul Mitchell | Shines XG | 67 | ✅ Integrated |
| Alfaparf | Evolution of the Color | 109 | ✅ Integrated |
| R+COLOR | Omnipresent, Stellar, Star Sign | 64 | ✅ Integrated |
| **Total** | | **3,000+** | |

---

*ColorGenius — Where Formulation Meets Commerce*

*This document is confidential and intended for the named recipient brand. Distribution without permission is prohibited.*
