import type { Metadata } from "next";
import { PorosityTestCalculator } from "@/components/tools/PorosityTestCalculator";

export const metadata: Metadata = {
  title: "Hair Porosity Test | ColorGenius",
  description: "Take our 5-question hair porosity quiz for personalized product recommendations and care tips. Free tool by ColorGenius.",
  openGraph: {
    title: "Hair Porosity Test | ColorGenius",
    description: "Discover your client’s porosity level in under a minute.",
  },
};

export default function PorosityTestPage() {
  return (
    <div
      className="min-h-screen p-4 pt-20 md:p-8 md:pt-8"
      style={{ background: "var(--cg-bg-deep)", color: "var(--cg-text-primary)" }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl" style={{ color: "var(--cg-text-primary)" }}>
            Hair Porosity Test
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--cg-text-secondary)" }}>
            Answer 5 quick questions to identify low, medium, or high porosity and get tailored recommendations.
          </p>
        </div>
        <PorosityTestCalculator />
      </div>
    </div>
  );
}
