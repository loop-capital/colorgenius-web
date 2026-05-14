# Vish Advanced Mixing — Complete Feature Reference

> Source: https://docs.getvish.com/docs/tablet-advanced-mixing/
> https://docs.getvish.com/docs/tablet-settings/
> Saved: 2026-05-12

---

## Multi-Formula Services

### Adding a Formula to an Existing Service
- Services can have multiple bowls/formulas
- "+ Add Bowl" under the service
- Three mixing options:
  1. **Start New Formula** — from scratch
  2. **Mix From History** — duplicate from client's previous appointment
  3. **Mix Favorite Formula** — from saved favorites

### Remove a Service
- More Options → Remove Service

### Remove a Formula
- More Options → Remove Formula
- Only if formula is empty (no products or nothing dispensed)

---

## Mix From History

- Select client → Add Service → + Add Bowl → Mix From History
- Choose a service from client's history
- Select the formula/bowl → Add to Service
- Choose % of previous formula to mix (typically 100%)
- Adjust ratio if needed → Mix Now
- **Auto-adjusts for waste** if original formula was reweighed
- Can adjust products, weights, or ratios from the original
- Can select **multiple formulas** from same appointment
- Selecting two bowls lets you view/update multiple at once

### Handling Inactive Products
- Orange alert icon + "Inactive Product" label on affected products
- Mix Now button disabled until inactive products resolved
- Two resolution options:
  1. **Manufacturer Recommended Swaps** — quick-swap with suggested replacement
  2. **Custom Replacements** — manually select any active product
- Once resolved: alerts disappear, Mix Now enabled

---

## Mix Favorite Formula

- Save frequently used formulas for a specific client
- Add to Favorites via More Options → Add To Favorites
- Select from saved list → choose % → adjust ratio → Mix Now
- Vish includes all required products with precise quantities

---

## Mix More (Partial Re-mix)

- Need more of an existing formula but only a portion
- Select client → bowl card → Mix More
- Choose **percentage** or **custom amount** of original
- "Are You Using a New Bowl?" toggle:
  - **Yes** — different bowl, calculates without waste
  - **No** — same bowl, accounts for waste in bowl
- Vish auto-calculates exact product amounts needed

### Mix More + Change Formula
- Can swap products while mixing more (e.g., change developer)
- Select Mix More → choose % → Yes (new bowl) → More → Edit Formula
- Change products → Mix Now

---

## Continue Mixing

- If logged out mid-mix, resume easily
- Select client → bowl card → Continue Mixing
- Put same bowl with product on scale
- Vish picks up where you left off

---

## Target Weight System

### Absolute Target
- Fixed amount in grams or ounces
- Set from formula builder or mixing screen

### Ratio Target
- Define ratio between one product and the rest
- Target auto-updates in real-time as product is dispensed
- Maintains specified ratio automatically

### Setting Target
- **From mixing screen:** Long press on product circle → Set Ingredient Target → enter grams/oz/ratio → Save
- **From formula builder:** Choose preset amount per product, choose developer ratio → Mix Now

---

## Overpour Recovery

### Rebalance
- If you overpour a product and want to maintain developer ratio:
  1. Ensure overpoured product is selected
  2. Tap "Balance"
  3. Total formula target adjusts while maintaining ratio
- Only works on products (developers are ratio-dependent)

### Transfer Segments
- If wrong product was selected when dispensing:
  1. Ensure wrong product is selected
  2. Press More → Transfer Segments
  3. Select how much to move → Next
  4. Select correct product to transfer to

### Remove Excess Product
- Scoop product out of bowl
- Vish updates current weight of selected ingredient
- Note: extra product NOT reflected in inventory tracking

---

## Bowl Management

### Discard Bowl
- More Options on bowl card → Discard Formula
- Marks formula as DISCARDED

### Change Service
- Three dots next to service name → Change Service
- Select new service from list

### Move Bowl
- Three dots next to formula name → Change Service
- Move to existing service or create new one

---

## Settings

### Reinstall Salon Data
- Local data copy on each device for offline operation
- Settings → Diagnostics → Reinstall Salon Data
- Downloads: manufacturers, products, clients, services
- Can operate without internet for short periods

### Connection & Scale Health
- Diagnostics tab for troubleshooting BLE scale issues

---

## Formula Statuses
- **ACTIVE** — created, currently mixing
- **REWEIGHED** — applied to client, container reweighed, complete
- **DISCARDED** — not applied, product discarded
- **CLOSED** — applied, no reweigh needed

## Cost Tracking
- Service Summary icon (white = OK, red = over allowance)
- Shows: product cost, product allowance, extra charges
- Available at any time during mixing
- $ icon to view

---

## OUR IMPLEMENTATION PRIORITY

### Must Have (Core)
1. ✅ Multi-formula per service (multiple bowls)
2. ✅ Mix from history (duplicate previous formula, auto-adjust for waste)
3. ✅ Mix more (partial re-mix with percentage)
4. ✅ Continue mixing (resume after logout)
5. ✅ Absolute target weights
6. ✅ Ratio targets (auto-calculate developer)
7. ✅ Rebalance after overpour
8. ✅ Transfer segments (wrong product correction)
9. ✅ Discard bowl
10. ✅ Formula statuses (ACTIVE, REWEIGHED, DISCARDED, CLOSED)
11. ✅ Inactive/discontinued product handling

### Should Have
12. Favorite formulas (per client)
13. Cost tracking / service summary
14. Remove excess product tracking
15. Move bowl between services
16. Change service type

### Nice to Have
17. Offline operation (local data sync)
18. Diagnostics (scale health)
19. Multiple formula selection from history
