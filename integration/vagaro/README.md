# Vagaro Integration — COLORgenius

Full TypeScript integration module for Vagaro POS + Scheduling. Provides auth, API client, data sync, webhooks, and orchestrated sync runners.

## Installation

```bash
npm install zod
# Peer deps: Node.js 18+ (fetch, crypto.randomUUID)
```

## Quick Start

```ts
import {
  VagaroAuthManager,
  createVagaroSyncRunner,
  createVagaroWebhookHandler,
} from "./integration/vagaro";

// 1. Initialize auth
const auth = new VagaroAuthManager();
await auth.initialize({
  apiKey: process.env.VAGARO_API_KEY!,
  businessId: process.env.VAGARO_BUSINESS_ID!,
});

// 2. Run a full sync
const runner = createVagaroSyncRunner({
  businessId: process.env.VAGARO_BUSINESS_ID!,
  apiKey: process.env.VAGARO_API_KEY!,
});

const sync = await runner.runFullSync();
console.log("Sync status:", sync.status);
console.log("Customers:", sync.entityProgress.customers?.processed ?? 0);
console.log("Appointments:", sync.entityProgress.appointments?.processed ?? 0);

// 3. Handle a webhook
const handler = createVagaroWebhookHandler({
  secret: process.env.VAGARO_WEBHOOK_SECRET!,
  businessId: process.env.VAGARO_BUSINESS_ID!,
  apiKey: process.env.VAGARO_API_KEY!,
});

handler.on("appointment.created", async (payload) => {
  console.log("New appointment:", payload.data);
  // Trigger incremental sync or process directly
});

// In your API route (Next.js / Hono / Express):
// const result = await handler.handle(req.body, req.headers);
```

## Architecture

```
vagaro/
├── types.ts              # Zod schemas + TypeScript types
├── vagaro-auth.ts        # API key management + rotation
├── vagaro-client.ts      # HTTP client (auth, rate limit, retry)
├── vagaro-customers.ts   # Customer sync + normalization
├── vagaro-appointments.ts # Appointment sync + normalization
├── vagaro-services.ts    # Service catalog sync
├── vagaro-inventory.ts   # Product inventory sync
├── vagaro-webhooks.ts    # Signature verification + event routing
├── vagaro-sync.ts        # Full + incremental sync orchestration
└── index.ts              # Barrel export
```

## Configuration

### Environment Variables

```bash
# Load keys from env (auto-parsed by VagaroAuthManager.loadFromEnv)
VAGARO_API_KEY_12345=your_api_key_here
#           ^^^^^
#           business ID suffix

VAGARO_BUSINESS_ID=12345
VAGARO_WEBHOOK_SECRET=whsec_...
```

### Auth Manager

```ts
import { VagaroAuthManager } from "./integration/vagaro";

const auth = new VagaroAuthManager({ storage: mySupabaseAdapter });

// Initialize
await auth.initialize({ apiKey: "vk_...", businessId: "12345" });

// Rotate key
const newKey = await auth.rotateKey("12345", "vk_new...", {
  gracePeriodMs: 10 * 60 * 1000, // 10 min grace
});

// Revoke
await auth.revokeKey(oldKeyConfig.id);

// Load from env
const loaded = await auth.loadFromEnv();
```

## API Client

```ts
import { getVagaroClient } from "./integration/vagaro";

const client = getVagaroClient({
  businessId: "12345",
  baseUrl: "https://api.vagaro.com/v2", // default
  timeoutMs: 30_000,
  maxRetries: 3,
  logger: console.log,
});

// GET with pagination
const customers = await client.paginateAll("/customers", { pageSize: 100 });

// GET single
const customer = await client.get(`/customers/${id}`);

// POST
const created = await client.post("/appointments", { ... });
```

## Data Sync

### Individual Entity Sync

```ts
import {
  createVagaroCustomersClient,
  createVagaroAppointmentsClient,
  createVagaroServicesClient,
  createVagaroInventoryClient,
} from "./integration/vagaro";

const customers = createVagaroCustomersClient({ businessId, apiKey });
const result = await customers.fullSync();
// result.customers — UnifiedCustomer[]
// result.errors    — any normalization failures

const appointments = createVagaroAppointmentsClient({ businessId, apiKey });
const apptResult = await appointments.getByDateRange("2025-01-01", "2025-01-31");
```

