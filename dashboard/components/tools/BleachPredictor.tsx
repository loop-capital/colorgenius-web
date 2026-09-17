"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Sun, Clock, AlertTriangle, CheckCircle2, ChevronDown, ShieldAlert, Sparkles } from "lucide-react";
import { bleachPredictorSchema, type BleachPredictorInput, type BleachPredictorResult } from "@/app/api/tools/bleach-predictor/route";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const conditionOptions = [
  { value: "healthy", label: "Healthy / Virgin" },
  { value: "processed", label: "Processed / Colored" },
  { value: "damaged", label: "Damaged / Fragile" },
];

const developerOptions = [10, 20, 30, 40];

export function BleachPredictor({ className }: { className?: string }) {
  const [apiResult, setApiResult] = useState<BleachPredictorResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const form = useForm<z.infer<typeof bleachPredictorSchema>>({
    resolver: zodResolver(bleachPredictorSchema),
    defaultValues: {
      startingLevel: 4,
      developerVolume: 30,
      processingTimeMinutes: 30,
      hairCondition: "healthy",
    },
    mode: "onChange",
  });

  const values = form.watch();

  const clientResult = useMemo<BleachPredictorResult>(() => {
    const parsed = bleachPredictorSchema.safeParse(values);
    if (!parsed.success) {
      return {
        predictedLevel: 1,
        liftLevels: 0,
        risk: "low",
        riskColor: "#10B981",
        recommendedTechnique: "",
        processingGuidance: "",
        notes: [],
      };
    }
    return calculateBleachPredictionClient(parsed.data);
  }, [values]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const parsed = bleachPredictorSchema.safeParse(form.getValues());
      if (!parsed.success) {
        setApiResult(null);
        return;
      }
      setStatus("loading");
      try {
        const res = await fetch("/api/tools/bleach-predictor", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        if (!res.ok) throw new Error("API calculation failed");
        const data = (await res.json()) as BleachPredictorResult;
        if (!cancelled) {
          setApiResult(data);
          setStatus("idle");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setApiResult(null);
        }
      }
    };
    const subscription = form.watch(() => run());
    run();
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [form]);

  const result = apiResult ?? clientResult;

  return (
    <div className={cn("mx-auto w-full max-w-3xl", className)}>
      <Card className="border border-white/[0.06]" style={{ background: "var(--cg-surface)", color: "var(--cg-text-primary)" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Sun className="h-5 w-5 text-[#9333EA]" />
            Bleach Level Predictor
          </CardTitle>
          <CardDescription style={{ color: "var(--cg-text-secondary)" }}>
            Predict lift level and assess risk before bleaching based on starting level, developer, timing, and hair condition.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startingLevel" style={{ color: "var(--cg-text-primary)" }}>Starting Level</Label>
              <Input
                id="startingLevel"
                type="number"
                min={1}
                max={10}
                {...form.register("startingLevel", { valueAsNumber: true })}
                className="border-white/[0.06] bg-[#0A0A0F]"
                style={{ color: "var(--cg-text-primary)" }}
              />
              {form.formState.errors.startingLevel && <p className="text-xs text-red-400">{form.formState.errors.startingLevel.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="developerVolume" style={{ color: "var(--cg-text-primary)" }}>Developer Volume</Label>
              <div className="relative">
                <select
                  id="developerVolume"
                  {...form.register("developerVolume", { valueAsNumber: true })}
                  className="flex h-10 w-full appearance-none rounded-md border border-white/[0.06] bg-[#0A0A0F] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                  style={{ color: "var(--cg-text-primary)" }}
                >
                  {developerOptions.map((vol) => (
                    <option key={vol} value={vol}>{vol} vol</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="processingTimeMinutes" style={{ color: "var(--cg-text-primary)" }}>Processing Time (min)</Label>
              <Input
                id="processingTimeMinutes"
                type="number"
                min={5}
                max={60}
                {...form.register("processingTimeMinutes", { valueAsNumber: true })}
                className="border-white/[0.06] bg-[#0A0A0F]"
                style={{ color: "var(--cg-text-primary)" }}
              />
              {form.formState.errors.processingTimeMinutes && <p className="text-xs text-red-400">{form.formState.errors.processingTimeMinutes.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hairCondition" style={{ color: "var(--cg-text-primary)" }}>Hair Condition</Label>
              <div className="relative">
                <select
                  id="hairCondition"
                  {...form.register("hairCondition")}
                  className="flex h-10 w-full appearance-none rounded-md border border-white/[0.06] bg-[#0A0A0F] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                  style={{ color: "var(--cg-text-primary)" }}
                >
                  {conditionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] p-4 md:p-6" style={{ background: "linear-gradient(180deg, rgba(30,30,45,0.8) 0%, rgba(22,22,32,0.95) 100%)" }}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--cg-text-secondary)" }}>Prediction</h3>
              {status === "loading" && <span className="text-xs" style={{ color: "var(--cg-text-tertiary)" }}>Syncing…</span>}
              {status === "error" && <span className="flex items-center gap-1 text-xs text-red-400"><AlertTriangle className="h-3 w-3" /> Offline calc</span>}
              {apiResult && status !== "loading" && <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Synced</span>}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ResultPill icon={Sparkles} label="Predicted Level" value={`Level ${result.predictedLevel}`} />
              <ResultPill icon={Sun} label="Estimated Lift" value={`+${result.liftLevels.toFixed(1)} levels`} />
              <ResultPill icon={ShieldAlert} label="Risk" value={result.risk} highlight color={result.riskColor} />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-white/[0.06] p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="mb-1 text-xs uppercase tracking-wider" style={{ color: "var(--cg-text-tertiary)" }}>Recommended Technique</p>
                <p className="text-sm" style={{ color: "var(--cg-text-primary)" }}>{result.recommendedTechnique || "—"}</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="mb-1 text-xs uppercase tracking-wider" style={{ color: "var(--cg-text-tertiary)" }}>Processing Guidance</p>
                <p className="text-sm" style={{ color: "var(--cg-text-primary)" }}>{result.processingGuidance || "—"}</p>
              </div>
            </div>

            {result.notes.length > 0 && (
              <ul className="space-y-2">
                {result.notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--cg-text-secondary)" }}>
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F59E0B]" />
                    {note}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={() => form.reset()} variant="outline" className="border-white/[0.06]" style={{ color: "var(--cg-text-primary)" }}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultPill({
  icon: Icon,
  label,
  value,
  highlight,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div className="rounded-lg p-4" style={{ background: highlight && color ? `${color}20` : "rgba(147,51,234,0.08)" }}>
      <div className="mb-2 flex items-center gap-2" style={{ color: "var(--cg-text-tertiary)" }}>
        <Icon className="h-4 w-4" style={color ? { color } : undefined} />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold" style={{ color: highlight && color ? color : "var(--cg-text-primary)" }}>{value}</p>
    </div>
  );
}

function calculateBleachPredictionClient(input: BleachPredictorInput): BleachPredictorResult {
  const { startingLevel, developerVolume, processingTimeMinutes, hairCondition } = input;
  const maxLiftPerVolume: Record<number, number> = { 10: 1, 20: 2, 30: 3, 40: 4 };
  const baseLift = maxLiftPerVolume[developerVolume] ?? 1;
  const timeFactor = Math.min(processingTimeMinutes / 30, 1);
  const conditionFactor = { healthy: 1, processed: 0.85, damaged: 0.65 }[hairCondition];
  const estimatedLift = baseLift * (0.4 + 0.6 * timeFactor) * conditionFactor;
  const liftLevels = Math.max(0, Math.round(estimatedLift * 10) / 10);
  let predictedLevel = Math.max(1, Math.min(10, startingLevel - Math.floor(liftLevels)));
  if (predictedLevel === startingLevel && liftLevels >= 0.5) predictedLevel = Math.max(1, predictedLevel - 1);

  let risk: "low" | "moderate" | "high" | "extreme" = "low";
  let riskColor = "#10B981";
  if (developerVolume === 40 || processingTimeMinutes > 45 || (hairCondition === "damaged" && developerVolume >= 30)) {
    risk = "extreme"; riskColor = "#EF4444";
  } else if (developerVolume >= 30 || processingTimeMinutes > 35 || hairCondition === "damaged") {
    risk = "high"; riskColor = "#F59E0B";
  } else if (developerVolume >= 20 || processingTimeMinutes > 25 || hairCondition === "processed") {
    risk = "moderate"; riskColor = "#FBBF24";
  }

  const techniques: Record<typeof input.hairCondition, string> = {
    healthy: "Full-head or virgin application with standard foiling.",
    processed: "Low-and-slow foiling; consider bond builder and lower developer.",
    damaged: "Baby lights or balayage with 10–20 vol only; mandatory bond builder.",
  };

  const processingGuidance = processingTimeMinutes > 30
    ? "Check every 5 minutes after 30 min. Do not exceed manufacturer maximums."
    : "Check at 15 and 25 minutes for even lift.";

  const notes: string[] = [];
  if (hairCondition === "damaged" && developerVolume >= 30) notes.push("High developer on damaged hair greatly increases breakage risk — use bond builder and lower vol.");
  if (processingTimeMinutes > 45) notes.push("Extended processing time can cause severe damage; rinse immediately if elasticity is lost.");
  if (predictedLevel <= 4 && startingLevel > 6) notes.push("Achieving very light results from a darker base may require multiple sessions.");

  return { predictedLevel, liftLevels, risk, riskColor, recommendedTechnique: techniques[hairCondition], processingGuidance, notes };
}
