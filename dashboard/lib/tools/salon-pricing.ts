import { z } from "zod";

export const salonPricingSchema = z.object({
  productCostPerService: z.coerce.number().min(0).max(10000),
  chairTimeMinutes: z.coerce.number().int().min(5).max(480),
  stylistHourlyRate: z.coerce.number().min(0).max(1000),
  salonOverheadPercent: z.coerce.number().min(0).max(200),
  desiredProfitMargin: z.coerce.number().min(0).max(95),
});

export type SalonPricingInput = z.infer<typeof salonPricingSchema>;

export interface SalonPricingResult {
  recommendedPrice: number;
  laborCost: number;
  overheadCost: number;
  productCost: number;
  totalCost: number;
  profitPerService: number;
  profitMarginPercent: number;
  priceBreakdown: {
    label: string;
    amount: number;
    percentOfPrice: number;
  }[];
}

export function calculateSalonPricing(input: SalonPricingInput): SalonPricingResult {
  const {
    productCostPerService,
    chairTimeMinutes,
    stylistHourlyRate,
    salonOverheadPercent,
    desiredProfitMargin,
  } = input;

  const laborCost = (chairTimeMinutes / 60) * stylistHourlyRate;
  const overheadCost = (laborCost + productCostPerService) * (salonOverheadPercent / 100);
  const totalCost = productCostPerService + laborCost + overheadCost;

  const targetPrice =
    desiredProfitMargin >= 100
      ? totalCost * 100
      : totalCost / (1 - desiredProfitMargin / 100);

  const recommendedPrice = Math.max(Number(targetPrice.toFixed(2)), Number(totalCost.toFixed(2)) + 0.01);
  const profitPerService = Number((recommendedPrice - totalCost).toFixed(2));
  const profitMarginPercent = Number(((profitPerService / recommendedPrice) * 100).toFixed(2));

  return {
    recommendedPrice,
    laborCost: Number(laborCost.toFixed(2)),
    overheadCost: Number(overheadCost.toFixed(2)),
    productCost: Number(productCostPerService.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    profitPerService,
    profitMarginPercent,
    priceBreakdown: [
      { label: "Product Cost", amount: Number(productCostPerService.toFixed(2)), percentOfPrice: Number(((productCostPerService / recommendedPrice) * 100).toFixed(2)) },
      { label: "Labor Cost", amount: Number(laborCost.toFixed(2)), percentOfPrice: Number(((laborCost / recommendedPrice) * 100).toFixed(2)) },
      { label: "Overhead Cost", amount: Number(overheadCost.toFixed(2)), percentOfPrice: Number(((overheadCost / recommendedPrice) * 100).toFixed(2)) },
      { label: "Profit", amount: profitPerService, percentOfPrice: profitMarginPercent },
    ],
  };
}
