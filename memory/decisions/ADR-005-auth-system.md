# ADR-005: Authentication System for ColorGenius Dashboard

## Status
**Accepted**

## Context
ColorGenius needs a closed authentication system for the salon dashboard (Next.js 14 App Router). Only registered stylists can access the app. No public/guest access. We are pre-launch and need the simplest possible system that can evolve later.

## Decision

### 1. Auth Approach: Custom JWT with httpOnly Cookies

We will implement a lightweight, custom JWT-based auth layer instead of NextAuth.js or any OAuth provider. This keeps our stack minimal, avoids third-party lock-in, and gives us full control over the session lifecycle.

| Aspect | Decision |
|--------|----------|
| Token format | JWT (signed HS256) |
| Token storage | httpOnly, Secure, SameSite=lax cookie (`token`) |
| Token lifetime | 7 days |
| Refresh strategy | None for now; re-login required after expiry |
| Password hashing | bcrypt (cost factor 12) |

**Why not NextAuth?**
- Overkill for a closed, username/password-only system.
- Adds ~100KB client bundle and a complex adapter layer we don't need.
- OAuth is explicitly out of scope for Phase 1.

**Why not localStorage for JWT?**
- XSS vulnerability. httpOnly cookies are not accessible to JavaScript, mitigating token theft via injected scripts.
- CSRF is a non-issue because we use SameSite=lax and all state-changing routes validate the cookie server-side.

### 2. User Data Model

```typescript
interface User {
  id:            string;      // UUID v4 (Prisma default)
  email:         string;      // Unique, required
  phone:         string?;     // Optional, E.164 format
  username:      string;      // Unique, required, 3–30 chars, alphanumeric + underscore
  passwordHash:  string;      // bcrypt hash, never returned to client
  profilePicture: string?;     // Base64 data URI (PNG/JPEG, < 500KB), nullable
  salonName:     string?;     // Optional, free text
  stylistName:   string;      // Display name, required, 1–100 chars
  brands:        string[];    // JSON array of brand IDs the stylist uses (e.g., ["schwarzkopf", "redken"])
  role:          "STYLIST" | "ADMIN";  // Default STYLIST; ADMIN for internal Pleij/ColorGenius staff
  createdAt:     Date;
  updatedAt:     Date;
}

interface AuthUser {
  id:            string;
  email:         string;
  username:      string;
  stylistName:   string;
  salonName:     string | null;
  profilePicture: string | null;
  brands:        string[];
  role:          string;
}
```

- `passwordHash` is **never** included in API responses.
- `brands` stored as JSON array in Prisma (`Json` field or separate `UserBrand` join table if we need referential integrity later). For Phase 1, a Prisma `Json` field on `User` is sufficient.
- `profilePicture` as base64 keeps us off S3/R2 dependency for now. A hard limit of 500KB per image prevents database bloat. We migrate to S3/R2 in a future ADR.

### 3. API Contract

#### `POST /api/auth/register`
**Body:**
```json
{
  "email": "eiza@pleij.com",
  "username": "eiza_pleij",
  "password": "Min12Chars!",
  "stylistName": "Eiza Pleij",
  "salonName": "Pleij Salon",
  "phone": "+15551234567",
  "brands": ["schwarzkopf", "redken"]
}
```
**Validation rules:**
- `email`: valid email format, unique
- `username`: 3–30 chars, `^[a-zA-Z0-9_]+$`, unique
- `password`: min 12 chars, at least 1 uppercase, 1 lowercase, 1 number (zxcvbn score ≥ 2)
- `stylistName`: 1–100 chars, required
- `salonName`: optional, max 200 chars
- `phone`: optional, E.164 format
- `brands`: optional array of valid brand slugs

