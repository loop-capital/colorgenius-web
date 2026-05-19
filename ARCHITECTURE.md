# COLORgenius — Architecture

## Stack
- **Frontend:** Next.js 14, React, Tailwind CSS, Lucide icons
- **Database:** Prisma + PostgreSQL (Supabase)
- **Auth:** Supabase (Google OAuth + Apple Sign In)
- **Storage:** Cloudflare R2 for photos
- **Deployment:** Vercel (deploy from `dashboard/` directory ONLY)
- **Mobile:** Expo SDK 53, React Native 0.79, EAS builds
- **Payments:** Square (NOT Stripe)

## API Patterns
- Routes at: `app/api/v1/[feature]/route.ts`
- Auth: Bearer token from Supabase session
- Validation: zod schemas
- Response format: `{ data: [...], error: null }` or `{ data: null, error: "message" }`

## Component Patterns
- UI primitives: `components/ui/` (shadcn-style)
- Feature components: `components/custom/`
- Pages: `app/[feature]/page.tsx`

## Deployment
- **Web:** `cd dashboard && npx vercel --prod`
- **Mobile build:** `cd mobile && npx eas build --platform ios --profile production`
- **Mobile submit:** `cd mobile && npx eas submit --platform ios`
- **EAS token:** Use full token from TOOLS.md (NOT truncated)
- **App Store ID:** 6768502681
- **Bundle ID:** com.colorgenius.app (matches App Store Connect)

## Known Gotchas
- Deploy from `dashboard/` NOT project root
- Formspree needs dedicated `/beta` page (not link target)
- EAS needs non-interactive flags (PTY corrupts input)
- bundleIdentifier must match App Store Connect exactly
- Shade database: 21 brands, 3,454+ shades
- Kimi K2.6 for photo analysis, Claude Haiku fallback
