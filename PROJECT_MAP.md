# ColorGenius Project Map

**Last updated:** 2026-09-16
**Repo:** https://github.com/loop-capital/colorgenius-web
**Tech stack:** Next.js 14 App Router, TypeScript, Prisma, PostgreSQL, Vercel

---

## Database Schema (54 tables)

### Core Entities
- **users** — Authentication (email, password, first_name, role)
- **salons** — Salon profiles, settings, Phorest/Square connections
- **stylists** — Public profiles, handles, creator profiles for marketplace
- **clients** — Client profiles, hair_profile JSON, allergies, preferences
- **brands** — Hair color brands (L'Oréal, Wella, Schwarzkopf, etc.)
- **product_lines** — Brand product lines
- **shades** — Color shades with equivalents
- **shade_equivalents** — Cross-brand shade mappings (Wella → Redken)

### Formulas & Formulation
- **formulas** — Saved color formulas
- **formulation_sessions** — Active formulation sessions
- **formulation_components** — Formula ingredients
- **formula_history** — Formula version history
- **formula_listings** — Marketplace listings
- **formula_purchases** — Marketplace purchases
- **formula_usage_log** — Usage tracking

### Client Management
- **client_visits** — Visit history
- **client_photo_collections** — Photo collections
- **client_portals** — Client portal links
- **analyses** — Hair analysis results (level, tone, porosity, RGB values)
- **photo_analyses** — AI photo analysis results
- **hair_segmentations** — Hair segmentation data
- **texture_analyses** — Texture analysis

### Community & Gallery
- **community_posts** — Community feed posts
- **post_comments** — Comments on posts
- **post_likes** — Likes
- **formula_photos** — Gallery photos
- **formula_photo_comments** — Photo comments
- **formula_photo_votes** — Photo votes
- **formula_photo_tags** — Photo tags
- **formula_ratings** — Formula ratings

### POS Integrations
- **square_connections** — Square OAuth connections
- **phorest_connections** — Phorest API connections (NEW — Claude Code fix)
- **salon_devices** — Trusted salon devices
- **inventory_items** — Inventory tracking
- **inventory_transactions** — Inventory movements

### Color Bar
- **color_bar_sessions** — In-salon color bar sessions
- **stylist_feedback** — Session feedback
- **session_codes** — Client session codes

### Subscriptions & Billing
- **subscriptions** — Subscription records (was in-memory, now DB — Claude Code fix)
- **formula_billing_invoices** — Invoice records
- **formula_client_requests** — Client formula requests

### System
- **api_keys** — API key management
- **webhooks** — Webhook configurations
- **schema_migrations** — Migration tracking

---

## API Routes (108 routes)

### Authentication
- `POST /api/auth/login` — Email/password login
- `POST /api/auth/register` — Registration (creates user + stylist row)
- `GET /api/auth/me` — Current user info
- `POST /api/auth/logout` — Logout
- `GET /api/auth/google` — Google OAuth
- `GET /api/auth/google/callback` — Google callback
- `GET /api/auth/apple` — Apple OAuth
- `GET /api/auth/apple/callback` — Apple callback

### Brands & Shades
- `GET /api/brands` — List all brands
- `GET /api/brands/[brand]/shades` — Brand shades
- `GET /api/brands/[brand]/equivalents` — Cross-brand shade equivalents ✅

### Formulation
- `POST /api/formulate` — Generate formula
- `POST /api/formulate/convert` — Convert between brands ✅
- `POST /api/formulations/save` — Save formula
- `GET /api/formulas` — List formulas
- `POST /api/formulas/purchase` — Purchase formula
- `POST /api/formulas/use` — Use formula

### AI Analysis
- `POST /api/vision-analyze` — AI photo analysis ✅
- `POST /api/analyze` — Hair analysis
- `GET /api/photos/[id]/analysis` — Photo analysis results ✅
- `POST /api/photos/[id]/analyze` — Analyze specific photo
- `POST /api/photos/upload` — Upload photo for analysis

### Clients
- `GET /api/clients` — List clients
- `POST /api/clients` — Create client
- `GET /api/clients/[id]/profile` — Client profile
- `GET /api/clients/[id]/last-consultation` — Last visit
- `GET /api/clients/search` — Search clients

### Square Integration
- `GET /api/square/status` — Connection status
- `POST /api/square/sync` — Sync data
- `GET /api/square/oauth/callback` — OAuth callback
- `POST /api/square/webhook` — Webhook handler
- `POST /api/square/clients/sync` — Client sync
- `POST /api/square/clients/sync-toggle` — Toggle sync
- `GET /api/square/clients/sync-cron` — Cron sync

### Phorest Integration
- `GET /api/phorest/status` — Connection status
- `GET /api/phorest/clients` — Client list
- `GET /api/phorest/appointments` — Appointments
- `GET /api/phorest/inventory` — Inventory
- `POST /api/phorest/sync` — Sync data
- `POST /api/v1/phorest/connect` — Connect to Phorest (was broken — table didn't exist)

### Community
- `GET /api/community/feed` — Community feed
- `POST /api/community/posts` — Create post
- `GET /api/community/posts/[id]` — Post detail
- `POST /api/community/posts/[id]/comments` — Add comment
- `POST /api/community/posts/[id]/like` — Like post
- `POST /api/community/posts/[id]/save` — Save post
- `POST /api/community/upload` — Upload content
- `POST /api/community/share` — Share content
- `POST /api/community/vote` — Vote on content
- `GET /api/community/trending` — Trending

### Marketplace
- `GET /api/marketplace/browse` — Browse formulas (mock data)
- `POST /api/marketplace/purchase` — Purchase (mock)
- `POST /api/marketplace/publish` — Publish formula (mock)
- `GET /api/marketplace/templates` — Templates (mock)
- `GET /api/marketplace/usage` — Usage stats (mock)
- `GET /api/marketplace/billing` — Billing (mock)
- `GET /api/marketplace/creator/dashboard` — Creator dashboard (mock)
- `POST /api/marketplace/client-requests` — Client requests
- `POST /api/marketplace/client-requests/[id]/accept` — Accept request
- `POST /api/marketplace/client-requests/[id]/decline` — Decline request
- `GET /api/marketplace/lookup/[code]` — Lookup by code
- `POST /api/marketplace/upload` — Upload marketplace content
- `POST /api/marketplace/inventory/check` — Check inventory

### Gallery
- `GET /api/gallery/public` — Public gallery
- `GET /api/gallery/seasonal` — Seasonal trends
- `GET /api/gallery/stylist/[id]` — Stylist gallery
- `GET /api/gallery/trending` — Trending photos

### Color Bar (v1)
- `POST /api/v1/color-bar/session` — Create session
- `POST /api/v1/color-bar/session/[id]/complete` — Complete session
- `POST /api/v1/color-bar/session/[id]/feedback` — Session feedback
- `GET /api/v1/color-bar/clients` — Color bar clients
- `GET /api/v1/color-bar/formulas/[clientId]` — Client formulas
- `POST /api/v1/color-bar/formula/create-official` — Create official formula
- `GET /api/v1/color-bar/pricing` — Pricing config
- `POST /api/v1/color-bar/square-order` — Push order to Square

### Admin/System
- `GET /api/health` — Health check
- `POST /api/feedback` — Submit feedback
- `GET /api/history` — Formula history
- `GET /api/user/shades` — User shades
- `GET /api/user/brands` — User brands
- `GET /api/user/lines` — User product lines
- `GET /api/v1/admin/account-types` — Account types
- `GET /api/v1/trends` — Trend data
- `GET /api/v1/visits` — Visit data

### Subscriptions
- `GET /api/subscriptions` — Subscription status (was in-memory, now DB)

### Profile
- `GET /api/profile` — User profile (still in-memory mock)

---

## Pages (28 pages)

### Public
- `/` — Landing page
- `/login` — Login
- `/register` — Registration
- `/privacy` — Privacy policy
- `/c/[token]` — Client portal (shareable link)

### Dashboard
- `/dashboard` — Main dashboard
- `/dashboard/inventory` — Inventory management
- `/dashboard/pricing` — Pricing rules

### Core Features
- `/formulate` — Formula generator ✅
- `/service` — New service flow
- `/questionnaire` — Client consultation
- `/analyze` — Photo analysis ✅
- `/capture` — Photo capture

### Client Management
- `/clients` — Client list
- `/clients/[id]` — Client detail
- `/history` — Formula history

### Community & Gallery
- `/community` — Community feed
- `/gallery` — Photo gallery
- `/gallery/[id]` — Photo detail

### Other
- `/library` — Formula library
- `/certification` — Certification program
- `/settings` — Account settings
- `/subscription` — Subscription management
- `/beta` — Beta features
- `/admin/account-types` — Admin (account types)

---

## Features Implemented

### ✅ Multi-Brand Formula Translation
- **Route:** `GET /api/brands/[brand]/equivalents`
- **Database:** `shade_equivalents` table
- **Function:** Maps shades across brands (e.g., Wella Koleston → Redken Color Fusion)
- **Status:** Live

### ✅ Photo-Based Hair Analysis
- **Routes:** `POST /api/vision-analyze`, `POST /api/photos/[id]/analyze`
- **Database:** `photo_analyses`, `analyses` tables
- **Function:** AI analysis of hair photos for level, tone, porosity, damage
- **Status:** Live

### ✅ Formula Generation
- **Route:** `POST /api/formulate`
- **Function:** Generates color formulas with measurements
- **Status:** Live

### ✅ Client Management
- **Routes:** `/api/clients/*`
- **Database:** `clients`, `client_visits`, `client_photo_collections`
- **Function:** Client profiles, visit history, photo collections
- **Status:** Live

### ✅ Square POS Integration
- **Routes:** `/api/square/*`
- **Database:** `square_connections`
- **Function:** OAuth, client sync, webhooks, order push
- **Status:** Live (Claude Code fixed SDK calls)

### ✅ Phorest Integration
- **Routes:** `/api/phorest/*`, `/api/v1/phorest/connect`
- **Database:** `phorest_connections` (NEW — Claude Code migration)
- **Function:** Client sync, appointments, inventory
- **Status:** Needs DB migration applied

### ✅ Community Features
- **Routes:** `/api/community/*`, `/api/v1/community/*`
- **Database:** `community_posts`, `post_comments`, `post_likes`
- **Function:** Feed, posts, comments, likes, uploads
- **Status:** Feed + upload still mock (Claude Code only fixed vote auth)

### ⚠️ Marketplace
- **Routes:** `/api/marketplace/*`
- **Database:** `formula_listings`, `formula_purchases`
- **Function:** Browse, purchase, publish formulas
- **Status:** Still mock data — needs real implementation

### ⚠️ Profile
- **Route:** `/api/profile`
- **Function:** User profile data
- **Status:** Hardcoded in-memory mock with Tiché's data

### ⚠️ Subscriptions
- **Route:** `/api/subscriptions`
- **Database:** `subscriptions` table
- **Function:** Subscription management
- **Status:** Now reads/writes DB (Claude Code fixed), but Square integration still TODO

---

## Integrations

### Square
- OAuth connection
- Client sync (bidirectional)
- Order push (Color Bar)
- Webhook handling
- Inventory sync

### Phorest
- API connection (NEW table)
- Client sync
- Appointment sync
- Inventory sync

### Google Vision
- Photo analysis
- Hair segmentation

---

## Known Issues

1. **Auth sidebar** — Still shows "Guest" / "Signed Out" after login (being fixed by Claude Code)
2. **JWT_SECRET** — Not set in `.env.local` (Claude Code fixed locally)
3. **Middleware caching** — API responses cached publicly (Claude Code fixed locally)
4. **Marketplace** — Still mock data
5. **Profile API** — Still hardcoded mock
6. **Phorest encryption** — Was storing plaintext passwords (Claude Code fixed)
7. **Square SDK** — Was using wrong API shape (Claude Code fixed)

---

## Claude Code Changes (NOT YET IN REPO)

### Schema Migration (needs DB execution)
- `users.salon_id` — Links user to salon
- `stylists.user_id` — Bridges login to creator profile
- `stylists.handle` — Public @handle
- `phorest_connections` — New table for Phorest API

### Auth Fixes (14 files)
- Replaced forgeable `token.split(':')` with real JWT verification
- Files: All Phorest routes, Square routes, community/vote, color-bar/formulas

### Registration Fix
- Now creates `stylists` row in same transaction as `users`

### Subscriptions Fix
- Changed from in-memory Map to real DB reads/writes

### Phorest Encryption Fix
- Now actually encrypts/decrypts passwords (was storing plaintext)

### Square SDK Fix
- Fixed `customersApi.listCustomers` → `customers.list`
- Fixed snake_case → camelCase field names

---

## Next Steps

1. **Get Claude Code's changes into repo** — Push to branch or copy files
2. **Run DB migration** — `prisma migrate deploy`
3. **Deploy to Vercel** — After merge
4. **Fix remaining mock data** — Marketplace, profile, community feed
5. **Document features properly** — This file is a start, needs ongoing maintenance

