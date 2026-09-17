"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  FlaskConical,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Thermometer,
} from "lucide-react";
import {
  bleachPredictorSchema,
  type BleachPredictorInput,
  type BleachPredictorResult,
  calculateBleachPredictor,
} from "@/app/api/tools/bleach-predictor/route";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const conditionOptions = [
  { value: "healthy", label: "Healthy" },
  { value: "normal", label: "Normal" },
  { value: "fragile", label: "Fragile" },
  { value: "compromised", label: "Compromised" },
];

const developerOptions = [
  { value: 10, label: "10 vol" },
  { value: 20, label: "20 vol" },
  { value: 30, label: "30 vol" },
  { value: 40, label: "40 vol" },
];

export function BleachPredictorCalculator({ className }: { className?: string }) {
  const [apiResult, setApiResult] = useState<BleachPredictorResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const form = useForm<z.infer<typeof bleachPredictorSchema>>({
    resolver: zodResolver(bleachPredictorSchema),
    defaultValues: {
      startingLevel: 5,
      developerVolume: 30,
      processingTimeMinutes: 30,
      hairCondition: "normal",
    },
    mode: "onChange",
  });

  const values = form.watch();

  const clientResult = useMemo<BleachPredictorResult>(() => {
    const parsed = bleachPredictorSchema.safeParse(values);
    if (!parsed.success) {
      return {
        predictedLevel: 5,
        liftLevels: 0,
        riskLevel: "low",
        techniqueRecommendation: "",
        developerRecommendation: 20,
        processingRecommendation: 20,
        safetyNotes: [],
      };
    }
    return calculateBleachPredictor(parsed.data);
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

  const riskConfig = {
    low: { color: "#10B981", icon: CheckCircle2, label: "Low Risk" },
    moderate: { color: "#F59E0B", icon: AlertTriangle, label: "Moderate Risk" },
    high: { color: "#EF4444", icon: AlertCircle, label: "High Risk" },
    extreme: { color: "#DC2626", icon: ShieldAlert, label: "Extreme Risk" },
  } as const;
  const risk = riskConfig[result.riskLevel];

  return (
    <div className={cn("mx-auto w-full max-w-3xl", className)}>
      <Card
        className="border border-white/[0.06]"
        style={{ background: "var(--cg-surface)", color: "var(--cg-text-primary)" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <FlaskConical className="h-5 w-5 text-[#9333EA]" />
            Bleach Level Predictor
          </CardTitle>
          <CardDescription style={{ color: "var(--cg-text-secondary)" }}>
            Predict lift, assess risk, and get technique guidance for any bleaching service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startingLevel" style={{ color: "var(--cg-text-primary)" }}>
                Starting Level (1-10)
              </Label>
              <Input
                id="startingLevel"
                type="number"
                min={1}
                max={10}
                {...form.register("startingLevel", { valueAsNumber: true })}
                className="border-white/[0.06] bg-[#0A0A0F]"
                style={{ color: "var(--cg-text-primary)" }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="developerVolume" style={{ color: "var(--cg-text-primary)" }}>
                Developer Volume
              </Label>
              <div className="relative">
                <select
                  id="developerVolume"
                  {...form.register("developerVolume", { valueAsNumber: true })}
                  className="flex h-10 w-full appearance-none rounded-md border border-white/[0.06] bg-[#0A0A0F] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                  style={{ color: "var(--cg-text-primary)" }}
                >
                  {developerOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FlaskConical className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="processingTimeMinutes" style={{ color: "var(--cg-text-primary)" }}>
                Processing Time (min)
              </Label>
              <Input
                id="processingTimeMinutes"
                type="number"
                min={5}
                max={60}
                {...form.register("processingTimeMinutes", { valueAsNumber: true })}
                className="border-white/[0.06] bg-[#0A0A0F]"
                style={{ color: "var(--cg-text-primary)" }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hairCondition" style={{ color: "var(--cg-text-primary)" }}>
                Hair Condition
              </Label>
              <div className="relative">
                <select
                  id="hairCondition"
                  {...form.register("hairCondition")}
                  className="flex h-10 w-full appearance-none rounded-md border border-white/[0.06] bg-[#0A0A0F] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                  style={{ color: "var(--cg-text-primary)" }}
                >
                  {conditionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Thermometer className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border border-white/[0.06] p-4 md:p-6"
            style={{ background: "var(--cg-gradient-card)" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: "var(--cg-text-secondary)" }}
              >
                Prediction
              </h3>
              {status === "loading" && (
                <span style={{ color: "var(--cg-text-tertiary)" }} className="text-xs">
                  Syncing…
                </span>
              )}
              {status === "error" && (
                <span className="flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="h-3 w-3" /> Offline calc
                </span>
              )}
              {apiResult && status !== "loading" && (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Synced
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ResultPill
                icon={FlaskConical}
                label="Predicted Level"
                value={`Level ${result.predictedLevel}`}
              />
              <ResultPill
                icon={Clock}
                label="Lift Levels"
                value={`${result.liftLevels.toFixed(1)} levels`}
              />
              <ResultPill
                icon={risk.icon}
                label="Risk Level"
                value={risk.label}
                valueColor={risk.color}
              />
            </div>

            <div className="mt-4 rounded-lg p-4" style={{ background: "rgba(147,51,234,0.06)" }}>
              <p className="mb-1 text-sm font-semibold" style={{ color: "var(--cg-text-primary)" }}>
                Recommended Technique
              </p>
              <p className="text-sm" style={{ color: "var(--cg-text-secondary)" }}>
                {result.techniqueRecommendation}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs" style={{ color: "var(--cg-text-tertiary)" }}>
                <span className="rounded-full border border-white/[0.06] px-2 py-1">
                  {result.developerRecommendation} vol
                </span>
                <span className="rounded-full border border-white/[0.06] px-2 py-1">
                  {result.processingRecommendation} min max
                </span>
              </div>
            </div>

            {result.safetyNotes.length > 0 && (
              <ul className="mt-4 space-y-2">
                {result.safetyNotes.map((note, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: "var(--cg-text-secondary)" }}
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F59E0B]" />
                    {note}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => form.reset()}
              variant="outline"
              className="border-white/[0.06]"
              style={{ color: "var(--cg-text-primary)" }}
            >
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
  valueColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-lg p-4" style={{ background: "rgba(147,51,234,0.08)" }}>
      <div className="mb-2 flex items-center gap-2" style={{ color: "var(--cg-text-tertiary)" }}>
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold" style={{ color: valueColor ?? "var(--cg-text-primary)" }}>
        {value}
      </p>
    </div>
  );
}
