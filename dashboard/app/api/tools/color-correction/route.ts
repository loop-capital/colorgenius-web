import { z } from "zod";
import { parseToolBody, toolResponse, toolError } from "@/lib/tools/calculator-utils";

export const colorCorrectionSchema = z.object({
  unwantedTone: z.enum(["orange", "brass", "yellow", "red"]),
  currentLevel: z.coerce.number().int().min(1).max(10),
  targetTone: z.enum(["ash", "beige", "neutral", "cool", "warm", "violet"]),
});

export type ColorCorrectionInput = z.infer<typeof colorCorrectionSchema>;

export interface ColorCorrectionResult {
  correctorShade: string;
  technique: string;
  developerRecommendation: 10 | 20 | 30 | 40;
  reasoning: string[];
  processingTimeMinutes: number;
}

const COMPLEMENTARY_CORRECTORS: Record<
  ColorCorrectionInput["unwantedTone"],
  Partial<Record<ColorCorrectionInput["targetTone"], string>>
> = {
  orange: {
    ash: "Blue-based ash",
    cool: "Blue-violet ash",
    neutral: "Neutral blue",
    violet: "Blue-violet",
  },
  brass: {
    ash: "Blue-violet ash",
    cool: "Blue ash",
    neutral: "Neutral ash",
    violet: "Violet",
  },
  yellow: {
    ash: "Violet ash",
    cool: "Violet",
    neutral: "Neutral violet",
    violet: "Deep violet",
  },
  red: {
    ash: "Green-based ash",
    cool: "Green-neutral",
    neutral: "Neutral green",
    beige: "Beige with green reflect",
  },
};

export function calculateColorCorrection(input: ColorCorrectionInput): ColorCorrectionResult {
  const { unwantedTone, currentLevel, targetTone } = input;

  const correctorShade =
    COMPLEMENTARY_CORRECTORS[unwantedTone][targetTone] ??
    (unwantedTone === "red" ? "Green-based corrector" : "Violet-based corrector");

  let developerRecommendation: 10 | 20 | 30 | 40 = 10;
  if (currentLevel >= 7) developerRecommendation = 10;
  else if (currentLevel >= 5) developerRecommendation = 20;
  else developerRecommendation = 20;

  const processingTimeMinutes = 15;

  const reasoning: string[] = [
    `${unwantedTone.charAt(0).toUpperCase() + unwantedTone.slice(1)} is neutralized by its complementary base in ${correctorShade.toLowerCase()}.`,
    currentLevel >= 7
      ? "Level 7+ is already light enough for a pure tone-on-tone correction."
      : "Level 1-6 may need pre-lightening or a stronger corrector formulation.",
  ];

  if (unwantedTone === "red" && targetTone === "warm") {
    reasoning.push("Red to warm is not a correction — confirm the client’s target before formulating.");
  }

  return {
    correctorShade,
    technique: "Apply corrector to areas of unwanted tone only. Process up to 15 minutes, then emulsify and evaluate before adding target shade.",
    developerRecommendation,
    reasoning,
    processingTimeMinutes,
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
