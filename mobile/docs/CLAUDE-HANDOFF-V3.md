# COLORgenius Mobile — Claude Review Handoff (V3)

**Date:** 2026-05-21
**From:** Che (OpenClaw orchestrator)
**For:** Claude review + fixes
**Project:** COLORgenius mobile (Expo/React Native)

---

## What This Is

A complete React Native mobile app for COLORgenius — AI hair color formulation platform for salon stylists. Built with Expo SDK 52, React Navigation, expo-camera v17, lucide-react-native icons.

**20 files total:** App.tsx + 2 components + 17 screens (~2,100+ lines)

---

## What We Need From Claude

**Review the entire `mobile/` directory and fix all issues below. One pass, clean build.**

The app has been syntax-reviewed (full report at `mobile/docs/SYNTAX-REVIEW.md`). Verdict was **Conditional Pass** — structurally sound, but runtime issues need fixing before we can submit to the App Store.

---

## 🚨 Must Fix (Build-Breaking or Runtime-Breaking)

### 1. Camera API (expo-camera v17)
**File:** `src/screens/CameraScreen.tsx`

The code uses expo-camera ~17.0.10. These calls may be wrong for v17:

- `takePictureAsync()` — method may be `takePicture()` in v17
- `facing` prop on `<CameraView>` — verify if still uses `CameraType` enum or string literals
- `useCameraPermissions()` — verify import path and return shape
- `CameraType` import — may not exist in v17

**Fix:** Check expo-camera v17 docs and update all API calls to match.

### 2. Image Picker API (expo-image-picker v17)
**File:** `src/screens/CameraScreen.tsx`

- `mediaTypes: ['images']` — may need `ImagePicker.MediaTypeOptions.Images` or different constant

**Fix:** Check expo-image-picker v17 and update.

---

## ⚠️ Should Fix

### 3. Navigation Typing
**File:** `App.tsx`

- `useNavigation<any>()` used throughout — no type safety
- All screen components typed as `({ navigation }: any)`
- Should use proper `NativeStackNavigationProp<RootStackParamList>`

### 4. Dead Navigation Calls
- `DashboardScreen.tsx`: `navigation.navigate('More', { screen: 'Library' })` — `More` is a dummy tab, not a nested navigator. This call won't work.
- `HomeScreen.tsx`: `navigation.navigate('Formulate', { screen: 'Camera' })` — `Formulate` is a stack screen, not a navigator.

**Fix:** Navigate to the correct stack screen directly (e.g., `navigation.navigate('Library')`).

### 5. Missing SafeAreaProvider
**File:** `App.tsx`

- Screens use `SafeAreaView` from `react-native-safe-area-context` but there's no `SafeAreaProvider` wrapping the app root.

**Fix:** Wrap `NavigationContainer` in `<SafeAreaProvider>`.

### 6. Unused Imports (remove these)
- `ServiceActionSheet.tsx`: `X` icon imported but never used
- `MoreDrawer.tsx`: `SCREEN_HEIGHT` destructured but never used
- `SettingsScreen.tsx`: `saveDefaultBrand` imported but never called

---

## 💡 Nice to Have

- Create shared `COLORS` constant (currently same hex values duplicated in every screen)
- Create shared `PlaceholderScreen` component (10 screens are identical placeholder layouts)
- Fix `FormulateScreen.tsx` `KeyboardAvoidingView` — `behavior="padding"` is iOS-only, Android needs `android:windowSoftInputMode="adjustPan"`

---

## Architecture Overview

```
App.tsx
├── CustomHeader (hamburger Menu icon)
├── ScreenWithHeader (wrapper for all screens)
├── Stack.Navigator (RootStack)
│   ├── Dashboard → DashboardScreen
│   ├── NewService → ServiceScreen (dummy, triggers action sheet)
│   ├── Formulate → FormulateScreen (6-step wizard)
│   ├── Clients → ClientsScreen
│   ├── More → DashboardScreen (dummy, triggers sidebar drawer)
│   ├── Questionnaire → QuestionnaireScreen
│   ├── Library → LibraryScreen
│   ├── Analyze → AnalyzeScreen
│   ├── History → HistoryScreen
│   ├── Gallery → GalleryScreen
│   ├── Community → CommunityScreen
│   ├── Inventory → InventoryScreen
│   ├── Pricing → PricingScreen
│   ├── Certification → CertificationScreen
│   ├── Settings → SettingsScreen
│   ├── Subscription → SubscriptionScreen
│   └── Camera → CameraScreen
├── SidebarDrawer (12-item "More" menu)
└── ServiceActionSheet (New Color Service / Consultation)
```

