# ColorGenius Mobile App — Navigation Architecture

> **Status:** UPDATED — Hamburger Menu Pattern (matches web app exactly)
> **Source of Truth:** `/dashboard/components/nav-sidebar.tsx` (14 nav items + subscription link)
> **Date:** 2026-05-21

---

## 1. Design Philosophy

The mobile app **mirrors the web app navigation exactly** — same labels, same icons, same order, same dark theme. Because 14 items won't fit in a bottom tab bar, we use a **hamburger menu that opens a full sidebar drawer** — identical to the web app's mobile header pattern.

**Key principle:** NO bottom tabs. NO "More" button. The sidebar contains everything, just like the web app.

**Theme Tokens (locked to web values):**
| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#0F0F1A` | App background, drawer background |
| `text-primary` | `#F5F5F7` | Active labels, headings |
| `text-secondary` | `#A1A1AA` | Inactive labels, subtitles |
| `accent-gradient` | `#9333EA → #EC4899` | CTAs, active indicators, logo badge |
| `surface-elevated` | `#161620` | Cards, drawer sections, hover states |
| `border-subtle` | `rgba(255,255,255,0.06)` | Dividers, hairlines |

---

## 2. Header Bar — Hamburger + Logo

Every screen has a **fixed top header bar** (same pattern as web app's mobile header):

```
┌──────────────────────────────────┐
│  ☰  [CG]  ColorGenius          │  ← hamburger icon + logo + title
│  ─────────────────────────────── │  ← border-bottom: 1px rgba(255,255,255,0.06)
│                                  │
│  [Screen Content]                │
│                                  │
└──────────────────────────────────┘
```

**Header Specs:**
- **Position:** Fixed top, full width, z-index 50
- **Background:** `rgba(15,15,26,0.95)` with `backdropFilter: blur(16px)` (web) / solid on mobile
- **Height:** 56px + safe area insets
- **Left side:** Hamburger icon (`Menu` from `lucide-react-native`) in a 36×36 rounded button (`#161620` bg)
- **After hamburger:** ColorGenius logo badge (28×28, `#9333EA` bg, "CG" text) + "ColorGenius" title
- **Border:** 1px bottom `rgba(255,255,255,0.06)`
- **Haptic:** `impactLight` on hamburger tap

---

## 3. Sidebar Drawer — All 14 Nav Items

Triggered by tapping the **hamburger icon** in the header. Slides in from the **left** (same as web app's sidebar direction).

**Exact web app nav order (must match):**

| # | Label | Icon | Route | Group |
|---|-------|------|-------|-------|
| 1 | **Dashboard** | `LayoutDashboard` | `/dashboard` | WORKFLOW |
| 2 | **New Service** | `CirclePlus` | `/service` | WORKFLOW |
| 3 | **Formulate** | `FlaskConical` | `/formulate` | WORKFLOW |
| 4 | **Consultation** | `ClipboardList` | `/questionnaire` | WORKFLOW |
| 5 | **Clients** | `Users` | `/clients` | CLIENTS |
| 6 | **Library** | `BookOpen` | `/library` | KNOWLEDGE |
| 7 | **Analyze** | `Camera` | `/analyze` | INTELLIGENCE |
| 8 | **History** | `History` | `/history` | INTELLIGENCE |
| 9 | **Gallery** | `ImageIcon` | `/gallery` | KNOWLEDGE |
| 10 | **Community** | `MessageCircle` | `/community` | COMMUNITY |
| 11 | **Inventory** | `Package` | `/dashboard/inventory` | BUSINESS |
| 12 | **Pricing Rules** | `DollarSign` | `/dashboard/pricing` | BUSINESS |
| 13 | **Certification** | `Award` | `/certification` | BUSINESS |
| 14 | **Settings** | `Settings` | `/settings` | ACCOUNT |
| — | **Subscription** | `CreditCard` | `/subscription` | — |
| — | **Logout** | `LogOut` | Auth logout | — |

**Drawer UI Specs:**
- **Width:** 82% of screen width (max 320px)
- **Presentation:** Slide-in from left with animated translateX
- **Background:** `#0F0F1A` with right border `1px solid rgba(255,255,255,0.06)`
- **Shadow:** 4px right offset, 30% opacity, 12px radius
- **Backdrop:** 50% black overlay, tap-to-dismiss
- **Header:** ColorGenius logo badge + "ColorGenius" title, border-bottom divider
- **Sections:** Grouped with uppercase 10px `#71717A` labels
- **Row height:** 44px, 12px horizontal padding
- **Row active:** Background `#161620` on press
- **Gesture:** Swipe from left edge to open, tap backdrop or swipe left to close

**User Identity Block (bottom of drawer, mirrors web sidebar footer):**
```
┌──────────────────────────────────┐
│  SALON NAME                      │  ← 10px uppercase, #71717A
│  🟢  Connected                   │  ← 12px, #A1A1AA
├──────────────────────────────────┤
│  💳  Subscription                │  ← CreditCard icon, #A1A1AA
├──────────────────────────────────┤
│  🚪  Logout                      │  ← LogOut icon, red #EF4444
└──────────────────────────────────┘
```
- Salon name fetched from `/api/auth/me` (same as web)
- Connection dot: `#10B981` (green) when authenticated, `#EF4444` (red) when signed out
- "Subscription" row links to `/subscription`
- "Logout" triggers `POST /api/auth/logout` + client state purge

---

## 4. Screen Hierarchy & Route Mapping

All 17 screens are registered in a single StackNavigator. Every screen gets the same custom header with the hamburger icon.

```
App (StackNavigator)
│
├── Dashboard (/dashboard) — default initial screen
├── New Service (/service)
├── Formulate (/formulate)
├── Consultation (/questionnaire)
├── Clients (/clients)
├── Library (/library)
├── Analyze (/analyze)
├── History (/history)
├── Gallery (/gallery)
├── Community (/community)
├── Inventory (/dashboard/inventory)
├── Pricing Rules (/dashboard/pricing)
├── Certification (/certification)
├── Settings (/settings)
├── Subscription (/subscription)
└── Camera (/analyze/camera — used by Analyze flow)
```

**Navigation State Rule:** When navigating between screens via the drawer, the stack pushes the new screen. Standard stack back behavior applies (header back button, iOS edge swipe, Android back button).

---

## 5. New Service Flow

Tapping **"New Service"** in the drawer navigates directly to the Service screen. No action sheet — the web app has a dedicated `/service` route, and so does mobile.

If the user wants Consultation, they tap Consultation directly in the drawer. The drawer is always one tap away, so there's no need for a secondary action sheet.

---

## 6. Analyze Flow (Camera → Photo → AI Analysis)

The **"Analyze"** feature uses the `Camera` icon. It is **never** labeled "Camera" — the label is always **"Analyze"**. The camera is merely the input modality.

**Flow Architecture:**

```
AnalyzeScreen (stack screen)
│
├── AnalyzeLanding (/analyze)
│   ├── Hero: "Analyze Hair Condition"
│   ├── Subtitle: "Take or upload a photo for AI assessment"
│   ├── Primary CTA: "Take Photo" → CameraScreen
│   ├── Secondary CTA: "Upload from Gallery" → ImagePicker → Review
│   └── Recent Analyses list (scrollable)
│
├── CameraScreen (/analyze/camera)
│   ├── Full-screen camera preview
│   ├── Overlay: Hair framing guide (oval mask, 70% opacity)
│   ├── Controls: Capture button (80px, gradient ring), flash toggle, flip camera
│   └── Haptic: `impactMedium` on capture shutter
│
└── (Review → Loading → Result — see previous spec)
```

---

## 7. Mobile-Specific Gestures & Interactions

| Gesture | Screen / Component | Action |
|---------|-------------------|--------|
| **Tap hamburger** | Any screen | Open sidebar drawer |
| **Tap backdrop** | Drawer open | Close drawer |
| **Swipe left** | Drawer open | Close drawer |
| **Pull-to-refresh** | Dashboard, Clients, History, Gallery, Community | `onRefresh` → re-fetch API data |
| **Swipe left** | Client list row | Reveal "Quick Service" action |
| **Swipe right** | Client list row | Reveal "Message" action |
| **Long-press** | Dashboard service card | Haptic → context menu: "Duplicate", "Delete", "Share" |
| **Pinch** | Gallery photo, Analysis review | Zoom to inspect detail |
| **Edge swipe (iOS)** | Any stack screen | Navigate back |

---

## 8. Deep Linking & Universal Links

Mobile must handle the same URLs as web for seamless cross-platform flow:

| URL Path | Mobile Screen | Notes |
|----------|-------------|-------|
| `colorgenius.app/dashboard` | Dashboard | Default screen |
| `colorgenius.app/service` | New Service | |
| `colorgenius.app/formulate` | Formulate | |
| `colorgenius.app/questionnaire` | Consultation | |
| `colorgenius.app/clients` | Clients | |
| `colorgenius.app/library` | Library | |
| `colorgenius.app/analyze` | Analyze | |
| `colorgenius.app/history` | History | |
| `colorgenius.app/gallery` | Gallery | |
| `colorgenius.app/community` | Community | |
| `colorgenius.app/dashboard/inventory` | Inventory | |
| `colorgenius.app/dashboard/pricing` | Pricing Rules | |
| `colorgenius.app/certification` | Certification | |
| `colorgenius.app/settings` | Settings | |
| `colorgenius.app/subscription` | Subscription | |

**Implementation:** `react-native-deep-linking` or Expo `Linking` API. Parse incoming URL, navigate to correct stack + screen, pass query params as route params.

---

## 9. State & Authentication

- **Auth check:** App launch → `fetch('/api/auth/me')` (same endpoint as web)
- **Signed out:** Show auth gate (login/register). No drawer.
- **Signed in:** Render full UI with hamburger header + drawer. Salon name + connection dot from auth response.
- **Token refresh:** Standard JWT refresh on 401. Logout on refresh failure → auth gate.
- **Logout:** Clear SecureStore/Keychain tokens, reset navigation to AuthGate, call `POST /api/auth/logout`.

---

## 10. File Structure

```
mobile/
├── App.tsx                          ← Root stack navigator, custom header, drawer state
├── src/
│   ├── components/
│   │   └── SidebarDrawer.tsx        ← Full sidebar slide-in (14 nav items + subscription + logout)
│   └── screens/
│       ├── DashboardScreen.tsx
│       ├── ServiceScreen.tsx
│       ├── FormulateScreen.tsx
│       ├── QuestionnaireScreen.tsx
│       ├── ClientsScreen.tsx
│       ├── LibraryScreen.tsx
│       ├── AnalyzeScreen.tsx
│       ├── HistoryScreen.tsx
│       ├── GalleryScreen.tsx
│       ├── CommunityScreen.tsx
│       ├── InventoryScreen.tsx
│       ├── PricingScreen.tsx
│       ├── CertificationScreen.tsx
│       ├── SettingsScreen.tsx
│       ├── SubscriptionScreen.tsx
│       └── CameraScreen.tsx
```

---

## 11. Implementation Checklist

- [x] Install `lucide-react-native` (verify all 15 icons exist)
- [x] Install `@react-navigation/stack`
- [x] Create `SidebarDrawer` component (full sidebar slide-in, 14 items + subscription + logout)
- [x] Rewrite `App.tsx` — single StackNavigator, no bottom tabs, custom header with hamburger
- [x] Remove `MoreDrawer.tsx` — replaced by SidebarDrawer
- [x] Remove `ServiceActionSheet.tsx` — New Service is direct nav item now
- [x] Wire all 17 screens to StackNavigator with shared custom header
- [x] Add deep linking configuration in `app.json` / `AndroidManifest.xml`
- [x] Implement auth gate (conditional rendering)
- [x] Add user identity block to drawer footer
- [x] Add pull-to-refresh on all list screens
- [x] Add swipe actions on Client list rows
- [x] QA: Verify icon names match web exactly (especially `FlaskConical`, `ImageIcon`)
- [x] QA: Verify "Analyze" label is never "Camera" anywhere in UI

---

## Appendix A: Icon Name Cross-Reference (Web → Mobile)

| Web Label | Web Icon Import | Mobile Icon Import (lucide-react-native) |
|-----------|-----------------|-------------------------------------------|
| Dashboard | `LayoutDashboard` | `LayoutDashboard` |
| New Service | `CirclePlus` | `CirclePlus` |
| Formulate | `FlaskConical` | `FlaskConical` |
| Consultation | `ClipboardList` | `ClipboardList` |
| Clients | `Users` | `Users` |
| Library | `BookOpen` | `BookOpen` |
| Analyze | `Camera` | `Camera` |
| History | `History` | `History` |
| Gallery | `ImageIcon` | `ImageIcon` |
| Community | `MessageCircle` | `MessageCircle` |
| Inventory | `Package` | `Package` |
| Pricing Rules | `DollarSign` | `DollarSign` |
| Certification | `Award` | `Award` |
| Settings | `Settings` | `Settings` |
| Subscription | `CreditCard` | `CreditCard` |
| Logout (mobile-only) | — | `LogOut` |
| Hamburger (mobile-only) | — | `Menu` |

---

## Appendix B: Route Path Cross-Reference (Web → Mobile)

| Web Path | Mobile Route Name | Notes |
|----------|-------------------|-------|
| `/dashboard` | `Dashboard` | Default initial screen |
| `/service` | `NewService` | Direct nav item |
| `/formulate` | `Formulate` | |
| `/questionnaire` | `Consultation` | |
| `/clients` | `Clients` | |
| `/library` | `Library` | |
| `/analyze` | `Analyze` | |
| `/history` | `History` | |
| `/gallery` | `Gallery` | |
| `/community` | `Community` | |
| `/dashboard/inventory` | `Inventory` | |
| `/dashboard/pricing` | `Pricing` | |
| `/certification` | `Certification` | |
| `/settings` | `Settings` | |
| `/subscription` | `Subscription` | |
| `/analyze/camera` | `Camera` | Camera flow screen |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-21 | Hamburger menu replaces bottom tabs | Bottom tabs can't hold 14 items. Web app already uses hamburger + sidebar. Mobile should match exactly. |
| 2026-05-21 | Remove "More" drawer pattern | With hamburger menu, there's no need for a secondary "More" drawer. All items are in the sidebar. |
| 2026-05-21 | Remove ServiceActionSheet | New Service is just a nav item in the sidebar now. Users tap it directly. Consultation is also directly accessible. |
| 2026-05-21 | All 17 screens in single StackNavigator | Cleanest architecture. Every screen gets the same header. No nested tab/stack complexity. |
| 2026-05-21 | Preserve exact web nav order | Source of truth is `nav-sidebar.tsx`. Groups: WORKFLOW, CLIENTS, KNOWLEDGE, INTELLIGENCE, COMMUNITY, BUSINESS, ACCOUNT. |

---

**Next Step:** Build out screen content and wire up API calls. Navigation architecture is complete.
