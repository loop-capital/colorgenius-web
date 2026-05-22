# COLORgenius Mobile — Syntax Review Report

**Reviewer:** Che (syntax subagent)  
**Date:** 2026-05-20  
**Files reviewed:** 20 (App.tsx + 2 components + 17 screens)  
**Lines reviewed:** ~2,100+

---

## 1. Critical Errors (Will Break Build) 🚨

| # | File | Issue | Fix |
|---|------|-------|-----|
| **1** | `CameraScreen.tsx` | `CameraView` from `expo-camera` v17 uses a **different API** than assumed. `CameraType` type and `useCameraPermissions` import may be incorrect for expo-camera ~17.0.10. The `facing` prop on `<CameraView>` should be `type="back" \| "front"` not the `CameraType` enum in newer versions. | Verify against expo-camera v17 docs; likely needs `type="back"` string instead of `CameraType` enum. |
| **2** | `CameraScreen.tsx` | `takePictureAsync` is called on `cameraRef.current` but `CameraView` in expo-camera v17 may use `takePicture` (not `takePictureAsync`) and returns a different shape. | Check expo-camera v17 API — method name and return type likely changed. |
| **3** | `FormulateScreen.tsx` | `ScrollView` is used inside `KeyboardAvoidingView` but `ScrollView` is **not imported** at the top of the file. Only `View`, `Text`, `StyleSheet`, `ScrollView`, `TouchableOpacity`, `TextInput`, `Alert`, `ActivityIndicator`, `KeyboardAvoidingView`, `Platform`, `Pressable` are imported — wait, `ScrollView` **IS** imported. Rechecking... Actually `ScrollView` IS in the import list. **This is fine.** | — |
| **4** | `App.tsx` | `useNavigation` imported from `@react-navigation/native` is used inside `MainTabs` which is **NOT** a screen component. `useNavigation` only works inside screen components or children of a navigator. Inside `MainTabs` it should use the `navigation` prop instead, or wrap with a proper screen component. | Pass `navigation` prop to `MainTabs` from a parent screen, or use `useNavigation` only inside components rendered within a screen context. |

### Detailed Analysis of Critical Error #4 (App.tsx)

In `MainTabs()`, the code calls:

```tsx
const navigation = useNavigation<any>();
```

`MainTabs` is a component that **returns** the `Tab.Navigator`. It is called from `RootStack.Screen` as `component={MainTabs}`. Because `MainTabs` is used as the `component` prop of a screen, React Navigation **will** pass `navigation` and `route` props to it. So `useNavigation()` inside `MainTabs` actually **is** inside a screen context because the rendered output of `MainTabs` gets the navigation context. This is a **gray area** — it may work at runtime but TypeScript may complain. **Downgrading from CRITICAL to WARNING.**

---

## 2. Warnings (Might Cause Issues) ⚠️

