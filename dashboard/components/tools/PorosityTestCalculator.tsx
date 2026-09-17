"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Question {
  question: string;
  options: string[];
}

interface PorosityResult {
  porosity: "low" | "medium" | "high";
  score: number;
  description: string;
  recommendations: string[];
  productRecommendations: string[];
}

const questions: Question[] = [
  {
    question: "How does your hair feel when wet?",
    options: ["Smooth, slippery", "Normal", "Rough, sticky", "Very rough"],
  },
  {
    question: "How long does your hair take to dry naturally?",
    options: ["Very long (4+ hours)", "Long (2-3 hours)", "Normal (1-2 hours)", "Quick (under 1 hour)"],
  },
  {
    question: "How does your hair absorb products?",
    options: ["Products sit on top", "Slow absorption", "Normal absorption", "Very fast absorption"],
  },
  {
    question: "How does your hair feel to the touch?",
    options: ["Very soft, silky", "Soft", "Slightly rough", "Dry, brittle"],
  },
  {
    question: "How does your hair react to chemical treatments?",
    options: ["Resistant, needs more processing", "Slightly resistant", "Normal processing", "Processes very quickly"],
  },
];

function calculatePorosityClient(answers: number[]): PorosityResult {
  const score = answers.reduce((sum, a) => sum + a, 0);
  
  if (score <= 8) {
    return {
      porosity: "low",
      score,
      description: "Your hair has low porosity. The cuticle layers are tightly packed, making it difficult for moisture and products to penetrate.",
      recommendations: [
        "Use heat when deep conditioning to open cuticles",
        "Apply products to damp, not soaking wet hair",
        "Use lighter, water-based products",
        "Avoid heavy oils and butters that can sit on top",
      ],
      productRecommendations: [
        "Lightweight leave-in conditioners",
        "Heat-activated treatments",
        "Clarifying shampoos weekly",
        "Humectants like glycerin and honey",
      ],
    };
  } else if (score <= 14) {
    return {
      porosity: "medium",
      score,
      description: "Your hair has medium (normal) porosity. The cuticle layers are slightly raised, allowing moisture to enter and exit at a balanced rate.",
      recommendations: [
        "Maintain a balanced moisture-protein routine",
        "Deep condition weekly",
        "Use a mix of lightweight and medium products",
        "Protect hair from heat damage",
      ],
      productRecommendations: [
        "Balanced moisturizing conditioners",
        "Occasional protein treatments",
        "Heat protectants when styling",
        "Medium-weight oils like argan or jojoba",
      ],
    };
  } else {
    return {
      porosity: "high",
      score,
      description: "Your hair has high porosity. The cuticle layers are lifted or damaged, allowing moisture to enter quickly but also escape quickly.",
      recommendations: [
        "Use heavier, creamy products to seal moisture",
        "Apply products to soaking wet hair",
        "Deep condition with heat regularly",
        "Use the LOC or LCO method (Liquid, Oil, Cream)",
      ],
      productRecommendations: [
        "Heavy creams and butters (shea, mango)",
        "Protein-rich treatments",
        "Sealants like castor oil or hair butter",
        "Acidic rinses to help close cuticles",
      ],
    };
  }
}

export default function PorosityTestCalculator() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<PorosityResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex + 1];
    setAnswers(newAnswers);
    
    if (newAnswers.length === questions.length) {
      setLoading(true);
      const calculatedResult = calculatePorosityClient(newAnswers);
      setResult(calculatedResult);
      setLoading(false);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const reset = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  if (result) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-[#0A0A1A] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Your Porosity Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${
              result.porosity === "low" ? "text-blue-400" :
              result.porosity === "medium" ? "text-green-400" : "text-orange-400"
            }`}>
              {result.porosity.charAt(0).toUpperCase() + result.porosity.slice(1)} Porosity
            </div>
            <div className="text-white/60">Score: {result.score} / {questions.length * 4}</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/80">{result.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Care Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Product Recommendations</h3>
              <ul className="space-y-2">
                {result.productRecommendations.map((prod, i) => (
                  <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                    <span className="text-pink-400 mt-1">•</span>
                    {prod}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Button
            onClick={reset}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
          >
            Take Test Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-[#0A0A1A] border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-2xl">Hair Porosity Test</CardTitle>
        <p className="text-white/60">Question {currentQuestion + 1} of {questions.length}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-white text-lg font-medium">
          {questions[currentQuestion].question}
        </div>
        
        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={loading}
              className="w-full text-left p-4 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-purple-500/50 transition-all disabled:opacity-50"
            >
              {option}
            </button>
          ))}
        </div>

        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
