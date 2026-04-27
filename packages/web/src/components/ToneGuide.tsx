"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface ToneData {
  id: string;
  name: string;
  description: string;
  colorHex: string;
  textColor: string;
  examples: string[];
  bestFor: string[];
  undertone: "warm" | "cool" | "neutral";
}

const TONES: ToneData[] = [
  {
    id: "natural",
    name: "Natural (N)",
    description: "Neutral, balanced base tones without strong warm or cool reflects.",
    colorHex: "#8B7355",
    textColor: "#000000",
    examples: ["3/0", "5/0", "7/0"],
    bestFor: ["Gray coverage", "Natural-looking results", "First-time color clients"],
    undertone: "neutral",
  },
  {
    id: "ash",
    name: "Ash (A)",
    description: "Cool, smoky tones that neutralize warmth and brassiness.",
    colorHex: "#A0A0A0",
    textColor: "#000000",
    examples: ["6/1", "7/1", "8/1"],
    bestFor: ["Neutralizing orange/yellow", "Cool blonde results", "Clients who want 'no warmth'"],
    undertone: "cool",
  },
  {
    id: "gold",
    name: "Gold (G)",
    description: "Warm, rich golden tones that add sunshine and brightness.",
    colorHex: "#DAA520",
    textColor: "#000000",
    examples: ["6/3", "7/3", "8/3"],
    bestFor: ["Adding warmth", "Golden blonde", "Rich brunette reflects"],
    undertone: "warm",
  },
  {
    id: "mahogany",
    name: "Mahogany / Red (R)",
    description: "Warm red-brown tones for vibrancy and depth.",
    colorHex: "#8B3D3D",
    textColor: "#FFFFFF",
    examples: ["5/5", "6/5"],
    bestFor: ["Warm red results", "Copper reflects", "Adding dimension"],
    undertone: "warm",
  },
  {
    id: "violet",
    name: "Violet (V)",
    description: "Cool purple tones that neutralize yellow and add smoky depth.",
    colorHex: "#7A4D7A",
    textColor: "#FFFFFF",
    examples: ["6/7", "8/7"],
    bestFor: ["Neutralizing yellow", "Cool burgundy results", "Smoky blonde"],
    undertone: "cool",
  },
];

const UNDERTONES = [
  {
    name: "Warm",
    description: "Skin has yellow, peach, or golden undertones. Veins appear green. Gold jewelry looks best.",
    colorIndicators: ["Yellow", "Golden", "Peach", "Olive"],
    hairRecommendations: [
      "Golden blondes and browns",
      "Warm reds and coppers",
      "Honey and caramel tones",
      "Avoid: Very ashy tones (can look dull)"
    ],
    colorHex: "#F4E4C1",
    textColor: "#000000",
  },
  {
    name: "Cool",
    description: "Skin has pink, red, or blue undertones. Veins appear blue/purple. Silver jewelry looks best.",
    colorIndicators: ["Pink", "Red", "Blue", "Rosy"],
    hairRecommendations: [
      "Ash blondes and browns",
      "Platinum and icy tones",
      "Cool violets and burgundies",
      "Avoid: Very warm gold tones (can look brassy)"
    ],
    colorHex: "#E8E4E8",
    textColor: "#000000",
  },
  {
    name: "Neutral",
    description: "Skin has a balance of warm and cool. Veins appear blue-green. Both gold and silver look good.",
    colorIndicators: ["Balanced", "Beige", "Ivory", "Olive-neutral"],
    hairRecommendations: [
      "Most colors work well",
      "Natural tones are safest",
      "Can experiment with warm or cool",
      "Avoid: Extreme ash or extreme warmth"
    ],
    colorHex: "#F5F0E8",
    textColor: "#000000",
  },
];

const CORRECTIONS = [
  {
    problem: "Orange / Brassy",
    cause: "Underlying warm pigment exposed during lightening",
    solution: "Use ash (A) or blue-based correctors",
    shades: ["0/11 Ash Intensifier", "0/88 Blue Intensifier", "6/1", "7/1"],
  },
  {
    problem: "Yellow / Brassy",
    cause: "Pale yellow undertone visible in lighter levels",
    solution: "Use violet (V) or ash (A) correctors",
    shades: ["0/66 Violet Intensifier", "0/11 Ash Intensifier", "8/1", "8/7"],
  },
  {
    problem: "Too Green / Ashy",
    cause: "Over-correction with ash tones on porous hair",
    solution: "Add warmth with gold (G) corrector",
    shades: ["0/33 Gold Intensifier", "6/3", "7/3"],
  },
  {
    problem: "Too Warm / Brass",
    cause: "Natural warmth overpowering the desired cool tone",
    solution: "Use matt (M) or ash (A) to cool down",
    shades: ["0/22 Matt Intensifier", "0/11 Ash Intensifier"],
  },
];

interface ToneGuideProps {
  selectedTone?: string;
  onToneSelect?: (toneId: string) => void;
}

export function ToneGuide({ selectedTone, onToneSelect }: ToneGuideProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-800">
          Tone & Undertone Guide
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Understanding tones helps you choose the right shade and correct unwanted results.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tones" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tones">Hair Tones</TabsTrigger>
            <TabsTrigger value="undertones">Skin Undertones</TabsTrigger>
            <TabsTrigger value="corrections">Color Corrections</TabsTrigger>
          </TabsList>

          <TabsContent value="tones" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => onToneSelect?.(tone.id)}
                  className={`
                    p-4 rounded-lg text-left transition-all
                    ${selectedTone === tone.id 
                      ? "ring-2 ring-blue-500 shadow-md scale-[1.02]" 
                      : "hover:shadow-sm hover:scale-[1.01]"
                    }
                  `}
                  style={{
                    backgroundColor: tone.colorHex,
                    color: tone.textColor,
                  }}
                >
                  <div className="font-bold text-lg mb-1">{tone.name}</div>
                  <div className="text-sm opacity-90 mb-2">{tone.description}</div>
                  <div className="text-xs mb-2">
                    <span className="font-semibold">Examples:</span> {tone.examples.join(", ")}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tone.bestFor.map((use, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm"
                      >
                        {use}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="undertones" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-slate-600 mb-3">
                Skin undertone affects how hair color appears. Choose tones that complement the client's natural undertone.
              </p>
              {UNDERTONES.map((ut) => (
                <div
                  key={ut.name}
                  className="p-4 rounded-lg border border-slate-200"
                  style={{
                    backgroundColor: ut.colorHex,
                    color: ut.textColor,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold">{ut.name}</span>
                    <div className="flex gap-1">
                      {ut.colorIndicators.map((indicator, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm"
                        >
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm mb-3">{ut.description}</p>
                  <div className="text-sm">
                    <span className="font-semibold">Best hair colors:</span>
                    <ul className="mt-1 space-y-0.5 list-disc list-inside">
                      {ut.hairRecommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="corrections" className="mt-4">
            <div className="space-y-3">
              <p className="text-sm text-slate-600 mb-3">
                Common correction scenarios and how to fix them using intensifiers.
              </p>
              {CORRECTIONS.map((corr, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-medium">
                      Problem
                    </span>
                    <span className="font-semibold text-slate-800">{corr.problem}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2"><strong>Cause:</strong> {corr.cause}</p>
                  <p className="text-sm text-slate-600 mb-2"><strong>Solution:</strong> {corr.solution}</p>
                  <div className="flex flex-wrap gap-1">
                    {corr.shades.map((shade, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium"
                      >
                        {shade}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ToneGuide;
