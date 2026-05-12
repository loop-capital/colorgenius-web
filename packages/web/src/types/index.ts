export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  preferred_brand: string | null;
  hair_type: string | null;
  formulations: number;
  lastVisit: string | null;
  avgScore: number | null;
  nextAppt: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  analysis_id: string;
  status: string;
  detected_color: {
    level: number;
    tone: string;
    level_name: string;
    tone_name: string;
    confidence: number;
    rgb: number[];
    color_hex: string;
  };
  condition: {
    porosity: string;
    damage_score: number;
    elasticity: string;
    elasticity_percent: number;
    flagged_concerns: string[];
  };
  hair_type: {
    texture: string;
    density: string;
    is_virgin: boolean;
  };
  warnings: Array<{
    type: 'critical' | 'warning' | 'info';
    code: string;
    message: string;
  }>;
  recommendations: {
    pre_treatment: string | null;
    developer_recommendation: string;
    processing_notes: string;
  };
}

export interface FormulationResult {
  formulation_id: string;
  created_at: string;
  confidence_score: number;
  validation: {
    is_valid: boolean;
    warnings: string[];
  };
  primary_formula: {
    action_type: string;
    brand: string;
    product_line: string;
    components: Array<{
      shade: {
        id: string;
        code: string;
        name: string;
        level: number;
        primary_tone: string;
        tone: string;
        is_natural: boolean;
        rgb: [number, number, number];
        undertone: 'warm' | 'neutral' | 'cool';
      };
      amount_oz: number;
      amount_ml: number;
      purpose: 'primary' | 'secondary' | 'gray_coverage' | 'corrector';
    }>;
    developer: {
      volume: number;
      amount_oz: number;
      amount_ml: number;
    };
    mixing_ratio: string;
    total_volume_oz: number;
    total_volume_ml: number;
  };
  processing_instructions: {
    total_time_minutes: number;
    application_sequence: Array<{
      zone: string;
      duration: number;
      description: string;
    }>;
    room_temperature_recommended: boolean;
    heat_optional: boolean;
    notes: string[];
  };
  cost_estimate: {
    total_product_cost: number;
    currency: string;
    breakdown: Array<{
      product: string;
      cost: number;
    }>;
  };
  pricing_suggestion: {
    recommended_price: number;
    price_range: [number, number];
    currency: string;
  };
  recommendations: {
    aftercare: string[];
    maintenance_schedule: string;
    next_appointment: string;
  };
}

// Shade entry type for internal use
export interface ShadeEntry {
  brand: string;
  productLine: string;
  shadeCode: string;
  name: string;
  level: number;
  tone: string;
  toneFamily: string;
  isNatural: boolean;
  isHighLift: boolean;
  isMixingShade: boolean;
  rgb: [number, number, number];
  undertone: 'warm' | 'neutral' | 'cool';
  maxGrayCoverage: number;
  maxLift: number;
  developerDefault: number;
  mixingRatio: string;
  baseProcessingMinutes: number;
}
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Formulation {
  formulation_id: string;
  created_at: string;
  confidence_score: number;
  validation: {
    is_valid: boolean;
    warnings: string[];
  };
  primary_formula: {
    action_type: string;
    brand: string;
    product_line: string;
    components: any[];
    developer: { volume: number; amount_oz: number; amount_ml: number };
    mixing_ratio: string;
    total_volume_oz: number;
    total_volume_ml: number;
  };
  processing_instructions: {
    total_time_minutes: number;
    application_sequence: any[];
    heat_optional: boolean;
    notes: string[];
  };
  cost_estimate: {
    total_product_cost: number;
    breakdown: any[];
  };
  pricing_suggestion: {
    recommended_price: number;
    price_range: [number, number];
  };
  recommendations: {
    aftercare: string[];
    maintenance_schedule: string;
    next_appointment: string;
  };
}
