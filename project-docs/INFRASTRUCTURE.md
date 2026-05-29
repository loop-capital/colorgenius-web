# COLORgenius Infrastructure

> **Last Updated:** 2026-05-29
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
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | JWT signing key | Yes |
| `SQUARE_APPLICATION_ID` | Square app ID | Yes |
| `SQUARE_ACCESS_TOKEN` | Square sandbox/prod token | Yes |
| `SQUARE_LOCATION_ID` | Square location for payments | Yes |
| `GOOGLE_CLIENT_ID` | Google Sign In | Yes |
| `GOOGLE_CLIENT_SECRET` | Google Sign In | Yes |
| `APPLE_TEAM_ID` | Apple Sign In | Yes |
| `APPLE_KEY_ID` | Apple Sign In | Yes |
| `APPLE_SERVICES_ID` | Apple Sign In | Yes |
| `APPLE_PRIVATE_KEY` | Apple Sign In | Yes |
| `R2_ACCOUNT_ID` | Cloudflare R2 storage | Yes |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 storage | Yes |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 storage | Yes |
| `R2_BUCKET_NAME` | Cloudflare R2 storage | Yes |
| `OPENAI_API_KEY` | AI assistant (optional) | Optional |
| `OLLAMA_BASE_URL` | Kimi K2.6 fallback endpoint | Optional |

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

## Database (PostgreSQL via Prisma)

### Connection
- **ORM:** Prisma (schema at `prisma/schema.prisma`)
- **Host:** Currently Supabase PostgreSQL (migrate to Neon/Railway later)
- **Connection string:** `DATABASE_URL` in Vercel env vars
- **Models:** 62 models (users, clients, formulas, inventory_items, etc.)

### Migrations
```bash
npx prisma migrate dev    # Create migration
npx prisma migrate deploy # Apply to production
npx prisma generate        # Regenerate client
```

### Storage
- **Product images:** Cloudflare R2 (`colorgenius-photos-beta` bucket)
- **Client photos:** On-device only (never uploaded)

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
- **Host backups:** Automated by PostgreSQL host (Neon/Railway/Supabase)
- **Manual export:** `pg_dump` before major schema changes

### Git
- **Backup branches:** `backup/<description>-<date>`
- **Tags:** `v1.0.0`, `v1.1.0` for releases

---

## Monitoring

- **Vercel Analytics:** Web vitals, error tracking
- **Prisma Studio:** Query performance, data inspection
- **Square Dashboard:** Payment success rates
- **Uptime:** Colorist-facing — if formulate is down, salon can't work
