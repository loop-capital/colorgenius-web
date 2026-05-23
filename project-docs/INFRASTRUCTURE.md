# ColorGenius Infrastructure

> Deployment, environment, and operational details.

## Environments

### Production

- **Platform**: Vercel
- **Repo**: `loop-capital/colorgenius-web`
- **Framework**: Next.js 15

### Local Development

- **Command**: `npm run dev` (delegates to `dashboard/`)
- **Database**: Prisma with local or remote DB

## Environment Variables

Check `dashboard/.env.local` for current values. Key vars:

- `DATABASE_URL` — Prisma database connection
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` / `AWS_S3_BUCKET` — S3 uploads
- `ANTHROPIC_API_KEY` — AI recommendations
- `SENTRY_DSN` — Error tracking
- `NEXT_PUBLIC_*` — Client-side vars

## Deployment

```bash
cd colorgenius
npm run build     # Builds dashboard/
vercel deploy --prod
```

## Operational Runbook

### Redeploy

```bash
git pull origin main
npm run build
vercel deploy --prod
```

### Database Migration

```bash
cd dashboard
npx prisma migrate dev --name your-migration
npx prisma generate
```
