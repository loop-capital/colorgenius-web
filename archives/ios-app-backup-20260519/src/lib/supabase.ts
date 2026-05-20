import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://beuiayrnzbgvvqfgsenc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldWlheXJuemJndnZxZmdzZW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTExOTAsImV4cCI6MjA5MzQyNzE5MH0.qzW29jlsPmd4SCZ_b_GIAXNeyzHu3n3wovY2ihE91SU';

// No auth session storage needed until user accounts are added
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// Raw Supabase row shape returned by the shades query
export interface ShadeRow {
  id: string;
  shade_code: string;
  shade_name: string;
  level: number;
  primary_tone: string | null;
  rgb_representation: number[] | null;
  is_active: boolean;
  product_lines: {
    name: string;
    slug: string;
    color_type: string | null;
    mixing_ratio: string | null;
    developer_options: number[] | null;
    brands: { name: string; slug: string } | null;
  } | null;
}

// Normalized type used throughout the app (mirrors api.js output shape)
export interface Shade {
  id: string;
  brand: string;
  line: string;
  lineSlug: string;
  name: string;
  code: string;
  level: number;
  tone: string;
  hex: string;
  mixingRatio: string;
  developers: number[];
}