### Orchestrated Sync Runner

```ts
import { createVagaroSyncRunner } from "./integration/vagaro";

const runner = createVagaroSyncRunner({
  businessId: "12345",
  apiKey: "vk_...",
  entities: ["customers", "appointments", "services", "inventory"],
  onProgress: (run) => console.log(run.status, run.entityProgress),
  onEntityComplete: (entity, status, result) => {
    // Push to Supabase, trigger notifications, etc.
  },
  store: mySupabaseSyncStore, // optional
});

// Full sync (all entities)
const full = await runner.runFullSync();

// Incremental sync (delta since last successful run)
const incremental = await runner.runIncrementalSync();

// Retry failed entities from a previous run
const retry = await runner.retrySync(full.id);

// History
const history = await runner.getHistory(10);
```

## Webhooks

### Setup

```ts
import { createVagaroWebhookHandler } from "./integration/vagaro";

const handler = createVagaroWebhookHandler({
  secret: process.env.VAGARO_WEBHOOK_SECRET!,
  businessId: "12345",
  apiKey: "vk_...",
  timestampToleranceMs: 5 * 60 * 1000, // 5 min
});

handler
  .on("appointment.created", async (payload) => {
    // Trigger incremental sync or push to queue
  })
  .on("appointment.updated", async (payload) => {
    // Update local cache
  })
  .on("customer.created", async (payload) => {
    // Enrich customer profile
  })
  .on("*", async (payload) => {
    // Catch-all logging
    console.log("Unhandled event:", payload.event);
  });
```

### In Your HTTP Handler

```ts
// Next.js API Route example
export async function POST(req: Request) {
  const rawBody = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  const result = await handler.handle(rawBody, headers);

  if (!result.success) {
    return new Response(result.error, { status: 400 });
  }

  return new Response("OK", { status: 200 });
}
```

### Security

- **HMAC-SHA256 signature verification** — prevents spoofing
- **Timestamp tolerance check** — prevents replay attacks
- **Idempotency store** — deduplicates duplicate deliveries
- **Queue adapter** — async processing with retry

## Unified Types

All fetched data is normalized to COLORgenius unified types:

| Vagaro Entity | Unified Type | File |
|---------------|-------------|------|
| Customer | `UnifiedCustomer` | `vagaro-customers.ts` |
| Appointment | `UnifiedAppointment` | `vagaro-appointments.ts` |
| Service | `UnifiedService` | `vagaro-services.ts` |
| Inventory Item | `UnifiedInventoryItem` | `vagaro-inventory.ts` |

## Error Handling

```ts
import { VagaroError } from "./integration/vagaro";

try {
  await client.get("/customers/99999");
} catch (err) {
  if (err instanceof VagaroError) {
    console.log(err.code);        // "NOT_FOUND"
    console.log(err.statusCode);  // 404
    console.log(err.retryable);   // false
    console.log(err.retryAfterMs);// undefined
  }
}
```

## Rate Limiting

The API client includes a **token-bucket rate limiter** (default: 5 req/sec per API key). Rate limit headers from Vagaro are logged for observability.

## Extending

### Custom Storage Adapters

Implement `KeyStorageAdapter`, `SyncStoreAdapter`, `QueueAdapter`, or `IdempotencyStore` to integrate with Supabase, Redis, SQS, etc.

```ts
interface KeyStorageAdapter {
  get(id: string): Promise<VagaroApiKeyConfig | null>;
  getActive(businessId: string): Promise<VagaroApiKeyConfig | null>;
  set(config: VagaroApiKeyConfig): Promise<void>;
  list(businessId: string): Promise<VagaroApiKeyConfig[]>;
  rotate(businessId: string, newKey: string, opts?: RotationOptions): Promise<VagaroApiKeyConfig>;
}
```

## License

MIT — COLORgenius Team
