import { supabase, Shade, ShadeRow } from '../lib/supabase';

// ─── Module-level cache ───────────────────────────────────────────────────────
// Shades are a read-only product catalog — load once, filter client-side.
// An in-flight promise is stored so concurrent calls don't race.
let _cache: Shade[] | null = null;
let _inflight: Promise<Shade[]> | null = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rgbToHex(rgb: number[]): string {
  if (!rgb || rgb.length < 3) return '#888888';
  return (
    '#' +
    rgb
      .map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0'))
      .join('')
  );
}

function toShade(row: ShadeRow): Shade {
  return {
    id: row.id,
    brand: row.product_lines?.brands?.name ?? 'Unknown',
    line: row.product_lines?.name ?? '',
    lineSlug: row.product_lines?.slug ?? '',
    name: `${row.shade_code} ${row.shade_name}`,
    code: row.shade_code,
    level: row.level,
    tone: (row.primary_tone ?? '').trim(),
    hex: rgbToHex(row.rgb_representation ?? [128, 128, 128]),
    mixingRatio: row.product_lines?.mixing_ratio ?? '',
    developers: row.product_lines?.developer_options ?? [],
  };
}

// ─── Network fetch (internal) ─────────────────────────────────────────────────

async function fetchAllShades(): Promise<Shade[]> {
  const { data, error } = await supabase
    .from('shades')
    .select(
      '*, product_lines(name, slug, color_type, mixing_ratio, developer_options, brands(name, slug))'
    )
    .eq('is_active', true)
    .order('level', { ascending: true })
    .order('shade_code', { ascending: true })
    .limit(600);

  if (error) throw error;
  return ((data as ShadeRow[]) ?? []).map(toShade);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Load all shades from Supabase once, then serve from memory.
 * Safe to call concurrently — subsequent calls during the first fetch
 * receive the same promise instead of issuing a second request.
 */
export async function preloadShades(): Promise<Shade[]> {
  if (_cache) return _cache;
  if (_inflight) return _inflight;

  _inflight = fetchAllShades()
    .then(shades => {
      _cache = shades;
      return shades;
    })
    .finally(() => {
      _inflight = null;
    });

  return _inflight;
}

/**
 * Force a fresh fetch from Supabase and replace the cache.
 * Call this when the user explicitly requests a refresh.
 */
export async function refreshShades(): Promise<Shade[]> {
  _cache = null;
  return preloadShades();
}

export interface ShadeFilters {
  level?: number;
  tone?: string;
  search?: string;
}

/**
 * Filter a pre-loaded shade array entirely in memory.
 * All matching is case-insensitive.
 */
export function filterShades(shades: Shade[], filters: ShadeFilters): Shade[] {
  let result = shades;

  if (filters.level !== undefined) {
    result = result.filter(s => s.level === filters.level);
  }

  if (filters.tone) {
    const t = filters.tone.toLowerCase();
    result = result.filter(s => s.tone.toLowerCase().startsWith(t));
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    );
  }

  return result;
}

/**
 * Server-side search — use only when the cache is unavailable and
 * the caller needs free-text results without a full preload.
 */
export async function searchShadesRemote(query: string): Promise<Shade[]> {
  if (!query || query.length < 2) return [];
  const { data, error } = await supabase
    .from('shades')
    .select(
      '*, product_lines(name, slug, color_type, mixing_ratio, developer_options, brands(name, slug))'
    )
    .eq('is_active', true)
    .or(`shade_name.ilike.*${query}*,shade_code.ilike.*${query}*`)
    .order('level', { ascending: true })
    .order('shade_code', { ascending: true })
    .limit(100);

  if (error) throw error;
  return ((data as ShadeRow[]) ?? []).map(toShade);
}
