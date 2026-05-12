# ColorGenius Production Deployment Guide

## Setup Steps

### 1. Supabase (Database)
1. Go to [supabase.com](https://supabase.com) → Create project (free)
2. Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Settings → API
3. Run `schema.sql` in the SQL Editor
4. Run `import_shades.py` to populate shade data:
   ```bash
   SUPABASE_URL=xxx SUPABASE_ANON_KEY=xxx python3 import_shades.py
   ```

### 2. Cloudflare (API + Frontend)
1. Install Wrangler: `npm install -g wrangler`
2. Login: `wrangler login`
3. Update `wrangler.toml` with your Supabase credentials
4. Deploy API: `cd api && npm install && wrangler deploy`
5. Deploy Frontend: `cd frontend/dist && wrangler pages deploy . --project-name=colorgenius`

### 3. Domain (colorgenius.co)
1. In Cloudflare dashboard → DNS → Add CNAME:
   - `colorgenius.co` → `colorgenius.pages.dev`
   - `api.colorgenius.co` → `colorgenius-api.workers.dev`

### 4. iOS App (MacinCloud)
1. Rent Mac from macincloud.com ($4 for 1 hour)
2. Upload `ios-app/` folder
3. Open `ios-app/ios/App/App.xcworkspace` in Xcode
4. Update `capacitor.config.ts` to point to `https://colorgenius.co`
5. Build & download .ipa
6. Install on iPad via TestFlight or direct install

## Architecture
```
iPad App (Capacitor)
    ↓
colorgenius.co (Cloudflare Pages)
    ↓
api.colorgenius.co (Cloudflare Worker)
    ↓
Railway PostgreSQL (existing)
```

## Costs
- Supabase: Free (up to 500MB)
- Cloudflare Pages: Free
- Cloudflare Workers: Free (100K requests/day)
- Apple Developer: $99/year
- MacinCloud: $4 (one-time build)

## File Structure
```
production/
├── database/
│   ├── schema.sql          # Database schema
│   └── import_shades.py    # Data import script
├── api/
│   ├── wrangler.toml       # Cloudflare config
│   ├── package.json
│   └── src/index.ts        # API endpoints
└── frontend/
    ├── package.json
    └── dist/               # Static files for Cloudflare Pages
        ├── index.html      # Main app
        └── api.js          # API client
```
