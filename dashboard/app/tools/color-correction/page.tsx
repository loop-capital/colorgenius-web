import type { Metadata } from "next";
import { ColorCorrectionCalculator } from "@/components/tools/ColorCorrectionCalculator";

export const metadata: Metadata = {
  title: "Color Correction Calculator | ColorGenius",
  description: "Find the right corrector shade, technique, and developer recommendation to neutralize orange, brass, yellow, or red tones. Free tool by ColorGenius.",
  openGraph: {
    title: "Color Correction Calculator | ColorGenius",
    description: "Neutralize unwanted tones with the right corrector.",
  },
};

export default function ColorCorrectionPage() {
  return (
    <div
      className="min-h-screen p-4 pt-20 md:p-8 md:pt-8"
      style={{ background: "var(--cg-bg-deep)", color: "var(--cg-text-primary)" }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl" style={{ color: "var(--cg-text-primary)" }}>
            Color Correction Calculator
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--cg-text-secondary)" }}>
            Match unwanted tones to the complementary corrector shade and technique.
          </p>
        </div>
        <ColorCorrectionCalculator />
      </div>
    </div>
  );
}
