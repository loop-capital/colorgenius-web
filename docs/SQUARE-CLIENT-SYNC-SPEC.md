# Square Client Sync — Implementation Spec

## Overview
Add Square customer sync to COLORgenius so salons don't have to manually re-enter clients. Vish does this — we should too.

## Background
- We already have Square OAuth connected for inventory/product sync (`/api/square/sync`)
- Square Customers API is available via the same OAuth token
- We need `CUSTOMERS_READ` scope added to OAuth

## Scope

### In Scope
1. **OAuth scope update** — add `CUSTOMERS_READ` to Square OAuth flow
2. **API endpoint** — `POST /api/square/clients/sync` — pull Square customers, upsert to our `clients` table
3. **Background sync** — cron job that runs daily for all connected salons
4. **UI** — Settings page toggle for "Auto-import clients from Square"
5. **Initial import** — one-time bulk import button in Settings

### Out of Scope
- Two-way sync (Square doesn't support writing customer data via most APIs)
- Real-time webhooks for customer changes (Square webhooks are limited)
- Client merge logic when duplicates exist

## Data Mapping

### Square Customer → COLORgenius Client

| Square Field | Our Field | Notes |
|-------------|-----------|-------|
| `given_name` | `first_name` | Required |
| `family_name` | `last_name` | Optional |
| `email_address` | `email` | Optional |
| `phone_number` | `phone` | E.164 format, optional |
| `id` | `square_customer_id` | New field on clients table |
| `created_at` | `created_at` | Use Square's timestamp |
| `updated_at` | `updated_at` | Use Square's timestamp |
| `note` | `general_notes` | Optional |
| `address` | — | Skip for now |
| `company_name` | — | Skip for now |

### Upsert Logic
- Match by `square_customer_id` first
- If no match, match by `email` (to prevent duplicates)
- If still no match, create new client
- Set `salon_id` to the salon that owns the Square connection
- Set `primary_stylist_id` to the salon owner or first stylist

## API Changes

### 1. OAuth Scope Update
**File:** `lib/square-multi.ts` — `getAuthUrl()`
```typescript
scope: 'ITEMS_READ INVENTORY_READ INVENTORY_WRITE MERCHANT_PROFILE_READ PAYMENTS_READ CUSTOMERS_READ'
```

### 2. New API Endpoint
**File:** `app/api/square/clients/sync/route.ts`

```typescript
POST /api/square/clients/sync
Body: { salon_id?: string } // Optional, defaults to auth user

Response: {
  success: boolean,
  data: {
    imported: number,
    updated: number,
    skipped: number,
    errors: number,
    details: Array<{ square_id, action: 'created'|'updated'|'skipped'|'error', client_id?, error? }>
  }
}
```

**Implementation steps:**
1. Validate auth, get salon_id
2. Check Square is connected (`isConnected()`)
3. Call Square Customers API: `client.customers.list()`
4. For each customer:
   - Map fields to our client schema
   - Upsert into `clients` table
   - Log result
5. Return summary stats

### 3. Background Sync Job
**File:** New — `app/api/square/clients/sync-cron/route.ts`

```typescript
GET /api/square/clients/sync-cron
Headers: { 'x-cron-secret': process.env.CRON_SECRET }

// Loops through all connected salons and triggers sync for each
```

**Vercel Cron Config:** Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/square/clients/sync-cron",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 4. UI Toggle
**File:** `app/settings/page.tsx` (or wherever Square settings live)

Add a switch: "Auto-import clients from Square"
- When enabled, the daily cron syncs clients
- When disabled, only manual import works

Store setting in `salons.features_enabled`:
```json
{ "square_client_sync": true }
```

### 5. Manual Import Button
On the Settings → Square integration page:
- Show last sync timestamp
- "Import Clients Now" button → calls `POST /api/square/clients/sync`
- Progress indicator during import

## Database Changes

### Add field to `clients` table:
```sql
ALTER TABLE clients ADD COLUMN square_customer_id VARCHAR(255) UNIQUE;
CREATE INDEX idx_clients_square_customer_id ON clients(square_customer_id);
```

Update Prisma schema:
```prisma
model clients {
  // ... existing fields
  square_customer_id String? @unique @db.VarChar(255)
}
```

## Testing

### Manual Test Plan
1. Connect a test Square account (sandbox)
2. Create customers in Square sandbox dashboard
3. Call `POST /api/square/clients/sync`
4. Verify clients appear in `/clients` page
5. Verify clicking client name opens profile (no black screen)
6. Run sync again — verify no duplicates created
7. Update customer in Square — verify sync picks up changes

### Edge Cases
- Customer with no email → create anyway, match by square_customer_id
- Customer with phone but no email → create, match by square_customer_id
- Duplicate Square customers (same email, different IDs) → match by square_customer_id first
- Square token expired → refresh token, retry
- Rate limiting → exponential backoff (Square allows 10 req/sec)

## Acceptance Criteria
- [ ] OAuth flow includes `CUSTOMERS_READ` scope
- [ ] `POST /api/square/clients/sync` endpoint works and returns stats
- [ ] Daily cron job runs at 2 AM UTC for all connected salons
- [ ] Settings page has toggle for auto-import
- [ ] Manual import button works with progress feedback
- [ ] No duplicate clients created on repeated syncs
- [ ] Client detail page works after import (no black screen)
- [ ] `square_customer_id` stored on clients for future matching

## Files to Create/Modify

### New files:
- `app/api/square/clients/sync/route.ts`
- `app/api/square/clients/sync-cron/route.ts`

### Modified files:
- `lib/square-multi.ts` — add `CUSTOMERS_READ` scope
- `prisma/schema.prisma` — add `square_customer_id` field
- `app/settings/page.tsx` — add toggle + manual import UI
- `vercel.json` — add cron schedule

## Notes
- Square Customers API returns paginated results (100 per page)
- Max customers per Square account: 10,000
- Typical salon: 500-2,000 customers
- Expected sync time: < 30 seconds for most salons
- No webhook support for real-time sync — polling only
