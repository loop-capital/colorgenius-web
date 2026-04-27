# Deployment Checklist — ColorGenius Dashboard

## Pre-Deploy Checks

1. **Type check**
   ```bash
   cd dashboard && npx tsc --noEmit
   ```
   Zero errors required.

2. **Build**
   ```bash
   cd dashboard && npm run build
   ```
   Must complete without errors. Check all routes listed.

3. **Lint** (if configured)
   ```bash
   cd dashboard && npm run lint
   ```

4. **Verify vercel.json**
   ```bash
   cat dashboard/vercel.json
   ```
   Must contain:
   ```json
   { "framework": "nextjs", "outputDirectory": ".next" }
   ```

## Deploy

```bash
cd dashboard && npx vercel --prod
```

Wait for:
- Build completed
- "Production: https://..." URL shown
- "Aliased: https://dashboard-tau-five-16.vercel.app" shown

## Post-Deploy Verification

1. **Health check**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://dashboard-tau-five-16.vercel.app/
   ```
   Must return `200` (not `401`, `404`, or `500`).

2. **Spot-check pages**
   - `/` — Dashboard home loads
   - `/formulate` — Wizard loads with step indicators
   - `/analyze` — Photo upload area visible
   - `/library` — Color library renders

3. **API check**
   ```bash
   curl -s https://dashboard-tau-five-16.vercel.app/api/health
   ```
   Must return JSON with `status: "ok"`.

4. **If 401**: Deployment protection is on → Vercel Dashboard → Project Settings → Deployment Protection → Disable

## Rollback

```bash
# List recent deployments
npx vercel list

# Visit previous deployment URL directly
# Or redeploy from git:
npx vercel --prod --yes
```

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| 404 on all pages | Framework preset wrong | Set to Next.js in vercel.json |
| 401 auth redirect | Deployment protection enabled | Disable in Vercel settings |
| Build fails: "No Output Directory" | Missing vercel.json | Add outputDirectory: ".next" |
| Sharp module error | Missing sharp dependency | Already resolved (v0.34.5) |