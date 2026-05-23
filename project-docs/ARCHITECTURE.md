# COLORgenius Architecture

> **Last Updated:** 2026-05-23
> **Scope:** Web dashboard + native iOS app for AI hair color formulation
> **On-device AI:** Photos never leave the user's phone

---

## System Overview

COLORgenius is an AI-powered hair color formulation platform. A salon professional inputs the client's hair state, and the system outputs a precise formula: brand, shade, developer volume, ratio, and timing.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Mobile    │────▶│  On-Device  │────▶│  COLORgenius    │
│   App       │     │  Gemma E4B  │     │  Cloud API      │
└─────────────┘     └─────────────┘     └─────────────────┘
      │                                    │
      │         Hair State (JSON)          │
      └───────────────────────────────────▶│
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │  Formulation│
                                    │   Engine    │
                                    └──────┬──────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │   Formula   │
                                    │   Result    │
                                    └─────────────┘
```

---

## 6-Step Formulate Flow

```
Step 1: Photo        → Client hair photo → On-device Gemma E4B analyzes
Step 2: Assessment   → Level, tone, gray %, porosity (auto-filled from photo)
Step 3: History      → Previous chemical services (bleach, color, keratin, relaxer)
Step 4: Target       → Desired shade, brand preference, developer strength
Step 5: Condition    → Texture, elasticity, scalp condition
Step 6: Results      → Precise formula generated and displayed
```

### Photo Analysis Pipeline
1. **User takes photo** → stays on device
2. **MediaPipe quality gate** → checks blur, lighting, face detection
3. **Gemma E4B (LiteRT-LM)** → analyzes hair level, tone, porosity, gray %
4. **JSON result** → sent to cloud API (photo never transmitted)
5. **Auto-fill Step 2** → pre-populates assessment fields

**Fallback:** Kimi K2.6 vision via Ollama (server-side, burns tokens)

---

## Bowl Weighing Pipeline

When a colorist mixes a formula using the on-screen scale widget:

1. **Start weighing** → zero scale, select formula
2. **Dispense per line item** → scale reads weight via Bluetooth (or manual entry)
3. **Auto-advance** → next line item highlighted
4. **Complete** → all items weighed, formula recorded
5. **Inventory deduction** → product quantities deducted from salon inventory
6. **Cost tracking** → service cost calculated per formula

```
Bowl Widget ──▶ Bluetooth Scale ──▶ Weight Log ──▶ Inventory Deduction
                                      │
                                      ▼
                              Supabase (inventory table)
```

---

## Vagaro Integration (10 Modules)

| # | Module | Purpose |
|---|--------|---------|
| 1 | **Auth** | OAuth 2.0 — connect salon's Vagaro account |
| 2 | **Clients** | Sync client profiles, photos, service history |
| 3 | **Appointments** | Pull today's schedule, mark formula used |
| 4 | **Services** | Map COLORgenius formulas to Vagaro service catalog |
| 5 | **Inventory** | Two-way sync: COLORgenius ↔ Vagaro product stock |
| 6 | **Staff** | Sync stylists, permissions, commission tracking |
| 7 | **Billing** | Push service charges back to Vagaro checkout |
| 8 | **Reports** | Color service analytics, product usage trends |
| 9 | **Notifications** | Appointment reminders, formula ready alerts |
| 10 | **Webhooks** | Real-time sync: Vagaro events → COLORgenius |

---

## On-Device AI: Gemma E4B via LiteRT-LM

**Architecture Principle:** Photos NEVER leave the user's device.

### Web (Next.js Dashboard)
- **Package:** `@litert-lm/core` (JavaScript API)
- **Model:** `gemma-4-E4B-it-web.litertlm` from Hugging Face
- **Runtime:** LiteRT (WebGL / WebGPU)
- **Status:** Text-only currently; vision support coming

### Native iOS (React Native / Expo)
- **Swift API:** LiteRT-LM with Metal GPU
- **Model:** Same Gemma E4B converted to LiteRT format
- **Bridge:** Expo native module
- **Download:** Model cached after first download (~4GB)

### Fallback Path
- **Primary:** Gemma E4B on-device
- **Secondary:** Kimi K2.6 via Ollama (server-side, only when Gemma unavailable)
- **Tertiary:** Manual entry by colorist

---

## Payment: Square (NO Stripe)

**Decision:** Square only. Never Stripe. Confirmed by Jason multiple times.

- **Sandbox:** Active for development
- **Production:** Swap sandbox credentials before launch
- **Scope:** Subscription payments, one-time purchases (formula marketplace)

---

## Backend: Supabase

| Service | Use |
|---------|-----|
| **Auth** | OAuth (Google, Vagaro), JWT sessions |
| **Database** | PostgreSQL with RLS policies |
| **Storage** | Product images, brand assets |
| **Edge Functions** | Lightweight compute, webhooks |

---

## Data Model (Core)

### `clients`
- id, salon_id, name, email, phone, photo_url, created_at

### `formulations`
- id, client_id, salon_id, hair_level, hair_tone, gray_pct, porosity, target_shade, brand, developer_vol, ratio, timing, created_at

### `inventory`
- id, salon_id, product_id, brand, shade, stock_qty, min_threshold, cost_per_unit, created_at

### `salons`
- id, name, vagaro_id, square_merchant_id, subscription_tier, created_at

### `shade_libraries`
- brand, line, shade_code, shade_name, level, tone, undertone, lift_capability, coverage, mixing_ratio

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Web** | Next.js 14 (App Router), TypeScript, Tailwind |
| **Mobile** | React Native, Expo |
| **API** | Next.js API Routes (`/api/v1/...`) |
| **Auth** | Supabase Auth (OAuth) |
| **Database** | Supabase PostgreSQL |
| **AI (On-device)** | Gemma E4B via LiteRT-LM |
| **AI (Fallback)** | Kimi K2.6 via Ollama |
| **Payments** | Square SDK |
| **Scheduling** | Vagaro API |
| **Deploy** | Vercel (web), EAS (mobile) |

---

## Directory Structure

```
colorgenius/
├── project-docs/          # Architecture, decisions, infrastructure
│   ├── ARCHITECTURE.md
│   ├── INFRASTRUCTURE.md
│   └── DECISIONS.md
├── dashboard/             # Next.js web app
│   ├── app/               # App Router
│   │   ├── api/v1/        # API routes
│   │   ├── formulate/     # 6-step flow
│   │   └── ...
│   ├── src/
│   │   ├── components/    # Reusable UI
│   │   ├── lib/           # Utils, hooks
│   │   └── types/         # TypeScript types
│   └── public/
├── mobile/                # React Native / Expo
│   ├── app/               # Expo Router
│   ├── src/
│   └── ...
├── data/
│   └── brands/            # Shade JSON libraries
│       ├── davines/
│       ├── wella/
│       └── ...
├── docs/                  # Additional documentation
├── supabase/              # Schema, migrations, RLS policies
├── .claude/               # Agent definitions, commands, hooks
│   ├── agents/
│   ├── commands/
│   ├── hooks/
│   └── settings.json
└── scripts/               # Build, deploy, data ingestion
```
