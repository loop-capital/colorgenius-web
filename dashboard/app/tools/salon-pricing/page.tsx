import type { Metadata } from "next";
import { SalonPricingCalculator } from "@/components/tools/SalonPricingCalculator";

export const metadata: Metadata = {
  title: "Salon Pricing Calculator | ColorGenius",
  description: "Calculate recommended hair service pricing from product cost, chair time, stylist rate, overhead, and desired profit margin. Free salon tool by ColorGenius.",
  openGraph: {
    title: "Salon Pricing Calculator | ColorGenius",
    description: "Set profitable prices for every salon service.",
  },
};

export default function SalonPricingPage() {
  return (
    <div
      className="min-h-screen p-4 pt-20 md:p-8 md:pt-8"
      style={{ background: "var(--cg-bg-deep)", color: "var(--cg-text-primary)" }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl" style={{ color: "var(--cg-text-primary)" }}>
            Salon Pricing Calculator
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--cg-text-secondary)" }}>
            Input your real costs and target margin to get a recommended service price with a full cost breakdown.
          </p>
        </div>
        <SalonPricingCalculator />
      </div>
    </div>
  );
}
