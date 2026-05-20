# COLORgenius Mobile — Claude Fix Document v2

> **Date:** 2026-05-19, 9:02 PM
> **Status:** 3 bugs still broken after 6+ fix attempts. Please fix directly.
> **Branch:** `main`, latest commit: `ace709c`
> **Directory:** `/home/jason/.openclaw/workspaces/colorgenius/mobile/`

---

## Bug 1: Photo Upload Fails — "Invalid header character in authorization"

**What the user sees:** Tap "Upload & Analyze" → error alert: `Upload Failed: Invalid header character in ["authorization"]`

**Root cause:** The `uploadPhotoMultipart()` function in `src/api/client.ts` (line ~268) sets an `Authorization` header with a token value. Even after sanitization, React Native's iOS `fetch()` implementation rejects the header value. The token may contain characters that survive the regex, or the `FormData` + custom headers combination triggers a conflict.

**Current code (lines 275-282):**
```typescript
const headers: Record<string, string> = {};
if (token) {
  const cleanToken = token.replace(/[^A-Za-z0-9._~+/=-]/g, '');
  if (cleanToken) {
    headers['Authorization'] = 'Bearer ' + cleanToken;
  }
}
```

**THE FIX:** The `/api/photos/upload` endpoint has NO AUTH CHECK. It accepts any request. Simply **remove the Authorization header entirely** from the multipart upload function. Also add a safety check — never set a header if the token is null/undefined.

**Expected fix:**
```typescript
// No auth needed for photo upload — endpoint is public
const response = await fetch(`${API_BASE}/photos/upload`, {
  method: 'POST',
  body: formData,
});
```

Also fix the `apiRequest()` function (line ~115) — it has the same token sanitization that may fail. Same fix: strip aggressively, guard against null.

---

## Bug 2: Settings Screen Buttons Don't Respond to Taps

**What the user sees:** Tapping switches in Settings does nothing — the toggle doesn't move.

**File:** `src/screens/SettingsScreen.tsx`

**Root cause:** The `SettingRow` component wraps everything in a `TouchableOpacity` (line ~40). When a `Switch` is passed as the `right` prop, the parent `TouchableOpacity` intercepts the tap event before it reaches the `Switch`. The previous fix attempted `pointerEvents="box-none"` but it's still not working correctly.

**THE FIX:** Don't use `TouchableOpacity` at all for rows that contain interactive children (Switch). Use a plain `View` with `pointerEvents="box-only"` (not "box-none") — this lets touches pass through to children but the row itself doesn't consume them. OR better: remove the touchable wrapper entirely and let each interactive element handle its own taps.

**Expected fix for SettingRow:**
```typescript
function SettingRow({ icon, title, subtitle, onPress, right, danger }: SettingRowProps) {
  const hasInteractiveRight = !!right;
  
  // Rows with switches: plain View, no touch wrapper
  if (hasInteractiveRight) {
    return (
      <View style={styles.settingRow} pointerEvents="box-only">
        <View style={styles.settingIcon}>{icon}</View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {right}
      </View>
    );
  }

  // Navigable rows: TouchableOpacity
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <ChevronRight size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );
}
```

**Also verify:** The `Switch` components use `onValueChange` (not `onPress`). The handlers (`handleNotificationsToggle`, `handleDarkModeToggle`, `handleAutoSyncToggle`) should be correctly wired.

---

## Bug 3: Bottom Tab Navigation — Must Tap at Very Bottom of Icon

**What the user sees:** Tapping the middle/center of a tab icon does nothing. Must tap at the very bottom edge.

**File:** `App.tsx`

**Root cause:** The current `tabBarButton` wrapper adds `hitSlop` but the issue is the `Pressable` is being laid out with the same small bounds as the default tab button. `hitSlop` only expands the touch area in pixels from the existing bounds — if the bounds themselves are tiny, it's still small.

**THE FIX:** Instead of `hitSlop`, wrap the entire tab button in a larger `Pressable` with explicit `minWidth` and `minHeight` styles. OR use the simpler approach: just set `tabBarItemStyle` with much larger padding and don't use a custom `tabBarButton` at all. The custom tabBarButton may be overriding React Navigation's built-in sizing.

**Current code in App.tsx (around line 48):**
```typescript
tabBarButton: (props: any) => (
  <Pressable
    {...props}
    hitSlop={{ top: 10, bottom: 20, left: 10, right: 10 }}
    android_ripple={{ borderless: true, radius: 40 }}
  />
),
```

**Expected fix — remove the custom tabBarButton entirely and just use larger padding:**
```typescript
tabBarItemStyle: {
  paddingVertical: 12,
  minHeight: 64,
},
tabBarStyle: {
  backgroundColor: '#0A0A0F',
  borderTopColor: '#1A1A2E',
  borderTopWidth: 1,
  paddingBottom: 12,
  paddingTop: 8,
  height: 80,
},
```

OR if keeping the custom tabBarButton, add explicit style to make the Pressable fill the full tab area:
```typescript
tabBarButton: (props: any) => (
  <Pressable
    {...props}
    style={[props.style, { minWidth: 60, minHeight: 50, justifyContent: 'center', alignItems: 'center' }]}
    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
  />
),
```

---

## Project Context

- **Repo:** `/home/jason/.openclaw/workspaces/colorgenius/`
- **Mobile app:** `/home/jason/.openclaw/workspaces/colorgenius/mobile/`
- **Web API:** `https://colorgenius.co/api` (Next.js, deployed on Vercel)
- **Photo upload endpoint:** `POST /api/photos/upload` — multipart form data, NO AUTH REQUIRED
- **Middleware:** Recently fixed to NOT redirect `/api/*` routes to `/login`
- **Build:** `cd mobile/ && EXPO_TOKEN="$(cat /tmp/expo_token.txt)" npx eas-cli@latest build --platform ios --profile production --non-interactive`
- **Submit:** `cd mobile/ && EXPO_TOKEN="$(cat /tmp/expo_token.txt)" npx eas-cli@latest submit --platform ios --id <BUILD_ID> --non-interactive`

## Files to Modify

1. `mobile/src/api/client.ts` — Bug 1 (upload auth header)
2. `mobile/src/screens/SettingsScreen.tsx` — Bug 2 (settings touch handling)
3. `mobile/App.tsx` — Bug 3 (tab bar touch targets)

After fixing, **commit only**. Do NOT build or submit.
