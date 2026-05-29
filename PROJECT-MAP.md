# COLORgenius — Project Map

> **Last updated:** 2026-05-29
> **Commit:** 010b952
> **Production:** https://colorgenius.co

---

## Stack
- **Framework:** Next.js 15 (App Router)
- **ORM:** Prisma (PostgreSQL via Supabase, but app code uses Prisma only)
- **Auth:** Custom JWT (jose) — cookie + Bearer token
- **Deployment:** Vercel (dashboard/ directory)
- **Mobile:** React Native / Expo (separate mobile/ directory)
- **Payments:** Square (NOT Stripe)
- **Storage:** Cloudflare R2

## Auth Flow
- `lib/auth.ts` — JWT generation, cookie management, `verifyBearerToken()`, `getUserFromRequest()`
- Register/Login: bcrypt password hash → Prisma users table → JWT cookie
- OAuth: Apple/Google callbacks → Prisma user lookup by social ID → JWT cookie
- **Zero Supabase dependency in app/** — fully removed (010b952)

## API Routes (app/api/)

### Auth (public except /me)
| Route | Method | Auth? | Purpose |
|-------|--------|-------|---------|
| `/api/auth/register` | POST | No | Email/password registration |
| `/api/auth/login` | POST | No | Email/password login |
| `/api/auth/logout` | POST | No | Clear cookie |
| `/api/auth/me` | GET | Yes | Current user profile |
| `/api/auth/apple` | GET | No | Apple Sign In redirect |
| `/api/auth/apple/callback` | POST | No | Apple OAuth callback |
| `/api/auth/google` | GET | No | Google Sign In redirect |
| `/api/auth/google/callback` | GET | No | Google OAuth callback |

### Formulas (all require auth)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/v1/formulas/list` | GET | List formulas (filter by client/stylist) |
| `/api/v1/formulas/[id]` | GET | Single formula detail |
| `/api/v1/formulas` | POST | Create formula |
| `/api/formulas/route` | POST | Alternative formula create |
| `/api/formulas/purchase` | POST | Purchase formula from marketplace |
| `/api/formulas/use` | POST | Log formula usage |
| `/api/formulations/save` | POST | Save formulation with client info |

### Inventory (all require auth)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/v1/inventory` | GET | List inventory items |
| `/api/v1/inventory/deduct` | POST | Deduct after formula |
| `/api/v1/inventory/low-stock` | GET | Low stock alerts |
| `/api/v1/inventory/reorder-check` | GET | Reorder suggestions |

### Color Bar (iPad mode)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/v1/color-bar/session` | POST | Start color bar session |
| `/api/v1/color-bar/session/[id]/complete` | POST | Complete session |
| `/api/v1/color-bar/session/[id]/feedback` | POST | Submit feedback |
| `/api/v1/color-bar/formula/create-official` | POST | Create official formula |
| `/api/v1/color-bar/formulas/[clientId]` | GET | Client's color bar formulas |
| `/api/v1/color-bar/pricing` | GET | Pricing config |
| `/api/v1/color-bar/square-order` | POST | Square order integration |
| `/api/v1/color-bar/clients` | GET | Client list for color bar |

### Clients
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/clients` | GET/POST | List/create clients |
| `/api/clients/search` | GET | Search clients |
| `/api/clients/[id]/profile` | GET | Client profile |
| `/api/clients/[id]/last-consultation` | GET | Last consultation |
| `/api/v1/clients/[id]/collection` | GET | Client photo collection |
| `/api/v1/clients/[id]/send-portal-link` | POST | Send portal link |

### Gallery / Community
| Route | Purpose |
|-------|---------|
| `/api/v1/gallery/photos/*` | Photo CRUD, comments, votes, saves, shares |
| `/api/v1/gallery/feed` | Gallery feed |
| `/api/v1/community/posts/*` | Community posts CRUD, likes, comments |
| `/api/v1/community/notifications` | Notifications |
| `/api/gallery/*` | Public gallery, trending, seasonal |

### Square Integration
| Route | Purpose |
|-------|---------|
| `/api/square/status` | Connection status |
| `/api/square/sync` | Sync inventory |
| `/api/square/webhook` | Square webhook handler |
| `/api/square/oauth/callback` | OAuth callback |
| `/api/square/clients/sync` | Client sync |
| `/api/square/clients/sync-cron` | Cron sync |

### Marketplace
| Route | Purpose |
|-------|---------|
| `/api/marketplace/browse` | Browse formulas |
| `/api/marketplace/publish` | Publish formula |
| `/api/marketplace/purchase` | Purchase formula |
| `/api/marketplace/templates` | Template library |
| `/api/marketplace/creator/dashboard` | Creator dashboard |

### Other
| Route | Purpose |
|-------|---------|
| `/api/health` | Health check |
| `/api/analyze` | Photo analysis |
| `/api/color-match` | Color matching |
| `/api/formulate` | Formula generation |
| `/api/profile` | User profile CRUD |
| `/api/salon/*` | Salon devices, PIN, trusted |
| `/api/v1/stylists/me` | Stylist profile |
| `/api/v1/visits` | Visit tracking |
| `/api/v1/pricing/config` | Pricing config |
| `/api/v1/trends` | Trend data |
| `/api/v1/portal/[token]` | Client portal |
| `/api/phorest/*` | Phorest integration |
| `/api/subscriptions` | Subscription management |

## Key Libraries (lib/)
| File | Purpose |
|------|---------|
| `lib/auth.ts` | JWT auth (generate, verify, cookie management) |
| `lib/prisma.ts` | Prisma client singleton |
| `lib/square.ts` | Square SDK client |
| `lib/square-multi.ts` | Multi-location Square support |
| `lib/r2.ts` | Cloudflare R2 storage |
| `lib/vish/schemas.ts` | Zod schemas for Vish API |
| `lib/formulation.ts` | Formulation engine |
| `lib/color-analysis.ts` | Color analysis logic |
| `lib/inventory/auto-deduct.ts` | Auto-deduct inventory |
| `lib/scale/acaia.ts` | Acaia BLE scale integration |
| `lib/subscription-tiers.ts` | Subscription tier logic |

## Prisma Models (62 models)
Key models: `users`, `clients`, `formulas`, `inventory_items`, `InventoryItem`, `brands`, `shades`, `stylists`, `salons`, `visits`, `formula_photos`, `community_posts`, `subscriptions`, `square_connections`, `color_bar_sessions`, `formulation_sessions`

## Environment Variables (required)
```
DATABASE_URL          — PostgreSQL connection string
JWT_SECRET            — JWT signing key
SQUARE_ACCESS_TOKEN   — Square API
SQUARE_ENVIRONMENT    — production|sandbox
SQUARE_APPLICATION_ID — Square app ID
R2_ACCOUNT_ID         — Cloudflare R2
R2_ACCESS_KEY_ID      — Cloudflare R2
R2_SECRET_ACCESS_KEY  — Cloudflare R2
R2_BUCKET_NAME        — Cloudflare R2 bucket
APPLE_TEAM_ID         — Apple Sign In
APPLE_KEY_ID          — Apple Sign In
APPLE_SERVICES_ID     — Apple Sign In
APPLE_PRIVATE_KEY     — Apple Sign In
GOOGLE_CLIENT_ID      — Google Sign In
GOOGLE_CLIENT_SECRET  — Google Sign In
GOOGLE_REDIRECT_URI   — Google OAuth callback URL
```

## Deployment
- **Vercel project:** `dashboard` (in colorgenius/ root)
- **Deploy command:** `cd dashboard && npx vercel --prod --yes`
- **Git:** Push to main auto-deploys via Vercel GitHub integration
- **EAS (iOS):** `cd mobile && EXPO_TOKEN=... npx eas build --platform ios --profile production`

## Supabase Status
- **App code:** ZERO Supabase dependency — fully migrated to Prisma (commit 010b952)
- **Database:** Still hosted on Supabase PostgreSQL (accessed via DATABASE_URL)
- **Can shut down Supabase project:** After confirming DATABASE_URL points to alternative PostgreSQL host

---

## Recent Fixes (2026-05-29)

### Auth Fixes (commit `bd1f8ff`)
- `/api/auth/me` — now uses `getUserFromRequest()` (cookie OR Bearer) instead of `verifyBearerToken` (Bearer only)
- `/api/v1/formulas` POST — added auth guard
- `/api/v1/formulas/[id]` GET/PUT/DELETE — added auth + ownership check (users can only access own formulas)
- Google callback — removed `google_id` (not in schema), switched to email-based lookup
- Apple/Google callbacks — added `password_hash` placeholder for OAuth-created accounts

### Supabase Removal (commits `53452f6`, `010b952`, `3bece0f`)
- All routes migrated to Prisma
- `@supabase/supabase-js` removed from package.json
- `lib/supabaseClient.ts` deleted
- Zero Supabase in app/ or lib/
- Only DATABASE_URL remains (PostgreSQL connection)
