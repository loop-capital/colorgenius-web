"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface HairLevelData {
  level: number;
  name: string;
  description: string;
  colorHex: string;
  textColor: string;
  characteristics: string[];
}

const HAIR_LEVELS: HairLevelData[] = [
  {
    level: 1,
    name: "Black",
    description: "Natural black, very dark",
    colorHex: "#0D0D0D",
    textColor: "#FFFFFF",
    characteristics: ["Maximum pigment", "Asian/African hair common", "Hard to lighten"],
  },
  {
    level: 2,
    name: "Very Dark Brown",
    description: "Near black brown",
    colorHex: "#1A1A1A",
    textColor: "#FFFFFF",
    characteristics: ["Very high pigment", "Resistant to lightening", "Common natural level"],
  },
  {
    level: 3,
    name: "Dark Brown",
    description: "Rich dark brown",
    colorHex: "#3D2B1F",
    textColor: "#FFFFFF",
    characteristics: ["High pigment", "Good gray coverage base", "Common for brunettes"],
  },
  {
    level: 4,
    name: "Medium Brown",
    description: "Standard medium brown",
    colorHex: "#5C4033",
    textColor: "#FFFFFF",
    characteristics: ["Moderate pigment", "Most common natural level", "Versatile base"],
  },
  {
    level: 5,
    name: "Light Brown",
    description: "Light brown, dark blonde",
    colorHex: "#7A5C4D",
    textColor: "#FFFFFF",
    characteristics: ["Moderate-low pigment", "Gray blending possible", "Warmth starts showing"],
  },
  {
    level: 6,
    name: "Dark Blonde",
    description: "Dark golden blonde",
    colorHex: "#A08060",
    textColor: "#000000",
    characteristics: ["Low pigment", "Warm undertones common", "Easy to lift"],
  },
  {
    level: 7,
    name: "Medium Blonde",
    description: "Standard blonde",
    colorHex: "#C4A882",
    textColor: "#000000",
    characteristics: ["Low pigment", "Natural warmth", "Popular target level"],
  },
  {
    level: 8,
    name: "Light Blonde",
    description: "Light golden blonde",
    colorHex: "#D4B896",
    textColor: "#000000",
    characteristics: ["Very low pigment", "Yellow base visible", "Needs toning often"],
  },
  {
    level: 9,
    name: "Very Light Blonde",
    description: "Pale blonde",
    colorHex: "#E4D4B8",
    textColor: "#000000",
    characteristics: ["Minimal pigment", "Yellow pale", "Pre-lightened usually"],
  },
  {
    level: 10,
    name: "Lightest Blonde",
    description: "Platinum pale",
    colorHex: "#F0E8DC",
    textColor: "#000000",
    characteristics: ["Barely any pigment", "Pale yellow/white", "Requires pre-lightening"],
  },
];

interface HairLevelChartProps {
  selectedLevel?: number;
  onLevelSelect?: (level: number) => void;
  showDetails?: boolean;
  compact?: boolean;
}

export function HairLevelChart({
  selectedLevel,
  onLevelSelect,
  showDetails = true,
  compact = false,
}: HairLevelChartProps) {
  if (compact) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700 mb-2">Hair Level Scale (1-10)</p>
        <div className="flex flex-col gap-1">
          {HAIR_LEVELS.map((level) => (
            <button
              key={level.level}
              onClick={() => onLevelSelect?.(level.level)}
              className={`
                flex items-center gap-2 px-2 py-1 rounded text-sm transition-all
                ${selectedLevel === level.level ? "ring-2 ring-blue-500 font-semibold" : "hover:opacity-80"}
              `}
              style={{
                backgroundColor: level.colorHex,
                color: level.textColor,
              }}
            >
              <span className="font-bold w-6">{level.level}</span>
              <span className="text-xs truncate">{level.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-800">
          Hair Level Chart
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Click a level to select it. Level 1 is darkest, Level 10 is lightest.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {HAIR_LEVELS.map((level) => (
            <button
              key={level.level}
              onClick={() => onLevelSelect?.(level.level)}
              className={`
                w-full flex items-start gap-4 p-3 rounded-lg transition-all text-left
                ${selectedLevel === level.level 
                  ? "ring-2 ring-blue-500 shadow-md scale-[1.02]" 
                  : "hover:shadow-sm hover:scale-[1.01]"
                }
              `}
              style={{
                backgroundColor: level.colorHex,
                color: level.textColor,
              }}
            >
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold">{level.level}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base">{level.name}</div>
                <div className="text-sm opacity-90">{level.description}</div>
                {showDetails && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {level.characteristics.map((char, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-1">Quick Reference:
          </p>
          <ul className="text-sm text-slate-600 space-y-1">
            <li><strong>Levels 1-3:</strong> Dark to very dark — black/dark brown range</li>
            <li><strong>Levels 4-5:</strong> Medium to light brown — brunette range</li>
            <li><strong>Levels 6-7:</strong> Dark to medium blonde — golden range</li>
            <li><strong>Levels 8-10:</strong> Light to lightest blonde — pale/platinum range</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default HairLevelChart;
