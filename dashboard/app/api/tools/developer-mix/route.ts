import { parseToolBody, toolResponse, toolError } from "@/lib/tools/calculator-utils";
import { developerMixSchema, calculateDeveloperMix } from "@/lib/tools/developer-mix";

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
