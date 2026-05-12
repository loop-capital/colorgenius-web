# Square Inventory/Catalog API Research
**Date:** 2026-05-03  
**Agent:** colorgenius-research  
**Purpose:** Evaluate Square APIs for ColorGenius auto-ordering integration.

---

## 1. Square Inventory API

### Endpoints
- `POST /v2/inventory/batch-change` — Adjust inventory counts programmatically (e.g., `ADJUSTMENT`, `PHYSICAL_COUNT`).
- `POST /v2/inventory/batch-retrieve-changes` — Retrieve historical inventory changes.
- `POST /v2/inventory/batch-retrieve-counts` — Get current calculated stock counts for items at specific locations.
- `GET /v2/inventory/{catalog_object_id}` — Retrieve inventory count for a single item variation.

### How Stock Works
- Inventory is tracked at the **item variation** level (not the item level).
- Stock can exist in multiple states: `IN_STOCK`, `SOLD`, `WASTED`, `RETURNED_BY_CUSTOMER`, etc.
- The API returns `calculated_at` timestamps — Square computes stock, so reads reflect the latest known state.
- `BatchChangeInventory` is used to apply adjustments (e.g., +10 units received).

### Webhooks
- `inventory.count.updated` — Fires every time a stock count changes for an item variation.
- Triggered by: sales (POS/Orders API), Dashboard manual updates, `BatchChangeInventory` calls.
- Payload includes: `merchant_id`, `location_id`, `catalog_object_id`, `quantity`, `state`, `calculated_at`.
- **Bulk updates:** One webhook can contain up to 100 counts. Larger batches span multiple notifications.
- **Webhook requirements:** HTTPS endpoint, must respond with HTTP 2xx within 10 seconds.
- **Permission needed:** `INVENTORY_READ` scope.

### Rate Limits
- Not explicitly documented as a hard number, but developer community reports **~10 requests per second per merchant** (429 responses when exceeded).
- Use batch endpoints (`BatchChangeInventory`, `BatchRetrieveCounts`) to minimize calls.
- Implement exponential backoff on 429.

### Pricing
- Square API is **free** to use. No per-call charges.
- Only fees: 1% per transaction if using the Orders API with a non-Square payment provider. Not applicable for inventory/catalog-only integrations.

---

## 2. Square Catalog API

### Endpoints
- `POST /v2/catalog/object` — Upsert a single catalog object.
- `POST /v2/catalog/batch-upsert` — Upsert up to 1,000 objects in one call.
- `POST /v2/catalog/search` — Search catalog objects by type, name, or query.
- `POST /v2/catalog/batch-delete` — Delete objects in bulk.

### Creating/Updating Products
- Catalog is item-centric. Each **CatalogItem** can have up to **250 item variations**.
- Item variations (`ITEM_VARIATION`) are what hold stock and pricing.
- To represent a product like "Redken Color Gels 6N":
  - Create a `CatalogItem` (the brand/product).
  - Create `CatalogItemVariation`(s) for size/ shade variants.
  - Inventory is tracked per variation.

### Custom Attributes
- `CUSTOM_ATTRIBUTE_DEFINITION` lets you define custom fields on catalog objects.
- Use cases: `reorderThreshold`, `supplier_name`, `par_level`, `usage_per_service`.
- Upserted via the same `BatchUpsertCatalogObjects` endpoint.
- Custom attributes are queryable via `SearchCatalogObjects`.

### Batch Operations
- `BatchUpsertCatalogObjects`: Up to **1,000 objects per call**.
- Supports temporary IDs (`#Tea`) for cross-referencing within the same batch.
- All catalog writes require an `idempotency_key`.

### Permissions
- `ITEMS_READ` — Read catalog.
- `ITEMS_WRITE` — Create/update/delete.

---

## 3. Square Orders API

### Can We Create Purchase Orders?
- **No.** The Square Orders API is for **customer-facing sales orders**, not procurement/purchase orders.
- An order can be `OPEN`, `COMPLETED`, or `CANCELED`. There is no `PURCHASE_ORDER` state.
- We **cannot** create supplier purchase orders through Square.

