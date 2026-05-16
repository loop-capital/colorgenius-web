# COLORgenius OAuth Flow — Square + Vagaro

> **Scope:** Merchant-facing OAuth 2.0 connections for both POS/scheduling platforms.  
> **Goal:** Secure, refreshable, revocable token pairs with minimal merchant friction.  
> **Security:** PKCE for public clients, state validation, short-lived auth codes, encrypted-at-rest tokens.

---

## Table of Contents

1. [Square OAuth](#1-square-oauth)
2. [Vagaro OAuth](#2-vagaro-oauth)
3. [Unified Token Lifecycle](#3-unified-token-lifecycle)
4. [Security Controls](#4-security-controls)
5. [Error Scenarios](#5-error-scenarios)
6. [Token Refresh Sequences](#6-token-refresh-sequences)

---

## 1. Square OAuth

### 1.1 Square-Specific URLs

| Environment | Value |
|-------------|-------|
| Authorize   | `https://connect.squareup.com/oauth2/authorize` |
| Token       | `https://connect.squareup.com/oauth2/token` |
| Revoke      | `POST https://connect.squareup.com/oauth2/revoke` |
| Permissions | `https://developer.squareup.com/docs/oauth-api/square-permissions` |

### 1.2 Required Scopes

```
customers.read          customers.write
bookings.read           bookings.write
orders.read             orders.write
inventory.read          inventory.write
catalog.read            catalog.write
payments.read
appointments.read       appointments.write
teams.read
locations.read
```

### 1.3 Authorization Flow

```
┌─────────────┐                                         ┌─────────────┐
│  Merchant   │  (1) "Connect Square"                   │  COLORgenius│
│   Browser   │ ──────────────────────────────────────▶ │   Web App   │
└─────────────┘                                         └──────┬──────┘
                                                                 │
                                                                 │ (2) generate state, PKCE
                                                                 │     store in Redis (nonce)
                                                                 │
                                                                 │ (3) redirect to Square
┌─────────────┐                                         ┌────────▼──────┐
│   Square    │  (4) login + consent                      │   Square      │
│  OAuth UI   │ ◀────────────────────────────────────── │   Auth Server │
└─────────────┘                                         └───────────────┘
     │                                                           │
     │ (5) redirect back                                         │
     │     ?code=<auth_code>
     │     &state=<state>
     │     &location_id=<loc>
     │                                                         │
     │──────────────────────────────────────────────────────▶   │
     │                                                   ┌──────▼──────┐
     │                                                   │ COLORgenius │
     │                                                   │  Callback   │
     │                                                   │  Handler    │
     │                                                   └──────┬──────┘
     │                                                          │
     │                                                          │ (6) POST /token
     │                                                          │     code + client_id
     │                                                          │     + client_secret
     │                                                          │     + grant_type=authorization_code
     │                                                          │
     │                                               ┌──────────▼──────────┐
     │                                               │     Square Token    │
     │                                               │       Server        │
     │                                               └──────────┬──────────┘
     │                                                          │
     │                              (7) { access_token, refresh_token,
     │                                    expires_at, merchant_id,
     │                                    token_type: "bearer" }
     │                                                          │
     │◀───────────────────────────────────────────────────────────│
     │                                                   ┌────────▼────────┐
     │                                                   │  COLORgenius    │
     │                                                   │  Token Vault    │
     │                                                   │  (encrypt + DB) │
     │                                                   └─────────────────┘
     │
     │ (8) redirect to /integrations?connected=square
     │     <── merchant sees success UI
```

### 1.4 Square Callback Handler (pseudocode)

```typescript
// POST /oauth/square/callback
async function handleSquareCallback(req: Request) {
  const { code, state, error, error_description, location_id } = req.query;

  // ── Guard ──
  if (error) throw OAuthError(error, error_description);
  const saved = await redis.get(`oauth:state:${state}`);
  if (!saved || saved.expiresAt < now()) throw StateMismatch();
  await redis.del(`oauth:state:${state}`);

  // ── Token exchange ──
  const tokenRes = await fetch('https://connect.squareup.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id:     process.env.SQUARE_APP_ID,
      client_secret: process.env.SQUARE_APP_SECRET,
      grant_type:    'authorization_code',
    }),
  });
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok) throw OAuthError(tokenJson.type, tokenJson.message);

  // ── Persist ──
  const connection = await createPlatformConnection({
    salonId:            saved.salonId,
    platform:           'square',
    status:             'connected',
    accessToken:        encrypt(tokenJson.access_token),
    refreshToken:       encrypt(tokenJson.refresh_token),
    tokenExpiresAt:     new Date(Date.now() + tokenJson.expires_in * 1000).toISOString(),
    tokenScope:         tokenJson.scopes ?? [],
    platformMerchantId: tokenJson.merchant_id,
    platformLocationId: location_id ?? null,
    initialSyncCompleted: false,
  });

  // ── Async: start initial full sync ──
  queueFullSync(connection.id);

  return redirect(`/salons/${saved.salonId}/integrations?connected=square`);
}
```

---

## 2. Vagaro OAuth

### 2.1 Vagaro-Specific URLs

| Environment | Value |
|-------------|-------|
| Authorize   | `https://www.vagaro.com/oauth/authorize` |
| Token       | `POST https://www.vagaro.com/oauth/token` |
| Revoke      | `POST https://www.vagaro.com/oauth/revoke` |
| Docs        | `https://developers.vagaro.com/docs/oauth2` |

### 2.2 Required Scopes

```
read_customers        write_customers
read_appointments     write_appointments
read_payments         write_payments
read_services         write_services
read_products         write_products
read_inventory        write_inventory
read_employees        read_business
```

### 2.3 Authorization Flow

```
┌─────────────┐                                         ┌─────────────┐
│  Merchant   │  (1) "Connect Vagaro"                   │  COLORgenius│
│   Browser   │ ──────────────────────────────────────▶ │   Web App   │
└─────────────┘                                         └──────┬──────┘
                                                                 │
                                                                 │ (2) generate state, PKCE
                                                                 │     store in Redis (nonce)
                                                                 │
                                                                 │ (3) redirect to Vagaro
┌─────────────┐                                         ┌────────▼──────┐
│   Vagaro    │  (4) login + consent                      │   Vagaro      │
│  OAuth UI   │ ◀────────────────────────────────────── │   Auth Server │
└─────────────┘                                         └───────────────┘
     │                                                           │
     │ (5) redirect back                                         │
     │     ?code=<auth_code>
     │     &state=<state>
     │     &business_id=<bid>
     │                                                         │
     │──────────────────────────────────────────────────────▶   │
     │                                                   ┌──────▼──────┐
     │                                                   │ COLORgenius │
     │                                                   │  Callback   │
     │                                                   │  Handler    │
     │                                                   └──────┬──────┘
     │                                                          │
     │                                                          │ (6) POST /token
     │                                                          │     code + grant_type
     │                                                          │     + client_id + client_secret
     │                                                          │
     │                                               ┌──────────▼──────────┐
     │                                               │     Vagaro Token    │
     │                                               │       Server        │
     │                                               └──────────┬──────────┘
     │                                                          │
     │                              (7) { access_token, refresh_token,
     │                                    expires_in, token_type, scope }
     │                                                          │
     │◀───────────────────────────────────────────────────────────│
     │                                                   ┌────────▼────────┐
     │                                                   │  COLORgenius    │
     │                                                   │  Token Vault    │
     │                                                   │  (encrypt + DB) │
     │                                                   └─────────────────┘
     │
     │ (8) redirect to /integrations?connected=vagaro
     │     <── merchant sees success UI
```

### 2.4 Vagaro Callback Handler (pseudocode)

```typescript
// POST /oauth/vagaro/callback
async function handleVagaroCallback(req: Request) {
  const { code, state, error, error_description, business_id } = req.query;

  if (error) throw OAuthError(error, error_description);
  const saved = await redis.get(`oauth:state:${state}`);
  if (!saved || saved.expiresAt < now()) throw StateMismatch();
  await redis.del(`oauth:state:${state}`);

  const tokenRes = await fetch('https://www.vagaro.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.VAGARO_CLIENT_ID,
      client_secret: process.env.VAGARO_CLIENT_SECRET,
      grant_type:    'authorization_code',
      redirect_uri:  `${process.env.APP_URL}/oauth/vagaro/callback`,
    }),
  });
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok) throw OAuthError(tokenJson.error, tokenJson.error_description);

  const connection = await createPlatformConnection({
    salonId:            saved.salonId,
    platform:           'vagaro',
    status:             'connected',
    accessToken:        encrypt(tokenJson.access_token),
    refreshToken:       encrypt(tokenJson.refresh_token),
    tokenExpiresAt:     new Date(Date.now() + tokenJson.expires_in * 1000).toISOString(),
    tokenScope:         (tokenJson.scope ?? '').split(' '),
    platformMerchantId: business_id ?? tokenJson.business_id ?? '',
    initialSyncCompleted: false,
  });

  queueFullSync(connection.id);
  return redirect(`/salons/${saved.salonId}/integrations?connected=vagaro`);
}
```

---

## 3. Unified Token Lifecycle

### 3.1 Token Storage

```
┌─────────────────────────────────────────────────────────────┐
│                    Token Vault (PostgreSQL)                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Table: platform_connections                          │  │
│  │  ──────────────────────────────────────────────────   │  │
│  │  id                    UUID PK                        │  │
│  │  salon_id              UUID FK                        │  │
│  │  platform              ENUM('square','vagaro')        │  │
│  │  status                ENUM(...)                        │  │
│  │  access_token          TEXT  -- AES-256-GCM encrypted │  │
│  │  refresh_token         TEXT  -- AES-256-GCM encrypted │  │
│  │  token_expires_at      TIMESTAMPTZ                    │  │
│  │  token_scope           TEXT[]                         │  │
│  │  platform_merchant_id  TEXT                           │  │
│  │  platform_location_id  TEXT                           │  │
│  │  webhook_secret        TEXT  -- encrypted             │  │
│  │  webhook_endpoint_url  TEXT                           │  │
│  │  webhook_events_subscribed TEXT[]                     │  │
│  │  last_sync_at          TIMESTAMPTZ                    │  │
│  │  last_sync_cursor      TEXT                           │  │
│  │  initial_sync_completed BOOLEAN                       │  │
│  │  created_at / updated_at TIMESTAMPTZ                  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Token Rotation (Refresh) Cron

```
Every 5 minutes:
  SELECT * FROM platform_connections
  WHERE status = 'connected'
    AND token_expires_at < NOW() + INTERVAL '10 minutes'

  For each:
    ┌──────────────────┐
    │  Refresh Token   │
    │    Job Queue     │
    │  (BullMQ/redis)  │
    └────────┬─────────┘
             │
             ▼
    ┌─────────────────┐
    │  Platform-specific│
    │  refresh handler │
    │  (Square/Vagaro)│
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Encrypt new    │
    │  tokens, update │
    │  DB, emit event │
    └─────────────────┘
```

---

## 4. Security Controls

| Control | Implementation |
|---------|----------------|
| **State validation** | Cryptographic random 32-byte `state`; stored in Redis with 10-min TTL; compared on callback |
| **PKCE** | `code_challenge` (S256) on authorize; `code_verifier` on token exchange |
| **Redirect URI whitelist** | Exact-match only; no wildcards; stored per environment |
| **Token encryption** | AES-256-GCM with KMS-backed key; envelope encryption pattern |
| **Token expiry** | Never store indefinitely; refresh at most 10 min before expiry |
| **Scope downgrade** | Alert if returned scopes ≠ requested; mark `refresh_needed` if critical scopes missing |
| **Revocation** | On disconnect: call platform revoke endpoint + delete from DB + delete webhooks |
| **Audit log** | Every token grant, refresh, and revocation written to `sync_audit_log` |

---

## 5. Error Scenarios

| Scenario | User Impact | Recovery |
|----------|-------------|----------|
| **User declines OAuth consent** | Redisplay "Connect" button with error toast | Retry immediately |
| **State mismatch / CSRF** | Error page; user retries | Auto-clear stale state, retry |
| **Token exchange fails (5xx)** | "Connection failed — try again" | Exponential backoff retry ×3, then alert ops |
| **Scope mismatch** | Yellow banner: "Limited permissions" | Prompt user to re-auth with full scopes |
| **Refresh token expired/invalid** | Connection status → `disconnected` | Force re-auth flow |
| **Platform revokes token** | Webhook or health-check detects → `revoked` | Email salon owner to re-connect |

---

## 6. Token Refresh Sequences

### 6.1 Square Refresh

```http
POST https://connect.squareup.com/oauth2/token
Content-Type: application/json

{
  "grant_type": "refresh_token",
  "client_id": "sq0idp-...",
  "client_secret": "sq0csp-...",
  "refresh_token": "REPLACE_WITH_ENCRYPTED_REFRESH"
}
```

Response:
```json
{
  "access_token": "EAAA...",
  "token_type": "bearer",
  "expires_at": "2025-01-01T00:00:00Z",
  "merchant_id": "MLY...",
  "refresh_token": "REPLACE_IF_NEW"
}
```

### 6.2 Vagaro Refresh

```http
POST https://www.vagaro.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&client_id=...
&client_secret=...
&refresh_token=REPLACE_WITH_ENCRYPTED_REFRESH
```

Response:
```json
{
  "access_token": "vgr_...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "REPLACE_IF_NEW",
  "scope": "read_customers write_customers ..."
}
```

### 6.3 Refresh Orchestrator (pseudocode)

```typescript
// src/jobs/tokenRefresh.ts
export async function refreshConnection(connectionId: string) {
  const conn = await db.platformConnections.findUnique({ where: { id: connectionId } });
  if (!conn || conn.status !== 'connected') return;

  const handler = conn.platform === 'square' ? squareOAuth : vagaroOAuth;
  const decryptedRefresh = decrypt(conn.refreshToken);

  try {
    const fresh = await handler.refresh(decryptedRefresh);
    await db.platformConnections.update({
      where: { id: connectionId },
      data: {
        accessToken:  encrypt(fresh.access_token),
        refreshToken: encrypt(fresh.refresh_token ?? conn.refreshToken),
        tokenExpiresAt: fresh.expires_at
          ? new Date(fresh.expires_at).toISOString()
          : new Date(Date.now() + fresh.expires_in * 1000).toISOString(),
        status: 'connected',
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (err.code === 'INVALID_REFRESH_TOKEN' || err.code === 'REVOKED') {
      await db.platformConnections.update({
        where: { id: connectionId },
        data: { status: 'disconnected', updatedAt: new Date().toISOString() },
      });
      await notifySalon(conn.salonId, `Your ${conn.platform} connection expired. Please reconnect.`);
    }
    throw err; // Let BullMQ retry if transient
  }
}
```

---

## Appendix: Environment Variables

```bash
# Square
SQUARE_APP_ID=sq0idp-...
SQUARE_APP_SECRET=sq0csp-...
SQUARE_ENVIRONMENT=sandbox|production

# Vagaro
VAGARO_CLIENT_ID=...
VAGARO_CLIENT_SECRET=...
VAGARO_ENVIRONMENT=sandbox|production

# Internal
OAUTH_STATE_TTL_SECONDS=600
TOKEN_ENCRYPTION_KEY_ID=kms-key-uuid
APP_URL=https://app.colorgenius.com
```
