# Square Integration for COLORgenius

Complete Square POS + Appointments integration module. Production-ready TypeScript with strict type safety, rate limiting, retries, and comprehensive error handling.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   OAuth Flow    │────▶│  SquareClient   │────▶│  Data Sync      │
│  (square-oauth) │     │ (square-client) │     │ (square-*.ts)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                        │
         ▼                      ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Token Storage   │     │ Rate Limiter    │     │ Webhook Handler │
│ (TokenStorage)  │     │ (10 req/s)      │     │(square-webhooks)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │   Queue /       │
                                               │   Idempotency   │
                                               └─────────────────┘
```

## Installation

```bash
npm install zod
# or
pnpm add zod
```

## Environment Variables

```bash
# Required
SQUARE_APPLICATION_ID=sq0idp-...
SQUARE_APPLICATION_SECRET=sq0csp-...
SQUARE_OAUTH_REDIRECT_URL=https://your-app.com/api/square/callback
SQUARE_OAUTH_SCOPES="CUSTOMERS_READ CUSTOMERS_WRITE ITEMS_READ ORDERS_READ PAYMENTS_READ APPOINTMENTS_READ APPOINTMENTS_WRITE INVENTORY_READ MERCHANT_PROFILE_READ"

# Webhooks (optional but recommended)
SQUARE_WEBHOOK_SIGNATURE_KEY=whsec_...
SQUARE_WEBHOOK_NOTIFICATION_URL=https://your-app.com/api/square/webhooks
SQUARE_WEBHOOK_EVENT_TYPES="payment.created,booking.created,customer.created"

# Optional overrides
SQUARE_API_BASE_URL=https://connect.squareup.com  # or sandbox: https://connect.squareupsandbox.com
SQUARE_API_VERSION=v2
```

## Quick Start

### 1. Initialize OAuth

```typescript
import { SquareOAuth, InMemoryTokenStorage } from './square-oauth';
import { SquareClient } from './square-client';

// Token storage — replace with Supabase/Redis in production
const tokenStorage = new InMemoryTokenStorage();

// OAuth handler
const oauth = new SquareOAuth(tokenStorage);

// Build authorization URL
const authUrl = oauth.getAuthorizationUrl({
  state: 'random-state-token',
  scopes: ['CUSTOMERS_READ', 'PAYMENTS_READ', 'APPOINTMENTS_READ'],
});

// Redirect user to authUrl
```

### 2. Handle OAuth Callback

```typescript
// In your /api/square/callback route:
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Validate state (CSRF protection)
  if (!validateState(state)) {
    return new Response('Invalid state', { status: 400 });
  }

  // Exchange code for tokens
  const tokens = await oauth.exchangeCode({ code });
  console.log(`Connected merchant: ${tokens.merchant_id}`);

  return Response.redirect('/dashboard');
}
```

### 3. Use the API Client

```typescript
// Initialize client with token resolver
const client = new SquareClient({}, async (merchantId) => {
  return tokenStorage.get(merchantId);
});

// Auto-refreshes expired tokens
const oauthClient = new SquareOAuth(tokenStorage);
client.setTokenResolver(async (merchantId) => {
  return oauthClient.ensureValid(merchantId);
});
```

### 4. Sync Data

```typescript
import { SquareSync, InMemorySyncStateStore } from './square-sync';

const sync = new SquareSync(
  client,
  oauth,
  new InMemorySyncStateStore(),
  {
    saveCustomer: async (c) => {
      // Insert into Supabase
      await supabase.from('customers').upsert(c);
    },
    saveTransaction: async (t) => {
      await supabase.from('transactions').upsert(t);
    },
    saveAppointment: async (a) => {
      await supabase.from('appointments').upsert(a);
    },
    saveInventoryItem: async (i) => {
      await supabase.from('inventory_items').upsert(i);
    },
    saveInventoryCount: async (itemId, quantity, locationId) => {
      await supabase.from('inventory_counts').upsert({ item_id: itemId, quantity, location_id: locationId });
    },
  }
);

// Full sync all data types
const results = await sync.fullSync('merchant-id', {
  onProgress: (progress) => {
    console.log(`${progress.dataType}: ${progress.phase} ${progress.current}/${progress.total}`);
  },
});

