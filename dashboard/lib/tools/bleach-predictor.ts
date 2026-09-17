import { z } from "zod";

export const bleachPredictorSchema = z.object({
  startingLevel: z.coerce.number().int().min(1).max(10),
  developerVolume: z.coerce.number().int().refine((v) => [10, 20, 30, 40].includes(v), {
    message: "Developer volume must be 10, 20, 30, or 40 vol",
  }),
  processingTimeMinutes: z.coerce.number().int().min(5).max(60),
  hairCondition: z.enum(["healthy", "processed", "damaged"]),
});

export type BleachPredictorInput = z.infer<typeof bleachPredictorSchema>;
export type HairCondition = "healthy" | "processed" | "damaged";

export interface BleachPredictorResult {
  predictedLevel: number;
  liftLevels: number;
  risk: "low" | "moderate" | "high" | "extreme";
  riskColor: string;
  recommendedTechnique: string;
  processingGuidance: string;
  notes: string[];
}

const conditionMultiplier: Record<HairCondition, number> = {
  healthy: 1,
  processed: 0.85,
  damaged: 0.65,
};

export function calculateBleachPrediction(input: BleachPredictorInput): BleachPredictorResult {
  const { startingLevel, developerVolume, processingTimeMinutes, hairCondition } = input;

  const maxLiftPerVolume: Record<number, number> = {
    10: 1,
    20: 2,
    30: 3,
    40: 4,
  };

  const baseLift = maxLiftPerVolume[developerVolume] ?? 1;
  const timeFactor = Math.min(processingTimeMinutes / 30, 1);
  const conditionFactor = conditionMultiplier[hairCondition];

  const estimatedLift = baseLift * (0.4 + 0.6 * timeFactor) * conditionFactor;
  const liftLevels = Math.max(0, Math.round(estimatedLift * 10) / 10);
  let predictedLevel = Math.max(1, Math.min(10, startingLevel - Math.floor(liftLevels)));

  if (predictedLevel === startingLevel && liftLevels >= 0.5) {
    predictedLevel = Math.max(1, predictedLevel - 1);
  }

  let risk: "low" | "moderate" | "high" | "extreme" = "low";
  let riskColor = "#10B981";
  if (developerVolume === 40 || processingTimeMinutes > 45 || (hairCondition === "damaged" && developerVolume >= 30)) {
    risk = "extreme";
    riskColor = "#EF4444";
  } else if (developerVolume >= 30 || processingTimeMinutes > 35 || hairCondition === "damaged") {
    risk = "high";
    riskColor = "#F59E0B";
  } else if (developerVolume >= 20 || processingTimeMinutes > 25 || hairCondition === "processed") {
    risk = "moderate";
    riskColor = "#FBBF24";
  }

  const techniques: Record<HairCondition, string> = {
    healthy: "Full-head or virgin application with standard foiling.",
    processed: "Low-and-slow foiling; consider bond builder and lower developer.",
    damaged: "Baby lights or balayage with 10–20 vol only; mandatory bond builder.",
  };

  const processingGuidance = processingTimeMinutes > 30
    ? "Check every 5 minutes after 30 min. Do not exceed manufacturer maximums."
    : "Check at 15 and 25 minutes for even lift.";

  const notes: string[] = [];
  if (hairCondition === "damaged" && developerVolume >= 30) {
    notes.push("High developer on damaged hair greatly increases breakage risk — use bond builder and lower vol.");
  }
  if (processingTimeMinutes > 45) {
    notes.push("Extended processing time can cause severe damage; rinse immediately if elasticity is lost.");
  }
  if (predictedLevel <= 4 && startingLevel > 6) {
    notes.push("Achieving very light results from a darker base may require multiple sessions.");
  }

  return {
    predictedLevel,
    liftLevels,
    risk,
    riskColor,
    recommendedTechnique: techniques[hairCondition],
    processingGuidance,
    notes,
  };
}
