# Claude Handoff — iOS App Backend Integration

## Context
Claude just finished fixing 6 bugs in the iOS app (BLE decoding, JSON syntax, Buffer polyfill, etc.). Next task: wire up the backend so the app actually works.

## Architecture

```
iPad App (React Native/Expo)
    ├── BLE Scale (local) ✅ DONE
    ├── Camera (local)     ✅ DONE  
    ├── Supabase REST API (shade library, user data, formulas)
    └── Vercel Backend (formulation engine, analysis)
```

- **Supabase:** https://beuiayrnzbgvvqfgsenc.supabase.co/rest/v1
- **Backend:** https://colorgenius.co (Vercel)
  - POST `/api/formulate` — shade matching + formula generation
  - POST `/api/analyze` — photo analysis

## Steps

### 1. Install dependencies
```bash
cd /home/jason/.openclaw/workspaces/colorgenius/ios-app
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
```

### 2. Create `lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://beuiayrnzbgvvqfgsenc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldWlheXJuemJndnZxZmdzZW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTExOTAsImV4cCI6MjA5MzQyNzE5MH0.qzW29jlsPmd4SCZ_b_GIAXNeyzHu3n3wovY2ihE91SU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});
```

### 3. Create `lib/shades.ts`
```typescript
import { supabase } from './supabase';

export async function loadShades(filters?: { level?: number; tone?: string; search?: string }) {
  let query = supabase
    .from('shades')
    .select('*, product_lines(name, slug, color_type, mixing_ratio, developer_options, brands(name, slug))')
    .eq('is_active', true)
    .order('level').order('shade_code').limit(600);

  if (filters?.level) query = query.eq('level', filters.level);
  if (filters?.tone) query = query.ilike('primary_tone', `${filters.tone}*`);
  if (filters?.search) query = query.or(`shade_name.ilike.*${filters.search}*,shade_code.ilike.*${filters.search}*`);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
```

### 4. Create `lib/api.ts`
```typescript
const API_BASE = 'https://colorgenius.co';

export async function formulate(input: {
  currentLevel: number; currentTone: string;
  targetLevel: number; targetTone: string;
  condition: { type: string; porosity: string; grayPercent: number; highlights: boolean; highlightedPercent?: number };
  brandPreference?: string; linePreference?: string;
}) {
  const res = await fetch(`${API_BASE}/api/formulate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Formulation failed'); }
  return res.json();
}

export async function analyzePhoto(photoUri: string) {
  const formData = new FormData();
  formData.append('photo', { uri: photoUri, type: 'image/jpeg', name: 'photo.jpg' } as any);
  const res = await fetch(`${API_BASE}/api/analyze`, { method: 'POST', body: formData });
  return res.json();
}
```

### 5. Create `lib/storage.ts`
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const FORMULAS_KEY = '@colorgenius/formulas';

export async function saveFormula(formula: any) {
  const existing = await getFormulas();
  existing.push({ ...formula, savedAt: Date.now() });
  await AsyncStorage.setItem(FORMULAS_KEY, JSON.stringify(existing));
}

export async function getFormulas() {
  const data = await AsyncStorage.getItem(FORMULAS_KEY);
  return data ? JSON.parse(data) : [];
}
```

### 6. Update App.tsx
- Load shades on app start from Supabase
- Wire formulation flow to API
- Add formula save/load with AsyncStorage
- Keep BLE scale code as-is (working)

## Reference Files
- `web-reference-dist/api.js` — existing web API client pattern
- `dashboard/app/api/formulate/route.ts` — formulation endpoint
- `dashboard/lib/formulation.ts` — formulation engine logic

## Do NOT
- Use `Buffer` (not in React Native)
- Install `react-native-gesture-handler` (not needed)
- Bundle `web-reference-dist/` into the app
- Change BLE scale code (already fixed)
- Hardcode keys for production (use EAS secrets later)

## After
- `npx expo prebuild` to generate ios/ Xcode project
- Build with `npx eas build --platform ios --profile preview` or open in Xcode
- Test: shades load, formulate works, scale connects, formulas persist
