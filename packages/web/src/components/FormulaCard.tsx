'use client';

import { Clock, Droplets, Beaker, AlertCircle, CheckCircle2 } from 'lucide-react';
type Formulation = any;
import ColorSwatch from './ColorSwatch';

interface FormulaCardProps {
  formulation: Formulation;
  showClientInfo?: boolean;
  hairRgb?: [number, number, number];
}

export default function FormulaCard({ formulation, showClientInfo = false }: FormulaCardProps) {
  const { primary_formula, processing_instructions, cost_estimate, confidence_score, validation } = formulation;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-mahogany-700 to-mahogany-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg capitalize">
              {primary_formula.brand} {primary_formula.product_line.replace(/_/g, ' ')}
            </h3>
            <p className="text-cream-200 text-sm">
              {primary_formula.action_type.replace(/_/g, ' ')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {Math.round(confidence_score * 100)}%
            </div>
            <p className="text-cream-200 text-xs">Confidence</p>
          </div>
        </div>
      </div>

      {/* Validation Warnings */}
      {validation.warnings.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {validation.warnings.map((warning: string, i: number) => (
                <span key={i} className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  {warning}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Color Components */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Color Formula
          </h4>
          <div className="space-y-3">
            {primary_formula.components.map((comp: any, i: number) => (
              <div key={i} className="flex items-center gap-4 bg-cream-50 rounded-xl p-3">
                <ColorSwatch
                  rgb={comp.shade.rgb}
                  name={comp.shade.name}
                  code={comp.shade.code}
                  level={comp.shade.level}
                  tone={comp.shade.primary_tone}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">{comp.shade.name}</p>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                      {comp.purpose.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{comp.shade.code} · Level {comp.shade.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{comp.amount_oz} oz</p>
                  <p className="text-xs text-gray-400">{comp.amount_ml} ml</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Developer */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-violet-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-violet-600" />
              <span className="text-sm font-medium text-gray-700">Developer</span>
            </div>
            <p className="text-2xl font-bold text-violet-700">{primary_formula.developer.volume} vol</p>
            <p className="text-sm text-gray-500">{primary_formula.developer.amount_oz} oz</p>
          </div>

          <div className="bg-gold-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Beaker className="w-5 h-5 text-gold-600" />
              <span className="text-sm font-medium text-gray-700">Mix Ratio</span>
            </div>
            <p className="text-2xl font-bold text-gold-700">{primary_formula.mixing_ratio}</p>
            <p className="text-sm text-gray-500">Color to Developer</p>
          </div>
        </div>

        {/* Bond Builder */}
        {primary_formula.bond_builder && (
          <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{primary_formula.bond_builder.product}</p>
              <p className="text-sm text-gray-500">Bond Builder</p>
            </div>
            <p className="font-medium text-gray-700">{primary_formula.bond_builder.amount_ml} ml</p>
          </div>
        )}

        {/* Processing Instructions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Processing
          </h4>
          <div className="bg-cream-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-mahogany-600" />
              <span className="font-semibold text-gray-800">
                {processing_instructions.total_time_minutes} minutes total
              </span>
            </div>
            <div className="space-y-2">
              {processing_instructions.application_sequence.map((step: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-mahogany-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{step.zone}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                    <p className="text-xs text-mahogany-600 font-medium mt-0.5">{step.duration} min</p>
                  </div>
                </div>
              ))}
            </div>
            {processing_instructions.notes && processing_instructions.notes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-cream-200">
                <p className="text-xs text-gray-500 italic">
                  {processing_instructions.notes.join(' · ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cost */}
        <div className="flex items-center justify-between pt-4 border-t border-cream-200">
          <div>
            <p className="text-sm text-gray-500">Estimated Product Cost</p>
            <p className="text-2xl font-bold text-gray-800">
              {cost_estimate.currency} {cost_estimate.total_product_cost.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Suggested Price</p>
            <p className="text-lg font-bold text-mahogany-600">
              {cost_estimate.currency} {formulation.pricing_suggestion.recommended_price.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}