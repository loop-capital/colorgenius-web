# COLORgenius Architecture Decision Records (ADRs)

> **Last Updated:** 2026-05-23
> **Format:** Each ADR has Context, Decision, Consequences

---

## ADR-001: On-Device AI with Gemma E4B

**Date:** 2026-05-22
**Status:** Decided

### Context
COLORgenius analyzes client hair photos to determine level, tone, porosity, and gray percentage. Sending photos to a server-based vision API would:
- Incur API costs per photo
- Create privacy concerns (client photos on our servers)
- Require high bandwidth for uploads

### Decision
Use **Gemma E4B** running **on-device** via LiteRT-LM as the primary vision model.

- **Web:** `@litert-lm/core` npm package (JavaScript API)
- **iOS:** LiteRT-LM Swift API with Metal GPU
- **Model:** `gemma-4-E4B-it-web.litertlm` from Hugging Face (~4GB)
- **MediaPipe:** Face detection + quality gating

**Fallback:** Kimi K2.6 via Ollama (server-side, only when Gemma unavailable or device too old)

### Consequences
- **+** Zero API costs for vision inference
- **+** Photos never leave the device (privacy-first)
- **+** Works offline
- **−** Model download ~4GB (cached after first use)
- **−** Requires newer devices for acceptable performance
- **−** JavaScript LiteRT-LM vision support not yet released (text-only now)

### References
- https://github.com/google-ai-edge/LiteRT-LM
- `skingenius/docs/ON-DEVICE-ARCHITECTURE.md` (shared pattern)

---

## ADR-002: Square Payments (NO Stripe)

**Date:** 2026-05-18
**Status:** Decided — irreversible

### Context
Need payment processing for subscriptions and formula marketplace purchases. Considered Stripe vs Square.

### Decision
Use **Square** exclusively. **Never Stripe.**

### Consequences
- **+** Square integrates with Vagaro (salon software)
- **+** Salon owners already familiar with Square
- **+** Unified hardware (Square readers) if needed
- **−** Switching to Stripe later is explicitly forbidden by Jason

### References
- `LESSONS-LEARNED.md` AP-012: "We use Square for payments. NO Stripe. Ever."

---

## ADR-003: Vercel for Web Deployment

**Date:** 2026-05-12
**Status:** Decided

### Context
Need a hosting platform for the Next.js dashboard. Options: Vercel, Netlify, AWS, self-hosted.

### Decision
Use **Vercel** for web deployment.

### Consequences
- **+** Native Next.js optimization
- **+** Edge functions, serverless API routes
- **+** Preview deployments on PRs
- **−** Free tier: 100 deploys/day limit
- **−** Vendor lock-in to Vercel ecosystem

### Safety Rule
After promoting a specific deployment to production: **STOP.** Do not deploy again until the replacement is verified. See `LESSONS-LEARNED.md` AP-011.

---

## ADR-004: Next.js 14 (App Router)

**Date:** 2026-04-15
**Status:** Decided

### Context
Need a React framework for the web dashboard. Options: Next.js, Remix, plain React + Vite.

### Decision
Use **Next.js 14 with App Router**.

### Consequences
- **+** Server components reduce client JS
- **+** API routes colocated with pages
- **+** Built-in image optimization
- **−** Learning curve for App Router patterns
- **−** Some libraries still not fully compatible

---

## ADR-005: Vagaro Integration (10 Modules)

**Date:** 2026-05-20
**Status:** Planned

### Context
Salons use Vagaro for scheduling, client management, inventory, and billing. COLORgenius needs to integrate to avoid double data entry.

### Decision
Build **10-module Vagaro integration** covering: Auth, Clients, Appointments, Services, Inventory, Staff, Billing, Reports, Notifications, Webhooks.

### Consequences
- **+** Seamless salon workflow
- **+** Single source of truth for clients and inventory
- **−** Vagaro API limitations and rate limits
- **−** Integration maintenance overhead

### Modules
| # | Module | Priority |
|---|--------|----------|
| 1 | Auth | P0 |
| 2 | Clients | P0 |
| 3 | Appointments | P0 |
| 4 | Services | P1 |
| 5 | Inventory | P1 |
| 6 | Staff | P2 |
| 7 | Billing | P2 |
| 8 | Reports | P3 |
| 9 | Notifications | P3 |
| 10 | Webhooks | P3 |

---

## ADR-006: Supabase Backend

**Date:** 2026-04-15
**Status:** Decided

### Context
Need database, auth, and storage. Options: Supabase, Firebase, AWS Amplify,自建 PostgreSQL.

### Decision
Use **Supabase** for backend services.

### Consequences
- **+** PostgreSQL (not NoSQL)
- **+** Built-in auth with OAuth
- **+** Real-time subscriptions
- **+** RLS policies for security
- **−** Service role key rotation breaks everything
- **−** Hobby plan limits

### Safety Rule
Service role key is NOT the anon key. Different permissions. Rotating keys breaks all connected services. See `LESSONS-LEARNED.md`.

---

## ADR-007: React Native / Expo for Mobile

**Date:** 2026-05-18
**Status:** Decided

### Context
Need a native iOS app for on-device AI and salon floor use. Options: Swift native, React Native, Flutter.

### Decision
Use **React Native with Expo**.

### Consequences
- **+** Shared code with web (TypeScript, components)
- **+** Expo EAS for builds and submissions
- **+** Over-the-air updates
- **−** Performance gap vs Swift native
- **−** Expo native modules required for LiteRT-LM

### Bundle Identifier
`com.colorgenius.app` — confirmed in App Store Connect. NEVER change. See `LESSONS-LEARNED.md` AP-014.
