# COLORgenius Integration Gateway — API Design

> **Base URL:** `https://api.colorgenius.com/v1`  
> **Auth:** `Authorization: Bearer <COLORgenius-salon-token>` (every endpoint)  
> **Content-Type:** `application/json` unless otherwise specified  
> **Pagination:** Cursor-based (`?cursor=`); `X-Next-Cursor` header on response

---

## Table of Contents

1. [Webhook Endpoints (Platform → Gateway)](#1-webhook-endpoints)
2. [OAuth Endpoints (Browser → Gateway)](#2-oauth-endpoints)
3. [Connection Management](#3-connection-management)
4. [Unified Entity APIs](#4-unified-entity-apis)
5. [Identity Resolution API](#5-identity-resolution-api)
6. [Sync Control API](#6-sync-control-api)
7. [Error Schema](#7-error-schema)
8. [Rate Limiting](#8-rate-limiting)

---

## 1. Webhook Endpoints

### 1.1 Square Webhook

```
POST /webhooks/square
```

**Headers:**
| Header | Description |
|--------|-------------|
| `X-Square-Signature` | HMAC-SHA256 of request body using webhook secret |
| `X-Square-Event-Id`  | Square's idempotency key for this event |

**Body:** Raw Square webhook JSON (varies by event type)

**Response:**
```json
{ "ok": true, "queued": "<webhook-envelope-id>" }
```

**Processing Flow:**
1. Verify signature (HMAC-SHA256)
2. Deduplicate by `X-Square-Event-Id` (Redis SETNX 24h TTL)
3. Normalise payload to `WebhookEnvelope`
4. Publish to `webhooks:square` queue (BullMQ)
5. Return 200 immediately — async worker processes entity

---

### 1.2 Vagaro Webhook

```
POST /webhooks/vagaro
```

**Headers:**
| Header | Description |
|--------|-------------|
| `X-Vagaro-Signature` | HMAC-SHA256 of request body |
| `X-Vagaro-Event-Id`  | Vagaro's unique event identifier |

**Body:** Raw Vagaro webhook JSON

**Response:**
```json
{ "ok": true, "queued": "<webhook-envelope-id>" }
```

**Processing Flow:**
1. Verify signature
2. Deduplicate by `X-Vagaro-Event-Id`
3. Normalise to `WebhookEnvelope`
4. Publish to `webhooks:vagaro` queue
5. Return 200

---

## 2. OAuth Endpoints

### 2.1 Initiate Square OAuth

```
GET /oauth/square/init?salon_id=<uuid>&redirect_uri=<uri>
```

**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `salon_id` | UUID | yes | COLORgenius salon tenant |
| `redirect_uri` | string | yes | Post-auth redirect (must be whitelisted) |

**Response:** `302 Redirect` → Square authorize URL

---

### 2.2 Square OAuth Callback

```
GET /oauth/square/callback?code=<>&state=<>&location_id=<>
```

Handled by Square (see [oauth-flow.md](oauth-flow.md)). Returns `302` to `redirect_uri` with `?connected=square` or `?error=...`.

---

### 2.3 Initiate Vagaro OAuth

```
GET /oauth/vagaro/init?salon_id=<uuid>&redirect_uri=<uri>
```

Same pattern as Square.

---

### 2.4 Vagaro OAuth Callback

```
GET /oauth/vagaro/callback?code=<>&state=<>&business_id=<>
```

Same pattern as Square.

---

### 2.5 Disconnect Platform

```
DELETE /connections/:platform
```

**Path:** `platform ∈ {square, vagaro}`

**Response:** `204 No Content` (revokes tokens, deletes webhooks, soft-deletes connection row)

---

## 3. Connection Management

### 3.1 List Connections

```
GET /connections
```

**Response:**
```json
{
  "data": [
    {
      "id": "conn_abc123",
      "platform": "square",
      "status": "connected",
      "merchantName": "Pleij Salon",
      "merchantId": "MLY...",
      "locationId": "L...",
      "scopes": ["customers.read", "orders.read", ...],
      "lastSyncAt": "2025-01-01T12:00:00Z",
      "initialSyncCompleted": true,
      "webhookEventsSubscribed": ["payment.created", "appointment.updated"],
      "createdAt": "2024-12-01T00:00:00Z"
    }
  ]
}
```

---

### 3.2 Get Connection Health

```
GET /connections/:platform/health
```

**Response:**
```json
{
  "platform": "square",
  "status": "healthy",
  "tokenExpiresInSeconds": 28740,
  "lastSuccessfulSyncAt": "2025-01-01T12:00:00Z",
  "pendingWebhookCount": 3,
  "errorRate24h": 0.002
}
```

---

## 4. Unified Entity APIs

All endpoints support:
- `?cursor=<opaque>` — pagination
- `?limit=1-100` (default 50)
- `?sync_status=synced|pending|conflict|error`
- `?platform=square|vagaro` — filter by source platform

---

### 4.1 Customers

#### List Customers
```
GET /customers?query=<>&email=<>&phone=<>&tags=<>&last_visit_after=<>&last_visit_before=<>
```

**Response:** `PaginatedResponse<UnifiedCustomer>`

#### Get Customer
```
GET /customers/:id
```

**Response:** `UnifiedCustomer`

#### Update Customer (manual override)
```
PATCH /customers/:id
```

**Body:** Partial `UnifiedCustomer` (only `notes`, `tags`, `preferredStylistId`, marketing consent fields allowed)

#### Create Customer
```
POST /customers
```

**Body:** Omit `id`, `platformIds`, `sync`. Gateway creates canonical record and optionally pushes to connected platforms (if `push_to_platforms: true`).

---

### 4.2 Appointments

#### List Appointments
```
GET /appointments?customer_id=<>&stylist_id=<>&start_after=<>&start_before=<>&status=<>
```

**Response:** `PaginatedResponse<UnifiedAppointment>`

#### Get Appointment
```
GET /appointments/:id
```

#### Create Appointment
```
POST /appointments
```

**Body:** `UnifiedAppointment` sans `id`, `platformIds`, `sync`

**Behaviour:** If platforms connected, pushes to both and stores platform-generated IDs. If conflict, returns `202 Accepted` with `syncStatus: "pending"`.

#### Update Appointment
```
PATCH /appointments/:id
```

**Allowed fields:** `startTime`, `endTime`, `status`, `services`, `cancellationReason`

#### Cancel Appointment
```
POST /appointments/:id/cancel
```

**Body:** `{ "reason": "...", "source": "manual" }`

---

### 4.3 Transactions

#### List Transactions
```
GET /transactions?customer_id=<>&appointment_id=<>&after=<>&before=<>&min_amount=<>&max_amount=<>
```

**Response:** `PaginatedResponse<UnifiedTransaction>`

#### Get Transaction
```
GET /transactions/:id
```

---

### 4.4 Inventory

#### List Inventory
```
GET /inventory?type=<>&category_id=<>&search=<>&low_stock=true|false
```

**Response:** `PaginatedResponse<UnifiedInventory>`

#### Get Inventory Item
```
GET /inventory/:id
```

#### Update Stock
```
PATCH /inventory/:id/stock
```

**Body:** `{ "locationId": "...", "quantityOnHand": 42, "reason": "cycle_count" }`

---

### 4.5 Services

#### List Services
```
GET /services?category=<>&bookable_online=true|false
```

**Response:** `PaginatedResponse<UnifiedService>`

#### Get Service
```
GET /services/:id
```

---

## 5. Identity Resolution API

### 5.1 Resolve Customer Identity

```
POST /identity/resolve
```

**Body (IdentityResolutionRequest):**
```json
{
  "salonId": "salon_abc",
  "platform": "square",
  "platformCustomerId": "sq_customer_123",
  "customerData": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+1-555-123-4567",
    "dateOfBirth": "1985-06-15"
  }
}
```

**Response (IdentityResolutionResponse):**
```json
{
  "candidates": [
    {
      "confidence": 0.94,
      "sourceCustomerId": "sq_customer_123",
      "targetUnifiedCustomerId": "unif_cust_456",
      "matchedFields": ["email", "phone"],
      "fieldScores": {
        "email": 1.0,
        "phone": 1.0,
        "name": 0.82,
        "dob": 0.0
      },
      "recommendation": "merge"
    }
  ],
  "selectedAction": "merge",
  "resolvedUnifiedId": "unif_cust_456"
}
```

**Auto-Actions:**
- `confidence >= 0.90` → auto-merge
- `0.70 <= confidence < 0.90` → queue for human review
- `confidence < 0.70` → create new unified record

---

### 5.2 Manual Merge

```
POST /identity/merge
```

**Body (ManualMergeRequest):**
```json
{
  "salonId": "salon_abc",
  "sourceIds": ["unif_cust_789", "unif_cust_012"],
  "targetId": "unif_cust_456",
  "conflictResolution": {
    "email": "target",
    "phone": "source",
    "firstName": "manual"
  }
}
```

**Response:** `200 OK` → merged `UnifiedCustomer`

---

### 5.3 Split Merged Customer

```
POST /identity/split
```

**Body:**
```json
{
  "salonId": "salon_abc",
  "unifiedId": "unif_cust_456",
  "splitByPlatform": true,
  "platformAssignments": {
    "square": "unif_cust_789",
    "vagaro": "unif_cust_012"
  }
}
```

---

## 6. Sync Control API

### 6.1 Trigger Full Sync

```
POST /sync/:platform/full
```

**Body:**
```json
{
  "entityTypes": ["customers", "appointments", "transactions", "inventory", "services"],
  "since": "2024-01-01T00:00:00Z",
  "dryRun": false
}
```

**Response:** `202 Accepted` with `jobId`

---

### 6.2 Trigger Incremental Sync

```
POST /sync/:platform/incremental
```

**Body:** `{ "entityTypes": [...] }`

Uses `lastSyncCursor` / `lastSyncAt` from connection record.

---

### 6.3 Get Sync Status

```
GET /sync/:platform/status
```

**Response:**
```json
{
  "platform": "square",
  "activeJobs": 2,
  "queueDepth": 47,
  "lastCompletedAt": "2025-01-01T12:00:00Z",
  "entities": {
    "customers": { "synced": 1240, "pending": 3, "conflicts": 1, "errors": 0 },
    "appointments": { "synced": 5600, "pending": 12, "conflicts": 0, "errors": 2 },
    "transactions": { "synced": 8900, "pending": 5, "conflicts": 0, "errors": 0 }
  }
}
```

---

### 6.4 Retry Failed Syncs

```
POST /sync/:platform/retry
```

**Body:** `{ "entityType": "appointments", "since": "..." }` or `{}` for all.

---

## 7. Error Schema

All errors return this envelope:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Human-readable description",
    "details": {},
    "requestId": "req_uuid",
    "documentationUrl": "https://docs.colorgenius.com/errors/invalid_request"
  }
}
```

### Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `invalid_request` | 400 | Bad parameters |
| `unauthorized` | 401 | Missing/invalid salon token |
| `forbidden` | 403 | Valid token, insufficient scope |
| `not_found` | 404 | Resource doesn't exist |
| `conflict` | 409 | Resource conflict (e.g. duplicate identity) |
| `rate_limited` | 429 | Platform or gateway rate limit hit |
| `platform_error` | 502 | Upstream Square/Vagaro error |
| `sync_conflict` | 422 | Data conflict during sync |
| `internal_error` | 500 | Unexpected server error |

---

## 8. Rate Limiting

### 8.1 Gateway → Client

| Tier | Requests/Min | Burst |
|------|--------------|-------|
| Default | 120 | 20 |
| Webhooks | 600 | 100 |
| Bulk sync | 60 | 10 |

Headers on every response:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

### 8.2 Gateway → Platform

Respects platform limits with token-bucket throttle:

| Platform | Limit | Strategy |
|----------|-------|----------|
| Square | 10 req/sec per app | Token bucket, queue overflow |
| Vagaro | 100 req/min per token | Leaky bucket, 429 backoff |

On platform `429`:
1. Read `Retry-After` header
2. Back off exponentially (base 2s, max 60s)
3. Re-queue job with delayed timestamp
4. Alert if back-off > 5 min

---

## Appendix: WebSocket Real-Time Events

`wss://api.colorgenius.com/v1/stream`

Subscribe with `?salon_id=<>&events=<comma-list>`

Events emitted:
- `sync.progress` — `{ platform, entityType, processed, total }`
- `webhook.received` — `{ platform, eventType, entityType, entityId }`
- `identity.resolved` — `{ unifiedCustomerId, action, confidence }`
- `connection.status` — `{ platform, status, error }`

---

*Last updated: 2025-01-01*
