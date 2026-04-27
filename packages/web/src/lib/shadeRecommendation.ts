/**
 * Shade Recommendation Engine
 * 
 * Takes manual analysis inputs and returns ranked shade recommendations
 * based on compatibility scoring.
 */

import wellaData from "@/data/wella-koleston-database.json";

export type HairCondition = "healthy" | "damaged" | "processed" | "overprocessed";
export type Undertone = "warm" | "cool" | "neutral";
export type CurrentLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type DesiredLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface ManualAnalysisInput {
  currentLevel: CurrentLevel;
  desiredLevel: DesiredLevel;
  condition: HairCondition;
  undertone: Undertone;
  hasGray?: boolean;
  grayPercentage?: number;
  previousColor?: string;
  wantsCorrection?: boolean;
  correctionType?: string;
}

export interface ShadeRecommendation {
  shadeId: string;
  shadeCode: string;
  shadeName: string;
  level: number;
  tone: string;
  undertone: string;
  category: string;
  colorHex: string;
  confidenceScore: number;
  reasoning: string[];
  isCorrector: boolean;
  isHighLift: boolean;
  recommendedDeveloper?: string;
  mixingInstructions?: string;
}

interface ShadeData {
  id: string;
  code: string;
  name: string;
  level: number;
  tone: string;
  primaryTone: string;
  undertone: string;
  category: string;
  colorHex: string;
  bestFor: string[];
  description: string;
  corrector: boolean;
  lifting: boolean;
  recommendedDeveloper?: string;
  mixingRatio?: string;
  maxLift?: number;
}

// Load and type the database
const db = wellaData as {
  shades: ShadeData[];
  commonCorrectionScenarios: Array<{
    id: string;
    name: string;
    problem: string;
    solution: string;
    recommendedShades: string[];
    developer: string;
  }>;
};

const SHADES = db.shades;
const SCENARIOS = db.commonCorrectionScenarios;

/**
 * Calculate level difference and direction
 */
function getLevelDelta(current: number, desired: number): number {
  return desired - current; // positive = lighter, negative = darker, 0 = same
}

/**
 * Determine if high-lift is needed (lifting 3+ levels)
 */
function needsHighLift(current: number, desired: number): boolean {
  return desired - current >= 3;
}

/**
 * Check if going darker
 */
function isGoingDarker(current: number, desired: number): boolean {
  return desired < current;
}

/**
 * Check if going lighter
 */
function isGoingLighter(current: number, desired: number): boolean {
  return desired > current;
}

/**
 * Score a shade based on level match
 */
function scoreLevelMatch(shade: ShadeData, desiredLevel: number): number {
  const levelDiff = Math.abs(shade.level - desiredLevel);
  if (levelDiff === 0) return 100;
  if (levelDiff === 1) return 80;
  if (levelDiff === 2) return 50;
  return 20;
}

/**
 * Score based on undertone compatibility
 */
function scoreUndertoneCompatibility(
  shade: ShadeData,
  clientUndertone: Undertone,
  wantsCorrection: boolean
): number {
  const shadeUndertone = shade.undertone as "warm" | "cool" | "neutral";

  // Corrector shades are context-dependent
  if (shade.corrector) {
    // Ash/blue correctors are great for warm undertones wanting cool results
    if (
      (shade.primaryTone === "A" || shade.primaryTone === "B") &&
      clientUndertone === "warm"
    ) {
      return wantsCorrection ? 90 : 40;
    }
    // Gold correctors are great for cool undertones wanting warm results
    if (
      shade.primaryTone === "G" &&
      clientUndertone === "cool"
    ) {
      return wantsCorrection ? 90 : 40;
    }
    // Violet correctors are great for neutral/warm wanting cool
    if (
      shade.primaryTone === "V" &&
      (clientUndertone === "warm" || clientUndertone === "neutral")
    ) {
      return wantsCorrection ? 85 : 35;
    }
    return 50;
  }

  // Non-corrector shades
  if (shadeUndertone === clientUndertone) return 100;
  if (clientUndertone === "neutral") return 90; // Neutral works with everything
  if (shadeUndertone === "neutral") return 80; // Neutral shade works with any undertone
  return 40; // Mismatch
}

/**
 * Score based on hair condition
 */
function scoreConditionCompatibility(
  shade: ShadeData,
  condition: HairCondition,
  levelDelta: number
): number {
  // Overprocessed hair needs gentle approach
  if (condition === "overprocessed") {
    if (shade.lifting) return 10; // Avoid high-lift on overprocessed hair
    if (levelDelta > 2) return 20; // Avoid big lifts
    if (shade.category === "natural" || shade.category === "warm") return 90;
    return 70;
  }

  // Damaged hair - be cautious with lift
  if (condition === "damaged") {
    if (shade.lifting) return 30;
    if (levelDelta > 3) return 25;
    if (shade.category === "natural") return 100;
    return 80;
  }

  // Processed hair - moderate caution
  if (condition === "processed") {
    if (shade.lifting && levelDelta > 3) return 40;
    if (shade.category === "natural") return 95;
    return 85;
  }

  // Healthy hair - can handle most things
  if (condition === "healthy") {
    if (shade.lifting && levelDelta > 4) return 60; // Still caution on extreme lifts
    return 100;
  }

  return 80;
}

