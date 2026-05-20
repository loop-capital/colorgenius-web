import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FormulaComponent } from '../types';

const KEYS = {
  SESSION: '@colorgenius/session',
  HISTORY: '@colorgenius/history',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SavedFormula {
  id: string;
  name: string;
  savedAt: number;           // unix ms
  components: FormulaComponent[];
}

// ─── Session — the active in-progress formula ─────────────────────────────────
// Auto-saved on every change and restored on app launch.

export async function saveSession(components: FormulaComponent[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.SESSION, JSON.stringify(components));
}

export async function loadSession(): Promise<FormulaComponent[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SESSION);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FormulaComponent[]) : [];
  } catch {
    return [];
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.SESSION);
}

// ─── History — named, saved formulas ─────────────────────────────────────────
// Capped at 100 entries; newest first.

export async function loadHistory(): Promise<SavedFormula[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.HISTORY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedFormula[]) : [];
  } catch {
    return [];
  }
}

export async function saveToHistory(
  name: string,
  components: FormulaComponent[]
): Promise<SavedFormula> {
  const existing = await loadHistory();
  const entry: SavedFormula = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    savedAt: Date.now(),
    components,
  };
  const updated = [entry, ...existing].slice(0, 100);
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
  return entry;
}

export async function deleteFromHistory(id: string): Promise<void> {
  const existing = await loadHistory();
  await AsyncStorage.setItem(
    KEYS.HISTORY,
    JSON.stringify(existing.filter(f => f.id !== id))
  );
}

// ─── Future Supabase sync hook ────────────────────────────────────────────────
// When auth is added, call these after the local writes above to sync upstream.
// Signature intentionally mirrors the local functions so the call sites don't change.
//
// export async function syncSessionToSupabase(userId: string, components: FormulaComponent[]) { ... }
// export async function syncHistoryEntryToSupabase(userId: string, entry: SavedFormula) { ... }
