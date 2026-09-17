"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Palette,
  AlertCircle,
  CheckCircle2,
  Droplets,
  Info,
  Clock,
} from "lucide-react";
import {
  colorCorrectionSchema,
  type ColorCorrectionInput,
  type ColorCorrectionResult,
  calculateColorCorrection,
} from "@/app/api/tools/color-correction/route";
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

const toneOptions = [
  { value: "orange", label: "Orange" },
  { value: "brass", label: "Brass" },
  { value: "yellow", label: "Yellow" },
  { value: "red", label: "Red" },
];

const targetToneOptions = [
  { value: "ash", label: "Ash" },
  { value: "beige", label: "Beige" },
  { value: "neutral", label: "Neutral" },
  { value: "cool", label: "Cool" },
  { value: "warm", label: "Warm" },
  { value: "violet", label: "Violet" },
];

export function ColorCorrectionCalculator({ className }: { className?: string }) {
  const [apiResult, setApiResult] = useState<ColorCorrectionResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const form = useForm<z.infer<typeof colorCorrectionSchema>>({
    resolver: zodResolver(colorCorrectionSchema),
    defaultValues: {
      unwantedTone: "orange",
      currentLevel: 7,
      targetTone: "ash",
    },
    mode: "onChange",
  });

  const values = form.watch();

  const clientResult = useMemo<ColorCorrectionResult>(() => {
    const parsed = colorCorrectionSchema.safeParse(values);
    if (!parsed.success) {
      return {
        correctorShade: "",
        technique: "",
        developerRecommendation: 10,
        reasoning: [],
        processingTimeMinutes: 15,
      };
    }
    return calculateColorCorrection(parsed.data);
  }, [values]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const parsed = colorCorrectionSchema.safeParse(form.getValues());
      if (!parsed.success) {
        setApiResult(null);
        return;
      }
      setStatus("loading");
      try {
        const res = await fetch("/api/tools/color-correction", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        if (!res.ok) throw new Error("API calculation failed");
        const data = (await res.json()) as ColorCorrectionResult;
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
      <Card
        className="border border-white/[0.06]"
        style={{ background: "var(--cg-surface)", color: "var(--cg-text-primary)" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Palette className="h-5 w-5 text-[#9333EA]" />
            Color Correction Calculator
          </CardTitle>
          <CardDescription style={{ color: "var(--cg-text-secondary)" }}>
            Identify the right corrector shade, technique, and developer to neutralize unwanted tones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="unwantedTone" style={{ color: "var(--cg-text-primary)" }}>
                Unwanted Tone
              </Label>
              <div className="relative">
                <select
                  id="unwantedTone"
                  {...form.register("unwantedTone")}
                  className="flex h-10 w-full appearance-none rounded-md border border-white/[0.06] bg-[#0A0A0F] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                  style={{ color: "var(--cg-text-primary)" }}
                >
                  {toneOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Palette className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentLevel" style={{ color: "var(--cg-text-primary)" }}>
                Current Level (1-10)
              </Label>
              <Input
                id="currentLevel"
                type="number"
                min={1}
                max={10}
                {...form.register("currentLevel", { valueAsNumber: true })}
                className="border-white/[0.06] bg-[#0A0A0F]"
                style={{ color: "var(--cg-text-primary)" }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetTone" style={{ color: "var(--cg-text-primary)" }}>
                Target Tone
              </Label>
              <div className="relative">
                <select
                  id="targetTone"
                  {...form.register("targetTone")}
                  className="flex h-10 w-full appearance-none rounded-md border border-white/[0.06] bg-[#0A0A0F] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                  style={{ color: "var(--cg-text-primary)" }}
                >
                  {targetToneOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Droplets className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
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
                Correction Plan
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

            <div className="mb-4 text-center">
              <p className="text-sm" style={{ color: "var(--cg-text-secondary)" }}>
                Corrector Shade
              </p>
              <p
                className="text-3xl font-bold"
                style={{
                  background: "var(--cg-gradient-teal)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {result.correctorShade}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ResultPill icon={Droplets} label="Developer" value={`${result.developerRecommendation} vol`} />
              <ResultPill icon={Clock} label="Processing Time" value={`${result.processingTimeMinutes} min`} />
            </div>

            <div className="mt-4 rounded-lg p-4" style={{ background: "rgba(147,51,234,0.06)" }}>
              <p className="mb-2 text-sm font-semibold" style={{ color: "var(--cg-text-primary)" }}>
                Technique
              </p>
              <p className="text-sm" style={{ color: "var(--cg-text-secondary)" }}>
                {result.technique}
              </p>
            </div>

            {result.reasoning.length > 0 && (
              <ul className="mt-4 space-y-2">
                {result.reasoning.map((reason, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: "var(--cg-text-secondary)" }}
                  >
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#9333EA]" />
                    {reason}
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
