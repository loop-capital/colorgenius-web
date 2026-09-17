import { z } from "zod";
import { parseToolBody, toolResponse, toolError } from "@/lib/tools/calculator-utils";

export const developerMixSchema = z.object({
  startingLevel: z.coerce.number().int().min(1).max(12),
  targetLevel: z.coerce.number().int().min(1).max(12),
  grayPercentage: z.coerce.number().int().min(0).max(100),
  desiredCoverage: z.enum(["full", "partial"]),
});

export type DeveloperMixInput = z.infer<typeof developerMixSchema>;

export interface DeveloperMixResult {
  developerVolume: 10 | 20 | 30 | 40;
  mixRatio: "1:1" | "1:1.5" | "1:2";
  processingTimeMinutes: number;
  liftLevels: number;
  notes: string[];
}

export function calculateDeveloperMix(input: DeveloperMixInput): DeveloperMixResult {
  const { startingLevel, targetLevel, grayPercentage, desiredCoverage } = input;
  const liftLevels = Math.max(0, startingLevel - targetLevel);
  let developerVolume: 10 | 20 | 30 | 40 = 10;

  if (liftLevels >= 4) developerVolume = 40;
  else if (liftLevels >= 3) developerVolume = 30;
  else if (liftLevels >= 1 || grayPercentage > 50) developerVolume = 20;
  else developerVolume = 10;

  if (grayPercentage > 75) developerVolume = 20;

  let mixRatio: "1:1" | "1:1.5" | "1:2" = "1:1";
  if (grayPercentage > 50 || desiredCoverage === "full") {
    mixRatio = grayPercentage > 75 ? "1:2" : "1:1.5";
  } else if (liftLevels >= 3) {
    mixRatio = "1:1.5";
  }

  let processingTimeMinutes = 20;
  if (grayPercentage > 50) processingTimeMinutes += 15;
  if (desiredCoverage === "full") processingTimeMinutes += 5;
  if (developerVolume >= 30) processingTimeMinutes += 5;
  if (liftLevels >= 4) processingTimeMinutes += 5;
  processingTimeMinutes = Math.min(processingTimeMinutes, 45);

  const notes: string[] = [];
  if (grayPercentage > 50) notes.push("Higher gray % needs more developer and longer processing.");
  if (liftLevels >= 4) notes.push("High lift — apply to mid-lengths/ends first, then roots.");
  if (targetLevel > startingLevel) notes.push("Darkening hair generally does not require lift; use lowest developer.");
  if (desiredCoverage === "full" && grayPercentage < 25) notes.push("Full coverage requested but low gray % — consider targeted application.");

  return {
    developerVolume,
    mixRatio,
    processingTimeMinutes,
    liftLevels,
    notes,
  };
}

export async function POST(request: Request) {
  const { data, error } = await parseToolBody(request, developerMixSchema);
  if (error) return error;
  try {
    const result = calculateDeveloperMix(data);
    return toolResponse(result);
  } catch (e) {
    return toolError(e instanceof Error ? e.message : "Calculation failed", 500);
  }
}

export async function GET() {
  return toolError("Use POST with a JSON body to calculate developer mix", 405);
}
