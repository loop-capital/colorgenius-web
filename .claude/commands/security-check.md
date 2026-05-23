---
description: Automated security audit for COLORgenius — OWASP, Supabase, API, secrets
scope: project
---

# Security Check

Comprehensive security audit for COLORgenius.

## Audit Areas

### 1. Secrets Scan
```bash
# Check for committed secrets
grep -rn "SUPABASE_SERVICE_ROLE" --include="*.ts" --include="*.tsx" --include="*.js" .
grep -rn "eyJ[a-zA-Z0-9_-]*\.eyJ" --include="*.ts" --include="*.tsx" .
grep -rn "api[_-]?key\|secret[_-]?key\|password\|token" --include="*.ts" --include="*.tsx" .
```

### 2. API Security
- All endpoints use `/api/v1/` prefix?
- Input validation on all POST/PUT/PATCH?
- Auth middleware on protected routes?
- Rate limiting configured?
- CORS properly restricted?

### 3. Supabase Security
- RLS enabled on ALL user tables?
- Service role key never exposed client-side?
- Auth policies reviewed?

### 4. Photo Privacy
- No photo URLs in API responses?
- No photo data in logs?
- On-device analysis only (Gemma)?

### 5. Payment Security
- Square credentials server-side only?
- No Stripe references anywhere?
- Webhook signatures verified?

### 6. Vagaro Integration
- OAuth tokens stored securely?
- No client secrets in frontend?

### 7. Dependencies
```bash
npm audit
```

### 8. OWASP Top 10 Check
- Injection (SQL, XSS, command)
- Broken authentication
- Sensitive data exposure
- XML external entities
- Broken access control
- Security misconfiguration
- Cross-site scripting (XSS)
- Insecure deserialization
- Using components with known vulnerabilities
- Insufficient logging

## Output
Security report with severity ratings:
- 🔴 CRITICAL — Fix before deploy
- 🟡 WARNING — Fix this week
- 🔵 INFO — Note for future
