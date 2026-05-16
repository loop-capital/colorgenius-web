// dashboard/lib/client-profile.ts
// Client hair profile types, validation, and helper functions

export type HairTexture = 'fine' | 'medium' | 'coarse';
export type HairPattern = 'straight' | 'wavy' | 'curly' | 'coily';
export type HairDensity = 'thin' | 'medium' | 'thick';
export type HairPorosity = 'low' | 'normal' | 'high';
export type LastServiceOption =
  | 'this_week'
  | '1-2_weeks'
  | '3-4_weeks'
  | '1-3_months'
  | '3-6_months'
  | '6+_months'
  | 'never';

export interface ChemicalHistorySnapshot {
  boxDye: boolean;
  metallicSalts: boolean;
  henna: boolean;
  keratinTreatment: boolean;
  relaxer: boolean;
  lastService: LastServiceOption;
  hardWater: boolean;
  medicationBuildup: boolean;
  lastServiceType?: string;
  lastServiceDate?: string;
}

export interface SensitivitySnapshot {
  ppdAllergy: boolean;
  ammoniaSensitivity: boolean;
  fragranceSensitivity: boolean;
  isPregnant: boolean;
  isBreastfeeding: boolean;
  activeChemo: boolean;
  other: string[];
}

export interface HairProfile {
  texture: HairTexture | null;
  hairPattern: HairPattern | null;
  density: HairDensity | null;
  porosity: HairPorosity | null;
  naturalLevel: number | null;
  naturalTone: string | null;
  scalpCondition: 'normal' | 'dry' | 'oily' | 'sensitive' | 'irritated' | null;
  chemicalHistory: ChemicalHistorySnapshot | null;
  sensitivities: SensitivitySnapshot | null;
  lastObservedLevel: number | null;
  lastObservedTone: string | null;
  lastObservedCondition: string | null;
  lastServiceDate: string | null;
  lastFormulaId: string | null;
  notes: string;
  updatedAt: string;
  updatedBy: string | null;
}

/* ───── type guards ───── */
function isTexture(v: unknown): v is HairTexture {
  return v === 'fine' || v === 'medium' || v === 'coarse';
}
function isPattern(v: unknown): v is HairPattern {
  return v === 'straight' || v === 'wavy' || v === 'curly' || v === 'coily';
}
function isDensity(v: unknown): v is HairDensity {
  return v === 'thin' || v === 'medium' || v === 'thick';
}
function isPorosity(v: unknown): v is HairPorosity {
  return v === 'low' || v === 'normal' || v === 'high';
}
function isScalp(v: unknown): v is HairProfile['scalpCondition'] {
  return v === 'normal' || v === 'dry' || v === 'oily' || v === 'sensitive' || v === 'irritated' || v === null;
}
function clampLevel(n: number): number {
  return Math.max(1, Math.min(10, Math.round(n)));
}
function isChemicalHistory(v: unknown): v is ChemicalHistorySnapshot {
  return v !== null && typeof v === 'object' && typeof (v as any).boxDye === 'boolean';
}
function isSensitivities(v: unknown): v is SensitivitySnapshot {
  return v !== null && typeof v === 'object' && typeof (v as any).ppdAllergy === 'boolean';
}

/* ───── normalize ───── */
export function normalizeHairProfile(raw: unknown): HairProfile {
  const defaults: HairProfile = {
    texture: null,
    hairPattern: null,
    density: null,
    porosity: 'normal',
    naturalLevel: null,
    naturalTone: null,
    scalpCondition: 'normal',
    chemicalHistory: null,
    sensitivities: null,
    lastObservedLevel: null,
    lastObservedTone: null,
    lastObservedCondition: null,
    lastServiceDate: null,
    lastFormulaId: null,
    notes: '',
    updatedAt: new Date().toISOString(),
    updatedBy: null,
  };

  if (!raw || typeof raw !== 'object') return defaults;
  const r = raw as Record<string, unknown>;

  return {
    texture: isTexture(r.texture) ? r.texture : defaults.texture,
    hairPattern: isPattern(r.hairPattern) ? r.hairPattern : defaults.hairPattern,
    density: isDensity(r.density) ? r.density : defaults.density,
    porosity: isPorosity(r.porosity) ? r.porosity : defaults.porosity,
    naturalLevel: typeof r.naturalLevel === 'number' ? clampLevel(r.naturalLevel) : defaults.naturalLevel,
    naturalTone: typeof r.naturalTone === 'string' ? r.naturalTone : defaults.naturalTone,
    scalpCondition: isScalp(r.scalpCondition) ? r.scalpCondition : defaults.scalpCondition,
    chemicalHistory: isChemicalHistory(r.chemicalHistory) ? r.chemicalHistory : defaults.chemicalHistory,
    sensitivities: isSensitivities(r.sensitivities) ? r.sensitivities : defaults.sensitivities,
    lastObservedLevel: typeof r.lastObservedLevel === 'number' ? clampLevel(r.lastObservedLevel) : defaults.lastObservedLevel,
    lastObservedTone: typeof r.lastObservedTone === 'string' ? r.lastObservedTone : defaults.lastObservedTone,
    lastObservedCondition: typeof r.lastObservedCondition === 'string' ? r.lastObservedCondition : defaults.lastObservedCondition,
    lastServiceDate: typeof r.lastServiceDate === 'string' ? r.lastServiceDate : defaults.lastServiceDate,
    lastFormulaId: typeof r.lastFormulaId === 'string' ? r.lastFormulaId : defaults.lastFormulaId,
    notes: typeof r.notes === 'string' ? r.notes : defaults.notes,
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : defaults.updatedAt,
    updatedBy: typeof r.updatedBy === 'string' ? r.updatedBy : defaults.updatedBy,
  };
}

