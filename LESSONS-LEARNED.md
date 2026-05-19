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

### PL-001: Build from the RIGHT Directory
**May 19, 2026:** Builds 8-14 were all compiled from `ios-app/` (old code) instead of `mobile/` (fixed code). Every build appeared to succeed but TestFlight had the old broken code. **Fix:** Always `cd mobile/` before running `eas build`. The EAS project root is `mobile/`, not the repo root. **Also:** commit changes before building — EAS uses git commits, not working tree.

### PL-002: EXPO_TOKEN Has Double-Dashes
The EXPO_TOKEN contains `--` which breaks shell argument parsing. `EXPO_TOKEN="$(cat /tmp/expo_token.txt)"` — read from file, never inline.

### PL-003: Vercel Project Can Be Stale
Multiple Vercel projects can exist for the same repo. The `colorgenius` project (root dir `.`, no domains) was created alongside `dashboard` (root dir `dashboard/`, serves colorgenius.co). The stale project failed on every push. **Fix:** Deleted the stale project. Always verify which Vercel project actually serves the live domain.

### PL-004: API Routes Need Middleware Exemption
The middleware was redirecting ALL unauthenticated requests (including `/api/*`) to `/login`. Mobile app uses `Authorization: Bearer` headers, not cookies. **Fix:** Added `/api` to `PUBLIC_PATHS`. API routes should handle their own auth.

### PL-005: Auth Token Can Contain Invalid Characters
AsyncStorage tokens can have whitespace, newlines, or control characters that break HTTP headers in React Native's `fetch()`. **Fix:** Aggressively sanitize tokens: `raw.replace(/[^\x20-\x7E]/g, '').trim()` on read, and `token.replace(/[^A-Za-z0-9._~+/=-]/g, '')` before setting header. Only set header if sanitized token is non-empty.

### PL-006: TouchableOpacity Blocks Child Switch Components
In React Native, wrapping a `Switch` inside a `TouchableOpacity` blocks the Switch's taps. **Fix:** Use `pointerEvents="box-none"` on the parent View when it contains interactive children (Switch, Slider, etc.).

### PL-007: Tab Bar Touch Targets Too Small
React Navigation's default tab bar touch targets are too small on iOS. `tabBarItemStyle.paddingVertical` alone doesn't expand the pressable area. **Fix:** Use a custom `tabBarButton` component wrapping `Pressable` with `hitSlop={{ top: 10, bottom: 20, left: 10, right: 10 }}`.

### PL-008: Always Check Which Vercel Project Serves the Domain
Before assuming a failed deployment affects the live site, run `npx vercel project ls` and check which project actually has the domain. Don't trust notification emails blindly.

### PL-009: Run EXPO_TOKEN From File
Shell truncates tokens with `--` (double-dash). Always use `EXPO_TOKEN="$(cat /tmp/expo_token.txt)"` when running EAS commands.

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
