import { z } from "zod";
import { parseToolBody, toolResponse, toolError } from "@/lib/tools/calculator-utils";

const porosityQuestionSchema = z.object({
  questionId: z.coerce.number().int().min(0).max(4),
  selectedOption: z.coerce.number().int().min(0).max(2),
});

export const porosityTestSchema = z.object({
  answers: z.array(porosityQuestionSchema).length(5),
});

export type PorosityTestInput = z.infer<typeof porosityTestSchema>;
export type PorosityLevel = "low" | "medium" | "high";

export interface PorosityTestResult {
  porosityLevel: PorosityLevel;
  score: number;
  description: string;
  productRecommendations: string[];
  careTips: string[];
}

export const QUESTIONS = [
  "How long does it take your hair to fully absorb water?",
  "How does your hair feel when wet?",
  "How long does your hair take to air dry?",
  "How does your hair react to product?",
  "How often do you need moisture/protein?",
];

export const OPTIONS = [
  ["Quickly", "Normally", "Slowly / beads up"],
  ["Soft, smooth", "Average texture", "Rough, tangles easily"],
  ["Dries quickly", "Normal drying time", "Takes a long time"],
  ["Absorbs well", "Average absorption", "Sits on top / builds up"],
  ["Needs frequent moisture", "Balanced", "Needs protein, gets weighed down easily"],
];

export function calculatePorosity(input: PorosityTestInput): PorosityTestResult {
  const score = input.answers.reduce((sum, answer) => sum + answer.selectedOption, 0);

  let porosityLevel: PorosityLevel;
  if (score <= 3) porosityLevel = "low";
  else if (score <= 7) porosityLevel = "medium";
  else porosityLevel = "high";

  const descriptions: Record<PorosityLevel, string> = {
    low: "Low porosity hair has a tight cuticle layer. It repels water and product initially, takes longer to dry, and is prone to buildup. Heat helps products penetrate.",
    medium: "Medium porosity hair is balanced. It absorbs and retains moisture well, holds styles, and generally responds predictably to product.",
    high: "High porosity hair has lifted or damaged cuticles. It absorbs moisture quickly but loses it just as fast, tangles easily, and benefits from heavier sealing products and protein.",
  };

  const productRecommendations: Record<PorosityLevel, string[]> = {
    low: [
      "Lightweight, water-based leave-ins",
      "Heat caps or warm towels for deep conditioning",
      "Clarifying shampoo to prevent buildup",
      "Avoid heavy butters and oils as primary moisturizers",
    ],
    medium: [
      "Balanced moisture and protein routine",
      "Weekly conditioning treatments",
      "Lightweight oils for sealing",
      "pH-balanced shampoo and conditioner",
    ],
    high: [
      "Protein reconstructor treatments",
      "Heavy creams and butters for sealing",
      "Acidic rinses to smooth cuticle",
      "Pre-poo oils to reduce porosity exposure",
    ],
  };

  const careTips: Record<PorosityLevel, string[]> = {
    low: [
      "Apply products to damp, warm hair for better absorption",
      "Use indirect heat during deep conditioning",
      "Avoid over-conditioning — buildup will dull hair",
      "Rinse with lukewarm water, not cold",
    ],
    medium: [
      "Maintain a consistent wash and condition routine",
      "Alternate moisture and protein treatments every 2-4 weeks",
      "Protect hair from heat damage with thermal protectant",
      "Regular trims keep ends healthy",
    ],
    high: [
      "Limit chemical services and heat styling",
      "Layer leave-in conditioner + cream + oil for retention",
      "Use lower developer volumes and bond builders when coloring",
      "Sleep on silk or satin to reduce friction",
    ],
  };

  return {
    porosityLevel,
    score,
    description: descriptions[porosityLevel],
    productRecommendations: productRecommendations[porosityLevel],
    careTips: careTips[porosityLevel],
  };
}

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
  return toolError("Use POST with a JSON body to calculate porosity", 405);
}
