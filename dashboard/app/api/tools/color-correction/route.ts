import { parseToolBody, toolResponse, toolError } from "@/lib/tools/calculator-utils";
import { colorCorrectionSchema, calculateColorCorrection } from "@/lib/tools/color-correction";

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
