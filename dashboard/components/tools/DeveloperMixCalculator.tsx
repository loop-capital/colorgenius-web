"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  FlaskConical,
  Clock,
  Droplets,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { developerMixSchema, type DeveloperMixInput, type DeveloperMixResult } from "@/app/api/tools/developer-mix/route";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const coverageOptions = [
  { value: "partial", label: "Partial / Refresh" },
  { value: "full", label: "Full Coverage" },
];

export function DeveloperMixCalculator({ className }: { className?: string }) {
  const [apiResult, setApiResult] = useState<DeveloperMixResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const form = useForm<z.infer<typeof developerMixSchema>>({
    resolver: zodResolver(developerMixSchema),
    defaultValues: {
      startingLevel: 5,
      targetLevel: 7,
      grayPercentage: 25,
      desiredCoverage: "partial",
    },
    mode: "onChange",
  });

  const values = form.watch();

  const clientResult = useMemo<DeveloperMixResult>(() => {
    const parsed = developerMixSchema.safeParse(values);
    if (!parsed.success) {
      return {
        developerVolume: 20,
        mixRatio: "1:1",
        processingTimeMinutes: 20,
        liftLevels: 0,
        notes: [],
      };
    }
    return {
      ...calculateDeveloperMixClient(parsed.data),
      notes: parsed.data.targetLevel > parsed.data.startingLevel
        ? ["Darkening hair generally does not require lift; use lowest developer."]
        : [],
    };
  }, [values]);

  useEffect(() => {
    const subscription = form.watch(async () => {
      const parsed = developerMixSchema.safeParse(form.getValues());
      if (!parsed.success) {
        setApiResult(null);
        return;
      }
      setStatus("loading");
      try {
        const res = await fetch("/api/tools/developer-mix", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        if (!res.ok) throw new Error("API calculation failed");
        const data = await res.json();
        setApiResult(data as DeveloperMixResult);
        setStatus("idle");
      } catch {
        setStatus("error");
        setApiResult(null);
      }
    });
    (async () => {
      const parsed = developerMixSchema.safeParse(form.getValues());
      if (!parsed.success) return;
      setStatus("loading");
      try {
        const res = await fetch("/api/tools/developer-mix", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        if (!res.ok) throw new Error("API calculation failed");
        const data = await res.json();
        setApiResult(data as DeveloperMixResult);
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    })();
    return () => subscription.unsubscribe();
  }, [form]);

  const result = apiResult ?? clientResult;

  return (
    <div className={cn("mx-auto w-full max-w-3xl", className)}>
      <Card
        className="border border-white/[0.06]"
        style={{ background: "var(--cg-surface)", color: "var(--cg-text-primary)" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <FlaskConical className="h-5 w-5 text-[#9333EA]" />
            Developer Mix Calculator
          </CardTitle>
          <CardDescription style={{ color: "var(--cg-text-secondary)" }}>
            Calculate the exact developer volume, mix ratio, and processing time for your color service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startingLevel" style={{ color: "var(--cg-text-primary)" }}>
                Starting Level
              </Label>
              <Input
                id="startingLevel"
                type="number"
                min={1}
                max={12}
                {...form.register("startingLevel", { valueAsNumber: true })}
                className="border-white/[0.06] bg-[#0A0A0F]"
                style={{ color: "var(--cg-text-primary)" }}
              />
              {form.formState.errors.startingLevel && (
                <p className="text-xs text-red-400">{form.formState.errors.startingLevel.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetLevel" style={{ color: "var(--cg-text-primary)" }}>
                Target Level
              </Label>
              <Input
                id="targetLevel"
                type="number"
                min={1}
                max={12}
                {...form.register("targetLevel", { valueAsNumber: true })}
                className="border-white/[0.06] bg-[#0A0A0F]"
                style={{ color: "var(--cg-text-primary)" }}
              />
              {form.formState.errors.targetLevel && (
                <p className="text-xs text-red-400">{form.formState.errors.targetLevel.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grayPercentage" style={{ color: "var(--cg-text-primary)" }}>
                Gray Percentage (%)
              </Label>
              <Input
                id="grayPercentage"
                type="number"
                min={0}
                max={100}
                {...form.register("grayPercentage", { valueAsNumber: true })}
                className="border-white/[0.06] bg-[#0A0A0F]"
                style={{ color: "var(--cg-text-primary)" }}
              />
              {form.formState.errors.grayPercentage && (
                <p className="text-xs text-red-400">{form.formState.errors.grayPercentage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="desiredCoverage" style={{ color: "var(--cg-text-primary)" }}>
                Desired Coverage
              </Label>
              <div className="relative">
                <select
                  id="desiredCoverage"
                  {...form.register("desiredCoverage")}
                  className="flex h-10 w-full appearance-none rounded-md border border-white/[0.06] bg-[#0A0A0F] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                  style={{ color: "var(--cg-text-primary)" }}
                >
                  {coverageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border border-white/[0.06] p-4 md:p-6"
            style={{ background: "linear-gradient(180deg, rgba(30,30,45,0.8) 0%, rgba(22,22,32,0.95) 100%)" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--cg-text-secondary)" }}>
                Recommendation
              </h3>
              {status === "loading" && (
                <span className="text-xs" style={{ color: "var(--cg-text-tertiary)" }}>
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
                icon={Droplets}
                label="Developer Volume"
                value={`${result.developerVolume} vol`}
              />
              <ResultPill
                icon={FlaskConical}
                label="Mix Ratio"
                value={result.mixRatio}
              />
              <ResultPill
                icon={Clock}
                label="Processing Time"
                value={`${result.processingTimeMinutes} min`}
              />
            </div>

            {result.notes.length > 0 && (
              <ul className="mt-4 space-y-2">
                {result.notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--cg-text-secondary)" }}>
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
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg p-4" style={{ background: "rgba(147,51,234,0.08)" }}>
      <div className="mb-2 flex items-center gap-2" style={{ color: "var(--cg-text-tertiary)" }}>
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold" style={{ color: "var(--cg-text-primary)" }}>
        {value}
      </p>
    </div>
  );
}

function calculateDeveloperMixClient(input: DeveloperMixInput): DeveloperMixResult {
  const { startingLevel, targetLevel, grayPercentage, desiredCoverage } = input;
  const liftLevels = Math.max(0, startingLevel - targetLevel);
  let developerVolume: 10 | 20 | 30 | 40 = 10;

  if (liftLevels >= 4) developerVolume = 40;
  else if (liftLevels >= 3) developerVolume = 30;
  else if (liftLevels >= 1 || grayPercentage > 50) developerVolume = 20;

  if (grayPercentage > 75) developerVolume = 20;

  let mixRatio: "1:1" | "1:1.5" | "1:2" = "1:1";
  if (grayPercentage > 50 || desiredCoverage === "full") {
    mixRatio = grayPercentage > 75 ? "1:2" : "1:1.5";
  } else if (liftLevels >= 3) {
    mixRatio = "1:1.5";
  }

  let processingTimeMinutes = 20;
  if (grayPercentage > 50) processingTimeMinutes += 15;
  if (desiredCoverage === "full") processingTimeMinutes += 5;
  if (developerVolume >= 30) processingTimeMinutes += 5;
  if (liftLevels >= 4) processingTimeMinutes += 5;
  processingTimeMinutes = Math.min(processingTimeMinutes, 45);

  return {
    developerVolume,
    mixRatio,
    processingTimeMinutes,
    liftLevels,
    notes: [],
  };
}
