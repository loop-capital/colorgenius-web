"use client";

import React, { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getShadeRecommendations,
  getAnalysisSummary,
  type ManualAnalysisInput,
  type ShadeRecommendation,
  type HairCondition,
  type Undertone,
} from "@/lib/shadeRecommendation";
import HairLevelChart from "./HairLevelChart";
import ToneGuide from "./ToneGuide";
import { Upload, Camera, X, AlertTriangle, CheckCircle, Info, ChevronRight } from "lucide-react";

export default function ManualPhotoAnalysis() {
  // Form state
  const [photo, setPhoto] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(4);
  const [desiredLevel, setDesiredLevel] = useState<number>(6);
  const [condition, setCondition] = useState<HairCondition>("healthy");
  const [undertone, setUndertone] = useState<Undertone>("neutral");
  const [hasGray, setHasGray] = useState(false);
  const [grayPercentage, setGrayPercentage] = useState(0);
  const [wantsCorrection, setWantsCorrection] = useState(false);
  const [correctionType, setCorrectionType] = useState("");

  // Results state
  const [recommendations, setRecommendations] = useState<ShadeRecommendation[]>([]);
  const [analysisSummary, setAnalysisSummary] = useState<ReturnType<typeof getAnalysisSummary> | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showLevelChart, setShowLevelChart] = useState(false);
  const [levelChartMode, setLevelChartMode] = useState<"current" | "desired">("current");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPhoto(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const clearPhoto = useCallback(() => {
    setPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleAnalyze = useCallback(() => {
    const input: ManualAnalysisInput = {
      currentLevel: currentLevel as ManualAnalysisInput["currentLevel"],
      desiredLevel: desiredLevel as ManualAnalysisInput["desiredLevel"],
      condition,
      undertone,
      hasGray,
      grayPercentage: hasGray ? grayPercentage : undefined,
      wantsCorrection,
      correctionType: wantsCorrection ? correctionType : undefined,
    };

    const recs = getShadeRecommendations(input);
    const summary = getAnalysisSummary(input);

    setRecommendations(recs);
    setAnalysisSummary(summary);
    setShowResults(true);
  }, [
    currentLevel,
    desiredLevel,
    condition,
    undertone,
    hasGray,
    grayPercentage,
    wantsCorrection,
    correctionType,
  ]);

  const handleLevelSelect = useCallback(
    (level: number) => {
      if (levelChartMode === "current") {
        setCurrentLevel(level);
      } else {
        setDesiredLevel(level);
      }
      setShowLevelChart(false);
    },
    [levelChartMode]
  );

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return "High";
    if (score >= 60) return "Moderate";
    return "Caution";
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "moderate":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Manual Hair Analysis</h1>
        <p className="text-sm text-slate-600">
          Upload a photo and answer a few questions to get shade recommendations.
        </p>
      </div>

      {/* Photo Upload */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Client Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!photo ? (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className="w-10 h-10 text-slate-400" />
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-blue-600">Click to upload</span> or drag
                  and drop
                </div>
                <p className="text-xs text-slate-400">
                  PNG, JPG up to 10MB
                </p>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={photo}
                alt="Client hair"
                className="w-full max-h-64 object-contain rounded-lg"
              />
              <button
                onClick={clearPhoto}
                className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="text-xs">
                  <Camera className="w-3 h-3 mr-1 inline" />
                  Photo uploaded
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Hair Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Level */}
            <div className="space-y-2">
              <Label htmlFor="current-level">Current Level (1-10)</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={currentLevel.toString()}
                  onValueChange={(v) => setCurrentLevel(parseInt(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select current level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        Level {level} —{" "}
                        {level <= 3
                          ? "Dark"
                          : level <= 5
                          ? "Brown"
                          : level <= 7
                          ? "Blonde"
                          : "Light Blonde"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={showLevelChart && levelChartMode === "current"} onOpenChange={setShowLevelChart}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLevelChartMode("current")}
                      className="flex-shrink-0"
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Select Current Hair Level</DialogTitle>
                    </DialogHeader>
                    <HairLevelChart
                      selectedLevel={currentLevel}
                      onLevelSelect={handleLevelSelect}
                      showDetails={true}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Desired Level */}
            <div className="space-y-2">
              <Label htmlFor="desired-level">Desired Level (1-10)</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={desiredLevel.toString()}
                  onValueChange={(v) => setDesiredLevel(parseInt(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select desired level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        Level {level} —{" "}
                        {level <= 3
                          ? "Dark"
                          : level <= 5
                          ? "Brown"
                          : level <= 7
                          ? "Blonde"
                          : "Light Blonde"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={showLevelChart && levelChartMode === "desired"} onOpenChange={setShowLevelChart}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLevelChartMode("desired")}
                      className="flex-shrink-0"
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Select Desired Hair Level</DialogTitle>
                    </DialogHeader>
                    <HairLevelChart
                      selectedLevel={desiredLevel}
                      onLevelSelect={handleLevelSelect}
                      showDetails={true}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Hair Condition */}
            <div className="space-y-2">
              <Label>Hair Condition</Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as HairCondition)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Healthy — Strong, minimal damage
                    </div>
                  </SelectItem>
                  <SelectItem value="damaged">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      Damaged — Some breakage, dry
                    </div>
                  </SelectItem>
                  <SelectItem value="processed">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      Processed — Previous color/chemicals
                    </div>
                  </SelectItem>
                  <SelectItem value="overprocessed">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Overprocessed — Fragile, compromised
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Undertone */}
            <div className="space-y-2">
              <Label>Natural Undertone</Label>
              <Select value={undertone} onValueChange={(v) => setUndertone(v as Undertone)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select undertone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warm">
                    Warm — Yellow, golden, peach tones
                  </SelectItem>
                  <SelectItem value="cool">
                    Cool — Pink, blue, rosy tones
                  </SelectItem>
                  <SelectItem value="neutral">
                    Neutral — Balanced, no dominant tone
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Gray Hair Option */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasGray}
                onChange={(e) => setHasGray(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm font-medium">Client has gray hair</span>
            </label>
            {hasGray && (
              <div className="mt-3 space-y-2">
                <Label className="text-sm">Gray Percentage: {grayPercentage}%</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={grayPercentage}
                  onChange={(e) => setGrayPercentage(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </div>

          {/* Correction Option */}
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wantsCorrection}
                onChange={(e) => setWantsCorrection(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm font-medium">Needs color correction</span>
            </label>
            {wantsCorrection && (
              <div className="mt-3">
                <Label className="text-sm mb-2 block">Correction needed:</Label>
                <Select value={correctionType} onValueChange={setCorrectionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select correction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orange-brass">Orange / Brassy tones</SelectItem>
                    <SelectItem value="yellow-brass">Yellow / Brassy tones</SelectItem>
                    <SelectItem value="too-ashy">Too ashy / Green cast</SelectItem>
                    <SelectItem value="too-warm">Too warm / Needs cooling</SelectItem>
                    <SelectItem value="uneven">Uneven / Patchy color</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            className="w-full mt-6 py-6 text-lg font-semibold"
          >
            Get Shade Recommendations
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && analysisSummary && (
        <div className="space-y-6">
          {/* Analysis Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">Level Change</p>
                  <p className="text-lg font-semibold">
                    Level {currentLevel} → Level {desiredLevel}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {analysisSummary.direction === "lighter"
                      ? `Lifting ${analysisSummary.liftNeeded} level${analysisSummary.liftNeeded > 1 ? "s" : ""}`
                      : analysisSummary.direction === "darker"
                      ? `Going darker by ${analysisSummary.liftNeeded} level${analysisSummary.liftNeeded > 1 ? "s" : ""}`
                      : "Same level — toning or refreshing"}
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${getRiskColor(analysisSummary.riskLevel)}`}>
                  <p className="text-sm opacity-80 mb-1">Risk Level</p>
                  <p className="text-lg font-semibold capitalize">{analysisSummary.riskLevel}</p>
                  <p className="text-sm mt-1">
                    {analysisSummary.riskLevel === "high"
                      ? "Extra care needed — consider lower developer or pre-treatment"
                      : analysisSummary.riskLevel === "moderate"
                      ? "Standard precautions apply"
                      : "Low risk — standard process"}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">Condition</p>
                  <p className="text-lg font-semibold capitalize">{condition}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {condition === "healthy"
                      ? "Hair can handle standard processing"
                      : condition === "damaged"
                      ? "Use lower developer, monitor closely"
                      : condition === "processed"
                      ? "Previous chemicals — test strand recommended"
                      : "Very fragile — gentle process only"}
                  </p>
                </div>
              </div>

              {analysisSummary.recommendations.length > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-800 mb-2">Stylist Notes:</p>
                  <ul className="space-y-1">
                    {analysisSummary.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shade Recommendations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">
                Recommended Shades ({recommendations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={rec.shadeId}
                    className={`p-4 rounded-lg border transition-all ${
                      index === 0
                        ? "border-blue-300 bg-blue-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Color Swatch */}
                      <div
                        className="w-16 h-16 rounded-lg shadow-inner flex-shrink-0 border border-slate-200"
                        style={{ backgroundColor: rec.colorHex }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">{rec.shadeName}</span>
                          <span className="text-sm text-slate-500 font-mono">
                            {rec.shadeCode}
                          </span>
                          {index === 0 && (
                            <Badge className="bg-blue-500 text-white">Top Pick</Badge>
                          )}
                          {rec.isCorrector && (
                            <Badge variant="outline" className="text-purple-600 border-purple-300">
                              Corrector
                            </Badge>
                          )}
                          {rec.isHighLift && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              High Lift
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Confidence:</span>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={rec.confidenceScore}
                                className="w-24 h-2"
                              />
                              <span className={`text-sm font-semibold ${
                                rec.confidenceScore >= 80
                                  ? "text-green-600"
                                  : rec.confidenceScore >= 60
                                  ? "text-yellow-600"
                                  : "text-orange-600"
                              }`}>
                                {rec.confidenceScore}%
                              </span>
                            </div>
                          </div>
                          <span className="text-sm text-slate-500 capitalize">
                            {rec.undertone} • Level {rec.level}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {rec.reasoning.map((reason, i) => (
                            <p key={i} className="text-sm text-slate-600">
                              {reason.startsWith("⚠️") ? (
                                <span className="text-red-600 font-medium">{reason}</span>
                              ) : (
                                reason
                              )}
                            </p>
                          ))}
                        </div>

                        {(rec.recommendedDeveloper || rec.mixingInstructions) && (
                          <div className="mt-3 p-3 bg-slate-100 rounded text-sm space-y-1">
                            {rec.recommendedDeveloper && (
                              <p>
                                <span className="font-semibold">Developer:</span>{" "}
                                {rec.recommendedDeveloper}
                              </p>
                            )}
                            {rec.mixingInstructions && (
                              <p>
                                <span className="font-semibold">Mixing:</span>{" "}
                                {rec.mixingInstructions}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visual Guides */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HairLevelChart compact showDetails={false} />
            <ToneGuide />
          </div>
        </div>
      )}
    </div>
  );
}
