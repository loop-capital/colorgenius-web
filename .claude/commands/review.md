---
description: Review code for bugs, security issues, and best practices
scope: project
---

# Code Review

Review the current changes for:

## Branch Check

Verify the current branch context:

```bash
git branch --show-current
```

- If on `main` or `master`: warn — "You're reviewing changes directly on main. Use a feature branch."
- Report which branch is being reviewed in the output header

## Context
- Current diff: `git diff HEAD`
- Staged changes: `git diff --cached`

## Review Checklist

1. **Security** — OWASP Top 10, no secrets in code, proper input validation
2. **Types** — No `any`, proper null handling, explicit return types
3. **Error Handling** — No swallowed errors, proper logging, user-friendly messages
4. **Performance** — No N+1 queries, no memory leaks, proper pagination
5. **Testing** — New code has tests, tests have explicit assertions
6. **Database** — Supabase RLS enabled, service role key only server-side
7. **API Versioning** — All endpoints use `/api/v1/` prefix
8. **Payments** — Square only, NO Stripe references anywhere
9. **Privacy** — No photo data in logs or responses (on-device only)
10. **Vagaro** — Correct API version, proper OAuth flow

## Output Format

For each issue found:
- **File**: path/to/file.ts:line
- **Severity**: 🔴 CRITICAL | 🟡 WARNING | 🔵 SUGGESTION
- **Issue**: Description
- **Fix**: Suggested change
