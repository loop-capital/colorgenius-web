import { parseToolBody, toolResponse, toolError } from "@/lib/tools/calculator-utils";
import { bleachPredictorSchema, calculateBleachPrediction } from "@/lib/tools/bleach-predictor";

export async function POST(request: Request) {
  const { data, error } = await parseToolBody(request, bleachPredictorSchema);
  if (error) return error;
  try {
    const result = calculateBleachPrediction(data);
    return toolResponse(result);
  } catch (e) {
    return toolError(e instanceof Error ? e.message : "Calculation failed", 500);
  }
}

export async function GET() {
  return toolError("Use POST with a JSON body to calculate bleach lift", 405);
}
