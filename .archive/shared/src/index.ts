// Core domain types for ColorGenius

// ============================================================
// ENUMS
// ============================================================

export enum HairLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
  LEVEL_6 = 6,
  LEVEL_7 = 7,
  LEVEL_8 = 8,
  LEVEL_9 = 9,
  LEVEL_10 = 10,
}

export enum HairTone {
  NATURAL = 'N',
  ASH = 'A',
  GOLD = 'G',
  VIOLET = 'V',
  RED = 'R',
  COPPER = 'K',
  BEIGE = 'B',
  MAUVE = 'M',
  ORANGE = 'O',
  PEARL = 'P',
  SILVER = 'S',
  WARM = 'W',
  RED_VIOLET = 'RV',
  BLUE_VIOLET = 'BV',
  ORANGE_RED = 'RO',
  BLUE_GREEN = 'BG',
  YELLOW_GREEN = 'YG',
}

export enum HairTexture {
  FINE = 'fine',
  MEDIUM = 'medium',
  COARSE = 'coarse',
}

export enum HairDensity {
  THIN = 'thin',
  MEDIUM = 'medium',
  THICK = 'thick',
}

export enum Porosity {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

export enum CurlPattern {
  STRAIGHT = 'straight',
  WAVY = 'wavy',
  CURLY = 'curly',
  COILY = 'coily',
}

export enum ActionType {
  DEPOSIT_ONLY = 'deposit_only',
  LIFT_WITH_COLOR = 'lift_with_color',
  LIGHTEN_THEN_TONE = 'lighten_then_tone',
  FILL_THEN_DEPOSIT = 'fill_then_deposit',
  CORRECTIVE = 'corrective',
}

export enum ColorLineType {
  PERMANENT = 'permanent',
  DEMI_PERMANENT = 'demi-permanent',
  SEMI_PERMANENT = 'semi-permanent',
  TEMPORARY = 'temporary',
  BLEACH = 'bleach',
  TONER = 'toner',
  HIGH_LIFT = 'high-lift',
  DIRECT_DYE = 'direct_dye',
}

export enum PhotoType {
  CURRENT = 'current',
  TARGET = 'target',
  TEXTURE = 'texture',
  RESULT = 'result',
}

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// ============================================================
// CORE INTERFACES
// ============================================================

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface LAB {
  l: number;
  a: number;
  b: number;
}

export interface ShadeCode {
  brand: string;
  productLine: string;
  code: string;
}

// ============================================================
// HAIR ANALYSIS
// ============================================================

export interface HairColorAnalysis {
  level: HairLevel;
  levelConfidence: number;
  primaryTone: HairTone;
  secondaryTone?: HairTone;
  undertone: string;
  rgb: RGB;
  lab: LAB;
}

export interface HairTextureAnalysis {
  thickness: HairTexture;
  thicknessConfidence: number;
  curlPattern: CurlPattern;
  curlConfidence: number;
  density: HairDensity;
  densityConfidence: number;
}

export interface HairDamageAssessment {
  overallScore: number; // 0-1
  indicators: {
    splitEnds: boolean;
    breakage: boolean;
    heatDamage: boolean;
    chemicalDamage: boolean;
  };
}

export interface PorosityAssessment {
  level: Porosity;
  confidence: number;
  factors: string[];
}

export interface HairProfile {
  texture: HairTextureAnalysis;
  porosity: PorosityAssessment;
  density: HairDensity;
  elasticityPercent?: number;
  damage: HairDamageAssessment;
  curlPattern: CurlPattern;
}

export interface PhotoAnalysis {
  id: string;
  stylistId: string;
  clientId?: string;
  photoType: PhotoType;
  originalUrl: string;
  processedUrl?: string;
  maskUrl?: string;
  originalSize: [number, number];
  processingStatus: ProcessingStatus;
  lightingCorrected: boolean;
  hairAnalysis?: HairColorAnalysis;
  hairProfile?: HairProfile;
  damageAssessment?: HairDamageAssessment;
  confidence: number;
  createdAt: string;
  completedAt?: string;
}

// ============================================================
// FORMULATION
// ============================================================

export interface FormulaComponent {
  shadeId: string;
  shadeCode: string;
  shadeName: string;
  brand: string;
  productLine: string;
  level: HairLevel;
  tone: HairTone;
  amountOz: number;
  amountMl: number;
  amountRatio: number;
  purpose: 'primary' | 'secondary' | 'corrector' | 'gray_coverage' | 'neutralization';
}

export interface DeveloperRecommendation {
  volume: number; // 10, 20, 30, 40
  processingTimeMinutes: number;
  rationale: string[];
  warnings: string[];
}

export interface BondBuilder {
  product: string;
  amountMl: number;
}

export interface PrimaryFormula {
  actionType: ActionType;
  brand: string;
  productLine: string;
  components: FormulaComponent[];
  developer: DeveloperRecommendation;
  bondBuilder?: BondBuilder;
  mixingRatio: string;
  totalVolumeOz: number;
  totalVolumeMl: number;
}

export interface ToningFormula extends Omit<PrimaryFormula, 'actionType'> {
  toneReason: string;
}

export interface ApplicationStep {
  zone: string;
  duration: number;
  description: string;
}

export interface ProcessingInstructions {
  totalTimeMinutes: number;
  applicationSequence: ApplicationStep[];
  roomTemperatureRecommended: boolean;
  heatOptional: boolean;
  notes: string[];
}

export interface CostBreakdown {
  product: string;
  cost: number;
  currency: string;
}

export interface CostEstimate {
  totalProductCost: number;
  currency: string;
  breakdown: CostBreakdown[];
}

export interface PricingSuggestion {
  recommendedPrice: number;
  priceRange: [number, number];
  currency: string;
}

export interface FormulationValidation {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  alternatives: string[];
}

export interface FormulationResult {
  formulationId: string;
  createdAt: string;
  confidenceScore: number;
  validation: FormulationValidation;
  primaryFormula: PrimaryFormula;
  toningFormula?: ToningFormula;
  processingInstructions: ProcessingInstructions;
  costEstimate: CostEstimate;
  pricingSuggestion: PricingSuggestion;
  recommendations: {
    aftercare: string[];
    maintenanceSchedule: string;
    nextAppointment: string;
  };
}

// ============================================================
// CLIENT
// ============================================================

export interface ClientAllergies {
  ppd: boolean;
  ammonia: boolean;
  fragrance: boolean;
  other: string[];
}

export interface ClientPreferences {
  communicationMethod: 'text' | 'email' | 'phone';
  remindersEnabled: boolean;
  preferredBrands: string[];
  dislikedTones: HairTone[];
  maintenanceLevel: 'low' | 'medium' | 'high';
}

export interface ClientFactors {
  grayPercentage: number;
  medications: string[];
  scalpCondition: 'normal' | 'sensitive' | 'oily' | 'dry' | 'irritated';
  hasPpdAllergy: boolean;
  hasAmmoniaSensitivity: boolean;
  allergies: ClientAllergies;
  washingFrequency: 'daily' | 'every_2_3_days' | 'weekly';
  heatStylingFrequency: 'daily' | 'few_times_week' | 'rarely' | 'never';
  swimmingFrequency: 'daily' | 'weekly' | 'rarely' | 'never';
}

// ============================================================
// COLOR LINES
// ============================================================

export interface Brand {
  id: string;
  name: string;
  slug: string;
  manufacturer?: string;
  tier: 'mass' | 'mid' | 'premium' | 'luxury';
  features: string[];
  logoUrl?: string;
  isActive: boolean;
}

export interface ProductLine {
  id: string;
  brandId: string;
  name: string;
  code: string;
  colorType: ColorLineType;
  ammoniaFree: boolean;
  plexTechnology?: string;
  maxGrayCoverage: number;
  maxLiftLevels: number;
  mixingRatio: string;
  developerOptions: number[];
  baseProcessingTime: number;
  isActive: boolean;
}

export interface Shade {
  id: string;
  productLineId: string;
  shadeCode: string;
  shadeName: string;
  level: HairLevel;
  primaryTone: HairTone;
  secondaryTone?: HairTone;
  tertiaryTone?: HairTone;
  isNatural: boolean;
  isHighLift: boolean;
  isSpecialMix: boolean;
  rgb: RGB;
  lab: LAB;
  undertone: string;
  intensityScore: number;
  description?: string;
  bestFor: string[];
  notRecommendedFor: string[];
  isActive: boolean;
}

// ============================================================
// API RESPONSES
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: string[];
  requestId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ============================================================
// EVENT TYPES
// ============================================================

export type WebhookEvent =
  | 'formulation.completed'
  | 'feedback.received'
  | 'photo.analysis.completed'
  | 'subscription.updated';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}