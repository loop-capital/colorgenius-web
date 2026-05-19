# COLORgenius — Project Completion Brief

> **Last updated:** 2026-05-18 17:30 EDT
> **Status:** 90% complete. Mobile iOS build + submission is the ONLY remaining task.
> **Workspace:** `/home/jason/.openclaw/workspaces/colorgenius/`

---

## What Is COLORgenius

AI-powered hair color formulation platform for professional stylists. Takes a photo of client's hair, analyzes it, and generates a precise formula — shades, developer, ratios, and processing time.

**Deployed:** colorgenius.co (Vercel)
**Project type:** Next.js 14 web dashboard + React Native (Expo) mobile app

---

## What's DONE — Don't Touch

| Component | Status | Location |
|-----------|--------|----------|
| Web landing page | ✅ Deployed | `dashboard/app/page.tsx` |
| Beta signup form | ✅ Deployed at `/beta` | `dashboard/app/beta/page.tsx` |
| Formulate page (6-step AI) | ✅ Deployed | `dashboard/app/formulate/` |
| Bowl weighing pipeline | ✅ Deployed | `dashboard/app/api/v1/bowls/`, `dashboard/components/scale-bowl.tsx` |
| Inventory management | ✅ Deployed | `dashboard/app/api/v1/inventory/` |
| Square POS integration | ✅ Built | `integration/square/` |
| Vagaro integration | ✅ Built (3,055 lines) | `integration/vagaro/` |
| Client management | ✅ Deployed | `dashboard/app/clients/` |
| Community gallery | ✅ Deployed | `dashboard/app/community/` |
| Formula marketplace | ✅ Deployed | `dashboard/app/library/` |
| Photo analysis (Kimi K2.6) | ✅ Deployed | API routes |
| Google + Apple Sign In | ✅ Deployed | Auth system |
| Cost-plus pricing | ✅ Deployed | `dashboard/components/custom/cost-calculator.tsx` |
| Education component | ✅ Deployed | `dashboard/components/education/` |
| Contact masking + PIN | ✅ Built | `dashboard/components/ui/contact-mask.tsx` |
| Phone-to-iPad upload | ✅ Built | `dashboard/app/c/page.tsx` |
| Use counter (formula licensing) | ✅ Built | `dashboard/components/formula/use-counter.tsx` |

---

## What Needs To Be Done — EXPO iOS BUILD + SUBMISSION

The mobile app has 6 screens already built. It just needs to be built with EAS and submitted to Apple App Store.

### App Source Code Location
- Path: `/home/jason/.openclaw/workspaces/colorgenius/mobile/`
- 6 screens: Home, Formulate, Camera, Clients, Community, Settings
- API client, components, types all built

### Accounts

**Expo:**
- Email: theoplandgroup@gmail.com
- Password: Natishafl0rence!
- Access Token: Qe7Nuio-DEpkKeJa-VTqGmX4JLvv--lpvsZULah7

**Apple Developer:**
- Email: jasonopland@msn.com
- Password: Natishafl0!
- Team ID: 9NR7ZYC94R

**Vercel:**
- Account: jasonopland-7887
- Deploys from: `dashboard/` directory ONLY (not project root)
- Command: `cd dashboard && npx vercel --prod`

### Expo Project Details
- **Existing project slug:** `colorgenius` (NOT `colorgenius-mobile`)
- **Existing project ID:** `b079806d-5b5b-4c83-ab89-63ea74de66da`
- **Full name on Expo:** `@jasonopland/colorgenius`
- **Previous builds:** 3 successful iOS builds from May 12, 2026
- **Previous submission:** Already submitted to App Store Connect once before
- **This is a RESUBMISSION** — update version to 1.0.1 or bump build number

### mobile/app.json — Correct Values (FIXED 2026-05-18)
- slug: "colorgenius" ✅
- bundleIdentifier: "com.colorgenius.app" ✅ (must match App Store Connect — do NOT change to co.colorgenius.mobile)
- projectId: "b079806d-5b5b-4c83-ab89-63ea74de66da" ✅
- owner: "jasonopland" ✅
- version: "1.0.1" ✅

