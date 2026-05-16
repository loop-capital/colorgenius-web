# LESSONS-LEARNED.md — COLORgenius Failure Log

> **Purpose:** Document failures so they don't repeat. Log lessons specific to COLORgenius work here.

---

## How To Use This File

1. **Before starting any task:** Read the anti-patterns below
2. **After any failure:** Add an entry immediately — don't wait
3. **Weekly review:** Clean up and promote durable rules

---

## Critical Anti-Patterns (Universal — DO NOT REPEAT)

### 🔴 AP-001: "I'll Back It Up Later"
Declare a safety step then skip it. **Fix:** Verify backup exists (`git branch`, `ls` backup path) before ANY destructive write.

### 🔴 AP-002: Retry Without Reading the Error
Something fails, retry 3+ times without checking why. **Fix:** Read the error, search for the cause, max 2 identical attempts before diagnosing.

### 🔴 AP-003: Memory Is Write-Only
Write to memory but never check it before tasks. **Fix:** Read this file + MEMORY.md at session start.

### 🟡 AP-004: Ask Instead of Act
Found a clear fix, asked permission instead of doing it. **Fix:** Act on internal improvements. Only ask before destructive/external actions.

### 🟡 AP-005: No Post-Mortem After Failure
Moved on without documenting. **Fix:** Write root cause to this file immediately after any failure >30 min.

### 🔴 AP-006: Cross-Talk Into Other Bot's Conversations
Responded to status from another bot as if it were my task. **Fix:** Status reports from other bots are READ ONLY unless the human explicitly asks me to act.

### 🔴 AP-007: Not Checking Existing Work Before Starting New
Spawned an agent to build something that already existed. **Fix:** `ls` the target, `git log`, search memory before spawning any "build X" task.

---

## Platform Knowledge (COLORgenius Stack)

### Vision / Image Analysis
- **Kimi K2.6 (`ollama/kimi-k2.6:cloud`)** supports image input — use for image analysis tasks
- Cheaper than MiMo for vision — use Kimi first, escalate only for complex analysis

### Expo / EAS
- Free tier: **1 iOS submission per month** via `eas submit`
- When submission fails: check EAS dashboard for quota before retrying
- Alternative: `eas build` + manual upload to App Store Connect
- **Don't brute-force submissions** — check limits first

### React Native
- `Buffer.from()` doesn't exist in RN — use `atob()` + `Uint8Array` + `DataView`
- BLE initialization must be wrapped in try/catch (crashes on devices without BLE)
- iOS crash on launch = App Store rejection (Guideline 2.1)

### Apple App Store
- Guideline 2.1(a) — crash on launch = instant rejection
- Placeholder icons = rejection
- Resubmission after rejection: fix ALL issues, not just the ones they flagged

### Next.js (Dashboard)
- _Add lessons here_

### Supabase / Prisma
- _Add lessons here_

### Square Payments
- Sandbox creds ≠ production creds
- Swap keys + webhook URL when going live

---

## Project-Specific Lessons

_COLORgenius failures and discoveries go here._

<!-- Examples:
- "Always back up COLORgenius workspace before letting ColorGenius-CEO write to it"
- "iOS app is at ios-app/ — Expo project"
- "Dashboard is at dashboard/ — Next.js + Prisma"
-->

---

## Brand Ingestion Lessons

### BI-001: Tone Family Mappings Must Match Universal Families
When adding new brand tone codes to `tone-family-map.json`, verify each maps to one of the 13 universal families: `natural`, `ash`, `blue-ash`, `gold`, `copper`, `red`, `violet`, `pearl`, `beige`, `mahogany`, `chocolate`, `warm`, `cool`. Mismatches cause conversion engine to produce `weak` or `hard-stop` results for valid shades.

### BI-002: Simply Blonde Has Nested Structure
The `simply-blonde.json` file uses a wrapper object with `toners` array, not a flat array like other shade files. In `data-loader.ts`, access as `...(simplyBlondeShades.toners)` not `...simplyBlondeShades`. Sub-agents may miss this — always verify the structure after ingestion.

### BI-003: Rapid Toners Need Unique Tone Codes
Rapid Toners (RT-SA, RT-SV, etc.) share the same level (10) but need distinct `toneCode` entries in `tone-family-map.json`. Use hyphenated format (`RT-SA`, not `RT SA`) for consistent parsing.

### BI-004: Validate Shade Counts Against Official Sources
Always cross-check final shade count against the official brand color wheel / shade chart. The Kenra permanent file was corrected from ~116 to exactly 108 after receiving the authoritative color wheel list.

### BI-005: Demi-Permanent ≠ Permanent Shade Roster
Don't assume demi-permanent shares the same shade codes as permanent. Kenra demi has fewer tones (no AA, RR, BC, etc.) and fewer levels (5-10 only). Generate demi roster separately.
