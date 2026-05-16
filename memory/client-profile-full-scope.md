# COLORgenius Client Profile — Full Scope (from Jason's discussions)

> **Last updated:** 2026-05-15
> **Source:** Forwarded conversations from @pleij_bot and @Color_Genius_Bot

## Client Profile Card — What MUST Be Included

### 1. Hair Characteristics (built ✅)
- Texture, pattern, density, porosity, natural level, natural tone, scalp condition

### 2. Chemical History (built ✅)
- Box dye, metallic salts, henna, keratin, relaxer, hard water, medication buildup
- Danger/warning/neutral color badges

### 3. Sensitivities (built ✅)
- PPD allergy, ammonia, fragrance, pregnant, breastfeeding, active chemo
- Purple/red badge colors

### 4. Last Observed (built ✅)
- Last formulated level, tone, condition, date

### 5. Notes (built ✅)
- Stylist free-form notes

### 6. Product Recommendations (NOT built ❌)
- Based on AI hair analysis
- Porosity → protein vs moisture products
- Damage level → bond-building treatments
- Gray coverage → color-safe shampoos
- Dry/brittle → biotin, collagen supplements
- Affiliate commission for stylists (opt-in toggle)
- Start manual (stylist tags products), then AI-generated

### 7. Maintenance Tips (NOT built ❌)
- Auto-generated from formula
- "Use sulfate-free shampoo for your level 8 ash blonde"
- "Deep condition weekly for porosity level high"
- Based on formula + hair profile combination

### 8. Fade Preview (NOT built ❌)
- "Expected fade: Level X ToneName in 4-6 weeks"
- Color swatch showing predicted fade
- Uses ADR-013 computeFadePreview() logic

### 9. Client Portal Link (NOT built ❌)
- Magic token URL: colorgenius.co/c/[token]
- Persistent token tied to client phone number
- No login required
- Privacy toggle: public (shareable) / private (SMS verification)

### 10. Formula History (NOT built ❌)
- Timeline of all formulations for this client
- Before/after photos from each visit
- Formula used, date, stylist name

---

## Client Portal Page (/c/[token])

### What the client sees:
| Section | Content |
|---------|---------|
| Color History | Timeline of visits — before/after photos, formula, date, stylist |
| Current Color | Latest formula, next appointment, maintenance countdown |
| Maintenance Tips | Auto-generated from their formula |
| Recommended Products | AI-based recommendations (affiliate links) |
| Stylist Card | Name, Instagram, "Book Again" button |
| Fade Preview | Expected color shift in 4-6 weeks |

### Key decisions:
- No login required (magic token)
- Persistent token (works forever, no expiry)
- Privacy toggle per client (public/private)
- SMS integration (Twilio) for sending portal links
- Stylist dashboard shows: who opened, share count, affiliate revenue

---

## Community Features (Discussed)

### Photos + Formula = Training Data
- Photos MUST require formula ID
- Not just gallery — "I used formula X, here's the result"

### Dual-Axis Rating
- Execution skill score (stylist's work)
- Formula performance score (how well it worked)

### Structured Comments
- Freeform + tagged: "too warm," "too ashy," "perfect match," "faded fast," "great gray coverage"
- Tags become AI training signals

### Formula Variations
- When colorist comments "I adjusted to use 7.1 instead of 7.0" = fork
- Fork becomes discoverable variant

### ByondEdu Badges
- Educators get special badge on profile
- Links to ByondEdu profile + course inventory
- Beta testers / founding professionals get badge too

---

## Distributor Portal (Monaco Blue)

### Value Prop
- Aggregate demand data: which shades, brands, regions
- Real-time trends for inventory optimization
- Revenue model: Free (delayed), Pro ($299/mo), Enterprise ($999/mo)

---

## Strategic Roadmap (Jason Confirmed)

### Tier 1 — Beta Launch
1. Client-Facing Color Portal ✅ (scope defined)
2. Education Layer (ByondEdu integration)
3. Stylist Dashboard Analytics

### Tier 2 — Post-Launch
4. Virtual Try-On
5. Booking Integration (Square)
6. Formula Performance AI
7. Supply Chain Integration (Monaco Blue)

### Tier 3 — Long Term
8. Client Loyalty / Color Subscription
9. Pro Certification Badge
10. Wholesale / Distributor Portal