### Bluetooth Dependency Issue
- `react-native-ble-plx` may conflict with React Native 0.79
- If it conflicts, remove it. Scale works on web app. Add BLE to mobile later.
- The mobile app's primary value is photo capture + formula generation + client management, NOT scale weighing.

### Build Steps

```bash
# 1. Fix app.json (slug, bundleIdentifier, projectId, owner)

# 2. Login to Expo
cd /home/jason/.openclaw/workspaces/colorgenius/mobile
export EXPO_TOKEN=Qe7Nuio-DEpkKeJa-VTqGmX4JLvv--lpvsZULah7
npx eas whoami  # Should show jasonopland / theoplandgroup@gmail.com

# 3. Build
npx eas build --platform ios --profile production --non-interactive

# 4. If non-interactive fails on Apple credentials:
#    Answer "n" to "Do you want to log in to your Apple account?"
#    The Apple account was connected yesterday via API key

# 5. Submit
npx eas submit --platform ios
```

### Vercel Web Deploys
```bash
# ALWAYS deploy from dashboard/ directory
cd /home/jason/.openclaw/workspaces/colorgenius/dashboard
npx vercel --prod
```

---

## Project Structure

```
colorgenius/
├── dashboard/           # Next.js web app (deployed to Vercel)
│   ├── app/             # Pages and API routes
│   ├── components/      # React components
│   ├── lib/             # Utilities, Prisma, scale integration
│   ├── prisma/          # Database schema
│   └── package.json
├── mobile/              # Expo mobile app (needs build + submission)
│   ├── src/
│   │   ├── screens/     # 6 screens
│   │   ├── api/         # API client
│   │   ├── components/  # Reusable components
│   │   └── types/       # TypeScript types
│   ├── app.json         # Expo config (needs fixes)
│   ├── eas.json         # EAS build config
│   └── package.json
├── integration/
│   ├── square/          # Square POS integration
│   └── vagaro/          # Vagaro integration (3,055 lines)
├── docs/                # Documentation
├── backups/             # Code backups
└── PROJECT_STATUS.md    # Project status
```

---

## Shade Database
- 21 brands, 3,454+ shades
- Brands: Schwarzkopf, Wella, Redken, Matrix, L'Oréal, Goldwell, Joico, Pravana, Pulp Riot, Igora Royal, Majirel, Dia, Innéoa, Koleston Perfect, Majifashion, Innosense, Welloxon, Dia Activate, Color Touch, Illumina, Innosence

## Key Technical Decisions
- Square is the payment processor (NOT Stripe)
- Kimi K2.6 for photo analysis (primary), Claude Haiku (fallback)
- Kimi K2.6 for shade matching
- Acaia BLE scales for bowl weighing (web only for now)
- Prisma + PostgreSQL for database
- Supabase for auth

---

## DO NOT
- Touch the web landing page or /beta page
- Create a new Expo project (use existing `@jasonopland/colorgenius`)
- Downgrade React Native or Expo SDK
- Run `eas init` — project is already linked
- Deploy Vercel from project root (always from dashboard/)
- Overwrite the bowl weighing pipeline (scale-bowl.tsx)

## Lessons Learned (Critical)
- Formspree URLs don't work as link targets — they need an inline `<form method="POST">`
- Vercel must deploy from `dashboard/` directory, not project root
- Expo project slug must match what's on the server
- PTY terminals on this server corrupt input (appends "78") — use non-interactive flags
- Never modify existing working code without understanding it first
- bundleIdentifier MUST be "com.colorgenius.app" — that is what App Store Connect (app ID 6768502681) is registered with. Do not change it.
- ASC App ID is 6768502681 — already in eas.json submit profile
- EAS credentials for com.colorgenius.app provisioning profile already exist (set up May 12, valid until May 2027) — non-interactive builds work without any Apple login
- Interactive EAS sessions must be run from Windows Terminal → wsl, NOT from this server (PTY issue)
- Status: v1.0.1 build 1.0.3 submitted to Apple on 2026-05-18, processing at Apple