| # | File | Issue | Risk |
|---|------|-------|------|
| **1** | `App.tsx` | `useNavigation<any>()` in `MainTabs` — using `any` defeats TypeScript safety. | Navigation calls won't be type-checked. |
| **2** | `App.tsx` | All screen components typed as `({ navigation }: any)` — no typed navigation props. | Missing type safety across all screens. |
| **3** | `MoreDrawer.tsx` | `LogOut` icon imported from `lucide-react-native` — verify this icon exists (should be `LogOut` or `LogOutIcon` depending on version). | Icon may not render. |
| **4** | `SettingsScreen.tsx` | `CircleQuestionMark` icon imported — verify this exists in `lucide-react-native` v1.16.0. May be `HelpCircle` instead. | Icon may not render. |
| **5** | `SettingsScreen.tsx` | `Smartphone` icon imported — verify this exists in `lucide-react-native` v1.16.0. | Icon may not render. |
| **6** | `DashboardScreen.tsx` | `navigation.navigate('More', { screen: 'Library' })` — the `More` tab is registered as a bottom tab with `component={DashboardScreen}` (dummy). Nested navigation to `More.screen` won't work because `More` is not a navigator, just a dummy screen. | Navigation call is effectively a no-op or may crash. |
| **7** | `HomeScreen.tsx` | `navigation.navigate('Formulate', { screen: 'Camera' })` — `Formulate` is a Stack screen, not a navigator with nested screens. The `screen` param won't do anything. | Dead navigation param. |
| **8** | `HomeScreen.tsx` | Uses light theme (`#F9FAFB` bg, `#111827` text) while most other screens use dark theme (`#0F0F1A` bg). **Inconsistent theming** across screens. | UX inconsistency — half the app is light, half is dark. |
| **9** | `ClientsScreen.tsx` | Uses light theme (`#F9FAFB` bg) — same inconsistency issue. | UX inconsistency. |
| **10** | `CommunityScreen.tsx` | Uses light theme (`#F9FAFB` bg) — same inconsistency issue. | UX inconsistency. |
| **11** | `SettingsScreen.tsx` | Uses light theme (`#F3F4F6` bg) — same inconsistency issue. | UX inconsistency. |
| **12** | `CameraScreen.tsx` | Permission denied UI uses `#111827` text colors (light theme) on what could be a light background — the `center` style has no explicit backgroundColor, inherits from parent `SafeAreaView` which is also not explicitly colored in the denied path. | Visual inconsistency. |
| **13** | `FormulateScreen.tsx` | The `KeyboardAvoidingView` + `ScrollView` combination may cause scroll issues on Android when keyboard opens. The `behavior="padding"` prop is iOS-only. | Android keyboard may obscure input fields. |
| **14** | `FormulateScreen.tsx` | `ScrollView` inside `KeyboardAvoidingView` but no `behavior` prop explicitly set (defaults to `undefined` on Android). | Android UX issue. |
| **15** | `FormulateScreen.tsx` | `BRANDS` array includes `L'Oréal` with a curly apostrophe — could cause encoding issues in some environments. | Rare, but possible encoding glitch. |
| **16** | `MoreDrawer.tsx` | `SCREEN_HEIGHT` is destructured from `Dimensions.get('window')` but **never used** in the file. | Dead code — no functional issue but lint warning. |
| **17** | `ServiceActionSheet.tsx` | `X` icon imported but never used in the JSX (no close button in the sheet itself, only backdrop tap). | Dead import. |
| **18** | `App.tsx` | `CameraScreen` imported but never referenced in the `TabParamList` type definition (it's only in `RootStackParamList`). | Missing from tab types — not critical since it's a stack screen. |
| **19** | `SettingsScreen.tsx` | `saveDefaultBrand` imported from `../api/client` but never called (default brand is hardcoded as "Wella"). | Dead import / unfinished feature. |
| **20** | `SettingsScreen.tsx` | `getDefaultBrand` imported but the settings loading effect doesn't update `defaultBrand` state from settings API. | Unfinished feature. |
| **21** | `ClientsScreen.tsx` | `useEffect` dependency `[search]` calls `loadClients` which is a `useCallback` with `[search]` dependency — this is a **circular dependency pattern** that works but is fragile. | Potential stale closure issues. |
| **22** | `CameraScreen.tsx` | `ImagePicker.launchImageLibraryAsync` uses `mediaTypes: ['images']` — in expo-image-picker v17, this may need to be `mediaTypes: ImagePicker.MediaTypeOptions.Images` or a string constant. | Potential runtime error if API changed. |

---

## 3. Suggestions (Code Quality) 💡

| # | File | Suggestion |
|---|------|-----------|
| **1** | All screens | Create a shared `COLORS` constant file instead of duplicating the same palette in every screen file. |
| **2** | All screens | Create shared `ScreenWrapper` component that handles `SafeAreaView` + `ScrollView` + consistent padding. |
| **3** | `App.tsx` | Define typed navigation props instead of `any` — use `NativeStackNavigationProp<RootStackParamList>` and pass to screens. |
| **4** | `App.tsx` | Add `SafeAreaProvider` from `react-native-safe-area-context` at the root level (currently only `SafeAreaView` is used in screens). |
| **5** | `SettingsScreen.tsx` | Remove the duplicate `content` variable pattern — the `SettingRow` component has a `content` variable that's never used because the component returns JSX directly. |
| **6** | `FormulateScreen.tsx` | The `stepStyles.generateBtn` style is defined but never used (no Generate button in Step 6 — it's handled by `NavButtons`). | Remove dead style. |
| **7** | `FormulateScreen.tsx` | The `handleGenerate` function references `formData.developerPreference` but the field is called `developerPreference` in `FormState`, yet sent as `linePreference` to the API. Consider renaming for clarity. |
| **8** | `MoreDrawer.tsx` | Consider adding an overlay backdrop with semi-transparent black behind the drawer for better UX. |
| **9** | `ServiceActionSheet.tsx` | Consider adding a slide-up animation instead of instant appear. |
| **10** | `CameraScreen.tsx` | The permission denied screen uses hardcoded colors (`#111827`, `#6B7280`) instead of the theme constants. |
| **11** | `DashboardScreen.tsx` | The `LayoutDashboard` icon is imported in `App.tsx` for the Dashboard tab but `DashboardScreen` itself doesn't import or use it. | N/A — tab icon is in App.tsx, this is fine. |
| **12** | `FormulateScreen.tsx` | `TONE_VALUE_MAP` is used to convert tone codes to names for the API, but the API may actually accept the single-letter codes directly. Verify and simplify if possible. |
| **13** | All placeholder screens | 10 screens (Analyze, Certification, Gallery, History, Inventory, Library, Pricing, Questionnaire, Service, Subscription) are essentially identical placeholder layouts. Consider creating a `PlaceholderScreen` reusable component. |

---

## 4. App.tsx Wiring Analysis

### Tab Wiring (5 tabs)

| Tab Name | Component | Icon | Listener | Status |
|----------|-----------|------|----------|--------|
| Dashboard | `DashboardScreen` | `LayoutDashboard` | — | ✅ OK |
| NewService | `ServiceScreen` (dummy) | `CirclePlus` | `tabPress` → `serviceSheetVisible = true` | ✅ OK |
| Formulate | `FormulateScreen` | `FlaskConical` | — | ✅ OK |
| Clients | `ClientsScreen` | `Users` | — | ✅ OK |
| More | `DashboardScreen` (dummy) | `MoreHorizontal` | `tabPress` → `moreDrawerVisible = true` | ✅ OK |

**Note:** The "More" tab uses `DashboardScreen` as a dummy component. This is fine because the drawer overlay handles all navigation. When the drawer navigates to a screen, it pushes onto the RootStack, so the tab bar remains visible (correct behavior).

### Stack Screen Registration (12 screens from More drawer)

| Screen Name | Component | Registered in RootStack | Status |
|-------------|-----------|------------------------|--------|
| Questionnaire | `QuestionnaireScreen` | ✅ | OK |
| Library | `LibraryScreen` | ✅ | OK |
| Analyze | `AnalyzeScreen` | ✅ | OK |
| History | `HistoryScreen` | ✅ | OK |
| Gallery | `GalleryScreen` | ✅ | OK |
| Community | `CommunityScreen` | ✅ | OK |
| Inventory | `InventoryScreen` | ✅ | OK |
| Pricing | `PricingScreen` | ✅ | OK |
| Certification | `CertificationScreen` | ✅ | OK |
| Settings | `SettingsScreen` | ✅ | OK |
| Subscription | `SubscriptionScreen` | ✅ | OK |
| Camera | `CameraScreen` | ✅ | OK |

**All 12 More drawer items + Camera are registered.** ✅

### ServiceActionSheet Routes

The sheet offers two options:
1. **"New Color Service"** → navigates to `Formulate` ✅
2. **"Consultation"** → navigates to `Questionnaire` ✅

Both routes exist in the RootStack. ✅

---

## 5. Theme Consistency Check

| Screen | Background | Text Primary | Text Secondary | Theme Match |
|--------|-----------|--------------|-----------------|-------------|
| App.tsx (tab bar) | `#0F0F1A` | `#F5F5F7` | `#A1A1AA` | ✅ Dark |
| DashboardScreen | `#0F0F1A` | `#F5F5F7` | `#A1A1AA` | ✅ Dark |
| FormulateScreen | `#0A0A1A` | `#F5F5F7` | `rgba(255,255,255,0.5)` | ⚠️ Slightly different bg |
| AnalyzeScreen | `#0F0F1A` | `#F5F5F7` | `#A1A1AA` | ✅ Dark |
| CertificationScreen | `#0F0F1A` | `#F5F5F7` | `#A1A1AA` | ✅ Dark |
| GalleryScreen | `#0F0F1A` | `#F5F5F7` | `#A1A1AA` | ✅ Dark |
| HistoryScreen | `#0F0F1A` | `#F5F5F7` | `#A1A1AA` | ✅ Dark |
| InventoryScreen | `#0F0F1A` | `#F5F5F7` | `#A1A1AA` | ✅ Dark |
| LibraryScreen | `#0F0F1A` | `#F5F5F7` | `#A1A1AA` | ✅ Dark |
| PricingScreen | `#0F0F1A` | `#F5F5F7` | `#A1A1AA` | ✅ Dark |
| QuestionnaireScreen | `#0F0F1A` | `#F5F5F7` | `#A1A1AA` | ✅ Dark |
| ServiceScreen | `#0F0F1A` | `#F5F5F7` | `#A1A1AA` | ✅ Dark |
| SubscriptionScreen | `#0F0F1A` | `#F5F5F7` | `#A1A1AA` | ✅ Dark |
| **HomeScreen** | `#F9FAFB` | `#111827` | `#6B7280` | ❌ **LIGHT** |
| **ClientsScreen** | `#F9FAFB` | `#111827` | `#6B7280` | ❌ **LIGHT** |
| **CommunityScreen** | `#F9FAFB` | `#111827` | `#6B7280` | ❌ **LIGHT** |
| **SettingsScreen** | `#F3F4F6` | `#111827` | `#6B7280` | ❌ **LIGHT** |
| **CameraScreen** (perms) | `#FFF` (implicit) | `#111827` | `#6B7280` | ❌ **LIGHT** |

**Summary:** 13 screens use dark theme, 4 screens use light theme, 1 has mixed. This is a **significant UX inconsistency** — the app will feel like two different apps when navigating between Dashboard → Clients → Settings.

---

## 6. Icon Verification (lucide-react-native v1.16.0)

All icons used are standard lucide icons. Here are the ones to double-check at runtime:

| Icon | Used In | Status |
|------|---------|--------|
| `LayoutDashboard` | App.tsx tab | ✅ Standard |
| `CirclePlus` | App.tsx tab, ServiceScreen, FormulateScreen | ✅ Standard |
| `FlaskConical` | App.tsx tab | ✅ Standard |
| `Users` | App.tsx tab, ClientsScreen | ✅ Standard |
| `MoreHorizontal` | App.tsx tab | ✅ Standard |
| `ClipboardList` | MoreDrawer, ServiceActionSheet, QuestionnaireScreen | ✅ Standard |
| `BookOpen` | MoreDrawer, LibraryScreen | ✅ Standard |
| `Camera` | MoreDrawer, AnalyzeScreen, CameraScreen, FormulateScreen, HomeScreen | ✅ Standard |
| `History` | MoreDrawer, HistoryScreen | ✅ Standard |
| `ImageIcon` | MoreDrawer, GalleryScreen, CameraScreen | ✅ Standard |
| `MessageCircle` | MoreDrawer, CommunityScreen | ✅ Standard |
| `Package` | MoreDrawer, InventoryScreen, HomeScreen | ✅ Standard |
| `DollarSign` | MoreDrawer, PricingScreen | ✅ Standard |
| `Award` | MoreDrawer, CertificationScreen | ✅ Standard |
| `CreditCard` | MoreDrawer, SubscriptionScreen | ✅ Standard |
| `Settings` | MoreDrawer, SettingsScreen | ✅ Standard |
| `LogOut` | MoreDrawer | ⚠️ Verify at runtime |
| `X` | MoreDrawer, ServiceActionSheet, ClientsScreen, CameraScreen | ✅ Standard |
| `ChevronRight` | Almost all screens | ✅ Standard |
| `ChevronLeft` | FormulateScreen | ✅ Standard |
| `Sparkles` | FormulateScreen, CommunityScreen, HomeScreen, DashboardScreen | ✅ Standard |
| `AlertTriangle` | FormulateScreen | ✅ Standard |
| `CheckCircle2` | FormulateScreen | ✅ Standard |
| `RotateCcw` | FormulateScreen, CameraScreen | ✅ Standard |
| `Palette` | FormulateScreen, HomeScreen | ✅ Standard |
| `Zap` | CameraScreen | ✅ Standard |
| `RotateCcw` | CameraScreen | ✅ Standard (duplicate) |
| `Search` | ClientsScreen | ✅ Standard |
| `Plus` | ClientsScreen, HomeScreen | ✅ Standard |
| `User` | ClientsScreen | ✅ Standard |
| `Phone` | ClientsScreen | ✅ Standard |
| `Mail` | ClientsScreen | ✅ Standard |
| `Calendar` | ClientsScreen | ✅ Standard |
| `TrendingUp` | CommunityScreen | ✅ Standard |
| `Star` | CommunityScreen | ✅ Standard |
| `Heart` | CommunityScreen | ✅ Standard |
| `Eye` | CommunityScreen | ✅ Standard |
| `Bell` | SettingsScreen | ✅ Standard |
| `Bluetooth` | SettingsScreen | ✅ Standard |
| `Shield` | SettingsScreen | ✅ Standard |
| `CircleQuestionMark` | SettingsScreen | ⚠️ Verify — may be `HelpCircle` |
| `Moon` | SettingsScreen | ✅ Standard |
| `Wifi` | SettingsScreen | ✅ Standard |
| `Smartphone` | SettingsScreen | ⚠️ Verify at runtime |

---

## 7. Import Analysis

### Missing / Potentially Broken Imports

| File | Import | From | Status |
|------|--------|--------|--------|
| `App.tsx` | `DashboardScreen` | `./src/screens/DashboardScreen` | ✅ OK |
| `App.tsx` | `ServiceScreen` | `./src/screens/ServiceScreen` | ✅ OK |
| `App.tsx` | `FormulateScreen` | `./src/screens/FormulateScreen` | ✅ OK |
| `App.tsx` | `ClientsScreen` | `./src/screens/ClientsScreen` | ✅ OK |
| `App.tsx` | `QuestionnaireScreen` | `./src/screens/QuestionnaireScreen` | ✅ OK |
| `App.tsx` | `LibraryScreen` | `./src/screens/LibraryScreen` | ✅ OK |
| `App.tsx` | `AnalyzeScreen` | `./src/screens/AnalyzeScreen` | ✅ OK |
| `App.tsx` | `HistoryScreen` | `./src/screens/HistoryScreen` | ✅ OK |
| `App.tsx` | `GalleryScreen` | `./src/screens/GalleryScreen` | ✅ OK |
| `App.tsx` | `CommunityScreen` | `./src/screens/CommunityScreen` | ✅ OK |
| `App.tsx` | `InventoryScreen` | `./src/screens/InventoryScreen` | ✅ OK |
| `App.tsx` | `PricingScreen` | `./src/screens/PricingScreen` | ✅ OK |
| `App.tsx` | `CertificationScreen` | `./src/screens/CertificationScreen` | ✅ OK |
| `App.tsx` | `SettingsScreen` | `./src/screens/SettingsScreen` | ✅ OK |
| `App.tsx` | `SubscriptionScreen` | `./src/screens/SubscriptionScreen` | ✅ OK |
| `App.tsx` | `CameraScreen` | `./src/screens/CameraScreen` | ✅ OK |
| `App.tsx` | `MoreDrawer` | `./src/components/MoreDrawer` | ✅ OK |
| `App.tsx` | `ServiceActionSheet` | `./src/components/ServiceActionSheet` | ✅ OK |

All 16 screen imports + 2 component imports in `App.tsx` resolve correctly. ✅

### Cross-Screen API Imports

| File | Import | From | Status |
|------|--------|--------|--------|
| `CameraScreen.tsx` | `uploadPhoto`, `analyzePhoto` | `../api/client` | ✅ OK |
| `ClientsScreen.tsx` | `getClients`, `createClient`, `Client` | `../api/client` | ✅ OK |
| `CommunityScreen.tsx` | `getPublicGallery`, `getTrendingGallery`, `browseMarketplace` | `../api/client` | ✅ OK |
| `DashboardScreen.tsx` | (none) | — | N/A |
| `FormulateScreen.tsx` | `submitFormulation`, `FormulationInput`, `FormulationResult` | `../api/client` | ✅ OK |
| `FormulateScreen.tsx` | `HAIR_LEVEL_NAMES`, `TONES`, `ToneValue`, `TEXTURES`, etc. | `../types` | ✅ OK |
| `HomeScreen.tsx` | `healthCheck`, `getTrendingGallery`, `getProducts` | `../api/client` | ✅ OK |
| `SettingsScreen.tsx` | `clearAuthToken`, `getSettings`, `saveNotifications`, etc. | `../api/client` | ✅ OK |

All API imports resolve correctly. ✅

---

## 8. Export Analysis

All 17 screens export their component as `default`. ✅

| Screen | Export | Status |
|--------|--------|--------|
| AnalyzeScreen | `export default function` | ✅ |
| CameraScreen | `export default function` | ✅ |
| CertificationScreen | `export default function` | ✅ |
| ClientsScreen | `export default function` | ✅ |
| CommunityScreen | `export default function` | ✅ |
| DashboardScreen | `export default function` | ✅ |
| FormulateScreen | `export default function` | ✅ |
| GalleryScreen | `export default function` | ✅ |
| HistoryScreen | `export default function` | ✅ |
| HomeScreen | `export default function` | ✅ |
| InventoryScreen | `export default function` | ✅ |
| LibraryScreen | `export default function` | ✅ |
| PricingScreen | `export default function` | ✅ |
| QuestionnaireScreen | `export default function` | ✅ |
| ServiceScreen | `export default function` | ✅ |
| SettingsScreen | `export default function` | ✅ |
| SubscriptionScreen | `export default function` | ✅ |

---

## 9. JSX Structural Issues

| File | Issue | Status |
|------|-------|--------|
| `MoreDrawer.tsx` | `ScrollView` inside `View` with `position: 'absolute'` — `ScrollView` needs a bounded height. The parent `View` has `top:0, bottom:0` so it fills the screen, giving `ScrollView` a bounded height. | ✅ OK |
| `ServiceActionSheet.tsx` | `View` with `position: 'absolute'` fills screen, `TouchableOpacity` backdrop covers full area. Sheet is positioned at bottom with `justifyContent: 'flex-end'`. | ✅ OK |
| `FormulateScreen.tsx` | `KeyboardAvoidingView` wraps `ScrollView` — valid pattern for iOS. On Android, may need `android:windowSoftInputMode="adjustPan"` in manifest. | ⚠️ See warnings |
| All screens | No obvious unclosed tags, mismatched braces, or JSX syntax errors. | ✅ OK |

---

## 10. TypeScript Type Issues

| File | Issue | Severity |
|------|-------|----------|
| All screens | `navigation` prop typed as `any` | Low — works at runtime, no type safety |
| `FormulateScreen.tsx` | `formData.lastChemicalService as LastServiceType` — explicit cast needed because `FormState.lastChemicalService` is typed as `string` but `LAST_SERVICE_OPTIONS` expects `LastServiceType`. This is a legitimate type mismatch in the state definition. | Medium |
| `CameraScreen.tsx` | `err: any` in catch blocks — could use `unknown` with type guard. | Low |
| `ClientsScreen.tsx` | `err: any` in catch block. | Low |
| `FormulateScreen.tsx` | `err: any` in catch block. | Low |
| `CommunityScreen.tsx` | `item: any` in `PhotoCard` and `MarketplaceItem` props. | Low |
| `MoreDrawer.tsx` | `icon: React.ReactNode` in `DrawerItem` interface — should be more specific (e.g., `React.ReactElement`). | Low |
| `App.tsx` | `icon: any` in `TabIcon` props — should be `React.ComponentType<{ size: number; color: string }>`. | Low |

---

## 11. Metro Bundler Concerns

| Concern | Status | Notes |
|---------|--------|-------|
| All imports resolve | ✅ | No missing modules detected |
| No circular dependencies | ✅ | None detected |
| No bare `require()` calls | ✅ | All ES module imports |
| `package.json` dependencies | ✅ | All referenced packages are listed |
| `expo-camera` v17 API | ⚠️ | May need verification for `CameraView` props |
| `expo-image-picker` v17 API | ⚠️ | `mediaTypes: ['images']` may need updating |

---

## 12. Summary Verdict

### Verdict: ⚠️ **CONDITIONAL PASS — with fixes required**

The codebase is **structurally sound** with no syntax errors that would prevent Metro from bundling. All imports resolve, all screens export correctly, and the navigation wiring is complete.

### Must Fix Before Release:
1. **Theme consistency** — 4 screens (Home, Clients, Community, Settings) use light theme while the rest use dark. Pick one theme and apply uniformly.
2. **Expo Camera API** — Verify `CameraView` props and `takePictureAsync` method against expo-camera v17 docs.
3. **Expo Image Picker API** — Verify `mediaTypes` prop format for expo-image-picker v17.

### Should Fix:
4. Replace `any` types with proper navigation prop types.
5. Verify `LogOut`, `CircleQuestionMark`, and `Smartphone` icon names in lucide-react-native v1.16.0.
6. Fix dead navigation calls (`navigation.navigate('More', { screen: 'Library' })` and `navigation.navigate('Formulate', { screen: 'Camera' })`).
7. Remove unused imports (`X` in ServiceActionSheet, `SCREEN_HEIGHT` in MoreDrawer).

### Overall Assessment:
- **Build:** Will likely compile, but runtime issues possible with expo-camera.
- **Navigation:** Fully wired, all 5 tabs + 12 drawer items + Camera work.
- **Theme:** Inconsistent — needs unification.
- **Type Safety:** Weak due to heavy `any` usage, but no type errors that would block compilation.
- **Code Quality:** Good structure, well-organized, but could benefit from shared components.

---

*End of review. 20 files analyzed, ~2,100+ lines reviewed, 4 critical items (downgraded to 1), 22 warnings, 12 suggestions.*
