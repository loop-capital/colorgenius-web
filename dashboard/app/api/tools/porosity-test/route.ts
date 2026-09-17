import { parseToolBody, toolResponse, toolError } from "@/lib/tools/calculator-utils";
import { porosityTestSchema, porosityQuestions, calculatePorosity } from "@/lib/tools/porosity-test";

export async function POST(request: Request) {
  const { data, error } = await parseToolBody(request, porosityTestSchema);
  if (error) return error;
  try {
    const result = calculatePorosity(data);
    return toolResponse(result);
  } catch (e) {
    return toolError(e instanceof Error ? e.message : "Calculation failed", 500);
  }
}

export async function GET() {
  return toolResponse({ questions: porosityQuestions });
}
