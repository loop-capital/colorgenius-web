# ColorGenius Beta — Deployment Architecture Plan

**Version:** 1.0  
**Date:** April 25, 2026  
**Target:** 50 stylists, August 15, 2026  
**Budget Ceiling:** $500/month during beta

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Web App    │  │   Tablet     │  │   Mobile     │           │
│  │  (Next.js)   │  │   (PWA)      │  │   (PWA)      │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                    │
│                    Vercel Edge CDN                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                         API LAYER                              │
│                         (Vercel)                              │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Next.js API Routes (Serverless)            │   │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────────┐ │   │
│  │  │  Auth      │ │  Core API  │ │  AI/Formulation  │ │   │
│  │  │ (NextAuth) │ │ (tRPC?)    │ │ (Edge Functions) │ │   │
│  │  └────────────┘ └────────────┘ └──────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                                │
│  Rate Limiting: Upstash Redis                                 │
│  Caching: Vercel Edge Config + Redis                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                      SERVICES LAYER                            │
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │  PostgreSQL │  │   Redis     │  │  Object Storage     │   │
│  │  (Supabase) │  │  (Upstash)  │  │  (Cloudflare R2)    │   │
│  │             │  │             │  │                     │   │
│  │  • Clients  │  │  • Sessions │  │  • Photos           │   │
│  │  • Formulas │  │  • Rate     │  │  • Shade swatches   │   │
│  │  • Colors   │  │    Limits   │  │  • Before/After     │   │
│  │  • Photos   │  │  • Caching  │  │                     │   │
│  │  metadata   │  │             │  │                     │   │
│  └─────────────┘  └─────────────┘  └─────────────────────┘   │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              AI/ML Services (Future)                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │   │
│  │  │  Replicate  │  │  OpenAI    │  │  HuggingFace   │  │   │
│  │  │  (Photo     │  │  (Text      │  │  (Self-hosted  │  │   │
│  │  │   Analysis) │  │   Models)   │  │   Models)      │  │   │
│  │  └────────────┘  └────────────┘  └────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Hosting Recommendations

### 2.1 Frontend: Vercel (Already Decided) ✅

**Why:** Team is already on Next.js + App Router. Vercel is the native host.

**Plan:**
| Tier | Cost | Notes |
|------|------|-------|
| Pro | $20/mo | 1TB bandwidth, 6,000 GB-hrs serverless |
| Add-on: Analytics | $0 | Included |

**Estimated:** $20/month

**Config:**
- Deploy from GitHub repo
- Preview deployments for PRs
- Edge Functions for API routes
- ISR for color library pages

---

### 2.2 Backend API: Vercel Serverless Functions ✅

**Why:** Next.js API routes run as serverless functions on Vercel. No separate backend needed for beta.

**Pros:**
- Same codebase as frontend
- Auto-scaling (0 → ∞)
- Edge network (low latency)
- Zero cold starts with Edge Runtime

**Cons:**
- 10s timeout on Hobby, 60s on Pro (fine for our use case)
- No WebSocket support (use polling for now)
- Long-running ML jobs need external service

**Alternative if needed:** Railway ($5/mo) or Render ($7/mo) for a dedicated Node.js server.

**Decision:** Stick with Vercel for beta. Move to Railway only if we hit function timeout limits.

**Estimated:** Included in Vercel Pro ($20/month)

---

### 2.3 Database: Supabase ✅ **RECOMMENDED**

**Why over others:**

| Provider | Cost (Beta) | Pros | Cons |
|----------|-------------|------|------|
| **Supabase** | **$0-$25** | ✅ Free tier generous, ✅ PostgreSQL + RLS, ✅ Built-in auth, ✅ Real-time, ✅ Good DX | ❌ Row limits on free tier (500k) |
| PlanetScale | $29/mo | ✅ MySQL-compatible, ✅ Branching | ❌ No JSONB, ❌ Costlier, ❌ MySQL |
| Railway Postgres | $5/mo | ✅ Cheap, ✅ Simple | ❌ No managed backups, ❌ Manual RLS |
| AWS RDS | $15+/mo | ✅ Enterprise-grade | ❌ Complex, ❌ Overkill for beta |
| Neon | $0-$19 | ✅ Serverless Postgres, ✅ Branching | ❌ Newer, ❌ Less mature |

