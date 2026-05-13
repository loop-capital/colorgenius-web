# ColorGenius — Project Info

> **Last Updated:** 2026-05-12
> **Lead:** Jason Opland
> **Status:** 🔴 In Progress — Landing page + formulate flow broken, needs repair

---

## Repository & Deployment

### Git
- **Repo:** https://github.com/loop-capital/colorgenius-web.git
- **Branch:** `feature/pwa-camera` (active) → deploys to `main`
- **Location:** `/home/jason/.openclaw/workspaces/colorgenius/dashboard/`

### Vercel
- **Project:** `dashboard` (project ID: `prj_EKwoZjoanit1N4iNi3MujBoMhHM0`)
- **URL:** https://colorgenius.co
- **Org:** `team_OFCIBr60qcpFAM2py5rAfPnU`
- **Landing page project:** `landing-page` (project ID: `prj_bwlJsi2Aw0zhs41TBh9YmilZCjxH`)
  - NOT currently linked to colorgenius.co — dashboard project serves the domain

### Supabase
- **Project Ref:** `beuiayrnzbgvvqfgsenc`
- **URL:** https://beuiayrnzbgvvqfgsenc.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/beuiayrnzbgvvqfgsenc

### GitHub
- **Account:** loop-capital
- **Web repo:** colorgenius-web

---

## Accounts & Credentials

### Expo (iOS Builds)
- **Email:** theoplandgroup@gmail.com
- **Password:** Natishafl0rence!
- **Access Token:** Qe7Nuio-DEpkKeJa-VTqGmX4JLvv--lpvsZULah7

### Apple Developer
- **Email:** jasonopland@msn.com
- **Password:** Nat1shafl0!

### Auth (for dev — middleware disabled)
- **JWT Secret:** `colorgenius-prod-secret-2026`
- **Middleware:** Currently disabled (all routes public) — RE-ENABLE before production

---

## Architecture

### Web Dashboard (Next.js 16 + React 19)
- **Location:** `colorgenius/dashboard/`
- **Framework:** Next.js 16.2.4 + React 19 + Tailwind CSS 4
- **Database:** Supabase (Postgres) via Prisma
- **Auth:** JWT (jose) + middleware — currently disabled for debugging

### Routes
| Route | Status | Description |
|-------|--------|-------------|
| `/` | 🔴 Broken | Landing page — built but needs polish |
| `/dashboard` | ✅ Working | App dashboard |
| `/formulate` | 🔴 Broken | 5-step formulate — buttons work but color wheel broken |
| `/dashboard/inventory` | ✅ Working | Vish inventory management |
| `/dashboard/pricing` | ✅ Working | Vish pricing rules |
| `/service` | ✅ Working | Vish service flow with scale |
| `/login` | ✅ Working | Login page |
| `/analyze` | ✅ Working | Photo analysis |
| `/capture` | ✅ Working | Hair capture with hair type icons |
| `/clients` | ✅ Working | Client management |
| `/history` | ✅ Working | Formula history |
| `/gallery` | ✅ Working | Color gallery |

### API Routes
- `/api/formulate` — Generate formula
- `/api/v1/formulas` — CRUD saved formulas
- `/api/v1/inventory` — Inventory management
- `/api/v1/pricing` — Pricing rules
- `/api/auth/login` — JWT login
- `/api/auth/register` — User registration

---

## Known Issues (2026-05-12)

### CRITICAL: Deploy Limit Hit
- Vercel free tier: 100 deploys/day — ALL USED TODAY
- Cannot deploy until limit resets (~midnight or tomorrow morning)
- All edits are in code but NOT deployed

### ColorWheel3D Click Not Working
- **File:** `components/custom/color-wheel-3d.tsx`
- **Issue:** SVG `motion.circle` with `onClick` not firing in browsers
- **Stashed fix:** Dev agent added transparent hit-target circle + moved click handler to `<g>` wrapper
- **Risk:** Changes to formulate page or ColorWheel3D sometimes break ALL buttons (type="button" issue)
- **Lesson:** ALWAYS set `type="button"` on non-submit buttons in Next.js App Router

### Formulate Page Status
- 5 steps: Photo → Hair Assessment → Target Look → Condition → Results
- Steps 1-4 navigation works (buttons confirmed working)
- Color wheel click does NOT work (stashed fix needs careful application)
- Photo step has: Take Photo, Upload Photo, instructional box, dry hair recommendation
- Hair Assessment has: level swatches, color wheel (broken), 12 tone circles in 2 rows of 6

### Landing Page Status
- Has: Hero (Stop Guessing Start Formulating), How It Works, Color Management Suite, AI Features, Pricing, CTA
- Uses Lucide React icons (no emojis)
- Sign In modal → login → redirect to /dashboard
- ConditionalLayout hides sidebar on landing page

---

## Do NOT
- Deploy more than 5 changes at a time (batch edits)
- Use `motion.button` or `motion.circle` with onClick — use plain HTML buttons
- Forget `type="button"` on any button element
- Deploy without testing the build first (`npx next build`)
- Edit formulate page and ColorWheel3D in the same deploy

---

## Tomorrow's Fix Plan

### Priority 1: Fix Color Wheel
1. Apply stashed fix carefully (transparent hit-target circles)
2. Test buttons still work after applying
3. Single deploy with both fixes bundled

### Priority 2: Re-enable Auth
1. Restore middleware to require auth
2. Test login flow works
3. Deploy

### Priority 3: Polish Landing Page
1. Finalize copy and layout
2. Test on mobile
3. Single deploy

### Priority 4: Batch All Remaining Edits
1. Collect ALL changes needed
2. Build locally, test
3. ONE deploy

---

## Hardware
- **Acaia Pearl 2021** — 0.1g accuracy, BLE 4.0
- **Acaia Lunar** — 0.1g accuracy, BLE, compact
- 2 purchased for testing

## Database Schema
Key models: `User`, `Client`, `Formulation`, `Brand`, `Product`, `InventoryItem`, `PricingRule`
See `prisma/schema.prisma`