/* ───── profile ↔ form state mapping ───── */
import type { ChemicalHistory, SensitivityFlags } from './formulation';

export interface FormState {
  clientId?: string;
  texture: HairTexture | '';
  hairPattern: HairPattern | '';
  density: HairDensity | '';
  porosity: HairPorosity | '';
  currentLevel: number;
  currentTone: string;
  targetLevel: number;
  targetTone: string;
  condition: {
    type: 'virgin' | 'previously_colored' | 'damaged' | 'highly_damaged';
    porosity: HairPorosity;
    grayPercent: number;
    highlights: boolean;
  };
  chemicalHistory: ChemicalHistory | null;
  sensitivityFlags: SensitivityFlags | null;
  serviceType: string;
  brandPreference: string;
  linePreference: string;
}

export function profileToFormState(profile: HairProfile): Partial<FormState> {
  const state: Partial<FormState> = {};

  if (profile.texture) state.texture = profile.texture;
  if (profile.hairPattern) state.hairPattern = profile.hairPattern;
  if (profile.density) state.density = profile.density;
  if (profile.porosity) state.porosity = profile.porosity;
  if (profile.naturalLevel) state.currentLevel = profile.naturalLevel;
  if (profile.naturalTone) state.currentTone = profile.naturalTone;

  if (profile.chemicalHistory) {
    state.chemicalHistory = {
      boxDye: profile.chemicalHistory.boxDye,
      metallicSalts: profile.chemicalHistory.metallicSalts,
      henna: profile.chemicalHistory.henna,
      keratinTreatment: profile.chemicalHistory.keratinTreatment,
      relaxer: profile.chemicalHistory.relaxer,
      lastService: profile.chemicalHistory.lastService,
      hardWater: profile.chemicalHistory.hardWater,
      medicationBuildup: profile.chemicalHistory.medicationBuildup,
    };
  }

  if (profile.sensitivities) {
    state.sensitivityFlags = {
      ppdAllergy: profile.sensitivities.ppdAllergy,
      isPregnant: profile.sensitivities.isPregnant,
      isBreastfeeding: profile.sensitivities.isBreastfeeding,
      activeChemo: profile.sensitivities.activeChemo,
    };
  }

  return state;
}

/* ───── merge profile after formulation ───── */
import type { FormulationInput, FormulationResult } from './formulation';

export function mergeProfileFromFormulation(
  existing: HairProfile,
  input: FormulationInput,
  result: FormulationResult,
  stylistId: string
): HairProfile {
  const now = new Date().toISOString();

  return {
    ...existing,
    texture: input.texture ?? existing.texture,
    hairPattern: input.hairType ?? existing.hairPattern,
    density: input.density ?? existing.density,
    porosity: input.condition.porosity ?? existing.porosity,

    chemicalHistory: input.chemicalHistory
      ? {
          boxDye: input.chemicalHistory.boxDye,
          metallicSalts: input.chemicalHistory.metallicSalts,
          henna: input.chemicalHistory.henna,
          keratinTreatment: input.chemicalHistory.keratinTreatment,
          relaxer: input.chemicalHistory.relaxer,
          lastService: input.chemicalHistory.lastService,
          hardWater: input.chemicalHistory.hardWater,
          medicationBuildup: input.chemicalHistory.medicationBuildup,
          lastServiceType: input.serviceType ?? existing.chemicalHistory?.lastServiceType,
          lastServiceDate: now,
        }
      : existing.chemicalHistory,

    sensitivities: existing.sensitivities || input.sensitivityFlags
      ? {
          ppdAllergy: existing.sensitivities?.ppdAllergy || input.sensitivityFlags?.ppdAllergy || false,
          ammoniaSensitivity: existing.sensitivities?.ammoniaSensitivity || false,
          fragranceSensitivity: existing.sensitivities?.fragranceSensitivity || false,
          isPregnant: input.sensitivityFlags?.isPregnant ?? existing.sensitivities?.isPregnant ?? false,
          isBreastfeeding: input.sensitivityFlags?.isBreastfeeding ?? existing.sensitivities?.isBreastfeeding ?? false,
          activeChemo: existing.sensitivities?.activeChemo || input.sensitivityFlags?.activeChemo || false,
          other: existing.sensitivities?.other || [],
        }
      : null,

    lastObservedLevel: input.currentLevel ?? existing.lastObservedLevel,
    lastObservedTone: input.currentTone ?? existing.lastObservedTone,
    lastObservedCondition: input.condition.type ?? existing.lastObservedCondition,
    lastServiceDate: now,
    lastFormulaId: result.formulaId ?? null,

    updatedAt: now,
    updatedBy: stylistId,
  };
}
