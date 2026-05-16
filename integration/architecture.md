# COLORgenius Unified Integration Layer — Architecture

> **Status:** Production-ready architecture  
> **Platforms:** Square (POS + Appointments), Vagaro (POS + Scheduling)  
> **Goal:** Single unified data layer on top of heterogeneous salon platforms

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Component Architecture](#2-component-architecture)
3. [Data Flow Diagrams](#3-data-flow-diagrams)
4. [Webhook Handler Pattern](#4-webhook-handler-pattern)
5. [Sync Strategy](#5-sync-strategy)
6. [Rate Limiting & Throttling](#6-rate-limiting--throttling)
7. [Error Handling & Retry Logic](#7-error-handling--retry-logic)
8. [Customer Identity Resolution](#8-customer-identity-resolution)
9. [Database Schema](#9-database-schema)
10. [Security Model](#10-security-model)
11. [Observability](#11-observability)
12. [Deployment & Scaling](#12-deployment--scaling)

---

## 1. System Overview

COLORgenius integrates with two dominant salon platforms—**Square** and **Vagaro**—each with distinct APIs, data shapes, and event models. The Unified Integration Layer abstracts these differences behind a single, consistent domain model so the COLORgenius app never speaks Square-ese or Vagaro-ese.

### Guiding Principles

| # | Principle | Rationale |
|---|-----------|-----------|
| 1 | **Gateway owns the complexity** | App consumes unified APIs only |
| 2 | **Async everywhere** | Webhooks enqueue; workers process; never block HTTP threads on sync I/O |
| 3 | **Idempotency is mandatory** | Same webhook delivered twice = same result |
| 4 | **Conflict over clobber** | When data diverges, flag and queue—never silently overwrite |
| 5 | **Encrypt at rest, verify in transit** | Tokens and PII encrypted; webhooks signature-verified |
| 6 | **Observability by design** | Every sync operation is auditable |

---

## 2. Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              COLORgenius App                                  │
│  (React / Next.js — consumes ONLY unified APIs)                              │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               │ REST + WebSocket
                               │
┌──────────────────────────────▼──────────────────────────────────────────────┐
│                    Integration Gateway (Node.js / Fastify)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│
│  │  REST API   │  │  WebSocket  │  │  OAuth      │  │  Identity Resolver  ││
│  │  Router     │  │  Stream     │  │  Handler    │  │  Engine             ││
│  └──────┬──────┘  └─────────────┘  └──────┬──────┘  └─────────────────────┘│
│         │                                    │                                 │
│  ┌──────▼──────┐  ┌────────────────────────▼────────────────────────┐     │
│  │  Unified    │  │           Platform Adapters                        │     │
│  │  Service    │  │  ┌───────────────┐      ┌───────────────┐          │     │
│  │  Layer      │  │  │  Square       │      │  Vagaro       │          │     │
│  │             │  │  │  Adapter      │      │  Adapter      │          │     │
│  │  - Customer │  │  │               │      │               │          │     │
│  │  - Appt     │  │  │  ┌─────────┐  │      │  ┌─────────┐  │          │     │
│  │  - Txn      │  │  │  │ Square  │  │      │  │ Vagaro  │  │          │     │
│  │  - Inv      │  │  │  │ Client  │  │      │  │ Client  │  │          │     │
│  │  - Service  │  │  │  │ (got)   │  │      │  │ (axios) │  │          │     │
│  └──────┬──────┘  │  │  └────┬────┘  │      │  └────┬────┘  │          │     │
│         │         │  │       │       │      │       │       │          │     │
│         │         │  └───────┼───────┘      └───────┼───────┘          │     │
│         │         │          │                      │                    │     │
│  ┌──────▼──────┐  └──────────┼──────────────────────┼────────────────────┘     │
│  │  Event      │             │                      │                          │
│  │  Normaliser │◀────────────┘                      │                          │
│  │             │◀───────────────────────────────────┘                          │
│  └──────┬──────┘                                                              │
│         │                                                                     │
│  ┌──────▼──────┐  ┌────────────────────────────────────────────────────────┐ │
│  │  Job Queue  │  │  Redis (BullMQ)                                        │ │
│  │  Producer   │  │  - webhooks:square                                     │ │
│  │             │  │  - webhooks:vagaro                                     │ │
│  │  - Enqueue  │  │  - sync:full                                           │ │
│  │  - Schedule │  │  - sync:incremental                                    │ │
│  │  - Retry    │  │  - identity:resolve                                    │ │
│  │  - Dead     │  │  - token:refresh                                       │ │
│  │    Letter   │  │  - notifications                                         │ │
│  └──────┬──────┘  └────────────────────────────────────────────────────────┘ │
│         │                                                                     │
└─────────┼─────────────────────────────────────────────────────────────────────┘
          │
          │ reads/writes
          │
┌─────────▼─────────────────────────────────────────────────────────────────────┐
│                              PostgreSQL (Primary)                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  unified_    │  │  platform_   │  │  identity_     │  │  sync_audit_log  │ │
│  │  customers   │  │  connections │  │  matches       │  │                  │ │
│  │  appointments│  │  (token vault) │  │  merge_history │  │                  │ │
│  │  transactions│  │                │  │                │  │                  │ │
│  │  inventory   │  │                │  │                │  │                  │ │
│  │  services    │  │                │  │                │  │                  │ │
│  │  employees   │  │                │  │                │  │                  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          │ streaming replication
          │
┌─────────▼─────────────────────────────────────────────────────────────────────┐
│                          Read Replicas (2×, auto-scaled)                        │
│                     (API queries, reporting, analytics)                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| **REST API Router** | HTTP ingress, auth, validation, rate limiting, serialisation |
| **WebSocket Stream** | Real-time sync progress, webhook receipts, connection health |
| **OAuth Handler** | PKCE + state management, token exchange, refresh scheduling |
| **Identity Resolver** | Fuzzy matching, scoring, merge/split orchestration |
| **Unified Service Layer** | Business logic: CRUD, conflict detection, field-level merge rules |
| **Platform Adapters** | Platform-specific API clients, error translation, rate-limit handling |
| **Event Normaliser** | Transform raw platform events into `WebhookEnvelope` |
| **Job Queue (BullMQ)** | Reliable, retryable, observable async work distribution |
| **PostgreSQL** | Source of truth for all unified + platform state |

---

## 3. Data Flow Diagrams

### 3.1 Webhook Ingestion

```
Square / Vagaro
       │
       │ POST /webhooks/:platform
       │ + signature + event_id
       │
       ▼
┌──────────────┐
│   Gateway    │  (1) Signature verify (HMAC-SHA256)
│   Ingress    │  (2) Idempotency check (Redis SETNX 24h)
│              │  (3) Parse body
└──────┬───────┘
       │
       │ Enqueue to BullMQ
       │ job: { envelopeId, platform, eventType, payload }
       │
       ▼
┌──────────────┐
│   Worker     │  (4) Dequeue
│   (Node)     │  (5) Normalise to domain event
│              │  (6) Load existing unified record (or create)
│              │  (7) Apply delta / detect conflict
│              │  (8) Upsert unified record
│              │  (9) Emit `webhook.processed` event
└──────┬───────┘
       │
       │ WebSocket broadcast
       │
       ▼
COLORgenius App (real-time UI update)
```

### 3.2 Full Initial Sync

```
Merchant connects OAuth
       │
       ▼
┌──────────────┐
│   OAuth      │  Token saved, connection.status = 'connected'
│   Callback   │
└──────┬───────┘
       │
       │ POST /sync/:platform/full
       │
       ▼
┌──────────────┐
│   Full Sync  │  (1) Queue jobs per entity type:
│   Orchestrator│     - customers (batch 100)
│              │     - appointments (batch 50)
│              │     - transactions (batch 50)
│              │     - inventory (batch 100)
│              │     - services (batch 100)
│              │  (2) Workers paginate through platform APIs
│              │  (3) Each page: normalise → identity resolve → upsert
│              │  (4) Progress events via WebSocket
│              │  (5) Mark connection.initialSyncCompleted = true
└──────┬───────┘
       │
       │ Sync complete
       ▼
COLORgenius App (all data visible)
```

### 3.3 Query Flow (App → Unified Data)

```
App requests: GET /customers?query=jane
       │
       ▼
┌──────────────┐
│   API Router │  Auth check (salon_id from JWT)
│              │  Rate limit check
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Unified    │  Query read replica:
│   Service    │  SELECT * FROM unified_customers
│   Layer      │  WHERE salon_id = ?
│              │    AND (email ILIKE ? OR name ILIKE ?)
│              │  ORDER BY last_visit_date DESC
│              │  LIMIT 50
└──────┬───────┘
       │
       ▼
App receives PaginatedResponse<UnifiedCustomer>
```

---

## 4. Webhook Handler Pattern

### 4.1 Signature Verification

```typescript
// src/webhooks/verify.ts
export function verifySignature(
  platform: Platform,
  body: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

### 4.2 Idempotency

```typescript
// src/webhooks/dedupe.ts
const IDEMPOTENCY_TTL_SECONDS = 86400; // 24h

export async function isDuplicate(eventId: string): Promise<boolean> {
  const key = `webhook:seen:${eventId}`;
  const result = await redis.set(key, '1', 'EX', IDEMPOTENCY_TTL_SECONDS, 'NX');
  return result === null; // Already existed
}
```

### 4.3 Queue Processing

```typescript
// src/workers/webhookWorker.ts
queue.process('webhooks:square', 10, async (job) => {
  const { envelopeId, platform, eventType, payload } = job.data;

  try {
    // 1. Parse + validate
    const parsed = platform === 'square'
      ? squareTransformer.parse(eventType, payload)
      : vagaroTransformer.parse(eventType, payload);

    // 2. Normalise to unified event
    const unifiedEvent = eventNormaliser.toUnified(platform, parsed);

    // 3. Load or create target entity
    const existing = await unifiedService.findByPlatformId(
      platform,
      parsed.platformEntityId,
      parsed.entityType
    );

    // 4. Apply or detect conflict
    if (existing) {
      const delta = diff(existing, unifiedEvent);
      if (delta.isConflict) {
        await conflictQueue.add('conflict', {
          unifiedId: existing.id,
          fieldDiffs: delta.fields,
          sources: delta.sources,
        });
        await unifiedService.markSyncStatus(existing.id, 'conflict');
      } else {
        await unifiedService.applyDelta(existing.id, delta);
      }
    } else {
      // New record — identity resolution for customers
      if (parsed.entityType === 'customer') {
        const resolution = await identityResolver.resolve(parsed.data);
        if (resolution.action === 'merge') {
          await unifiedService.mergeCustomer(resolution.targetId, parsed.data);
        } else {
          await unifiedService.createCustomer(parsed.data);
        }
      } else {
        await unifiedService.create(parsed.entityType, parsed.data);
      }
    }

    // 5. Update webhook envelope
    await webhookRepo.markProcessed(envelopeId, 'success');

    // 6. Broadcast
    websocket.emit(parsed.salonId, 'webhook.processed', {
      platform,
      entityType: parsed.entityType,
      entityId: existing?.id ?? parsed.data.id,
    });

  } catch (err) {
    await handleWorkerError(job, err, 'webhook');
  }
});
```

---

## 5. Sync Strategy

### 5.1 Full Sync (One-Time)

Triggered on:
- Initial OAuth connection
- Manual "Resync All" from dashboard
- Data integrity repair

**Algorithm:**
```
for each entityType in [customers, appointments, transactions, inventory, services]:
  cursor = null
  do:
    page = platformAdapter.list(entityType, { cursor, limit: BATCH_SIZE })
    for each record in page.data:
      normalised = transformer.toUnified(record)
      if entityType == 'customer':
        identityResolver.resolveAndMerge(normalised)
      else:
        upsertUnified(entityType, normalised)
    cursor = page.nextCursor
  while cursor
  mark entityType synced
mark connection.initialSyncCompleted = true
```

### 5.2 Incremental Sync (Ongoing)

Triggered by:
- Scheduled cron (every 15 min per connection)
- Webhook gap detection (webhook missed → backfill)
- Connection health recovery

**Algorithm:**
```
since = connection.lastSyncAt ?? connection.createdAt
cursor = connection.lastSyncCursor

page = platformAdapter.listChanges(entityType, { since, cursor })
for each change in page.changes:
  if change.type == 'deleted':
    softDeleteUnified(change.platformId)
  else:
    normalised = transformer.toUnified(change.record)
    upsertUnified(entityType, normalised)

connection.lastSyncAt = now()
connection.lastSyncCursor = page.nextCursor
```

### 5.3 Backfill on Webhook Gap

```
Webhook sequence: 101, 102, 104  (103 missing)
       │
       ▼
Worker detects gap (Redis sorted set of event IDs)
       │
       ▼
Queue incremental sync for timestamp range covering gap
       │
       ▼
Mark gap resolved when record count matches
```

---

## 6. Rate Limiting & Throttling

### 6.1 Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Rate Limit Manager                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Per-Platform│  │  Per-Salon  │  │  Global Gateway │  │
│  │  Token Bucket│ │  Leaky Bucket│ │  Circuit Breaker │  │
│  │  (Redis)     │  │  (Redis)     │  │  (Redis)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 6.2 Platform Limits

| Platform | Limit | Bucket Config |
|----------|-------|---------------|
| Square | 10 req/s per application | Token bucket: 10 tokens, refill 10/sec |
| Vagaro | 100 req/min per access token | Leaky bucket: 100 capacity, drain 1.67/sec |

### 6.3 Implementation

```typescript
// src/ratelimit/platformLimiter.ts
class PlatformRateLimiter {
  async acquire(platform: Platform, salonId: string): Promise<void> {
    const key = `ratelimit:${platform}:${salonId}`;
    const config = PLATFORM_CONFIG[platform];

    const acquired = await this.tokenBucket.acquire(key, config);
    if (!acquired) {
      const retryAfter = await this.tokenBucket.retryAfter(key);
      throw new RateLimitError(retryAfter);
    }
  }
}

// Worker backoff on RateLimitError:
//   retryAfter <= 60s  → delay job by retryAfter
//   retryAfter >  60s  → throw to dead-letter, alert ops
```

---

## 7. Error Handling & Retry Logic

### 7.1 Retry Policy Matrix

| Error | Retry? | Backoff | Max Retries | Dead Letter? |
|-------|--------|---------|-------------|--------------|
| Platform 5xx | Yes | Exponential 2^N × 1s | 5 | Yes |
| Platform 429 | Yes | `Retry-After` + jitter | 10 | Yes |
| Platform 401/403 | No | — | 0 | Yes (mark disconnected) |
| Platform 404 (entity) | No | — | 0 | Yes (skip) |
| Validation failure | No | — | 0 | Yes |
| DB transient | Yes | Linear 1s × N | 3 | Yes |
| Network timeout | Yes | Exponential | 5 | Yes |

### 7.2 Exponential Backoff

```typescript
function backoff(attempt: number, baseMs = 1000, maxMs = 60000): number {
  const jitter = Math.random() * 0.3 + 0.85; // 0.85–1.15
  const delay = Math.min(baseMs * Math.pow(2, attempt), maxMs) * jitter;
  return Math.round(delay);
}
```

### 7.3 Dead Letter Queue

```
After max retries:
  1. Move job to `dlq:<platform>:<entityType>`
  2. Write `sync_audit_log` entry with status='error'
  3. WebSocket alert to salon dashboard
  4. Email ops if >10 DLQ entries / hour / platform
```

---

## 8. Customer Identity Resolution

### 8.1 Matching Pipeline

```
New platform customer record
       │
       ▼
┌─────────────────┐
│  Pre-normalise  │  Clean phone (E.164), email (lowercase), name (trim)
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Exact Match    │  email = ? OR phone = ?
│  Search         │  → confidence 1.0, auto-link
└────────┬────────┘
         │ no exact
         ▼
┌─────────────────┐
│  Fuzzy Match    │  name similarity (Levenshtein + Metaphone)
│  Search         │  + phone area code match
│                 │  + email domain match
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Scoring        │  weighted sum:
│  Engine         │    email exact      = 0.40
│                 │    phone exact      = 0.35
│                 │    name fuzzy ≥0.85 = 0.20
│                 │    dob match        = 0.05
│                 │  threshold: auto-merge ≥0.90
│                 │             review  0.70–0.89
│                 │             new     <0.70
└────────┬────────┘
         │
         ▼
   Action: link / merge / create_new / review
```

### 8.2 Merge Logic

```typescript
// src/identity/merge.ts
async function mergeCustomers(
  targetId: string,
  sourceIds: string[],
  conflictResolution?: Record<string, 'source' | 'target' | 'manual'>
): Promise<UnifiedCustomer> {
  const target = await db.unifiedCustomers.findById(targetId);
  const sources = await db.unifiedCustomers.findMany({ id: { in: sourceIds } });

  // Build merged record
  const merged: Partial<UnifiedCustomer> = {
    ...target,
    platformIds: mergePlatformIds(target.platformIds, sources.map(s => s.platformIds)),
    secondaryEmails: unique([...target.secondaryEmails, ...sources.flatMap(s => [s.contact.email, ...s.secondaryEmails]).filter(Boolean)]),
    secondaryPhones: unique([...target.secondaryPhones, ...sources.flatMap(s => [s.contact.phone, ...s.secondaryPhones]).filter(Boolean)]),
    totalVisits: target.totalVisits + sources.reduce((sum, s) => sum + s.totalVisits, 0),
    lifetimeSpendCents: target.lifetimeSpendCents + sources.reduce((sum, s) => sum + s.lifetimeSpendCents, 0),
    mergedFrom: [...target.mergedFrom, ...sourceIds],
    mergeConfidence: Math.max(target.mergeConfidence, ...sources.map(s => s.mergeConfidence)),
  };

  // Field-level conflict resolution
  for (const field of CONFLICT_FIELDS) {
    if (conflictResolution?.[field]) {
      merged[field] = conflictResolution[field] === 'target'
        ? target[field]
        : sources[0][field]; // source
    } else {
      merged[field] = target[field] ?? sources.find(s => s[field])?.[field];
    }
  }

  // Soft-delete sources, update target
  await db.transaction(async (tx) => {
    await tx.unifiedCustomers.update({ where: { id: targetId }, data: merged });
    await tx.unifiedCustomers.updateMany({
      where: { id: { in: sourceIds } },
      data: { status: 'merged', mergedIntoId: targetId, deletedAt: new Date() },
    });
    await tx.identityMergeHistory.create({
      data: { targetId, sourceIds, resolvedFields: conflictResolution },
    });
  });

  return db.unifiedCustomers.findById(targetId);
}
```

### 8.3 Split Logic

When a merge is wrong:
```
POST /identity/split
→ Create new UnifiedCustomer for each source platform ID
→ Re-parent transactions/appointments by platform
→ Mark original as "split" in merge_history
→ Queue re-resolution for affected records
```

---

## 9. Database Schema

### 9.1 Core Tables

```sql
-- Unified customers (source of truth)
CREATE TABLE unified_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  notes TEXT DEFAULT '',
  email TEXT,
  phone TEXT,
  phone_country_code TEXT,
  secondary_emails TEXT[] DEFAULT '{}',
  secondary_phones TEXT[] DEFAULT '{}',
  platform_ids JSONB DEFAULT '{}',  -- { square: "...", vagaro: "..." }
  platform_raw JSONB DEFAULT '{}',     -- full payload stash
  first_visit_date TIMESTAMPTZ,
  last_visit_date TIMESTAMPTZ,
  total_visits INTEGER DEFAULT 0,
  lifetime_spend_cents INTEGER DEFAULT 0,
  preferred_stylist_id UUID,
  tags TEXT[] DEFAULT '{}',
  email_marketing_consent BOOLEAN DEFAULT false,
  sms_marketing_consent BOOLEAN DEFAULT false,
  birth_year_for_marketing INTEGER,
  merged_from UUID[] DEFAULT '{}',
  merge_confidence NUMERIC(3,2),
  sync_status TEXT DEFAULT 'synced',
  source_platform TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  UNIQUE(salon_id, id)
);

-- Platform connections (OAuth token vault)
CREATE TABLE platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id),
  platform TEXT NOT NULL CHECK (platform IN ('square', 'vagaro')),
  status TEXT NOT NULL DEFAULT 'disconnected',
  access_token TEXT NOT NULL,          -- AES-256-GCM encrypted
  refresh_token TEXT NOT NULL,         -- AES-256-GCM encrypted
  token_expires_at TIMESTAMPTZ NOT NULL,
  token_scope TEXT[] DEFAULT '{}',
  platform_merchant_id TEXT NOT NULL,
  platform_location_id TEXT,
  webhook_secret TEXT,                 -- encrypted
  webhook_endpoint_url TEXT,
  webhook_events_subscribed TEXT[] DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  last_sync_cursor TEXT,
  initial_sync_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(salon_id, platform)
);

-- Identity match history
CREATE TABLE identity_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL,
  platform TEXT NOT NULL,
  platform_customer_id TEXT NOT NULL,
  unified_customer_id UUID REFERENCES unified_customers(id),
  confidence NUMERIC(3,2) NOT NULL,
  matched_fields TEXT[] NOT NULL,
  field_scores JSONB NOT NULL,
  recommendation TEXT NOT NULL,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Merge history (auditable)
CREATE TABLE identity_merge_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL,
  target_id UUID NOT NULL REFERENCES unified_customers(id),
  source_ids UUID[] NOT NULL,
  resolved_fields JSONB,
  performed_by UUID,  -- null = auto-merge
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sync audit log (comprehensive)
CREATE TABLE sync_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT now(),
  salon_id UUID NOT NULL,
  platform TEXT NOT NULL,
  operation TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  platform_entity_id TEXT,
  status TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  error_message TEXT,
  duration_ms INTEGER
);

-- Indexes for performance
CREATE INDEX idx_customers_salon_email ON unified_customers(salon_id, email);
CREATE INDEX idx_customers_salon_phone ON unified_customers(salon_id, phone);
CREATE INDEX idx_customers_salon_name ON unified_customers(salon_id, last_name, first_name);
CREATE INDEX idx_customers_platform_ids ON unified_customers USING GIN(platform_ids);
CREATE INDEX idx_audit_log_salon_time ON sync_audit_log(salon_id, timestamp DESC);
CREATE INDEX idx_audit_log_platform_time ON sync_audit_log(platform, timestamp DESC);
CREATE INDEX idx_identity_matches_salon ON identity_matches(salon_id, platform_customer_id);
```

---

## 10. Security Model

| Layer | Control |
|-------|---------|
| **Transport** | TLS 1.3 mandatory; HSTS |
| **Webhook signatures** | HMAC-SHA256 verification on every webhook |
| **Token storage** | AES-256-GCM envelope encryption; KMS key rotation |
| **API auth** | Salon-scoped JWT; no platform tokens in client |
| **PII** | Phone/email encrypted at rest; masking in logs |
| **Rate limits** | Per-salon + per-IP + global circuit breaker |
| **Audit** | Every token operation in `sync_audit_log` |
| **CORS** | Whitelist only `app.colorgenius.com` |
| **OAuth** | PKCE + state validation + exact redirect URI match |

---

## 11. Observability

### 11.1 Metrics (Prometheus)

```
integration_webhook_received_total{platform, event_type}
integration_webhook_processed_total{platform, event_type, status}
integration_sync_operations_total{platform, entity_type, status}
integration_sync_duration_seconds{platform, entity_type}
integration_api_requests_total{platform, endpoint, status}
integration_rate_limit_hits_total{platform}
integration_identity_matches_total{confidence_bucket}
integration_merge_operations_total
integration_dlq_entries_total{platform, entity_type}
```

### 11.2 Alerts

| Condition | Severity | Action |
|-----------|----------|--------|
| Webhook processing error rate > 5% | P1 | Page on-call |
| Platform connection status = 'disconnected' > 1h | P1 | Email salon owner |
| DLQ entries > 10/hour | P2 | Slack ops channel |
| Identity match queue backlog > 100 | P3 | Scale workers |
| Token expires in < 5 min (not refreshed) | P1 | Page on-call |

### 11.3 Logging

Structured JSON logs with correlation IDs:
```json
{
  "timestamp": "2025-01-01T00:00:00Z",
  "level": "info",
  "service": "integration-gateway",
  "traceId": "abc-123",
  "salonId": "salon_xyz",
  "platform": "square",
  "event": "webhook.processed",
  "entityType": "appointment",
  "entityId": "appt_456",
  "durationMs": 42,
  "status": "success"
}
```

---

## 12. Deployment & Scaling

### 12.1 Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                        Kubernetes (GKE/EKS)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  API Pods    │  │  Worker Pods   │  │  Cron Pods     │      │
│  │  (3× min)    │  │  (5× min)    │  │  (1×)          │      │
│  │  HPA: CPU    │  │  HPA: queue    │  │  Token refresh │      │
│  │       latency│  │       depth    │  │  Full sync     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Redis (MemoryStore / ElastiCache) — HA + persistence  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL 15 (Cloud SQL / RDS) — HA, read replicas   │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 12.2 Scaling Triggers

| Metric | Scale Up | Scale Down |
|--------|----------|------------|
| API CPU | > 70% | < 30% |
| API p99 latency | > 500ms | < 200ms |
| Queue depth | > 500 jobs | < 100 jobs |
| Webhook ingress | > 100 req/s | < 20 req/s |

### 12.3 Environment Strategy

| Env | Purpose | Data |
|-----|---------|------|
| `dev` | Local development | Mock platform APIs |
| `staging` | Integration testing | Sandbox Square/Vagaro accounts |
| `prod` | Live merchant data | Production Square/Vagaro |

---

*End of Architecture Document*

**Next Steps for Implementation:**
1. Scaffold Fastify gateway with BullMQ + Prisma
2. Implement Square adapter with `square` Node SDK
3. Implement Vagaro adapter (REST)
4. Build webhook ingress with signature verification
5. Create identity resolution service with fuzzy matching
6. Write integration tests against sandbox accounts
7. Load-test with 10× projected webhook volume