**Navigation pattern:** Hamburger Menu → SidebarDrawer → pushes onto RootStack. Tab bar removed — matches web app UX.

**Theme:** Dark only (`#0F0F1A` bg, `#F5F5F7` text, `#9333EA` accent). All screens use dark theme. Dark toggle removed from settings.

---

## File List for Review

```
mobile/
├── App.tsx                                    (198 lines — main nav, theme, header)
├── src/
│   ├── components/
│   │   ├── SidebarDrawer.tsx                  (310 lines — hamburger drawer)
│   │   ├── GlassCard.tsx                      (component)
│   │   ├── LevelSlider.tsx                    (component)
│   │   └── ToneSelector.tsx                   (component)
│   ├── screens/
│   │   ├── DashboardScreen.tsx                (main dashboard)
│   │   ├── ServiceScreen.tsx                  (action sheet trigger)
│   │   ├── FormulateScreen.tsx                (6-step formula wizard)
│   │   ├── ClientsScreen.tsx                  (client management)
│   │   ├── CameraScreen.tsx                   (photo capture — ⚠️ has API issues)
│   │   ├── HomeScreen.tsx                     (home)
│   │   ├── QuestionnaireScreen.tsx            (placeholder)
│   │   ├── LibraryScreen.tsx                  (placeholder)
│   │   ├── AnalyzeScreen.tsx                  (placeholder)
│   │   ├── HistoryScreen.tsx                  (placeholder)
│   │   ├── GalleryScreen.tsx                  (placeholder)
│   │   ├── CommunityScreen.tsx                (placeholder)
│   │   ├── InventoryScreen.tsx                (placeholder)
│   │   ├── PricingScreen.tsx                  (placeholder)
│   │   ├── CertificationScreen.tsx            (placeholder)
│   │   ├── SettingsScreen.tsx                 (settings)
│   │   └── SubscriptionScreen.tsx             (placeholder)
│   ├── types/index.ts
│   └── api/client.ts
├── docs/
│   ├── NAV-ARCHITECTURE.md
│   ├── SYNTAX-REVIEW.md                       (full syntax report)
│   └── CLAUDE-HANDOFF-V3.md                   (this file)
├── package.json
└── app.json
```

---

## What Success Looks Like

1. `npx expo start` runs without errors
2. Camera opens, takes photo, returns to app — no crash
3. All navigation routes resolve correctly
4. No TypeScript errors in strict mode
5. All screens render with dark theme
6. No dead imports or unused variables

---

## Delivery

After Claude fixes everything:
- Update this handoff doc with a changelog of what was fixed
- Jason will do a final visual test on device
- Then we submit to App Store

---

## Changelog — Claude Review 2026-05-21

**Commit:** `22383e9`

### Fixed

| # | Issue | File | Change |
|---|---|---|---|
| 1 | Dead nav: `'More'` is not a nested navigator | `DashboardScreen.tsx` | `navigate('More', { screen: 'Library' })` → `navigate('Library')` |
| 2 | Dead nav: `'Formulate'` is a stack screen, not a navigator | `HomeScreen.tsx` | `navigate('Formulate', { screen: 'Camera' })` → `navigate('Camera')` |
| 3 | Unused import | `CameraScreen.tsx` | Removed `useEffect` from React import |

### Verified OK (no changes needed)

- **expo-camera v17 API**: `CameraType`, `takePictureAsync`, `facing` prop, `useCameraPermissions` — all confirmed valid against installed `node_modules/expo-camera/build/Camera.types.d.ts`
- **expo-image-picker v17**: `mediaTypes: ['images']` is the correct new-style API
- **SafeAreaProvider**: Already present wrapping `NavigationContainer` in `App.tsx`
- **`saveDefaultBrand` import**: Already absent from `SettingsScreen.tsx` imports
- **SidebarDrawer**: No unused `X` icon or `SCREEN_HEIGHT` found (those were in files that no longer exist)

*Reviewed by Claude Sonnet 4.6 — 2026-05-21*
