"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DollarSign, Clock, TrendingUp, PieChart, AlertCircle, CheckCircle2 } from "lucide-react";
import { salonPricingSchema, type SalonPricingInput, type SalonPricingResult } from "@/app/api/tools/salon-pricing/route";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SalonPricingCalculator({ className }: { className?: string }) {
  const [apiResult, setApiResult] = useState<SalonPricingResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const form = useForm<SalonPricingInput>({
    resolver: zodResolver(salonPricingSchema),
    defaultValues: {
      productCostPerService: 8.5,
      chairTimeMinutes: 90,
      stylistHourlyRate: 35,
      salonOverheadPercent: 25,
      desiredProfitMargin: 55,
    },
    mode: "onChange",
  });

  const values = form.watch();

  const clientResult = useMemo<SalonPricingResult>(() => {
    const parsed = salonPricingSchema.safeParse(values);
    if (!parsed.success) {
      return {
        recommendedPrice: 0,
        laborCost: 0,
        overheadCost: 0,
        productCost: 0,
        totalCost: 0,
        profitPerService: 0,
        profitMarginPercent: 0,
        priceBreakdown: [],
      };
    }
    return calculateSalonPricingClient(parsed.data);
  }, [values]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const parsed = salonPricingSchema.safeParse(form.getValues());
      if (!parsed.success) {
        if (!cancelled) setApiResult(null);
        return;
      }
      if (!cancelled) setStatus("loading");
      try {
        const res = await fetch("/api/tools/salon-pricing", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        if (!res.ok) throw new Error("API calculation failed");
        const data = await res.json();
        if (!cancelled) {
          setApiResult(data as SalonPricingResult);
          setStatus("idle");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    };
    run();
    const subscription = form.watch(() => run());
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
            <DollarSign className="h-5 w-5 text-[#9333EA]" />
            Salon Pricing Calculator
          </CardTitle>
          <CardDescription style={{ color: "var(--cg-text-secondary)" }}>
            Calculate a recommended service price from product cost, chair time, stylist rate, overhead, and target margin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              id="productCostPerService"
              label="Product Cost per Service"
              prefix="$"
              type="number"
              step="0.01"
              error={form.formState.errors.productCostPerService?.message}
              {...form.register("productCostPerService", { valueAsNumber: true })}
            />
            <Field
              id="chairTimeMinutes"
              label="Chair Time (minutes)"
              suffix="min"
              type="number"
              error={form.formState.errors.chairTimeMinutes?.message}
              {...form.register("chairTimeMinutes", { valueAsNumber: true })}
            />
            <Field
              id="stylistHourlyRate"
              label="Stylist Hourly Rate"
              prefix="$"
              type="number"
              step="0.01"
              error={form.formState.errors.stylistHourlyRate?.message}
              {...form.register("stylistHourlyRate", { valueAsNumber: true })}
            />
            <Field
              id="salonOverheadPercent"
              label="Salon Overhead"
              suffix="%"
              type="number"
              error={form.formState.errors.salonOverheadPercent?.message}
              {...form.register("salonOverheadPercent", { valueAsNumber: true })}
            />
            <Field
              id="desiredProfitMargin"
              label="Desired Profit Margin"
              suffix="%"
              type="number"
              error={form.formState.errors.desiredProfitMargin?.message}
              {...form.register("desiredProfitMargin", { valueAsNumber: true })}
            />
          </div>

          <div className="rounded-xl border border-white/[0.06] p-4 md:p-6" style={{ background: "linear-gradient(180deg, rgba(30,30,45,0.8) 0%, rgba(22,22,32,0.95) 100%)" }}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--cg-text-secondary)" }}>Pricing Recommendation</h3>
              {status === "loading" && <span className="text-xs" style={{ color: "var(--cg-text-tertiary)" }}>Syncing…</span>}
              {status === "error" && <span className="flex items-center gap-1 text-xs text-red-400"><AlertCircle className="h-3 w-3" /> Offline calc</span>}
              {apiResult && status !== "loading" && <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Synced</span>}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ResultPill icon={DollarSign} label="Recommended Price" value={`$${result.recommendedPrice.toFixed(2)}`} highlight />
              <ResultPill icon={TrendingUp} label="Profit / Service" value={`$${result.profitPerService.toFixed(2)}`} />
              <ResultPill icon={PieChart} label="Profit Margin" value={`${result.profitMarginPercent.toFixed(1)}%`} />
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--cg-text-tertiary)" }}>Cost Breakdown</h4>
              {result.priceBreakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="w-24 text-sm" style={{ color: "var(--cg-text-secondary)" }}>{item.label}</span>
                  <div className="flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)", height: "8px" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(item.percentOfPrice, 100)}%`,
                        background: item.label === "Profit" ? "linear-gradient(90deg, #10B981, #34D399)" : "linear-gradient(90deg, #9333EA, #EC4899)",
                      }}
                    />
                  </div>
                  <span className="w-24 text-right text-sm font-medium" style={{ color: "var(--cg-text-primary)" }}>
                    ${item.amount.toFixed(2)} ({item.percentOfPrice.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
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

function Field({
  id,
  label,
  prefix,
  suffix,
  error,
  ...props
}: {
  id: string;
  label: string;
  prefix?: string;
  suffix?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} style={{ color: "var(--cg-text-primary)" }}>{label}</Label>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--cg-text-tertiary)" }}>{prefix}</span>}
        <Input
          id={id}
          className={cn("border-white/[0.06] bg-[#0A0A0F]", prefix && "pl-7", suffix && "pr-10")}
          style={{ color: "var(--cg-text-primary)" }}
          {...props}
        />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--cg-text-tertiary)" }}>{suffix}</span>}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function ResultPill({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg p-4" style={{ background: highlight ? "rgba(147,51,234,0.12)" : "rgba(147,51,234,0.08)" }}>
      <div className="mb-2 flex items-center gap-2" style={{ color: "var(--cg-text-tertiary)" }}>
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold" style={{ color: "var(--cg-text-primary)" }}>{value}</p>
    </div>
  );
}

function calculateSalonPricingClient(input: SalonPricingInput): SalonPricingResult {
  const { productCostPerService, chairTimeMinutes, stylistHourlyRate, salonOverheadPercent, desiredProfitMargin } = input;
  const laborCost = (chairTimeMinutes / 60) * stylistHourlyRate;
  const overheadCost = (laborCost + productCostPerService) * (salonOverheadPercent / 100);
  const totalCost = productCostPerService + laborCost + overheadCost;
  const targetPrice = desiredProfitMargin >= 100 ? totalCost * 100 : totalCost / (1 - desiredProfitMargin / 100);
  const recommendedPrice = Math.max(Number(targetPrice.toFixed(2)), Number(totalCost.toFixed(2)) + 0.01);
  const profitPerService = Number((recommendedPrice - totalCost).toFixed(2));
  const profitMarginPercent = Number(((profitPerService / recommendedPrice) * 100).toFixed(2));

  return {
    recommendedPrice,
    laborCost: Number(laborCost.toFixed(2)),
    overheadCost: Number(overheadCost.toFixed(2)),
    productCost: Number(productCostPerService.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    profitPerService,
    profitMarginPercent,
    priceBreakdown: [
      { label: "Product Cost", amount: Number(productCostPerService.toFixed(2)), percentOfPrice: Number(((productCostPerService / recommendedPrice) * 100).toFixed(2)) },
      { label: "Labor Cost", amount: Number(laborCost.toFixed(2)), percentOfPrice: Number(((laborCost / recommendedPrice) * 100).toFixed(2)) },
      { label: "Overhead Cost", amount: Number(overheadCost.toFixed(2)), percentOfPrice: Number(((overheadCost / recommendedPrice) * 100).toFixed(2)) },
      { label: "Profit", amount: profitPerService, percentOfPrice: profitMarginPercent },
    ],
  };
}
