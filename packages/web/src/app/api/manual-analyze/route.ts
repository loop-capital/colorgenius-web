import { NextRequest, NextResponse } from "next/server";
import { getShadeRecommendations, getAnalysisSummary } from "@/lib/shadeRecommendation";
import type { ManualAnalysisInput } from "@/lib/shadeRecommendation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const {
      currentLevel,
      desiredLevel,
      condition,
      undertone,
      hasGray = false,
      grayPercentage = 0,
      wantsCorrection = false,
      correctionType = "",
    } = body;

    if (!currentLevel || !desiredLevel || !condition || !undertone) {
      return NextResponse.json(
        { error: "Missing required fields: currentLevel, desiredLevel, condition, undertone" },
        { status: 400 }
      );
    }

    if (currentLevel < 1 || currentLevel > 10 || desiredLevel < 1 || desiredLevel > 10) {
      return NextResponse.json(
        { error: "Levels must be between 1 and 10" },
        { status: 400 }
      );
    }

    const input: ManualAnalysisInput = {
      currentLevel: currentLevel as ManualAnalysisInput["currentLevel"],
      desiredLevel: desiredLevel as ManualAnalysisInput["desiredLevel"],
      condition: condition as ManualAnalysisInput["condition"],
      undertone: undertone as ManualAnalysisInput["undertone"],
      hasGray: Boolean(hasGray),
      grayPercentage: hasGray ? Number(grayPercentage) : undefined,
      wantsCorrection: Boolean(wantsCorrection),
      correctionType: wantsCorrection ? correctionType : undefined,
    };

    const recommendations = getShadeRecommendations(input);
    const summary = getAnalysisSummary(input);

    return NextResponse.json({
      success: true,
      input,
      summary,
      recommendations,
      recommendationCount: recommendations.length,
    });
  } catch (error) {
    console.error("Manual analysis error:", error);
    return NextResponse.json(
      { error: "Failed to process manual analysis" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Manual analysis endpoint. POST with analysis data to get recommendations.",
    requiredFields: [
      "currentLevel (number 1-10)",
      "desiredLevel (number 1-10)",
      "condition (healthy|damaged|processed|overprocessed)",
      "undertone (warm|cool|neutral)",
    ],
    optionalFields: [
      "hasGray (boolean)",
      "grayPercentage (number 0-100)",
      "wantsCorrection (boolean)",
      "correctionType (string)",
    ],
  });
}
