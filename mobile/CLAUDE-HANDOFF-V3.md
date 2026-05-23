# COLORgenius Mobile — Claude Review Document v3

> **Date:** 2026-05-23, 7:30 PM
> **Purpose:** Pre-submission review. All 3 previous bugs (upload auth, settings switches, tab bar) are FIXED. This is a final review before we submit to Apple.
> **Branch:** `main`, latest commit: `d5040c0`
> **Directory:** `/home/jason/.openclaw/workspaces/colorgenius/mobile/`

---

## Your Job

Run the checks below. Fix anything broken. Commit the fixes. DO NOT build or submit — we handle that.

---

## Check 1: TypeScript Compilation

```bash
cd /home/jason/.openclaw/workspaces/colorgenius/mobile
npx tsc --noEmit 2>&1
```

Zero errors expected. If there are errors, fix them.

---

## Check 2: Expo Export (does it bundle?)

```bash
npx expo export --platform ios 2>&1 | tail -20
```

Should complete without errors. If it fails, read the error and fix.

---

## Check 3: App Launches Without Crash

This was the #1 Apple rejection reason. Read `App.tsx` and verify:
- No synchronous errors at startup
- No missing imports
- No undefined references in the root component
- Auth token loading doesn't crash if token is null/empty
- Safe area insets are handled (no crash on notch devices)

---

## Check 4: Camera & Photo Upload Flow

Apple cares that the camera feature works. Read these files:
- `src/screens/` — find the photo upload/capture screen
- `src/api/client.ts` — the `uploadPhotoMultipart()` function

Verify:
- Camera permission request is correct (in `app.json`)
- Photo capture works and returns a URI
- Upload sends multipart form data to `/api/photos/upload`
- NO Authorization header on the upload endpoint (it's public, no auth needed)
- Error handling shows user-friendly messages, not raw errors

---

## Check 5: 6-Step Formulate Flow

The core feature. Read `src/screens/` for the formulate steps. Verify:
- Step 1 (brand/product selection) loads
- Step 2 (shade selection) loads
- Step 3 (developer/ratio) loads
- Step 4 (timing) loads
- Step 5 (review/confirm) loads
- Step 6 (results) loads
- Navigation between steps works (next/back)
- No dead screens or missing routes

---

## Check 6: No Dead Imports or Unused Code

Run:
```bash
npx tsc --noEmit 2>&1 | grep "not used\|declared but never\|cannot find"
```

If there are unused imports, clean them up.

---

## Check 7: Icons & Splash

Apple rejected for placeholder icons before. Verify:
- `assets/icon.png` exists and is 1024x1024
- `assets/splash-icon.png` exists
- No placeholder text or "TODO" in the icon assets

---

## Check 8: Settings Screen

Verify the settings screen works:
- Switches respond to taps (was fixed in commit `2d6bafd`)
- No crashes when toggling settings
- Navigation to sub-pages works

---

## What NOT to Do

- ❌ Do NOT run `npm run build` (this is Expo, not a standard build)
- ❌ Do NOT run EAS build or submit commands
- ❌ Do NOT modify `app.json` version/build numbers
- ❌ Do NOT create new branches — fix on `main` and commit

---

## After Review

If all 8 checks pass, commit any fixes and tell me "ready to submit." I'll handle the EAS build and submission.

---

## Reference: Previous Bugs (Already Fixed)

The following 3 bugs were fixed in commits `ec439e4`, `2d6bafd`, `18b1e5b`. Do NOT re-fix them — just verify they stay fixed:

1. **Photo upload auth header** — Removed Authorization header from upload endpoint (it's public)
2. **Settings switches not responding** — Changed SettingRow from TouchableOpacity to plain View for rows with Switch children
3. **Tab bar touch targets too small** — Removed custom tabBarButton, increased tabBarItemStyle padding and height

If any of these regressed, fix them again.

---

## Reference: Project Structure

```
mobile/
├── App.tsx                          # Root component, navigation setup
├── app.json                         # Expo config (DO NOT modify version)
├── src/
│   ├── api/
│   │   └── client.ts               # API client, upload functions
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── FormulateScreen.tsx      # 6-step flow
│   │   ├── SettingsScreen.tsx
│   │   ├── PhotoScreen.tsx          # Camera/upload
│   │   └── ...
│   ├── components/
│   │   └── ...
│   └── lib/
│       └── ...
├── assets/
│   ├── icon.png                     # 1024x1024 app icon
│   └── splash-icon.png             # Splash screen
└── CLAUDE-HANDOFF-V3.md            # This file
```

---

*Good luck. Ship it clean.*