// Incremental sync (since last successful sync)
await sync.incrementalSync('merchant-id', 'customers');
```

### 5. Handle Webhooks

```typescript
import { SquareWebhooks, InMemoryIdempotencyStore } from './square-webhooks';

const webhooks = new SquareWebhooks(
  new InMemoryIdempotencyStore(),
  undefined, // No queue — process synchronously
);

// Register handlers
webhooks.on('payment.created', async (payload) => {
  console.log('Payment received:', payload.data.id);
  // Upsert to your database
});

webhooks.on('booking.created', async (payload) => {
  console.log('Booking created:', payload.data.id);
  // Notify staff, update calendar, etc.
});

webhooks.on('customer.updated', async (payload) => {
  console.log('Customer updated:', payload.data.id);
  // Sync customer data
});

// In your /api/square/webhooks route:
export async function POST(request: Request) {
  const signature = request.headers.get('x-square-signature') ?? '';
  const body = await request.text();

  const result = await webhooks.handleRequest(signature, body);

  return Response.json(result, {
    status: result.status === 'ok' ? 200 : result.status === 'invalid' ? 400 : 500,
  });
}
```

## Module Reference

### `square-oauth.ts` — OAuth 2.0 + PKCE

| Method | Description |
|--------|-------------|
| `getAuthorizationUrl()` | Build authorization URL |
| `exchangeCode()` | Exchange authorization code for tokens |
| `refreshTokens()` | Refresh expired access token |
| `ensureValid()` | Get valid tokens (refresh if needed) |
| `revokeToken()` | Revoke access/refresh token |
| `generateCodeVerifier()` | PKCE code verifier |
| `generateCodeChallenge()` | PKCE code challenge (S256) |

### `square-client.ts` — HTTP Client

| Method | Description |
|--------|-------------|
| `request()` | Low-level request with auth, retries, rate limit |
| `get()` / `post()` / `put()` / `delete()` | Convenience methods |
| `paginate()` | Async generator for cursor pagination |
| `fetchAll()` | Fetch all pages into array |

### `square-customers.ts` — Customers

| Method | Description |
|--------|-------------|
| `getCustomer()` | Fetch single customer |
| `getAllCustomers()` | Fetch all customers |
| `searchCustomers()` | Search by email, phone, or text |
| `createCustomer()` | Create customer in Square |
| `updateCustomer()` | Update customer |
| `deleteCustomer()` | Delete customer |

### `square-payments.ts` — Payments

| Method | Description |
|--------|-------------|
| `getPayment()` | Fetch single payment |
| `getAllPayments()` | Fetch with date/location filters |
| `getAllPaymentsPaginated()` | Auto-paginated fetch |
| `getPaymentsByOrderId()` | Payments for an order |

### `square-bookings.ts` — Appointments

| Method | Description |
|--------|-------------|
| `getBooking()` | Fetch single booking |
| `getAllBookings()` | Fetch with filters |
| `getUpcomingBookings()` | Future bookings only |
| `getBookingsForDateRange()` | Date range filter |
| `createBooking()` | Create appointment |
| `updateBooking()` | Update appointment |
| `cancelBooking()` | Cancel appointment |

### `square-catalog.ts` — Products & Inventory

| Method | Description |
|--------|-------------|
| `getCatalogObject()` | Fetch single object |
| `getCatalogObjects()` | Batch fetch with pagination |
| `getAllCatalogObjects()` | Auto-paginated fetch |
| `getItems()` | Items (products/services) only |
| `getCategories()` | Categories only |
| `getInventoryCounts()` | Inventory quantities |
| `getInventoryForItems()` | Inventory for specific items |
| `searchCatalog()` | Text search |

### `square-webhooks.ts` — Webhooks

| Method | Description |
|--------|-------------|
| `verifySignature()` | HMAC-SHA256 signature check |
| `verifySignatureV2()` | V2 signature format |
| `handleRequest()` | Full request processing (verify → idempotency → route) |
| `on()` / `onMany()` | Register event handlers |
| `processEvent()` | Process a specific event |

### `square-sync.ts` — Full Sync Runner

| Method | Description |
|--------|-------------|
| `fullSync()` | Sync all data types |
| `syncDataType()` | Sync specific type |
| `incrementalSync()` | Sync since last run |
| `retrySync()` | Retry failed sync |
| `getSyncStatus()` | Get current sync status |

## Error Handling

All errors are typed:

```typescript
import { SquareError } from './square-client';
import { OAuthError } from './square-oauth';
import { WebhookError } from './square-webhooks';
import { CustomerSyncError } from './square-customers';
import { PaymentSyncError } from './square-payments';
import { BookingSyncError } from './square-bookings';
import { CatalogSyncError } from './square-catalog';
import { SyncError } from './square-sync';