/**
 * Score based on correction needs
 */
function scoreCorrectionNeed(
  shade: ShadeData,
  wantsCorrection: boolean,
  correctionType?: string
): number {
  if (!wantsCorrection) {
    // If no correction needed, penalize pure correctors
    if (shade.corrector) return 20;
    return 100;
  }

  // They want correction
  if (shade.corrector) {
    // Match corrector to type
    if (!correctionType) return 80;
    if (correctionType.includes("orange") && (shade.primaryTone === "A" || shade.primaryTone === "B"))
      return 100;
    if (correctionType.includes("yellow") && (shade.primaryTone === "A" || shade.primaryTone === "V"))
      return 100;
    if (correctionType.includes("ash") && shade.primaryTone === "G") return 100;
    if (correctionType.includes("warm") && shade.primaryTone === "G") return 100;
    return 80;
  }

  // Non-corrector shades - check if they're in the right family
  if (correctionType?.includes("orange") && shade.category === "ash") return 85;
  if (correctionType?.includes("yellow") && (shade.category === "ash" || shade.category === "violet"))
    return 85;
  if (correctionType?.includes("ash") && shade.category === "warm") return 85;
  if (correctionType?.includes("warm") && shade.category === "warm") return 85;

  return 70;
}

/**
 * Score based on gray coverage needs
 */
function scoreGrayCoverage(
  shade: ShadeData,
  hasGray: boolean,
  grayPercentage?: number
): number {
  if (!hasGray) return 100;

  const grayLevel = grayPercentage || 50;

  // Natural shades are best for gray
  if (shade.category === "natural") {
    if (grayLevel > 75) return 100;
    if (grayLevel > 50) return 95;
    return 90;
  }

  // Warm shades are second best
  if (shade.category === "warm") {
    if (grayLevel > 75) return 70;
    if (grayLevel > 50) return 80;
    return 90;
  }

  // Ash shades can be tricky on high gray
  if (shade.category === "ash") {
    if (grayLevel > 75) return 50;
    if (grayLevel > 50) return 65;
    return 85;
  }

  // Red/violet on gray depends on level
  if (shade.category === "red" || shade.category === "violet") {
    if (grayLevel > 50) return 60;
    return 80;
  }

  return 75;
}

/**
 * Get developer recommendation based on condition and lift needed
 */
function getDeveloperRecommendation(
  condition: HairCondition,
  levelDelta: number,
  hasGray: boolean
): string {
  if (condition === "overprocessed") {
    if (levelDelta > 0) return "10-20 vol (gentle lift, consider low-and-slow)";
    return "10-20 vol (deposit only, very gentle)";
  }

  if (condition === "damaged") {
    if (levelDelta > 1) return "20 vol (maximum, monitor carefully)";
    if (hasGray) return "20 vol (gray coverage with care)";
    return "10-20 vol (deposit or gentle lift)";
  }

  if (condition === "processed") {
    if (levelDelta >= 3) return "30-40 vol (processed but can lift with care)";
    if (levelDelta > 0) return "20-30 vol (moderate lift)";
    if (hasGray) return "20-30 vol (gray coverage)";
    return "10-20 vol (deposit)";
  }

  // Healthy
  if (levelDelta >= 4) return "40 vol (high lift)";
  if (levelDelta >= 2) return "30-40 vol (moderate to high lift)";
  if (levelDelta > 0) return "20-30 vol (gentle lift)";
  if (hasGray) return "20-30 vol (gray coverage)";
  return "10-20 vol (deposit or tone)";
}

/**
 * Main recommendation function
 */
