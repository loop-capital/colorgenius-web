const API_BASE = 'https://colorgenius.co';

export type ToneFamily =
  | 'warm' | 'cool' | 'neutral' | 'ash' | 'golden'
  | 'copper' | 'red' | 'violet' | 'pearl' | 'beige'
  | 'mahogany' | 'chocolate';

export type ConditionType =
  | 'virgin' | 'previously_colored' | 'damaged' | 'highly_damaged';

export type Porosity = 'low' | 'normal' | 'high';

export interface HairInput {
  currentLevel: number;
  currentTone: ToneFamily;
  targetLevel: number;
  targetTone: ToneFamily;
  condition: {
    type: ConditionType;
    porosity: Porosity;
    grayPercent: number;
    highlights: boolean;
    highlightedPercent: number;
  };
  brandPreference?: string;
  linePreference?: string;
}

// /api/analyze response shape
export interface AnalyzeResult {
  hairState: {
    currentLevel: number;
    currentTone: string;
    targetLevel: number;
    targetTone: string;
  };
  formula: {
    brand: string;
    line: string;
    steps: Array<{
      step: number;
      product: string;   // shadeName string
      shadeCode: string;
      grams: number;
      role: 'primary' | 'secondary' | 'additive' | 'corrective';
      notes?: string;
    }>;
    developer: { volume: number; ml: number };
    mixingRatio: string;
    totalFormulaMl: number;
    processingTime: number;
    application: string;
    coverage: string;
  };
  instructions: {
    notes: string[];
    warnings: string[];
    technique: string;
  };
}

// /api/formulate response shape — steps contain full Product objects
export interface FormulateProduct {
  id?: string;
  brand: string;
  line: string;
  shadeCode: string;
  shadeName: string;
  level: number;
  tone: ToneFamily;
  mixingRatio: string;
}

export interface FormulateResult {
  success: boolean;
  steps: Array<{
    product: FormulateProduct;
    grams: number;
    role: 'primary' | 'secondary' | 'additive' | 'corrective';
    notes?: string;
  }>;
  developerVolume: number;
  developerMl: number;
  totalMl: number;
  processingTime: number;
  application: string;
  coverage: string;
  notes: string[];
  warnings: string[];
  brand: string;
  line: string;
}

async function post<T>(path: string, body: HairInput): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(
      typeof json.error === 'string' ? json.error : `HTTP ${res.status}`
    );
  }
  return json.data as T;
}

export async function analyzeHair(input: HairInput): Promise<AnalyzeResult> {
  return post<AnalyzeResult>('/api/analyze', input);
}

export async function formulateHair(input: HairInput): Promise<FormulateResult> {
  return post<FormulateResult>('/api/formulate', input);
}

// Approximate swatch hex from hair level (1=black → 10=light blonde)
export function levelToHex(level: number): string {
  const palette: Record<number, string> = {
    1: '#1A1A1A', 2: '#2D1B0E', 3: '#3B2010', 4: '#4A2B12',
    5: '#6B3A1F', 6: '#8B5E3C', 7: '#A07B52', 8: '#C4A882',
    9: '#D4C0A0', 10: '#E8D5B0',
  };
  return palette[Math.max(1, Math.min(10, level))] ?? '#888888';
}

export const TONES: Array<{ value: ToneFamily; label: string; color: string }> = [
  { value: 'neutral',   label: 'Natural',   color: '#8B7355' },
  { value: 'warm',      label: 'Warm',      color: '#C8843B' },
  { value: 'ash',       label: 'Ash',       color: '#9E9E9E' },
  { value: 'golden',    label: 'Golden',    color: '#D4A017' },
  { value: 'copper',    label: 'Copper',    color: '#B87333' },
  { value: 'red',       label: 'Red',       color: '#C0392B' },
  { value: 'violet',    label: 'Violet',    color: '#8E44AD' },
  { value: 'cool',      label: 'Cool',      color: '#6B8E9F' },
  { value: 'pearl',     label: 'Pearl',     color: '#C8B8A8' },
  { value: 'beige',     label: 'Beige',     color: '#C5A882' },
  { value: 'mahogany',  label: 'Mahogany',  color: '#7D2935' },
  { value: 'chocolate', label: 'Choc',      color: '#5C3317' },
];
