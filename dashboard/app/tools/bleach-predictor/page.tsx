import type { Metadata } from "next";
import { BleachPredictorCalculator } from "@/components/tools/BleachPredictorCalculator";

export const metadata: Metadata = {
  title: "Bleach Level Predictor | ColorGenius",
  description: "Predict bleach lift levels, risk, and technique recommendations based on starting level, developer, time, and hair condition. Free tool by ColorGenius.",
  openGraph: {
    title: "Bleach Level Predictor | ColorGenius",
    description: "Lift smarter with risk-aware bleach predictions.",
  },
};

export default function BleachPredictorPage() {
  return (
    <div
      className="min-h-screen p-4 pt-20 md:p-8 md:pt-8"
      style={{ background: "var(--cg-bg-deep)", color: "var(--cg-text-primary)" }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl" style={{ color: "var(--cg-text-primary)" }}>
            Bleach Level Predictor
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--cg-text-secondary)" }}>
            Estimate lift, assess risk, and choose the safest technique for every bleaching service.
          </p>
        </div>
        <BleachPredictorCalculator />
      </div>
    </div>
  );
}