### What Orders API Can Do
- Record line items, calculate totals, apply taxes/discounts.
- Update inventory automatically when an order is completed.
- Retrieve orders created in Square POS or other integrations.
- Push fulfillment orders to Square POS/Dashboard.

### PO Strategy
- ColorGenius must handle purchase order creation **outside Square** (e.g., email supplier, generate PDF, send to supplier portal).
- After receiving goods, use `BatchChangeInventory` to sync stock back into Square.

---

## 4. Integration Approach Recommendation

### Source of Truth: Square
- **Sync FROM Square** (Square is the source of truth for stock levels).
- Salon staff already use Square POS to ring up sales → stock automatically decrements.
- ColorGenius reads stock from Square via `BatchRetrieveInventoryCounts` and/or listens to `inventory.count.updated` webhooks.
- ColorGenius runs its auto-ordering logic against the synced stock data and creates POs externally.
- When goods arrive, ColorGenius pushes the adjustment into Square via `BatchChangeInventory`.

### Sync Strategy
| Direction | Method | Use Case |
|---|---|---|
| Square → ColorGenius | Webhook (`inventory.count.updated`) | Near real-time stock updates |
| Square → ColorGenius | Polling `BatchRetrieveInventoryCounts` | Fallback / initial sync |
| ColorGenius → Square | `BatchChangeInventory` (`ADJUSTMENT`) | Receiving goods, restocking |
| ColorGenius → Square | `BatchUpsertCatalogObjects` | Syncing product catalog, custom attrs |

### Auth Flow: OAuth2
1. Salon owner authorizes ColorGenius via Square OAuth2 (`https://connect.squareup.com/oauth2/authorize`).
2. Redirect back with authorization code.
3. Exchange code for `access_token` + `refresh_token` (`POST /oauth2/token`).
4. Access tokens expire after **30 days** — refresh proactively.
5. Scopes needed:
   - `INVENTORY_READ` + `INVENTORY_WRITE`
   - `ITEMS_READ` + `ITEMS_WRITE`
   - `ORDERS_READ` (optional, for reading sales history)

### Webhook vs Polling
- **Primary:** Webhooks for real-time inventory changes.
- **Secondary:** Nightly polling of `BatchRetrieveInventoryCounts` to reconcile drift.
- **Why both:** Webhooks can miss events (endpoint down). Polling is the safety net.

---

## 5. What Square CAN'T Do (ColorGenius Handles)

| Need | Square Capability? | ColorGenius Must Handle |
|---|---|---|
| Supplier management | ❌ None | Supplier directory, contact info, preferred vendors |
| Purchase order creation | ❌ Not supported | Build POs, email/PDF to suppliers |
| Auto-reorder logic (thresholds, par levels) | ⚠️ Custom attrs only | Reorder engine, thresholds, forecasting |
| Supplier pricing / cost tracking | ❌ Not supported | Cost per unit, supplier-specific pricing |
| Multi-location PO splitting | ❌ Not supported | Route orders to correct supplier/location |
| Receiving workflow | ⚠️ Manual inventory adjustment | UI for colorists to confirm receipt, then sync to Square |
| Usage-based forecasting | ❌ Not supported | Track formula usage per service, project demand |

---

## Key Takeaways

1. ✅ Square can be the **live stock ledger** for salons — webhook + read API is solid.
2. ✅ Catalog API supports custom attributes (`reorderThreshold`, `supplier`, etc.) on items.
3. ✅ Batch endpoints exist for both catalog and inventory, keeping API calls efficient.
4. ❌ Square does **NOT** support purchase orders or supplier workflows. ColorGenius must own PO generation entirely.
5. ❌ Square does **NOT** have built-in reorder logic. ColorGenius must calculate thresholds and trigger orders.
6. 🟡 OAuth2 with refresh tokens is required; tokens expire every 30 days.
7. 🟡 Rate limits are soft (~10 req/sec per merchant); batch operations are essential.

**Bottom line:** Square is an excellent read/write stock ledger but a poor procurement platform. ColorGenius should treat Square as the inventory source of truth, layer its own auto-ordering intelligence on top, and push stock adjustments back into Square after receiving goods. This is a clean integration model and a legitimate differentiator vs. Vish.
