# COLORgenius Infrastructure

> **Last Updated:** 2026-05-23
> **Deploy Target:** Vercel (web) + EAS (mobile)

---

## Vercel Deploy Config

### Web Dashboard
- **Project:** `dashboard` (Vercel project name)
- **Framework:** Next.js 14
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node Version:** 20.x

### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client-safe) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-only) | Yes |
| `SQUARE_APPLICATION_ID` | Square app ID | Yes |
| `SQUARE_ACCESS_TOKEN` | Square sandbox/prod token | Yes |
| `SQUARE_LOCATION_ID` | Square location for payments | Yes |
| `VAGARO_CLIENT_ID` | Vagaro OAuth client ID | Yes |
| `VAGARO_CLIENT_SECRET` | Vagaro OAuth secret | Yes |
| `NEXT_PUBLIC_APP_URL` | Production URL (colorgenius.co) | Yes |
| `OLLAMA_BASE_URL` | Kimi K2.6 fallback endpoint | Optional |
| `LITERT_LM_MODEL_PATH` | Gemma model path for server tests | Optional |

### `.env.local` (Local Dev)
Copy from `.env.example` and fill in values. Never commit `.env.local`.

---

## Deployment Commands

```bash
# Web — Production
cd /home/jason/.openclaw/workspaces/colorgenius/dashboard
npx vercel --prod --yes

# Web — Preview
cd /home/jason/.openclaw/workspaces/colorgenius/dashboard
npx vercel --yes

# Mobile — iOS (EAS)
cd /home/jason/.openclaw/workspaces/colorgenius/mobile
eas build --platform ios --profile production

# Mobile — Submit to App Store
eas submit --platform ios
```

---

## Vercel Limits (Free Tier)

- **100 deploys/day** — resets midnight UTC (8 PM ET)
- **Batch changes** — don't deploy one file at a time
- **Hobby plan** — sufficient for beta; upgrade before public launch

---

## Supabase Configuration

### RLS Policies
Every table must have Row Level Security enabled. Default: deny all, then grant per role.

### Connection Pooling
- **Max connections:** 60 (Hobby plan)
- **Connection string:** Use Supabase pooler for serverless functions

### Storage Buckets
- `product-images` — brand shade swatches
- `client-photos` — NOT USED (photos on-device only)

---

## DNS / Domains

| Domain | Purpose |
|--------|---------|
| `colorgenius.co` | Production web |
| `www.colorgenius.co` | Redirect to apex |
| `api.colorgenius.co` | API subdomain (if needed) |

---

## CI / CD (Planned)

### GitHub Actions
- **Lint + Type Check** — on every PR
- **Build Test** — `npm run build` must pass
- **Security Scan** — secret detection, dependency audit
- **Deploy Preview** — Vercel preview on PRs
- **Deploy Prod** — merge to main triggers Vercel prod deploy

### Branch Strategy
- `main` — production (protected, no direct commits)
- `feat/*` — feature branches
- `fix/*` — bug fixes
- `hotfix/*` — production emergencies

---

## Backup & Recovery

### Database
- **Supabase backups:** Daily automated (Hobby: 7-day retention)
- **Manual export:** `pg_dump` before major schema changes

### Git
- **Backup branches:** `backup/<description>-<date>`
- **Tags:** `v1.0.0`, `v1.1.0` for releases

---

## Monitoring

- **Vercel Analytics:** Web vitals, error tracking
- **Supabase Dashboard:** Query performance, slow queries
- **Square Dashboard:** Payment success rates
- **Uptime:** Colorist-facing — if formulate is down, salon can't work
