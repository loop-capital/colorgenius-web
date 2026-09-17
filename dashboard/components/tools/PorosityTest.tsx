"use client";

import { useEffect, useMemo, useState } from "react";
import { Droplets, RefreshCcw, ChevronRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { porosityQuestions, type PorosityTestInput, type PorosityTestResult, type PorosityLevel } from "@/lib/tools/porosity-test";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const levelColor: Record<PorosityLevel, string> = {
  low: "#3B82F6",
  medium: "#10B981",
  high: "#F59E0B",
};

export function PorosityTest({ className }: { className?: string }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [apiResult, setApiResult] = useState<PorosityTestResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === porosityQuestions.length;

  const clientResult = useMemo<PorosityTestResult | null>(() => {
    if (!isComplete) return null;
    return calculatePorosityClient({ answers });
  }, [answers, isComplete]);

  useEffect(() => {
    if (!isComplete) {
      setApiResult(null);
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetch("/api/tools/porosity-test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ answers }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("API failed"))))
      .then((data) => {
        if (!cancelled) {
          setApiResult(data as PorosityTestResult);
          setStatus("idle");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [answers, isComplete]);

  const result = apiResult ?? clientResult;

  const handleSelect = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const reset = () => {
    setAnswers({});
    setApiResult(null);
    setStatus("idle");
  };

  return (
    <div className={cn("mx-auto w-full max-w-3xl", className)}>
      <Card className="border border-white/[0.06]" style={{ background: "var(--cg-surface)", color: "var(--cg-text-primary)" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Droplets className="h-5 w-5 text-[#9333EA]" />
            Hair Porosity Test
          </CardTitle>
          <CardDescription style={{ color: "var(--cg-text-secondary)" }}>
            Answer 5 quick questions to discover your client’s hair porosity and get tailored product + routine recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--cg-text-secondary)" }}>
              Progress
            </span>
            <span className="text-xs" style={{ color: "var(--cg-text-tertiary)" }}>
              {answeredCount} / {porosityQuestions.length}
            </span>
          </div>
          <div className="mb-4 h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(answeredCount / porosityQuestions.length) * 100}%`,
                background: "linear-gradient(90deg, #9333EA, #EC4899)",
              }}
            />
          </div>

          <div className="space-y-5">
            {porosityQuestions.map((q) => (
              <div key={q.id} className="space-y-3">
                <p className="text-sm font-medium" style={{ color: "var(--cg-text-primary)" }}>
                  {q.question}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.score;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(q.id, opt.score)}
                        className={cn(
                          "rounded-lg border px-4 py-3 text-left text-sm transition-all hover:bg-white/[0.03]",
                          selected && "border-[#9333EA] bg-[rgba(147,51,234,0.12)]"
                        )}
                        style={{ borderColor: selected ? "#9333EA" : "rgba(255,255,255,0.06)", color: "var(--cg-text-primary)" }}
                      >
                        <span className="flex items-center justify-between">
                          {opt.label}
                          {selected && <CheckCircle2 className="h-4 w-4 text-[#9333EA]" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {result && (
            <div
              className="mt-6 rounded-xl border border-white/[0.06] p-4 md:p-6"
              style={{ background: "linear-gradient(180deg, rgba(30,30,45,0.8) 0%, rgba(22,22,32,0.95) 100%)" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--cg-text-secondary)" }}>
                  Result
                </h3>
                {status === "loading" && <span className="text-xs" style={{ color: "var(--cg-text-tertiary)" }}>Syncing…</span>}
                {status === "error" && <span className="flex items-center gap-1 text-xs text-red-400"><AlertCircle className="h-3 w-3" /> Offline calc</span>}
                {apiResult && status !== "loading" && <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Synced</span>}
              </div>

              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: `${levelColor[result.level]}20`, color: levelColor[result.level] }}
                >
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider" style={{ color: "var(--cg-text-secondary)" }}>Porosity Level</p>
                  <p className="text-2xl font-bold capitalize" style={{ color: levelColor[result.level] }}>
                    {result.level}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs uppercase tracking-wider" style={{ color: "var(--cg-text-secondary)" }}>Score</p>
                  <p className="text-xl font-bold" style={{ color: "var(--cg-text-primary)" }}>
                    {result.score} / {result.maxScore}
                  </p>
                </div>
              </div>

              <p className="mb-4 text-sm" style={{ color: "var(--cg-text-secondary)" }}>{result.description}</p>

              <div className="mb-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--cg-text-tertiary)" }}>
                  Product Recommendations
                </h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--cg-text-secondary)" }}>
                      <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#9333EA]" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--cg-text-tertiary)" }}>
                  Care Routine
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.routine.map((step, i) => (
                    <span
                      key={i}
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{ background: "rgba(147,51,234,0.12)", color: "var(--cg-text-primary)" }}
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={reset} variant="outline" className="border-white/[0.06]" style={{ color: "var(--cg-text-primary)" }}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Retake Test
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function calculatePorosityClient(input: PorosityTestInput): PorosityTestResult {
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
