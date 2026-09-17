import { parseToolBody, toolResponse, toolError } from "@/lib/tools/calculator-utils";
import { salonPricingSchema, calculateSalonPricing } from "@/lib/tools/salon-pricing";

export async function POST(request: Request) {
  const { data, error } = await parseToolBody(request, salonPricingSchema);
  if (error) return error;
  try {
    const result = calculateSalonPricing(data);
    return toolResponse(result);
  } catch (e) {
    return toolError(e instanceof Error ? e.message : "Calculation failed", 500);
  }
}

export async function GET() {
  return toolError("Use POST with a JSON body to calculate salon pricing", 405);
}
