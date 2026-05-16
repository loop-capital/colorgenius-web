# Salon Brand Configuration & Pricing Model

> **Status:** Active — May 16, 2026
> **Product Owner:** COLORgenius
> **Revenue Model:** Subscription + Upsell

---

## Overview

Every salon should ONLY see the brands they actually stock. This prevents formula waste, builds trust, and creates a clear upsell revenue stream.

**Default:** 3 brands included with base subscription.
**Upsell:** $5–$10/month for each additional brand beyond 3.

---

## Pricing Tiers

| Plan | Price | Brands | Best For |
|------|-------|--------|----------|
| **Starter** | $29/mo | 1 brand | Solo stylists, chair renters |
| **Salon** | $49/mo | 3 brands | Small salons (most common) |
| **Pro** | $79/mo | 5 brands | Multi-brand salons |
| **Elite** | $119/mo | Unlimited | Color schools, chains |

---

## Upsell Flow

When a salon tries to add a 4th brand:

1. **Block the action** with a clear message:
   > "Your current plan includes 3 brands. Upgrade to Pro ($79/mo) for 5 brands, or add this brand for $7.50/mo."

2. **One-click upgrade** via Square:
   - Call `POST /api/subscription/upgrade` with `targetBrand: "Matrix"`
   - Square processes prorated charge
   - Immediately unlocks the brand

3. **Prorated billing:** Charge only for remaining days in cycle

---

## Database Configuration

### `salons` Table

| Field | Type | Description |
|-------|------|-------------|
| `subscription_tier` | `String` | `starter`, `salon`, `pro`, `elite` |
| `subscription_seats` | `Int` | Number of stylist seats |
| `subscription_expires_at` | `DateTime` | When to enforce limits |
| `preferred_brands` | `String[]` | Active brand slugs |
| `max_brands` | `Int` | Computed from tier |

### `salon_brand_usage` Table (new)

Tracks which brands are active and when they were added:

| Field | Type | Description |
|-------|------|-------------|
| `salon_id` | `UUID` | FK → salons |
| `brand_slug` | `String` | Brand identifier |
| `added_at` | `DateTime` | When activated |
| `added_by` | `UUID` | Stylist who added it |
| `price_tier` | `String` | `included`, `premium` |

---

## API Endpoints

### `GET /api/user/brands`

Returns brands the salon is allowed to use:

```json
{
  "brands": ["Davines", "L'ANZA", "Schwarzkopf"],
  "source": "salon",
  "tier": "salon",
  "included_brands": 3,
  "used_brands": 3,
  "can_add_more": false
}
```

### `POST /api/salons/brands/add`

Attempt to add a brand:

**Request:**
```json
{ "brand": "Matrix" }
```

**Success (if included in tier):**
```json
{ "success": true, "brand": "Matrix", "tier": "salon" }
```

**Blocked (would exceed limit):**
```json
{
  "error": "BRAND_LIMIT_REACHED",
  "message": "Your Salon plan includes 3 brands. Upgrade to add more.",
  "upgrade_url": "/settings/billing/upgrade?target=pro",
  "add_on_price": 750  // cents
}
```

### `POST /api/subscription/upgrade`

One-click upgrade:

```json
{
  "target_tier": "pro",
  "target_brand": "Matrix"  // optional, for add-on
}
```

---

## Implementation Status

- [x] Hardcoded per-salon config in `lib/products.ts` (temporary)
- [x] Formulate page fetches salon brands from API
- [x] Tiche's account restricted to Davines, L'ANZA, Schwarzkopf
- [ ] Database-driven brand limits (salon table `max_brands` column)
- [ ] Square integration for upsell payments
- [ ] Admin dashboard for adding/removing brands per salon
- [ ] Auto-downgrade when subscription expires
- [ ] Brand add-on analytics (MRR from brand upsells)

---

## Migration Path

1. **Now:** Per-salon hardcoded config in `lib/products.ts`
2. **Week 1–2:** Add `max_brands` column to `salons` table
3. **Week 2–3:** Build Square checkout for brand add-ons
4. **Week 3–4:** Build admin dashboard for salon management
5. **Week 4+:** Remove hardcoded config, use database only

---

## Revenue Projection

| Scenario | Salons | Avg Brands/Extra | Price | Monthly MRR |
|----------|--------|------------------|-------|-------------|
| Conservative | 50 | 1 extra | $7.50 | $375 |
| Moderate | 200 | 2 extra | $7.50 | $3,000 |
| Aggressive | 500 | 2 extra | $7.50 | $7,500 |

---

## Related

- [Brand Integration Spec](./BRAND-INTEGRATION-ORDERING-SPEC.md)
- [Square Integration](./SQUARE-SETUP.md)
- [Salon Onboarding](./SALON-ONBOARDING.md)

---

*Last updated: May 16, 2026*
