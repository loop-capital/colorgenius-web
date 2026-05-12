# ColorGenius — Project Info

> **Last Updated:** 2026-05-12
> **Lead:** Jason Opland

---

## Accounts & Credentials

### Expo (iOS Builds)
- **Email:** theoplandgroup@gmail.com
- **Password:** Natishafl0rence!
- **Access Token:** Qe7Nuio-DEpkKeJa-VTqGmX4JLvv--lpvsZULah7
- **EAS Project ID:** b079806d-5b5b-4c83-ab89-63ea74de66da
- **Bundle ID:** com.colorgenius.app
- **App Store ID:** 6768502681

### Apple Developer
- **Email:** jasonopland@msn.com
- **Password:** Nat1shafl0!
- **Team ID:** 9NR7ZYC94R (Jason Opland Individual)

### Supabase (Database)
- **Project Ref:** beuiayrnzbgvvqfgsenc
- **URL:** https://beuiayrnzbgvvqfgsenc.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/beuiayrnzbgvvqfgsenc

### Vercel (Web Hosting)
- **Project:** `dashboard` → serves colorgenius.co
- **Org:** team_OFCIBr60qcpFAM2py5rAfPnU
- **Deploy from:** `/home/jason/.openclaw/workspaces/colorgenius/dashboard/`

---

## Architecture

### Web Dashboard (Next.js)
- **Location:** `colorgenius/dashboard/`
- **URL:** https://colorgenius.co
- **Framework:** Next.js 14 + React 18 + Tailwind CSS
- **Database:** Supabase (Postgres) via Prisma

### iOS App (Expo/React Native)
- **Location:** `colorgenius/ios-app/`
- **Framework:** Expo SDK 54 + React Native
- **Build:** EAS Build → App Store Connect
- **BLE:** Acaia Pearl/Lunar scales via react-native-ble-plx

### Formulation Engine
- **Location:** `colorgenius/dashboard/lib/formulation.ts`
- **Type:** Rules-based algorithm (color theory, lift charts, neutralizers)
- **Products DB:** `lib/products.ts` (brands, shades, levels, tones)

### API Routes
- `/api/formulate` — Generate formula from hair input
- `/api/v1/formulas` — CRUD for saved formulas (Prisma)
- `/api/v1/formulas/list` — List formulas by client/stylist
- `/api/user/brands` — Get user's preferred brands
- `/api/assistant` — Placeholder for AI assistant

---

## Hardware

### Bluetooth Scales
- **Acaia Pearl 2021** — 0.1g accuracy, BLE 4.0, $150
- **Acaia Lunar** — 0.1g accuracy, BLE, compact model
- **Research:** `research/bluetooth-scale-research.md`
- **SDK:** Official iOS + Android SDKs on GitHub
- **Status:** 2 purchased for testing/integration

---

## Database Schema (Prisma)
Key models: `User`, `Client`, `Formulation`, `Brand`, `Product`, `InventoryItem`, `PricingRule`
- See `prisma/schema.prisma` for full schema

---

## Do NOT
- Deploy from Che's workspace to this project
- Suggest eliminating the Bluetooth scale
- Overwrite without checking what's deployed
