# COLORgenius Mobile — Claude Handoff Document

> **Created:** 2026-05-19 2:10 PM
> **Status:** 3 bugs still present after multiple fix attempts
> **Goal:** Fix photo upload, settings buttons, and bottom tab navigation

---

## Bugs to Fix

### Bug 1: Photo Upload Fails — "Invalid header character in authorization"
- **Error shown on device:** `Upload Failed: Invalid header character in ["authorization"]`
- **Root cause:** The auth token stored in AsyncStorage contains invalid characters (whitespace, newlines, control chars) that break the HTTP `Authorization` header in React Native's `fetch()`.
- **What we tried:** Stripped `\x00-\x1F\x7F` and whitespace from token on read, and regex-removed non-base64 chars before setting header. Still failing.
- **File:** `mobile/src/api/client.ts` — see `getAuthToken()` and `uploadPhotoMultipart()`
- **Key detail:** The token comes from `AsyncStorage.getItem('cg_auth_token')`. The token value likely has characters that the current regex doesn't catch, OR the token is null/undefined and we're setting a header with a bad value.
- **The upload endpoint:** `POST https://colorgenius.co/api/photos/upload` — multipart form data with `file`, `sessionId`, `angle` fields.
- **Test:** Upload a photo from the Camera screen → choose gallery or take photo → tap "Upload & Analyze"

### Bug 2: Settings Buttons Don't Work
- **Symptom:** All buttons in the Settings screen appear unresponsive to taps
- **Settings actually ARE local (AsyncStorage) — not connected to any backend.** They save to AsyncStorage and load on screen mount.
- **The toggles use `Switch` components with `onValueChange` handlers.** The handlers call AsyncStorage save functions.
- **File:** `mobile/src/screens/SettingsScreen.tsx`
- **Possible causes:**
  1. The `TouchableOpacity` `onPress` on rows without `onPress` is set to `disabled={!onPress}` — this might be blocking Switch taps somehow
  2. The `ScrollView` might be capturing touch events
  3. The `SafeAreaView` edges configuration might be interfering
  4. The Switch might not be responding on the device (trackColor/thumbColor might not render)
- **Test:** Open Settings tab → try toggling Notifications, Dark Mode, Auto Sync switches

### Bug 3: Bottom Tab Navigation Requires Multiple Taps
- **Symptom:** Tab bar buttons at the bottom must be tapped at the very bottom of the icon to register
- **Current config in `App.tsx`:**
  ```js
  tabBarItemStyle: {
    paddingVertical: 8,
    minHeight: 60,
  },
  tabBarStyle: {
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
  },
  ```
- **File:** `mobile/App.tsx`
- **Possible cause:** The `tabBarItemStyle` might not be expanding the touch target. React Navigation's tab bar uses `Pressable` internally, and the icon + label area might be too small despite the padding. May need `hitSlop` or a custom `tabBarButton` component.
- **Test:** Tap each tab (Home, Formulate, Camera, Clients, Community, Settings) — they should respond on first tap anywhere on the icon/label

---

## Project Structure

```
mobile/                          # Expo React Native app (THIS is the source of truth)
├── App.tsx                      # Tab navigator — 6 tabs
├── app.json                     # Expo config, projectId: b079806d-5b5b-4c83-ab89-63ea74de66da
├── eas.json                     # EAS Build config
├── src/
│   ├── api/
│   │   └── client.ts           # API client — upload, formulate, settings (AsyncStorage)
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Dashboard home
│   │   ├── FormulateScreen.tsx  # 6-step wizard (1556 lines)
│   │   ├── CameraScreen.tsx     # Photo capture + upload
│   │   ├── ClientsScreen.tsx    # Client management
│   │   ├── CommunityScreen.tsx  # Gallery/community
│   │   └── SettingsScreen.tsx   # Settings with toggles
│   └── types/
│       └── index.ts            # TONES, HAIR_LEVEL_NAMES, TONE_VALUE_MAP
├── package.json
└── node_modules/
```

## Web Backend (colorgenius.co)

The web API runs at `https://colorgenius.co/api`. Key endpoints:

- `POST /api/formulate` — accepts `{ currentLevel, currentTone, targetLevel, targetTone, condition, brandPreference }`. Tone values are full names like "warm", "cool", "ash" (not single letters).
- `POST /api/photos/upload` — multipart form data with `file`, `sessionId`, `angle` fields. Returns `{ success: true, data: { id, url, ... } }`. No auth required (middleware was just fixed to not redirect API routes).
- `GET /api/health` — health check
- `GET /api/clients` — client list

**Middleware:** `dashboard/middleware.ts` — was recently fixed to add `/api` to PUBLIC_PATHS so API routes aren't redirected to `/login`.

## EAS Build & Deploy

```bash
# Build from mobile/ directory:
cd /home/jason/.openclaw/workspaces/colorgenius/mobile
EXPO_TOKEN="$(cat /tmp/expo_token.txt)" npx eas-cli@latest build --platform ios --profile production --non-interactive

# Submit to Apple:
EXPO_TOKEN="$(cat /tmp/expo_token.txt)" npx eas-cli@latest submit --platform ios --id <BUILD_ID> --non-interactive
```

**Token file:** `/tmp/expo_token.txt` (contains EXPO_TOKEN — read from file, don't inline it)
**ASC App ID:** `6768502681`
**Bundle ID:** `com.colorgenius.app`
**Project ID:** `b079806d-5b5b-4c83-ab89-63ea74de66da`

## Important Notes

1. **Always build from `mobile/` directory** — NOT from `ios-app/` (old code) or repo root
2. **Commit before building** — EAS uses git commits, not working tree
3. **EXPO_TOKEN has `--` in it** — must be read from file or shell will truncate it
4. **The stale `colorgenius` Vercel project** builds from repo root and fails — it's unrelated to the live site
5. **The `dashboard` Vercel project** serves colorgenius.co and is working correctly

## What Works Now
- ✅ 6-step formulate wizard (generates formulas from web API)
- ✅ Camera capture and gallery picker
- ✅ Tab navigation (just needs larger touch targets)
- ✅ Web middleware fix deployed (API routes no longer redirect to /login)

## What's Broken
- ❌ Photo upload — "Invalid header character in authorization"
- ❌ Settings toggles — buttons don't respond to taps
- ❌ Tab bar — must tap at very bottom of icon to register
