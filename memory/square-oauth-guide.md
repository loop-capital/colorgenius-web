# Square OAuth2 Integration Guide

## 1. OAuth2 Flow

```
authorize URL → user grants → callback with code → exchange for tokens → store tokens
```

### Step 1: Build the Authorization URL
```
GET https://connect.squareup.com/oauth2/authorize
```
Query params:
| Param | Value |
|-------|-------|
| `client_id` | Your Square Application ID |
| `scope` | `INVENTORY_READ INVENTORY_WRITE ITEMS_READ ITEMS_WRITE APPOINTMENTS_ALL_READ` |
| `redirect_uri` | Your registered callback URL |
| `state` | CSRF token (store in session, verify on callback) |

### Step 2: Handle the Callback
Square redirects to your `redirect_uri` with:
```
?code=AUTHORIZATION_CODE&state=STATE_VALUE
```

Verify `state` matches. Extract `code`.

### Step 3: Exchange Code for Tokens
```bash
curl -X POST https://connect.squareup.com/oauth2/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "YOUR_APP_ID",
    "client_secret": "YOUR_APP_SECRET",
    "code": "AUTHORIZATION_CODE",
    "grant_type": "authorization_code",
    "redirect_uri": "YOUR_REDIRECT_URI"
  }'
```

Response:
```json
{
  "access_token": "EAAAl...",
  "token_type": "bearer",
  "expires_at": "2026-06-03T03:55:00Z",
  "refresh_token": "EQAA1...",
  "merchant_id": "MLY..."
}
```

### Step 4: Store Tokens
Save to `SquareConnection` record (see Prisma model below).

---

## 2. Required Scopes

| Scope | Purpose |
|-------|---------|
| `INVENTORY_READ` | Read current stock counts |
| `INVENTORY_WRITE` | Adjust inventory (receives/audits) |
| `ITEMS_READ` | Read catalog items (color products) |
| `ITEMS_WRITE` | Create/update catalog items |
| `APPOINTMENTS_ALL_READ` | Read all bookings across staff |

---

## 3. Token Refresh

- **Refresh tokens expire after 30 days** of inactivity
- **Access tokens expire after 30 days** (or on refresh)
- Exchange refresh token **before** any API call if `expiresAt` is within 24h

```bash
curl -X POST https://connect.squareup.com/oauth2/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "YOUR_APP_ID",
    "client_secret": "YOUR_APP_SECRET",
    "refresh_token": "EXISTING_REFRESH_TOKEN",
    "grant_type": "refresh_token"
  }'
```

Response returns **new** `access_token`, `refresh_token`, and `expires_at`. **Update all fields** in the DB — the old refresh token is invalidated.

---

## 4. Prisma Model

```prisma
model SquareConnection {
  id           String   @id @default(uuid())
  userId       String   @unique  // ColorGenius user who connected Square
  merchantId   String            // Square merchant ID
  accessToken  String            // Encrypted at rest
  refreshToken String            // Encrypted at rest
  expiresAt    DateTime
  scopes       String[]          // Granted scopes
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}
```

**Encrypt `accessToken` and `refreshToken`** before storage (e.g., via `ENCRYPTION_KEY` env var + AES-256-GCM).

---

## 5. Key API Endpoints

### Inventory: Batch Retrieve Counts
```bash
curl -X POST https://connect.squareup.com/v2/inventory/batch-retrieve-counts \
  -H "Square-Version: 2025-04-23" \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "catalog_object_ids": ["ITEM_ID_1", "ITEM_ID_2"],
    "location_ids": ["LOC_ID"],
    "updated_after": "2026-04-01T00:00:00Z"
  }'
```

### Inventory: Batch Change (Stock Adjustment)
```bash
curl -X POST https://connect.squareup.com/v2/inventory/changes/batch-create \
  -H "Square-Version: 2025-04-23" \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "changes": [{
      "type": "ADJUSTMENT",
      "adjustment": {
        "catalog_object_id": "ITEM_VAR_ID",
        "location_id": "LOC_ID",
        "from_state": "IN_STOCK",
        "to_state": "IN_STOCK",
        "quantity": "-2",
        "occurred_at": "2026-05-03T23:55:00Z"
      }
    }]
  }'
```

### Appointments: List Bookings
```bash
curl -X GET "https://connect.squareup.com/v2/bookings?location_id=LOC_ID&start_at_min=2026-05-01T00:00:00Z" \
  -H "Square-Version: 2025-04-23" \
  -H "Authorization: Bearer {access_token}"
```

---

## 6. Webhooks

Subscribe to `inventory.count.updated` for real-time stock changes.

### Setup
1. In Square Developer Dashboard → Webhooks → Create endpoint
2. URL: `https://colorgenius.app/api/webhooks/square`
3. Event: `inventory.count.updated`

### Webhook Payload (inventory.count.updated)
```json
{
  "merchant_id": "MLY...",
  "type": "inventory.count.updated",
  "event_id": "uuid",
  "data": {
    "type": "inventory.count.updated",
    "id": "uuid",
    "object": {
      "catalog_object_id": "ITEM_VAR_ID",
      "state": "IN_STOCK",
      "quantity": "12",
      "calculated_at": "2026-05-03T23:55:00Z"
    }
  }
}
```

### Verify Signature
Square signs webhooks with your application secret:
```
Signature = Base64(HMACSHA256(application_secret, request_body))
```
Compare `x-square-signature` header. Reject if mismatch.

---

## Quick Reference

| Base URL | `https://connect.squareup.com` |
| Token endpoint | `/oauth2/token` |
| Refresh window | < 24h before `expiresAt` |
| Refresh token lifetime | 30 days (inactive) |
| API version | `2025-04-23` (update as needed) |
| Webhook event | `inventory.count.updated` |

---

## Next Steps

1. Register app in Square Developer Dashboard
2. Add `SQUARE_APP_ID`, `SQUARE_APP_SECRET`, `SQUARE_REDIRECT_URI` to env
3. Add `ENCRYPTION_KEY` for token encryption
4. Implement auth flow + token storage
5. Implement refresh logic (cron or pre-call check)
6. Subscribe to webhooks + implement handler