**Supabase Free Tier Limits (Sufficient for 50 stylists):**
- 500MB database (we'll use ~50MB)
- 500k rows (we'll use ~10k)
- 2GB bandwidth
- 1GB file storage (we'll use R2 instead)

**Upgrade trigger:** >400k rows or need dedicated resources

**Estimated:** $0/month (free tier sufficient)

---

### 2.4 File Storage: Cloudflare R2 ✅ **RECOMMENDED**

**Why over others:**

| Provider | Cost (Beta) | Pros | Cons |
|----------|-------------|------|------|
| **Cloudflare R2** | **$0** | ✅ Zero egress fees, ✅ S3-compatible, ✅ 10GB free tier, ✅ Fast CDN | ❌ Slightly slower uploads than S3 |
| AWS S3 | ~$5-15/mo | ✅ Standard, ✅ Fast | ❌ Egress fees add up fast |
| Supabase Storage | $0-$10 | ✅ Integrated with auth | ❌ Egress limits, ❌ Vendor lock-in |
| Backblaze B2 | ~$2-5/mo | ✅ Very cheap | ❌ Less CDN integration |

**R2 Free Tier:**
- 10GB storage
- 1 million Class A ops/month
- 10 million Class B ops/month

**For 50 stylists:** ~2-5GB photos/month = well within free tier

**Estimated:** $0/month

---

### 2.5 Redis: Upstash ✅ **RECOMMENDED**

**Why:** Rate limiting, sessions, caching. Serverless Redis with generous free tier.

| Provider | Cost | Limits |
|----------|------|--------|
| Upstash Free | $0 | 10,000 req/day, 256MB |
| Upstash Pay-as-you-go | ~$5/mo | 100k req/day |

**Usage:**
- Session storage (JWT blacklist)
- Rate limiting counters
- Formulation result caching (5 min TTL)
- Real-time status tracking

**Estimated:** $0/month (free tier sufficient for beta)

---

### 2.6 AI/ML Services

**Phase 1 (Beta — Mock/MVP):**
- Photo analysis: Mock responses (hardcoded for common scenarios)
- Formulation: Rule-based engine (no ML yet)
- Scoring: Simple comparison algorithms

**Cost:** $0 (runs in Vercel functions)

**Phase 2 (Post-beta):**
| Service | Use Case | Estimated Cost |
|---------|----------|----------------|
| Replicate | Photo color analysis | $0.01-0.05/image |
| OpenAI GPT-4o | Formulation reasoning | $0.01-0.03/request |
| HuggingFace (self-hosted) | Custom model inference | $20-50/mo on RunPod |

**Estimated for beta:** $0 (mocked)

---

## 3. Complete Stack Summary

| Layer | Service | Cost/Month | Role |
|-------|---------|------------|------|
| Frontend | Vercel Pro | $20 | Next.js hosting, Edge CDN |
| API | Vercel Functions | Included | Serverless API routes |
| Database | Supabase Free | $0 | PostgreSQL + RLS + Auth |
| Cache/Rate Limit | Upstash Free | $0 | Redis for sessions + limits |
| File Storage | Cloudflare R2 | $0 | Photo storage (10GB free) |
| DNS | Cloudflare Free | $0 | DNS + SSL + DDoS protection |
| Email | Resend Free | $0 | Transactional emails (3k/mo) |
| Monitoring | Vercel Analytics | Included | Performance monitoring |
| **TOTAL** | | **$20/month** | |

**Headroom:** $480/month remaining for AI services and scaling.

---

## 4. Domain & SSL

**Recommended:**
- Primary: `colorgenius.app` or `colorgenius.io` (~$10/year)
- Staging: `staging.colorgenius.app`
- DNS: Cloudflare (free tier)
- SSL: Auto-provisioned by Vercel + Cloudflare

---

## 5. Environment Strategy

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Local     │────▶│   Staging   │────▶│ Production  │
│  (localhost)│     │  (Vercel)   │     │  (Vercel)   │
│             │     │             │     │             │
│ Supabase    │     │ Supabase    │     │ Supabase    │
│ (local      │     │ (project    │     │ (project    │
│  Docker)    │     │  'staging') │     │  'prod')    │
│             │     │             │     │             │
│ R2 dev      │     │ R2 staging  │     │ R2 prod     │
│ bucket      │     │ bucket      │     │ bucket      │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Branch → Environment Mapping:**
- `main` → Production (auto-deploy)
- `staging` → Staging (auto-deploy)
- Feature branches → Preview URLs (Vercel)

---

## 6. Backup Strategy

| Data | Frequency | Method | Retention |
|------|-----------|--------|-----------|
| PostgreSQL | Daily | Supabase auto-backup + pg_dump | 7 days |
| Photos | Real-time | R2 versioning | 30 days |
| Code | Per commit | GitHub | Forever |

**Supabase backup:** Enable Point-in-Time Recovery (PITR) when upgrading to Pro ($25/mo).

**Manual backup script:**
```bash
#!/bin/bash
# backup.sh - Run via cron daily
pg_dump $DATABASE_URL > "backup-$(date +%Y%m%d).sql"
aws s3 cp "backup-$(date +%Y%m%d).sql" s3://colorgenius-backups/
```

---

## 7. Monitoring & Alerting

| Tool | Cost | Purpose |
|------|------|---------|
| Vercel Analytics | Included | Web Vitals, traffic, errors |
| Supabase Dashboard | Free | DB performance, slow queries |
| UptimeRobot | Free ($0) | Uptime monitoring (5 min intervals) |
| Sentry | Free (5k events/mo) | Error tracking |

**Alert channels:** Telegram bot for critical issues.

---

## 8. Scaling Triggers

| Metric | Current | Trigger | Action |
|--------|---------|---------|--------|
| Database size | ~50MB | >400MB | Upgrade Supabase to Pro ($25/mo) |
| Photos stored | ~1GB | >8GB | Pay R2 overage (~$0.015/GB) |
| API requests | ~1k/day | >50k/day | Upgrade Upstash ($5/mo) |
| Stylist count | 0 | >50 | Upgrade to paid tier, add monitoring |
| Response time | <200ms | >1s consistently | Add caching layer, optimize queries |

---

## 9. Security Checklist

- [x] Supabase RLS enabled on all tables
- [x] JWT auth with refresh tokens
- [x] Rate limiting via Upstash
- [x] HTTPS only (HSTS)
- [x] CORS restricted to app domains
- [x] Input validation (Zod)
- [x] SQL injection prevention (parameterized queries)
- [x] File upload validation (type, size)
- [ ] DDoS protection (Cloudflare)
- [ ] Penetration testing (pre-launch)
- [ ] SOC 2 readiness audit (post-beta)

---

## 10. Cost Projection

### Beta Phase (Months 1-3): 50 Stylists

| Service | Monthly | Notes |
|---------|---------|-------|
| Vercel Pro | $20 | Hosting + CDN |
| Supabase | $0 | Free tier |
| Cloudflare R2 | $0 | Free tier (10GB) |
| Upstash Redis | $0 | Free tier |
| Domain | ~$1 | $10/year amortized |
| **Monthly Total** | **~$21** | |

### Growth Phase (Months 4-6): 200 Stylists

| Service | Monthly | Notes |
|---------|---------|-------|
| Vercel Pro | $20 | May need Enterprise at 500+ |
| Supabase Pro | $25 | Dedicated resources |
| Cloudflare R2 | $5 | ~20GB storage |
| Upstash Pay-as-you-go | $10 | Higher request volume |
| Sentry | $26 | 50k events/mo |
| **Monthly Total** | **~$86** | |

### Scale Phase (Year 2): 1,000+ Stylists

| Service | Monthly | Notes |
|---------|---------|-------|
| Vercel Enterprise | $150+ | Higher limits |
| Supabase Pro/Team | $50-100 | Scale as needed |
| Cloudflare R2 | $25 | ~100GB + CDN |
| Upstash | $50 | High volume |
| Sentry | $80 | 200k events |
| Replicate/OpenAI | $200-500 | AI services |
| **Monthly Total** | **~$555-955** | |

**The $500/month ceiling covers beta comfortably with room for AI experimentation.**

---

## 11. Migration Path (If Needed)

### Scenario: Outgrowing Vercel Serverless
**Trigger:** Complex ML inference needs >60s timeout, or persistent WebSocket connections.

**Migration to Railway:**
1. Extract API routes to standalone Express/Fastify app
2. Deploy to Railway (`railway up`)
3. Update Vercel to proxy API requests to Railway
4. Keep Next.js frontend on Vercel

**Effort:** 2-3 days (keep domain, minimal downtime)

### Scenario: Outgrowing Supabase
**Trigger:** >500k rows, need read replicas, or complex analytics queries.

**Migration to AWS RDS/Neon:**
1. pg_dump from Supabase
2. pg_restore to new Postgres
3. Update connection strings
4. Re-implement RLS policies

**Effort:** 1-2 days (can run both in parallel during transition)

---

## 12. Immediate Action Items

| # | Task | Owner | Deadline |
|---|------|-------|----------|
| 1 | Create Supabase project | @colorgenius-dev | April 26 |
| 2 | Set up Vercel project + GitHub integration | @colorgenius-dev | April 26 |
| 3 | Configure Cloudflare R2 bucket | @colorgenius-dev | April 27 |
| 4 | Set up Upstash Redis | @colorgenius-dev | April 27 |
| 5 | Run schema migration on Supabase | @colorgenius-dev | April 27 |
| 6 | Configure env vars (DATABASE_URL, R2 credentials) | @colorgenius-dev | April 28 |
| 7 | Test end-to-end (upload → analyze → formulate) | @colorgenius-dev | April 29 |
| 8 | Set up monitoring (Vercel + UptimeRobot) | @colorgenius-dev | April 30 |

---

## 13. Architecture Decision Records

### ADR-001: Vercel for Frontend + API
**Decision:** Use Vercel for both frontend and API (serverless functions).
**Rationale:** Single codebase, zero infrastructure overhead, auto-scaling. Trade-off: 60s max timeout (acceptable for beta).
**Status:** Approved

### ADR-002: Supabase for Database
**Decision:** Use Supabase managed PostgreSQL over self-hosted or PlanetScale.
**Rationale:** Free tier sufficient for beta, built-in auth, RLS, real-time subscriptions, generous limits.
**Status:** Approved

### ADR-003: Cloudflare R2 for File Storage
**Decision:** Use R2 over S3 or Supabase Storage.
**Rationale:** Zero egress fees, S3-compatible API, generous free tier. Critical for photo-heavy app where stylists download many images.
**Status:** Approved

### ADR-004: Mock AI for Beta
**Decision:** Use rule-based formulation + mock photo analysis for beta.
**Rationale:** AI services add latency and cost. Validate UX and workflow first. Integrate real AI in Phase 2.
**Status:** Approved

---

**Questions?** Ping @colorgenius-dev for implementation or @colorgenius-ceo for budget approval.

**Next Review:** May 1, 2026 (after initial deployment).
