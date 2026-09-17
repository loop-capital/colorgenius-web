import { z } from "zod";
import { parseToolBody, toolResponse, toolError } from "@/lib/tools/calculator-utils";

export const porosityTestSchema = z.object({
  answers: z.record(z.coerce.number().int().min(0).max(2)),
});

export type PorosityTestInput = z.infer<typeof porosityTestSchema>;
export type PorosityLevel = "low" | "medium" | "high";

export interface PorosityQuestion {
  id: string;
  question: string;
  options: { value: string; label: string; score: number }[];
}

export interface PorosityTestResult {
  level: PorosityLevel;
  score: number;
  maxScore: number;
  percentage: number;
  description: string;
  recommendations: string[];
  routine: string[];
}

export const porosityQuestions: PorosityQuestion[] = [
  {
    id: "water",
    question: "When your hair is wet, water tends to…",
    options: [
      { value: "beads", label: "Bead up and roll off", score: 0 },
      { value: "normal", label: "Absorb at a normal rate", score: 1 },
      { value: "absorb", label: "Absorb quickly", score: 2 },
    ],
  },
  {
    id: "product",
    question: "Products feel like they…",
    options: [
      { value: "sit", label: "Sit on top of the hair", score: 0 },
      { value: "normal", label: "Penetrate after a few minutes", score: 1 },
      { value: "absorb", label: "Absorb instantly", score: 2 },
    ],
  },
  {
    id: "dry",
    question: "Air-drying time is…",
    options: [
      { value: "long", label: "Very long (4+ hours)", score: 0 },
      { value: "normal", label: "Average (1–3 hours)", score: 1 },
      { value: "short", label: "Very fast (under 1 hour)", score: 2 },
    ],
  },
  {
    id: "shine",
    question: "Natural shine level is…",
    options: [
      { value: "high", label: "High shine but prone to frizz", score: 0 },
      { value: "balanced", label: "Balanced", score: 1 },
      { value: "dull", label: "Dull or prone to breakage", score: 2 },
    ],
  },
  {
    id: "color",
    question: "Color tends to…",
    options: [
      { value: "resist", label: "Resist processing or look patchy", score: 0 },
      { value: "normal", label: "Process predictably", score: 1 },
      { value: "fade", label: "Fade quickly", score: 2 },
    ],
  },
];

export function calculatePorosity(input: PorosityTestInput): PorosityTestResult {
  const maxScore = porosityQuestions.length * 2;
  let score = 0;
  for (const q of porosityQuestions) {
    const answer = input.answers[q.id];
    if (answer != null) score += answer;
  }

  let level: PorosityLevel = "medium";
  if (score <= 3) level = "low";
  else if (score >= 7) level = "high";
  else level = "medium";

  const percentage = Math.round((score / maxScore) * 100);

  const descriptions: Record<PorosityLevel, string> = {
    low: "Cuticle is tightly closed. Hair resists moisture and product absorption and can feel greasy at the roots.",
    medium: "Cuticle is balanced. Hair accepts moisture and product at a normal rate and is generally resilient.",
    high: "Cuticle is lifted or damaged. Hair absorbs moisture and product quickly but also loses it fast, leading to dryness and fragility.",
  };

  const recommendations: Record<PorosityLevel, string[]> = {
    low: [
      "Use lightweight, liquid-based leave-ins and avoid heavy oils near roots.",
      "Apply products on damp hair to help penetration.",
      "Clarify periodically to remove buildup.",
    ],
    medium: [
      "Maintain a balanced routine with occasional protein and regular moisture.",
      "Use heat protection before thermal styling.",
      "Deep condition weekly based on seasonal needs.",
    ],
    high: [
      "Prioritize protein-moisture balance with bonding treatments.",
      "Seal with heavier creams or oils on ends.",
      "Avoid excessive heat and overwashing.",
    ],
  };

  const routines: Record<PorosityLevel, string[]> = {
    low: ["Clarify shampoo", "Lightweight conditioner", "Heat-activated treatments"],
    medium: ["Balanced shampoo", "Weekly mask", "Heat protectant"],
    high: ["Repair/bonding shampoo", "Protein + moisture mask", "Leave-in sealant"],
  };

  return {
    level,
    score,
    maxScore,
    percentage,
    description: descriptions[level],
    recommendations: recommendations[level],
    routine: routines[level],
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
  return toolResponse({ questions: porosityQuestions });
}