**Success (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "eiza@pleij.com",
    "username": "eiza_pleij",
    "stylistName": "Eiza Pleij",
    "salonName": "Pleij Salon",
    "profilePicture": null,
    "brands": ["schwarzkopf", "redken"],
    "role": "STYLIST"
  }
}
```
- On success, the server also sets the `token` httpOnly cookie with a 7-day JWT.

**Errors:**
- `409 Conflict` — email or username already exists
- `400 Bad Request` — validation failure (details in `error.errors[]`)

#### `POST /api/auth/login`
**Body:**
```json
{
  "email": "eiza@pleij.com",
  "password": "Min12Chars!"
}
```

**Success (200):**
```json
{
  "user": { /* AuthUser shape */ }
}
```
- Sets `token` httpOnly cookie.

**Errors:**
- `401 Unauthorized` — invalid credentials (do not reveal whether email exists)

#### `GET /api/auth/me`
Reads the `token` cookie, verifies JWT, returns the current user.

**Success (200):**
```json
{ "user": { /* AuthUser shape */ } }
```

**Errors:**
- `401 Unauthorized` — missing, malformed, or expired token

#### `POST /api/auth/logout`
Clears the `token` cookie by setting `Max-Age=0`.

**Success (200):**
```json
{ "success": true }
```

### 4. Protected Routes

Implement a `middleware.ts` at the project root (`dashboard/middleware.ts`).

**Behavior:**
- Intercept all routes under `/app/*` except the allow-list.
- Allow-list (no auth required): `/login`, `/register`, `/api/auth/*`
- If no valid `token` cookie → `NextResponse.redirect(new URL('/login', request.url))`
- If token valid → attach decoded `userId` to request headers (`x-user-id`) so server components and API routes can identify the caller without re-verifying the JWT.

**Middleware pseudocode:**
```typescript
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicPaths = ['/login', '/register'];
  if (publicPaths.includes(pathname)) return NextResponse.next();

  const token = request.cookies.get('token')?.value;
  if (!token) return redirectToLogin(request);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    return redirectToLogin(request);
  }
}
```

**API route protection:**
All `/api/*` routes (except `/api/auth/*`) should read `x-user-id` or fall back to cookie verification. If missing/invalid → `401`.

### 5. Profile Picture Storage

| Phase | Approach |
|-------|----------|
| **Now** | Base64 in `User.profilePicture` column. Max 500KB. Accept PNG/JPEG only. Resize to 256x256 on upload. |
| **Later** | Migrate to S3/R2 with CloudFront; store URL in `profilePicture`. Base64 migration script provided in future ADR. |

### 6. Implementation Spec for Dev Agent

The following files need to be created or modified:

#### New files
| File | Purpose |
|------|---------|
| `dashboard/prisma/migrations/XXXX_add_user/migration.sql` | Add `User` table |
| `dashboard/prisma/schema.prisma` | Add `User` model |
| `dashboard/lib/auth.ts` | `hashPassword`, `verifyPassword`, `signToken`, `verifyToken`, `setTokenCookie`, `clearTokenCookie` |
| `dashboard/lib/db.ts` | Prisma client singleton |
| `dashboard/app/api/auth/register/route.ts` | `POST` handler |
| `dashboard/app/api/auth/login/route.ts` | `POST` handler |
| `dashboard/app/api/auth/me/route.ts` | `GET` handler |
| `dashboard/app/api/auth/logout/route.ts` | `POST` handler |
| `dashboard/app/login/page.tsx` | Login UI (stub exists, replace) |
| `dashboard/app/register/page.tsx` | Registration UI (stub exists, replace) |
| `dashboard/middleware.ts` | Route protection |
| `dashboard/types/index.ts` | `AuthUser`, `RegisterInput`, `LoginInput` |

#### Modified files
| File | Change |
|------|--------|
| `dashboard/.env.example` | Add `JWT_SECRET=change-me-in-production` |
| `dashboard/.env.local` | Add `JWT_SECRET` (dev value) |

#### Prisma schema snippet to add
```prisma
model User {
  id             String   @id @default(uuid())
  email          String   @unique
  phone          String?
  username       String   @unique
  passwordHash   String
  profilePicture String?  @db.Text  // base64, nullable
  salonName      String?
  stylistName    String
  brands         Json     @default("[]")
  role           String   @default("STYLIST")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

#### `lib/auth.ts` contract
```typescript
export async function hashPassword(plain: string): Promise<string>;
export async function verifyPassword(plain: string, hash: string): Promise<boolean>;
export function signToken(payload: { userId: string; email: string }): string;
export function verifyToken(token: string): { userId: string; email: string };
export function setTokenCookie(response: NextResponse, token: string): NextResponse;
export function clearTokenCookie(response: NextResponse): NextResponse;
export function toAuthUser(user: User): AuthUser;
```

#### `lib/db.ts` contract
```typescript
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
```

### 7. Out of Scope (Future ADRs)

| Feature | Reason |
|---------|--------|
| OAuth (Google, etc.) | Phase 1 is closed salon-only; no public sign-up funnel |
| Email verification | Onboarded by salon manager/ColorGenius team; trust is manual |
| Password reset | Can be added as a single `/api/auth/forgot` route later |
| Role-based access control (RBAC) beyond STYLIST/ADMIN | YAGNI until multi-salon admin dashboards exist |
| Rate limiting | Add at edge (Cloudflare/Vercel) or with `rate-limiter-flexible` later |
| 2FA / MFA | Not needed for salon-internal tool in Phase 1 |
| S3/R2 profile pictures | Base64 is sufficient for < 50 stylists in beta |

## Consequences

### Positive
- **Minimal dependencies** — only `jsonwebtoken` and `bcryptjs` (or `bcrypt`); no NextAuth adapters, no OAuth client libraries.
- **Full control** — we own session expiry, revocation, and cookie policy.
- **Secure by default** — httpOnly + Secure + SameSite=lax mitigates XSS and CSRF.
- **Fast to implement** — ~6 API routes + middleware + 2 pages; can be built in a single dev sprint.
- **Easy to extend** — adding password reset or roles later is a small incremental change.

### Negative
- **We own security** — no external team auditing our auth layer. Must keep `jsonwebtoken` and `bcrypt` updated.
- **No built-in OAuth** — if we later want "Sign in with Google" for stylists, we add an OAuth provider (NextAuth or custom) in a separate integration.
- **Token revocation** — no server-side session store means we cannot instantly invalidate a leaked token before expiry. Mitigation: keep expiry short (7 days), plan a server-side deny-list (Redis) if needed.
- **Profile picture bloat** — base64 in the DB is acceptable for 50 users × 200KB but will not scale to thousands. Migration to object storage is planned.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **NextAuth.js (Auth.js)** | Excessive for username/password-only; adds complexity we don't need; designed around OAuth providers |
| **OAuth-only (no passwords)** | Stylist onboarding is manager-driven; not every stylist has/wants a Google account tied to work |
| **Clerk / Auth0 / Firebase Auth** | External dependency, ongoing cost, data egress concerns; we want to own user data for salon privacy |
| **LocalStorage JWT** | XSS risk; cookies are strictly better for token storage |
| **Session tokens in DB (stateful)** | More secure (revocable) but adds Redis/DB round-trip on every request; not justified for Phase 1 |

## Related
- ADR-003 (Data Model & API Design) — foundational schema patterns
- ADR-004 (Client History + Inventory) — `User` model links to `ClientVisit` and `UsageLog`
- `dashboard/prisma/schema.prisma` — `User` model definition
- `dashboard/lib/auth.ts` — auth utilities
- `dashboard/middleware.ts` — route protection

## Decision Owner
Iris (colorgenius-ceo) via delegation to colorgenius-architect

## Date
2026-05-03
