import { z } from "zod";
import { parseToolBody, toolResponse, toolError } from "@/lib/tools/calculator-utils";

export const colorCorrectionSchema = z.object({
  unwantedTone: z.enum(["orange", "brass", "yellow", "red", "green", "ash", "purple"]),
  currentLevel: z.coerce.number().int().min(1).max(10),
  targetTone: z.enum(["neutral", "cool", "warm", "ash", "beige", "golden"]),
});

export type ColorCorrectionInput = z.infer<typeof colorCorrectionSchema>;
export type UnwantedTone = ColorCorrectionInput["unwantedTone"];
export type TargetTone = ColorCorrectionInput["targetTone"];

export interface ColorCorrectionResult {
  correctorShade: string;
  technique: "tone-on-tone" | "pre-pigment" | "cancel" | "fill-and-tone";
  developerRecommendation: number;
  processingTimeMinutes: number;
  formulaGuidance: string;
  notes: string[];
}

const toneWheel: Record<
  UnwantedTone,
  { opposite: string; neutralizers: string[]; levelRange: [number, number] }
> = {
  orange: { opposite: "blue", neutralizers: ["blue", "ash-blue"], levelRange: [5, 7] },
  brass: { opposite: "blue-violet", neutralizers: ["violet", "blue-violet"], levelRange: [6, 8] },
  yellow: { opposite: "violet", neutralizers: ["violet", "purple"], levelRange: [7, 10] },
  red: { opposite: "green", neutralizers: ["green", "ash-green"], levelRange: [4, 6] },
  green: { opposite: "red", neutralizers: ["red", "red-violet"], levelRange: [3, 5] },
  ash: { opposite: "warmth", neutralizers: ["gold", "warm brown"], levelRange: [6, 9] },
  purple: { opposite: "yellow", neutralizers: ["gold", "yellow-gold"], levelRange: [7, 10] },
};

export function calculateColorCorrection(input: ColorCorrectionInput): ColorCorrectionResult {
  const { unwantedTone, currentLevel, targetTone } = input;
  const info = toneWheel[unwantedTone];

  let correctorShade = info.neutralizers[0];
  let technique: ColorCorrectionResult["technique"] = "tone-on-tone";
  let developerRecommendation = 10;
  let processingTimeMinutes = 10;
  let formulaGuidance = "";

  if (currentLevel < info.levelRange[0]) {
    technique = "pre-pigment";
    developerRecommendation = 10;
    processingTimeMinutes = 15;
    formulaGuidance = `Fill with a warm/${correctorShade} shade at the target level before applying final tone.`;
  } else if (unwantedTone === "green" || unwantedTone === "red") {
    technique = "cancel";
    developerRecommendation = 10;
    processingTimeMinutes = 10;
    formulaGuidance = `Apply a ${correctorShade}-based direct dye or toner to neutralize the ${unwantedTone} reflection.`;
  } else if (currentLevel >= info.levelRange[0] && currentLevel <= info.levelRange[1]) {
    technique = "tone-on-tone";
    developerRecommendation = targetTone === "warm" ? 10 : 6;
    processingTimeMinutes = targetTone === "warm" ? 15 : 10;
    formulaGuidance = `Use a level ${currentLevel} ${correctorShade} toner to cancel ${unwantedTone} while keeping the base level stable.`;
  } else {
    technique = "fill-and-tone";
    developerRecommendation = 10;
    processingTimeMinutes = 20;
    formulaGuidance = `Fill missing warmth first, then tone with ${correctorShade} to refine the final reflection.`;
  }

  if (targetTone === "cool" || targetTone === "ash") {
    correctorShade = info.neutralizers[0];
    developerRecommendation = Math.min(developerRecommendation, 10);
  } else if (targetTone === "warm" || targetTone === "golden") {
    if (unwantedTone === "ash" || unwantedTone === "purple") {
      correctorShade = info.neutralizers[0];
    } else {
      correctorShade = "warm neutral";
    }
    developerRecommendation = Math.max(developerRecommendation, 10);
  }

  const notes: string[] = [];
  notes.push(`Primary neutralizer: ${correctorShade} (opposite ${info.opposite} on the color wheel).`);
  if (currentLevel > 8 && (unwantedTone === "orange" || unwantedTone === "red")) {
    notes.push("Orange/red at level 8+ is usually leftover pigment from prior dark color — a targeted fill may be needed before toning.");
  }
  if (targetTone === "ash" && currentLevel < 7) {
    notes.push("Ash tones at darker levels can look muddy; ensure enough lift or warmth is present.");
  }
  if (unwantedTone === "green") {
    notes.push("Green often comes from ash on overly porous hair — red or copper fill cancels it.");
  }

  return {
    correctorShade,
    technique,
    developerRecommendation,
    processingTimeMinutes,
    formulaGuidance,
    notes,
  };
}

export async function POST(request: Request) {
  const { data, error } = await parseToolBody(request, colorCorrectionSchema);
  if (error) return error;
  try {
    const result = calculateColorCorrection(data);
    return toolResponse(result);
  } catch (e) {
    return toolError(e instanceof Error ? e.message : "Calculation failed", 500);
  }
}

export async function GET() {
  return toolError("Use POST with a JSON body to calculate color correction", 405);
}
