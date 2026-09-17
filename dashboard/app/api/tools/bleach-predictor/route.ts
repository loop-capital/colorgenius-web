import { z } from "zod";
import { parseToolBody, toolResponse, toolError } from "@/lib/tools/calculator-utils";

export const bleachPredictorSchema = z.object({
  startingLevel: z.coerce.number().int().min(1).max(10),
  developerVolume: z.union([z.literal(10), z.literal(20), z.literal(30), z.literal(40)]),
  processingTimeMinutes: z.coerce.number().int().min(5).max(60),
  hairCondition: z.enum(["healthy", "normal", "fragile", "compromised"]),
});

export type BleachPredictorInput = z.infer<typeof bleachPredictorSchema>;

export interface BleachPredictorResult {
  predictedLevel: number;
  liftLevels: number;
  riskLevel: "low" | "moderate" | "high" | "extreme";
  techniqueRecommendation: string;
  developerRecommendation: 10 | 20 | 30 | 40;
  processingRecommendation: number;
  safetyNotes: string[];
}

const CONDITION_MULTIPLIERS: Record<BleachPredictorInput["hairCondition"], number> = {
  healthy: 1,
  normal: 0.9,
  fragile: 0.75,
  compromised: 0.6,
};

const DEVELOPER_LIFT: Record<10 | 20 | 30 | 40, number> = {
  10: 0,
  20: 1,
  30: 2,
  40: 3,
};

export function calculateBleachPredictor(input: BleachPredictorInput): BleachPredictorResult {
  const { startingLevel, developerVolume, processingTimeMinutes, hairCondition } = input;

  const baseLift = DEVELOPER_LIFT[developerVolume];
  const timeBonus = Math.min(Math.floor((processingTimeMinutes - 10) / 10) * 0.5, 2);
  const rawLift = (baseLift + timeBonus) * CONDITION_MULTIPLIERS[hairCondition];
  const liftLevels = Number(rawLift.toFixed(1));
  const predictedLevel = Math.max(1, Math.min(10, startingLevel - Math.floor(rawLift)));

  let riskLevel: BleachPredictorResult["riskLevel"] = "low";
  if (hairCondition === "compromised") riskLevel = "extreme";
  else if (hairCondition === "fragile" && (developerVolume >= 30 || processingTimeMinutes > 30)) riskLevel = "high";
  else if (hairCondition === "fragile") riskLevel = "moderate";
  else if (developerVolume === 40 || processingTimeMinutes > 35) riskLevel = "high";
  else if (developerVolume >= 30) riskLevel = "moderate";

  let techniqueRecommendation = "Standard on-scalp or off-scalp lightening application.";
  if (riskLevel === "high" || riskLevel === "extreme") {
    techniqueRecommendation = "Use foils/balayage for heat control, work in small sections, and never overlap previously lightened hair.";
  } else if (developerVolume >= 30) {
    techniqueRecommendation = "Off-scalp or freehand technique recommended; monitor elasticity every 10 minutes.";
  }

  let recommendedDeveloper: 10 | 20 | 30 | 40 = developerVolume;
  if (hairCondition === "fragile" && developerVolume >= 40) recommendedDeveloper = 30;
  if (hairCondition === "compromised") recommendedDeveloper = 20;

  const recommendedProcessing = Math.min(processingTimeMinutes, hairCondition === "fragile" ? 25 : hairCondition === "compromised" ? 20 : 35);

  const safetyNotes: string[] = [];
  if (predictedLevel <= 1 && startingLevel > 6) safetyNotes.push("Predicted lift may not reach pale yellow; consider a second lightening session.");
  if (hairCondition === "fragile" || hairCondition === "compromised") {
    safetyNotes.push("Fragile/compromised hair — prioritize bond builder and avoid 40 vol.");
  }
  if (processingTimeMinutes > 45) safetyNotes.push("Processing beyond 45 minutes risks severe breakage on any hair type.");
  if (recommendedDeveloper < developerVolume) safetyNotes.push(`Developer reduced to ${recommendedDeveloper} vol to protect hair condition.`);

  return {
    predictedLevel,
    liftLevels,
    riskLevel,
    techniqueRecommendation,
    developerRecommendation: recommendedDeveloper,
    processingRecommendation: recommendedProcessing,
    safetyNotes,
  };
}

export async function POST(request: Request) {
  const { data, error } = await parseToolBody(request, bleachPredictorSchema);
  if (error) return error;
  try {
    const result = calculateBleachPredictor(data);
    return toolResponse(result);
  } catch (e) {
    return toolError(e instanceof Error ? e.message : "Calculation failed", 500);
  }
}

export async function GET() {
  return toolError("Use POST with a JSON body to calculate bleach lift", 405);
}
