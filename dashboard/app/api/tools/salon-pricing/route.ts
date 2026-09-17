import { z } from "zod";
import { parseToolBody, toolResponse, toolError } from "@/lib/tools/calculator-utils";

export const salonPricingSchema = z.object({
  productCost: z.coerce.number().min(0).max(10000),
  chairTimeMinutes: z.coerce.number().int().min(5).max(480),
  stylistHourlyRate: z.coerce.number().min(0).max(1000),
  overheadPercent: z.coerce.number().min(0).max(200),
  desiredMargin: z.coerce.number().min(0).max(100),
});

export type SalonPricingInput = z.infer<typeof salonPricingSchema>;

export interface SalonPricingResult {
  recommendedPrice: number;
  laborCost: number;
  overheadCost: number;
  productCost: number;
  totalCost: number;
  profitPerService: number;
  marginPercent: number;
  priceBreakdown: {
    label: string;
    amount: number;
    percentOfPrice: number;
  }[];
  notes: string[];
}

export function calculateSalonPricing(input: SalonPricingInput): SalonPricingResult {
  const {
    productCost,
    chairTimeMinutes,
    stylistHourlyRate,
    overheadPercent,
    desiredMargin,
  } = input;

  const laborCost = (chairTimeMinutes / 60) * stylistHourlyRate;
  const overheadCost = (laborCost + productCost) * (overheadPercent / 100);
  const totalCost = productCost + laborCost + overheadCost;

  const targetPrice =
    desiredMargin >= 100
      ? totalCost * 100
      : totalCost / (1 - desiredMargin / 100);

  const recommendedPrice = Math.max(Number(targetPrice.toFixed(2)), Number(totalCost.toFixed(2)) + 0.01);
  const profitPerService = Number((recommendedPrice - totalCost).toFixed(2));
  const marginPercent = Number(((profitPerService / recommendedPrice) * 100).toFixed(2));

  const notes: string[] = [];
  if (marginPercent < desiredMargin - 5) notes.push("Actual margin is below target — review costs or increase price.");
  if (overheadPercent > 50) notes.push("High overhead percentage; consider cost-control measures.");
  if (recommendedPrice < totalCost * 1.2) notes.push("Thin margin — any discounting will erase profit.");

  return {
    recommendedPrice,
    laborCost: Number(laborCost.toFixed(2)),
    overheadCost: Number(overheadCost.toFixed(2)),
    productCost: Number(productCost.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    profitPerService,
    marginPercent,
    priceBreakdown: [
      { label: "Product Cost", amount: Number(productCost.toFixed(2)), percentOfPrice: Number(((productCost / recommendedPrice) * 100).toFixed(2)) },
      { label: "Labor Cost", amount: Number(laborCost.toFixed(2)), percentOfPrice: Number(((laborCost / recommendedPrice) * 100).toFixed(2)) },
      { label: "Overhead Cost", amount: Number(overheadCost.toFixed(2)), percentOfPrice: Number(((overheadCost / recommendedPrice) * 100).toFixed(2)) },
      { label: "Profit", amount: profitPerService, percentOfPrice: marginPercent },
    ],
    notes,
  };
}

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