export function getShadeRecommendations(
  input: ManualAnalysisInput
): ShadeRecommendation[] {
  const {
    currentLevel,
    desiredLevel,
    condition,
    undertone,
    hasGray = false,
    wantsCorrection = false,
    correctionType,
  } = input;

  const levelDelta = getLevelDelta(currentLevel, desiredLevel);
  const goingLighter = isGoingLighter(currentLevel, desiredLevel);
  const goingDarker = isGoingDarker(currentLevel, desiredLevel);
  const useHighLift = needsHighLift(currentLevel, desiredLevel);

  const scoredShades = SHADES.map((shade) => {
    const scores: Record<string, number> = {};

    // 1. Level match (weight: 35%)
    scores.level = scoreLevelMatch(shade, desiredLevel) * 0.35;

    // 2. Undertone compatibility (weight: 20%)
    scores.undertone = scoreUndertoneCompatibility(shade, undertone, wantsCorrection) * 0.20;

    // 3. Condition compatibility (weight: 25%)
    scores.condition = scoreConditionCompatibility(shade, condition, levelDelta) * 0.25;

    // 4. Correction needs (weight: 10%)
    scores.correction = scoreCorrectionNeed(shade, wantsCorrection, correctionType) * 0.10;

    // 5. Gray coverage (weight: 10%)
    scores.gray = scoreGrayCoverage(shade, hasGray, input.grayPercentage) * 0.10;

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    // Build reasoning
    const reasoning: string[] = [];

    if (scores.level >= 35) {
      reasoning.push(`Level ${shade.level} matches desired level ${desiredLevel}`);
    } else if (scores.level >= 28) {
      reasoning.push(`Level ${shade.level} is close to desired level ${desiredLevel}`);
    } else {
      reasoning.push(`Level ${shade.level} may need adjustment for desired level ${desiredLevel}`);
    }

    if (shade.undertone === undertone) {
      reasoning.push(`${shade.undertone} undertone matches client`);
    } else if (undertone === "neutral") {
      reasoning.push(`Neutral client undertone works with ${shade.undertone} shade`);
    } else if (wantsCorrection && shade.corrector) {
      reasoning.push(`Corrector shade for ${correctionType || "color correction"}`);
    }

    if (shade.category === "natural" && hasGray) {
      reasoning.push("Natural base provides reliable gray coverage");
    }

    if (shade.lifting) {
      reasoning.push(`High-lift shade can achieve ${shade.maxLift} levels of lift`);
    }

    if (shade.corrector) {
      reasoning.push(`Mix ${shade.mixingRatio} with target shade`);
    }

    // Condition warnings
    if (condition === "overprocessed" && shade.lifting) {
      reasoning.push("⚠️ Avoid high-lift on overprocessed hair — risk of breakage");
    }
    if (condition === "damaged" && levelDelta > 2 && !shade.lifting) {
      reasoning.push("⚠️ Large lift on damaged hair — consider pre-treatment");
    }

    return {
      shadeId: shade.id,
      shadeCode: shade.code,
      shadeName: shade.name,
      level: shade.level,
      tone: shade.tone,
      undertone: shade.undertone,
      category: shade.category,
      colorHex: shade.colorHex,
      confidenceScore: Math.round(totalScore),
      reasoning,
      isCorrector: shade.corrector,
      isHighLift: shade.lifting,
      recommendedDeveloper: shade.recommendedDeveloper || getDeveloperRecommendation(condition, levelDelta, hasGray),
      mixingInstructions: shade.mixingRatio || undefined,
    };
  });

  // Sort by confidence score descending
  scoredShades.sort((a, b) => b.confidenceScore - a.confidenceScore);

  // Return top 8 recommendations
  return scoredShades.slice(0, 8);
}

/**
 * Get correction scenarios that match the current situation
 */
export function getRelevantCorrectionScenarios(
  currentLevel: number,
  desiredLevel: number,
  condition: HairCondition,
  undertone: Undertone
): typeof SCENARIOS {
  const levelDelta = desiredLevel - currentLevel;
  
  return SCENARIOS.filter((scenario) => {
    // Match based on common situations
    if (scenario.id === "dark-to-light" && levelDelta >= 3) return true;
    if (scenario.id === "gray-resistance" && condition !== "healthy") return true;
    if (scenario.id === "uneven-porosity" && condition === "overprocessed") return true;
    if (scenario.id === "dull-faded" && condition === "processed") return true;
    if (scenario.id === "orange-brass" && levelDelta > 0) return true;
    if (scenario.id === "yellow-brass" && levelDelta > 1) return true;
    return false;
  });
}

/**
 * Get a quick summary of the analysis
 */
export function getAnalysisSummary(input: ManualAnalysisInput): {
  liftNeeded: number;
  direction: "lighter" | "darker" | "same";
  riskLevel: "low" | "moderate" | "high";
  recommendations: string[];
} {
  const levelDelta = getLevelDelta(input.currentLevel, input.desiredLevel);
  const direction = levelDelta > 0 ? "lighter" : levelDelta < 0 ? "darker" : "same";

  let riskLevel: "low" | "moderate" | "high" = "low";
  if (input.condition === "overprocessed" || (direction === "lighter" && levelDelta >= 4)) {
    riskLevel = "high";
  } else if (input.condition === "damaged" || (direction === "lighter" && levelDelta >= 2)) {
    riskLevel = "moderate";
  }

  const recommendations: string[] = [];

  if (direction === "lighter" && levelDelta >= 3) {
    recommendations.push("Consider high-lift shades or pre-lightening");
  }
  if (input.condition === "overprocessed" && direction === "lighter") {
    recommendations.push("Overprocessed hair needs extra care — use lower developer");
  }
  if (input.hasGray && input.grayPercentage && input.grayPercentage > 50) {
    recommendations.push("High gray percentage — natural (N) shades recommended");
  }
  if (direction === "darker") {
    recommendations.push("Going darker is generally lower risk — focus on deposit and condition");
  }

  return {
    liftNeeded: Math.abs(levelDelta),
    direction,
    riskLevel,
    recommendations,
  };
}

export default getShadeRecommendations;
