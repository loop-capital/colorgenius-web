import { config } from '../config.js';

const ENGINE_URL = config.pythonEngine.url;

async function engineRequest<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const url = `${ENGINE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Engine request failed: ${response.status} ${errorText}`);
    }

    // Python engine returns raw Pydantic responses (no {success, data} wrapper)
    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to connect to Python engine: ${error.message}`);
    }
    throw new Error('Failed to connect to Python engine: Unknown error');
  }
}

export interface ColorAnalysisResult {
  level: number;
  tone: string;
  rgb: [number, number, number];
  confidence: number;
}

export async function analyzeColor(rgb: [number, number, number]): Promise<ColorAnalysisResult> {
  // Python engine expects: { rgb: { r: int, g: int, b: int }, source: string }
  const raw = await engineRequest<{
    level: number;
    level_confidence: number;
    primary_tone: string;
    undertone: string;
    rgb: { r: number; g: number; b: number };
    lab: { l: number; a: number; b: number };
  }>('/analyze/color', {
    rgb: { r: rgb[0], g: rgb[1], b: rgb[2] },
    source: 'extracted',
  });

  return {
    level: raw.level,
    tone: raw.primary_tone,
    rgb: [raw.rgb.r, raw.rgb.g, raw.rgb.b],
    confidence: raw.level_confidence,
  };
}

export interface DeveloperRecommendation {
  volume: number;
  time: number;
  rationale: string[];
  warnings: string[];
}

export async function formulateDeveloper(
  levelsToLift: number,
  porosity?: string,
  hairCondition?: number,
  grayPercentage?: number,
  previousColor?: boolean
): Promise<DeveloperRecommendation> {
  const raw = await engineRequest<{
    recommended_volume: number;
    processing_time_minutes: number;
    rationale: string[];
    warnings: string[];
  }>('/formulate/developer', {
    levels_to_lift: levelsToLift,
    porosity: porosity || 'normal',
    hair_condition: hairCondition ?? 0.3,
    gray_percentage: grayPercentage ?? 0,
    previous_color: previousColor ?? false,
  });

  return {
    volume: raw.recommended_volume,
    time: raw.processing_time_minutes,
    rationale: raw.rationale,
    warnings: raw.warnings,
  };
}

export interface LevelChangeResult {
  levelsToLift: number;
  actionType: string;
  warnings: string[];
}

export async function calculateLevelChange(
  currentLevel: number,
  targetLevel: number
): Promise<LevelChangeResult> {
  const raw = await engineRequest<{
    levels_to_lift: number;
    levels_to_deposit: number;
    action_type: string;
    underlying_pigment: Record<string, unknown>;
    warnings: string[];
  }>('/formulate/level', {
    current_level: currentLevel,
    target_level: targetLevel,
  });

  return {
    levelsToLift: raw.levels_to_lift,
    actionType: raw.action_type,
    warnings: raw.warnings,
  };
}

export interface DeltaEResult {
  delta_e: number;
  match: boolean;
  description: string;
}

export async function calculateDeltaE(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): Promise<DeltaEResult> {
  const raw = await engineRequest<{
    delta_e: number;
    interpretation: string;
    perceptible: boolean;
  }>('/color/delta-e', {
    color1: { r: rgb1[0], g: rgb1[1], b: rgb1[2] },
    color2: { r: rgb2[0], g: rgb2[1], b: rgb2[2] },
  });

  return {
    delta_e: raw.delta_e,
    match: raw.delta_e < 2.0,
    description: raw.interpretation,
  };
}

export async function checkEngineHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ENGINE_URL}/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}