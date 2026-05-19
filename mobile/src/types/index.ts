// ============================================================
// COLORgenius Mobile — TypeScript Types
// Matching the web API at colorgenius.co
// ============================================================

// --- Hair Levels & Tones ---
export const HAIR_LEVEL_NAMES: Record<number, string> = {
  1: 'Black',
  2: 'Very Dark Brown',
  3: 'Dark Brown',
  4: 'Medium Brown',
  5: 'Light Brown',
  6: 'Dark Blonde',
  7: 'Medium Blonde',
  8: 'Light Blonde',
  9: 'Very Light Blonde',
  10: 'Platinum',
};

export const TONES = [
  'neutral', 'warm', 'cool', 'ash', 'golden', 'copper',
  'red', 'violet', 'pearl', 'beige', 'mahogany', 'chocolate',
] as const;

export type Tone = typeof TONES[number];

export const HAIR_CONDITION_TYPES = [
  'virgin', 'previously_colored', 'damaged', 'highly_damaged',
] as const;

export type HairConditionType = typeof HAIR_CONDITION_TYPES[number];

export const POROSITY_LEVELS = ['low', 'normal', 'high'] as const;
export type Porosity = typeof POROSITY_LEVELS[number];

// --- Formulation Input ---
export interface HairCondition {
  type: HairConditionType;
  porosity: Porosity;
  grayPercent: number;   // 0–100
  highlights: boolean;
}

export interface FormulationInput {
  currentLevel: number;      // 1–10
  currentTone: Tone;
  targetLevel: number;       // 1–10
  targetTone: Tone;
  condition: HairCondition;
  brandPreference?: string;
  linePreference?: string;
}

// --- Formulation Result ---
export interface Product {
  name: string;
  brand?: string;
  shade?: string;
  ratio?: string;
}

export interface FormulationStep {
  product: Product;
  grams: number;
  role: string;   // e.g. "color", "developer", "additive"
  notes?: string;
}

export interface FormulationResult {
  success: boolean;
  steps: FormulationStep[];
  developerVolume?: string;
  processingTime?: string;
  application?: string;
  coverage?: string;
  notes?: string;
  warnings?: string[];
  brand?: string;
  line?: string;
  confidence?: number;  // 0–1
  error?: string;
}

// --- Client ---
export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  total_visits: number;
  last_visit_at?: string;
}

// --- Formula ---
export interface Formula {
  id: string;
  name?: string;
  developer_vol?: string;
  mixing_ratio?: string;
  processing_time?: string;
  notes?: string;
  product_brand?: string;
  product_line?: string;
  product_shade?: string;
  created_at?: string;
  client_id?: string;
}

// --- Community Formula ---
export interface CommunityFormula {
  id: string;
  name?: string;
  author?: string;
  brand?: string;
  level?: number;
  tone?: string;
  rating?: number;
  votes?: number;
  steps?: FormulationStep[];
  notes?: string;
  created_at?: string;
}

// --- User Profile ---
export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  defaultBrand?: string;
  defaultLine?: string;
  notificationsEnabled?: boolean;
  created_at?: string;
}

// --- API Response Wrappers ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
