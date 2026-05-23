---
description: Scaffold a new API endpoint for COLORgenius — route, handler, types, tests
scope: project
argument-hint: <resource-name>
---

# Create API Endpoint

Scaffold a production-ready API endpoint for: **$ARGUMENTS**

## Step 0 — Auto-Branch

Check the current branch. If on `main` or `master`, create a feature branch:

```bash
git branch --show-current
git checkout -b feat/api-$ARGUMENTS
```

## Step 1 — Gather Context

Before scaffolding, read the current project:

1. **Scan `src/app/api/`** — check for existing route patterns
2. **Scan `src/lib/`** — check for existing handler patterns
3. **Scan `src/types/`** — check for existing type patterns
4. **Read `API-ARCHITECTURE.md`** — if it exists, understand conventions

## Step 2 — Create Files

Generate these files for the resource:

### File 1: `src/types/api.ts` — Types (append to existing or create)

```typescript
/** API request body for creating a $ARGUMENTS */
export interface Create$ARGUMENTSBody {
  // Fields the client sends
}

/** API request body for updating a $ARGUMENTS */
export interface Update$ARGUMENTSBody {
  // Partial fields the client can update
}

/** API response shape (what the client receives) */
export interface $ARGUMENTSResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
}
```

### File 2: `src/app/api/v1/$ARGUMENTS/route.ts` — Next.js API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Create$ARGUMENTSBody, Update$ARGUMENTSBody, $ARGUMENTSResponse } from '@/types/api';

// ---------------------------------------------------------------------------
// Input Validation Schema
// ---------------------------------------------------------------------------
const createSchema = z.object({
  // Define required fields
});

// ---------------------------------------------------------------------------
// Auth Helper
// ---------------------------------------------------------------------------
async function requireAuth() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Error('Unauthorized', { cause: 401 });
  }
  return { supabase, user: session.user };
}

// ---------------------------------------------------------------------------
// POST /api/v1/$ARGUMENTS — Create
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { supabase, user } = await requireAuth();
    
    const body = await req.json();
    const validated = createSchema.parse(body);
    
    // Business logic here
    
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    if (err.cause === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('POST /api/v1/$ARGUMENTS failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/v1/$ARGUMENTS — List
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { supabase } = await requireAuth();
    
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    
    // Query logic
    
    return NextResponse.json({ data, total, page, limit }, { status: 200 });
  } catch (err) {
    if (err.cause === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/v1/$ARGUMENTS failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### File 3: `src/app/api/v1/$ARGUMENTS/[id]/route.ts` — Single Resource

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

async function requireAuth() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error('Unauthorized', { cause: 401 });
  return { supabase, user: session.user };
}

// GET /api/v1/$ARGUMENTS/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { supabase } = await requireAuth();
    const { id } = await params;
    
    // Fetch single record
    
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err) {
    if (err.cause === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/v1/$ARGUMENTS/:id failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/v1/$ARGUMENTS/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { supabase } = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    
    // Update logic
    
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err) {
    if (err.cause === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('PATCH /api/v1/$ARGUMENTS/:id failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/v1/$ARGUMENTS/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { supabase } = await requireAuth();
    const { id } = await params;
    
    // Delete logic
    
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err.cause === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('DELETE /api/v1/$ARGUMENTS/:id failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### File 4: Update `API-ARCHITECTURE.md`

Add the new endpoint to the architecture documentation:

```markdown
## $ARGUMENTS Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/v1/$ARGUMENTS | Required | Create new $ARGUMENTS |
| GET | /api/v1/$ARGUMENTS | Required | List $ARGUMENTS (paginated) |
| GET | /api/v1/$ARGUMENTS/:id | Required | Get single $ARGUMENTS |
| PATCH | /api/v1/$ARGUMENTS/:id | Required | Update $ARGUMENTS |
| DELETE | /api/v1/$ARGUMENTS/:id | Required | Delete $ARGUMENTS |
```

## Step 3 — Best Practices Enforced

### Security
- All user input passes through Zod validation
- NEVER trust `req.body` types at runtime
- NEVER expose Supabase service role key in client code
- ALWAYS return generic "Internal server error" for unexpected errors
- Auth check on every route

### Performance
- Pagination on ALL list endpoints (default 20, max 100)
- Proper HTTP status codes (201 created, 204 no content, 404 not found)
- JSON responses on all endpoints (including errors)

### Architecture
- Routes are THIN — no business logic, just parse and delegate
- Handlers contain ALL business logic
- Types defined FIRST — they're the contract
- One route file per resource

## Step 4 — Verification Checklist

After generating, verify:

- [ ] Types file updated at `src/types/api.ts`
- [ ] Route file created at `src/app/api/v1/$ARGUMENTS/route.ts`
- [ ] Single-resource route at `src/app/api/v1/$ARGUMENTS/[id]/route.ts`
- [ ] API-ARCHITECTURE.md updated
- [ ] All CRUD operations: create, read (single + list), update, delete
- [ ] Pagination on list endpoint (default 20, max 100)
- [ ] No `any` types
- [ ] No file exceeds 300 lines
- [ ] All errors caught and logged
- [ ] Auth check on every route
- [ ] Input validation with Zod
- [ ] Proper HTTP status codes
- [ ] No Stripe references — Square only