try {
  await client.get(merchantId, '/customers/nonexistent');
} catch (error) {
  if (error instanceof SquareError) {
    console.log(error.type);   // 'AUTH_ERROR' | 'RATE_LIMITED' | 'API_ERROR' | ...
    console.log(error.code);   // 'NOT_FOUND' | 'UNAUTHORIZED' | ...
    console.log(error.detail); // Human-readable message
    console.log(error.retryable); // Can retry?
    console.log(error.statusCode); // HTTP status
  }
}
```

## Rate Limiting

Built-in token-bucket rate limiter enforces **10 requests/second** (Square's default). Configurable:

```typescript
const client = new SquareClient(
  { rateLimitPerSecond: 5 }, // Lower if needed
  tokenResolver
);
```

## Retry Strategy

Exponential backoff with jitter:

| Attempt | Delay |
|---------|-------|
| 1 | 1s |
| 2 | 2s |
| 3 | 4s |

Only retryable errors are retried (5xx, rate limit, network errors).

## Idempotency

Webhook handler deduplicates events by `event_id` with a 24-hour TTL. Use Redis/Supabase in production:

```typescript
class SupabaseIdempotencyStore implements IdempotencyStore {
  async has(eventId: string): Promise<boolean> {
    const { data } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .single();
    return !!data;
  }

  async set(eventId: string, ttlSeconds?: number): Promise<void> {
    await supabase.from('webhook_events').upsert({
      event_id: eventId,
      expires_at: new Date(Date.now() + (ttlSeconds ?? 86400) * 1000),
    });
  }
}
```

## Webhook Security

1. **Signature verification** — HMAC-SHA256 with your webhook signature key
2. **Idempotency** — Events processed once even if Square retries
3. **Auto-queueing** — Optional queue integration for async processing

## Data Normalization

All Square data is normalized to platform-agnostic unified models:

| Square Model | Unified Model |
|-------------|---------------|
| `Customer` | `UnifiedCustomer` |
| `Payment` | `UnifiedTransaction` |
| `Booking` | `UnifiedAppointment` |
| `CatalogObject` | `UnifiedInventoryItem` |

## Testing

Use the sandbox environment:

```bash
SQUARE_API_BASE_URL=https://connect.squareupsandbox.com
SQUARE_APPLICATION_ID=sandbox-sq0idb-...
SQUARE_APPLICATION_SECRET=sandbox-sq0csp-...
```

## Next.js API Route Example

```typescript
// app/api/square/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SquareOAuth } from '@/integration/square/square-oauth';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const oauth = new SquareOAuth({
    get: async (id) => {
      const { data } = await supabase.from('square_tokens').select('*').eq('merchant_id', id).single();
      return data ? { ...data, expires_at: new Date(data.expires_at).getTime() / 1000 } : null;
    },
    set: async (id, tokens) => {
      await supabase.from('square_tokens').upsert({
        merchant_id: id,
        ...tokens,
        expires_at: new Date(tokens.expires_at * 1000).toISOString(),
      });
    },
    delete: async (id) => {
      await supabase.from('square_tokens').delete().eq('merchant_id', id);
    },
    list: async () => {
      const { data } = await supabase.from('square_tokens').select('merchant_id');
      return data?.map((d) => d.merchant_id) ?? [];
    },
  });

  const tokens = await oauth.exchangeCode({ code });

  return NextResponse.redirect('/dashboard/integrations');
}
```

## License

Internal — COLORgenius / SKINgenius platform
