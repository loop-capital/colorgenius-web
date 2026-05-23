// ============================================================
// FormulateScreen — 6-Step Hair Color Formulation
// Mobile version matching the web dashboard at colorgenius.co
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  Palette,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react-native';
import {
  submitFormulation,
  type FormulationInput,
  type FormulationResult,
} from '../api/client';
import {
  HAIR_LEVEL_NAMES,
  TONES,
  type ToneValue,
  TEXTURES,
  HAIR_PATTERNS,
  DENSITIES,
  SERVICE_TYPES,
  CHEMICAL_HISTORY_ITEMS,
  SENSITIVITIES,
  LAST_SERVICE_OPTIONS,
  CONDITION_TYPES,
  POROSITY,
  PROBLEM_INDICATORS,
  BRANDS,
  type TextureType,
  type HairPatternType,
  type DensityType,
  type ServiceType,
  type Porosity,
  type ConditionType,
  type LastServiceType,
} from '../types';

// ─── Constants ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: 'Photo', label: 'Photo' },
  { id: 2, title: 'Assessment', label: 'Hair Assessment' },
  { id: 3, title: 'History', label: 'Chemical History' },
  { id: 4, title: 'Target', label: 'Target Look' },
  { id: 5, title: 'Condition', label: 'Condition' },
  { id: 6, title: 'Review', label: 'Review & Generate' },
] as const;

const COLORS = {
  bg: '#0A0A1A',
  card: '#12121F',
  cardBorder: 'rgba(255,255,255,0.08)',
  textPrimary: '#F5F5F7',
  textSecondary: 'rgba(255,255,255,0.5)',
  textMuted: 'rgba(255,255,255,0.35)',
  purple: '#9333EA',
  purpleGlow: 'rgba(147,51,234,0.3)',
  pink: '#EC4899',
  pinkGlow: 'rgba(236,72,153,0.3)',
  chipBorder: 'rgba(255,255,255,0.12)',
  chipBg: 'rgba(255,255,255,0.05)',
  chipActiveBg: 'rgba(147,51,234,0.2)',
  chipActiveBorder: '#9333EA',
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function levelColor(lvl: number): string {
  const colors = [
    '#1C1C1C', '#2E1A0E', '#3E2723', '#5D4037', '#795548',
    '#A1887F', '#C8A96E', '#D4B86A', '#E8D5A3', '#F5E6C8',
  ];
  return colors[lvl - 1] ?? '#888';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <View style={stepIndicatorStyles.container}>
      <View style={stepIndicatorStyles.row}>
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isLast = step.id === STEPS.length;

          return (
            <React.Fragment key={step.id}>
              <View style={stepIndicatorStyles.stepItem}>
                <View
                  style={[
                    stepIndicatorStyles.circle,
                    isActive && stepIndicatorStyles.circleActive,
                    isCompleted && stepIndicatorStyles.circleCompleted,
                  ]}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={14} color="#FFF" />
                  ) : (
                    <Text
                      style={[
                        stepIndicatorStyles.circleText,
                        (isActive || isCompleted) && stepIndicatorStyles.circleTextActive,
                      ]}
                    >
                      {step.id}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    stepIndicatorStyles.stepLabel,
                    isActive && stepIndicatorStyles.stepLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>
              {!isLast && (
                <View
                  style={[
                    stepIndicatorStyles.connector,
                    isCompleted && stepIndicatorStyles.connectorCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const stepIndicatorStyles = StyleSheet.create({
  container: { paddingHorizontal: 8, paddingVertical: 12, backgroundColor: COLORS.bg },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  stepItem: { alignItems: 'center', flex: 1 },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.chipBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.chipBg,
  },
  circleActive: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.chipActiveBg,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  circleCompleted: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.purple,
  },
  circleText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  circleTextActive: { color: COLORS.textPrimary },
  stepLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  stepLabelActive: { color: COLORS.purple, fontWeight: '600' },
  connector: {
    width: 16,
    height: 2,
    backgroundColor: COLORS.chipBorder,
    marginTop: 13,
  },
  connectorCompleted: { backgroundColor: COLORS.purple },
});

// ─── ChipSelector ────────────────────────────────────────────────────────────

interface ChipSelectorProps<T extends string> {
  label: string;
  options: { value: T; label: string; desc?: string; danger?: boolean }[];
  selected: T;
  onSelect: (value: T) => void;
  layout?: 'horizontal' | 'grid';
}

function ChipSelector<T extends string>({
  label,
  options,
  selected,
  onSelect,
  layout = 'horizontal',
}: ChipSelectorProps<T>) {
  return (
    <View style={chipStyles.container}>
      <Text style={chipStyles.label}>{label}</Text>
      <View style={[chipStyles.row, layout === 'grid' && chipStyles.grid]}>
        {options.map((opt) => {
          const isSelected = opt.value === selected;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                chipStyles.chip,
                isSelected && chipStyles.chipActive,
                opt.danger && !isSelected && chipStyles.chipDanger,
                opt.danger && isSelected && chipStyles.chipDangerActive,
              ]}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  chipStyles.chipText,
                  isSelected && chipStyles.chipTextActive,
                  opt.danger && !isSelected && chipStyles.chipTextDanger,
                ]}
              >
                {opt.label}
              </Text>
              {opt.desc && (
                <Text style={chipStyles.chipDesc} numberOfLines={1}>
                  {opt.desc}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  container: { marginVertical: 10 },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.chipBg,
    alignItems: 'center',
    minHeight: 40,
  },
  chipActive: {
    backgroundColor: COLORS.chipActiveBg,
    borderColor: COLORS.chipActiveBorder,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  chipDanger: { borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.05)' },
  chipDangerActive: { backgroundColor: 'rgba(239,68,68,0.2)', borderColor: COLORS.danger },
  chipText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
  chipTextActive: { color: COLORS.textPrimary, fontWeight: '700' },
  chipTextDanger: { color: COLORS.danger },
  chipDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
});

// ─── MultiChipSelector ───────────────────────────────────────────────────────

interface MultiChipSelectorProps {
  label: string;
  options: { value: string; label: string; desc?: string; danger?: boolean; icon?: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}

function MultiChipSelector({ label, options, selected, onToggle }: MultiChipSelectorProps) {
  return (
    <View style={chipStyles.container}>
      <Text style={chipStyles.label}>{label}</Text>
      <View style={chipStyles.row}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                chipStyles.chip,
                isSelected && chipStyles.chipActive,
                opt.danger && !isSelected && chipStyles.chipDanger,
                opt.danger && isSelected && chipStyles.chipDangerActive,
              ]}
              onPress={() => onToggle(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[chipStyles.chipText, isSelected && chipStyles.chipTextActive]}>
                {opt.icon ? `${opt.icon} ` : ''}{opt.label}
              </Text>
              {opt.desc && (
                <Text style={chipStyles.chipDesc} numberOfLines={1}>
                  {opt.desc}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── LevelSlider ─────────────────────────────────────────────────────────────

interface LevelSliderProps {
  value: number;
  onChange: (level: number) => void;
  label?: string;
}

function LevelSlider({ value, onChange, label }: LevelSliderProps) {
  return (
    <View style={sliderStyles.container}>
      {label && <Text style={sliderStyles.label}>{label}</Text>}
      <Text style={sliderStyles.levelName}>
        Level {value} — {HAIR_LEVEL_NAMES[value] ?? ''}
      </Text>
      <View style={sliderStyles.row}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
          <Pressable
            key={lvl}
            onPress={() => onChange(lvl)}
            style={[
              sliderStyles.dot,
              lvl === value && sliderStyles.dotActive,
              { backgroundColor: levelColor(lvl) },
            ]}
          >
            <Text
              style={[
                sliderStyles.dotLabel,
                lvl === value && sliderStyles.dotLabelActive,
              ]}
            >
              {lvl}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: { marginVertical: 12 },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  levelName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dotActive: {
    borderColor: COLORS.purple,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  dotLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  dotLabelActive: { color: '#FFF', fontWeight: '800' },
});

// ─── ToneSelector (uses TONES from types with color) ─────────────────────────

interface ToneSelectorProps {
  value: ToneValue;
  onChange: (tone: ToneValue) => void;
  label?: string;
}

function ToneSelector({ value, onChange, label }: ToneSelectorProps) {
  return (
    <View style={toneStyles.container}>
      {label && <Text style={toneStyles.label}>{label}</Text>}
      <View style={toneStyles.grid}>
        {TONES.map((tone) => {
          const selected = tone.value === value;
          return (
            <Pressable
              key={tone.value}
              onPress={() => onChange(tone.value)}
              style={[
                toneStyles.chip,
                selected && {
                  backgroundColor: tone.color + '40',
                  borderColor: tone.color,
                },
              ]}
            >
              <View
                style={[
                  toneStyles.colorDot,
                  { backgroundColor: tone.color },
                  selected && toneStyles.colorDotActive,
                ]}
              />
              <Text
                style={[
                  toneStyles.chipText,
                  selected && toneStyles.chipTextActive,
                ]}
              >
                {tone.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const toneStyles = StyleSheet.create({
  container: { marginVertical: 12 },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.chipBg,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  colorDotActive: {
    borderColor: '#FFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  chipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: COLORS.textPrimary, fontWeight: '700' },
});

// ─── GraySlider ──────────────────────────────────────────────────────────────

function GraySlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={grayStyles.container}>
      <Text style={grayStyles.label}>Gray Percentage</Text>
      <View style={grayStyles.row}>
        <Text style={grayStyles.value}>{value}%</Text>
        <View style={grayStyles.track}>
          <View style={[grayStyles.fill, { width: `${value}%` }]} />
        </View>
      </View>
      <View style={grayStyles.dotsRow}>
        {[0, 25, 50, 75, 100].map((pct) => (
          <Pressable key={pct} onPress={() => onChange(pct)} style={grayStyles.dotBtn}>
            <View
              style={[
                grayStyles.dot,
                value >= pct && grayStyles.dotFilled,
              ]}
            />
            <Text style={grayStyles.dotLabel}>{pct}%</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const grayStyles = StyleSheet.create({
  container: { marginVertical: 12 },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  value: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    width: 48,
    textAlign: 'center',
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.purple,
    borderRadius: 3,
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  dotBtn: { alignItems: 'center' },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.chipBorder,
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  dotFilled: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.purple,
  },
  dotLabel: { fontSize: 10, color: COLORS.textMuted },
});

// ─── Navigation Buttons ──────────────────────────────────────────────────────

function NavButtons({
  step,
  totalSteps,
  onBack,
  onNext,
  nextLabel,
  disabled,
}: {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  disabled?: boolean;
}) {
  const isFirst = step === 1;
  const isLast = step === totalSteps;

  return (
    <View style={navStyles.container}>
      <TouchableOpacity
        style={[navStyles.backBtn, isFirst && navStyles.backBtnDisabled]}
        onPress={onBack}
        disabled={isFirst}
      >
        <ChevronLeft size={18} color={isFirst ? COLORS.textMuted : COLORS.textSecondary} />
        <Text style={[navStyles.backText, isFirst && navStyles.backTextDisabled]}>Back</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[navStyles.nextBtn, disabled && navStyles.nextBtnDisabled]}
        onPress={onNext}
        disabled={disabled}
      >
        <Text style={navStyles.nextText}>{nextLabel || 'Next'}</Text>
        <ChevronRight size={18} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const navStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    backgroundColor: COLORS.bg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
  },
  backBtnDisabled: { opacity: 0.5 },
  backText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  backTextDisabled: { color: COLORS.textMuted },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    paddingVertical: 12,
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});

// ─── Result Card ─────────────────────────────────────────────────────────────

function ResultCard({ result }: { result: FormulationResult }) {
  if (!result || !result.steps) {
    return (
      <View style={resultStyles.card}>
        <Text style={resultStyles.emptyText}>No formula generated yet.</Text>
      </View>
    );
  }

  return (
    <View style={resultStyles.card}>
      <View style={resultStyles.header}>
        <Sparkles size={20} color={COLORS.purple} />
        <Text style={resultStyles.headerTitle}>Your Formula</Text>
      </View>

      {result.hardStops && result.hardStops.length > 0 && (
        <View style={resultStyles.hardStops}>
          {result.hardStops.map((stop: { type: string; message: string }, i: number) => (
            <View key={i} style={resultStyles.hardStop}>
              <AlertTriangle size={16} color={COLORS.danger} />
              <Text style={resultStyles.hardStopText}>{stop.message}</Text>
            </View>
          ))}
        </View>
      )}

      {result.steps.map((step: { role: string; grams?: number; product?: { brand?: string; shadeCode?: string; name?: string; ratio?: string }; developer?: { volume: number }; notes?: string }, i: number) => (
        <View key={i} style={resultStyles.stepCard}>
          <View style={resultStyles.stepHeader}>
            <Text style={resultStyles.stepRole}>{step.role}</Text>
            {step.grams && <Text style={resultStyles.stepGrams}>{step.grams}g</Text>}
          </View>
          <Text style={resultStyles.stepProduct}>
            {step.product?.brand && `${step.product.brand} `}
            {step.product?.shadeCode && `(${step.product.shadeCode}) `}
            {step.product?.name || 'N/A'}
          </Text>
          {step.product?.ratio && (
            <Text style={resultStyles.stepMeta}>Ratio: {step.product.ratio}</Text>
          )}
          {step.developer?.volume && (
            <Text style={resultStyles.stepMeta}>Developer: {step.developer.volume}vol</Text>
          )}
          {step.notes && <Text style={resultStyles.stepNotes}>{step.notes}</Text>}
        </View>
      ))}

      <View style={resultStyles.metaSection}>
        {result.developerVolume && (
          <View style={resultStyles.metaRow}>
            <Text style={resultStyles.metaLabel}>Developer</Text>
            <Text style={resultStyles.metaValue}>{result.developerVolume}vol</Text>
          </View>
        )}
        {result.processingTime && (
          <View style={resultStyles.metaRow}>
            <Text style={resultStyles.metaLabel}>Processing Time</Text>
            <Text style={resultStyles.metaValue}>{result.processingTime}</Text>
          </View>
        )}
        {result.application && (
          <View style={resultStyles.metaRow}>
            <Text style={resultStyles.metaLabel}>Application</Text>
            <Text style={resultStyles.metaValue}>{result.application}</Text>
          </View>
        )}
        {result.brand && (
          <View style={resultStyles.metaRow}>
            <Text style={resultStyles.metaLabel}>Brand</Text>
            <Text style={resultStyles.metaValue}>{result.brand}</Text>
          </View>
        )}
        {result.line && (
          <View style={resultStyles.metaRow}>
            <Text style={resultStyles.metaLabel}>Line</Text>
            <Text style={resultStyles.metaValue}>{result.line}</Text>
          </View>
        )}
        {result.confidence && (
          <View style={resultStyles.metaRow}>
            <Text style={resultStyles.metaLabel}>Confidence</Text>
            <Text style={resultStyles.metaValue}>{result.confidence}%</Text>
          </View>
        )}
      </View>

      {result.warnings && result.warnings.length > 0 && (
        <View style={resultStyles.warnings}>
          {result.warnings.map((warn: string, i: number) => (
            <Text key={i} style={resultStyles.warningText}>• {warn}</Text>
          ))}
        </View>
      )}

      {result.notes && (
        <View style={resultStyles.notesBox}>
          <Text style={resultStyles.notesText}>{result.notes}</Text>
        </View>
      )}

      {result.strandTestRecommended && (
        <View style={resultStyles.strandTest}>
          <AlertTriangle size={16} color={COLORS.warning} />
          <Text style={resultStyles.strandTestText}>Strand test recommended</Text>
        </View>
      )}
    </View>
  );
}

const resultStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginTop: 8,
  },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  hardStops: { marginBottom: 16, gap: 8 },
  hardStop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  hardStopText: { color: COLORS.danger, fontSize: 13, fontWeight: '600', flex: 1 },
  stepCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.purple,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepRole: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.purple,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepGrams: { fontSize: 12, fontWeight: '600', color: COLORS.pink },
  stepProduct: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginTop: 2 },
  stepMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  stepNotes: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, fontStyle: 'italic' },
  metaSection: { marginTop: 12, gap: 8 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  metaLabel: { fontSize: 13, color: COLORS.textSecondary },
  metaValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  warnings: { marginTop: 12, gap: 4 },
  warningText: { fontSize: 12, color: COLORS.warning },
  notesBox: {
    backgroundColor: 'rgba(147,51,234,0.05)',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.1)',
  },
  notesText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  strandTest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 10,
  },
  strandTestText: { color: COLORS.warning, fontSize: 13, fontWeight: '600' },
});

// ─── Summary Section (Step 6) ────────────────────────────────────────────────

function SummarySection({
  formData,
}: {
  formData: FormState;
}) {
  const items = [
    { label: 'Texture', value: capitalize(formData.texture) },
    { label: 'Density', value: capitalize(formData.density) },
    { label: 'Pattern', value: capitalize(formData.hairPattern) },
    { label: 'Current Level', value: `${formData.currentLevel} — ${HAIR_LEVEL_NAMES[formData.currentLevel]}` },
    { label: 'Current Tone', value: TONES.find((t) => t.value === formData.currentTone)?.label || formData.currentTone },
    { label: 'Target Level', value: `${formData.targetLevel} — ${HAIR_LEVEL_NAMES[formData.targetLevel]}` },
    { label: 'Target Tone', value: TONES.find((t) => t.value === formData.targetTone)?.label || formData.targetTone },
    { label: 'Service Type', value: SERVICE_TYPES.find((s) => s.value === formData.serviceType)?.label || formData.serviceType },
    { label: 'Condition', value: CONDITION_TYPES.find((c) => c.value === formData.conditionType)?.label || formData.conditionType },
    { label: 'Porosity', value: capitalize(formData.porosity) },
    { label: 'Gray %', value: `${formData.grayPercent}%` },
    { label: 'Chemical History', value: formData.chemicalHistory.length > 0 ? formData.chemicalHistory.map((c) => CHEMICAL_HISTORY_ITEMS.find((i) => i.value === c)?.label || c).join(', ') : 'None' },
    { label: 'Sensitivities', value: formData.sensitivities.length > 0 ? formData.sensitivities.map((s) => SENSITIVITIES.find((i) => i.value === s)?.label || s).join(', ') : 'None' },
    { label: 'Last Service', value: LAST_SERVICE_OPTIONS.find((l) => l.value === formData.lastChemicalService)?.label || formData.lastChemicalService },
    { label: 'Brand Preference', value: formData.brandPreference || 'None' },
  ];

  return (
    <View style={summaryStyles.container}>
      <Text style={summaryStyles.title}>Review Your Selections</Text>
      {items.map((item, i) => (
        <View key={i} style={summaryStyles.row}>
          <Text style={summaryStyles.label}>{item.label}</Text>
          <Text style={summaryStyles.value} numberOfLines={2}>
            {item.value}
          </Text>
        </View>
      ))}

      {formData.problemIndicators.length > 0 && (
        <View style={summaryStyles.problemsSection}>
          <Text style={summaryStyles.problemsTitle}>Problem Indicators</Text>
          <View style={summaryStyles.problemsRow}>
            {formData.problemIndicators.map((key) => {
              const indicator = PROBLEM_INDICATORS.find((p) => p.key === key);
              return (
                <View key={key} style={summaryStyles.problemChip}>
                  <Text style={summaryStyles.problemChipText}>
                    {indicator?.label || key}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  label: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  problemsSection: { marginTop: 12 },
  problemsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  problemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  problemChip: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  problemChipText: { fontSize: 11, color: COLORS.danger, fontWeight: '600' },
});

// ─── Form State Type ─────────────────────────────────────────────────────────

interface FormState {
  currentLevel: number;
  currentTone: ToneValue;
  targetLevel: number;
  targetTone: ToneValue;
  texture: TextureType;
  hairPattern: HairPatternType;
  density: DensityType;
  serviceType: ServiceType;
  chemicalHistory: string[];
  sensitivities: string[];
  lastChemicalService: string;
  conditionType: ConditionType;
  porosity: Porosity;
  grayPercent: number;
  problemIndicators: string[];
  brandPreference: string;
  developerPreference: string;
}

const INITIAL_STATE: FormState = {
  currentLevel: 5,
  currentTone: 'N',
  targetLevel: 7,
  targetTone: 'A',
  texture: 'medium',
  hairPattern: 'straight',
  density: 'medium',
  serviceType: 'full_head',
  chemicalHistory: [],
  sensitivities: [],
  lastChemicalService: 'never',
  conditionType: 'previously_colored',
  porosity: 'normal',
  grayPercent: 0,
  problemIndicators: [],
  brandPreference: '',
  developerPreference: '',
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function FormulateScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FormulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateField = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleArray = useCallback((field: 'chemicalHistory' | 'sensitivities' | 'problemIndicators', value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  }, []);

  const handleNext = useCallback(() => {
    if (step < 6) {
      setStep((s) => s + 1);
      setError(null);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep((s) => s - 1);
      setError(null);
    }
  }, [step]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const input: FormulationInput = {
        currentLevel: formData.currentLevel,
        currentTone: formData.currentTone,
        targetLevel: formData.targetLevel,
        targetTone: formData.targetTone,
        texture: formData.texture,
        hairPattern: formData.hairPattern,
        density: formData.density,
        serviceType: formData.serviceType,
        chemicalHistory: formData.chemicalHistory,
        sensitivities: formData.sensitivities,
        lastChemicalService: formData.lastChemicalService,
        condition: {
          type: formData.conditionType,
          porosity: formData.porosity,
          grayPercent: formData.grayPercent,
          banding: formData.problemIndicators.includes('banding'),
          hotRoots: formData.problemIndicators.includes('hotRoots'),
          previousLightener: formData.problemIndicators.includes('previousLightener'),
          multipleColors: formData.problemIndicators.includes('multipleColors'),
          greenCast: formData.problemIndicators.includes('greenCast'),
          muddyToner: formData.problemIndicators.includes('muddyToner'),
          overAshy: formData.problemIndicators.includes('overAshy'),
          colorGrab: formData.problemIndicators.includes('colorGrab'),
          hollowEnds: formData.problemIndicators.includes('hollowEnds'),
        },
        brandPreference: formData.brandPreference || undefined,
        linePreference: formData.developerPreference || undefined,
      };

      const response = await submitFormulation(input);
      setResult(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate formula');
      Alert.alert('Formulation Failed', err.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const handleReset = useCallback(() => {
    setFormData(INITIAL_STATE);
    setStep(1);
    setResult(null);
    setError(null);
  }, []);

  // ─── Render Steps ──────────────────────────────────────────────────────────

  const renderStepContent = () => {
    switch (step) {
      // ─── STEP 1: Photo ─────────────────────────────────────────────────────
      case 1:
        return (
          <View style={stepStyles.container}>
            <Text style={stepStyles.stepTitle}>Start with a Photo</Text>
            <Text style={stepStyles.stepDesc}>
              Capture or upload hair photos for AI-assisted analysis. You'll need
              shots of the roots, mid-lengths, and ends.
            </Text>

            <TouchableOpacity
              style={stepStyles.photoCard}
              onPress={() => navigation.navigate('Camera')}
            >
              <View style={stepStyles.photoIconBg}>
                <Camera size={32} color={COLORS.purple} />
              </View>
              <View style={stepStyles.photoTextBlock}>
                <Text style={stepStyles.photoCardTitle}>Take Photos</Text>
                <Text style={stepStyles.photoCardDesc}>
                  Capture roots, mid-lengths, and ends for analysis
                </Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={stepStyles.photoCard}
              onPress={() => setStep(2)}
            >
              <View style={stepStyles.photoIconBg}>
                <Palette size={32} color={COLORS.pink} />
              </View>
              <View style={stepStyles.photoTextBlock}>
                <Text style={stepStyles.photoCardTitle}>Skip Photo</Text>
                <Text style={stepStyles.photoCardDesc}>
                  Enter hair details manually without a photo
                </Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        );

      // ─── STEP 2: Hair Assessment ───────────────────────────────────────────
      case 2:
        return (
          <View style={stepStyles.container}>
            <Text style={stepStyles.stepTitle}>Hair Assessment</Text>

            <ChipSelector
              label="Texture"
              options={TEXTURES}
              selected={formData.texture}
              onSelect={(v) => updateField('texture', v)}
            />

            <ChipSelector
              label="Density"
              options={DENSITIES}
              selected={formData.density}
              onSelect={(v) => updateField('density', v)}
            />

            <ChipSelector
              label="Pattern"
              options={HAIR_PATTERNS}
              selected={formData.hairPattern}
              onSelect={(v) => updateField('hairPattern', v)}
            />

            <LevelSlider
              label="Current Level"
              value={formData.currentLevel}
              onChange={(v) => updateField('currentLevel', v)}
            />

            <ToneSelector
              label="Current Tone"
              value={formData.currentTone}
              onChange={(v) => updateField('currentTone', v)}
            />
          </View>
        );

      // ─── STEP 3: Chemical History ──────────────────────────────────────────
      case 3:
        return (
          <View style={stepStyles.container}>
            <Text style={stepStyles.stepTitle}>Chemical History</Text>

            <ChipSelector
              label="Service Type"
              options={SERVICE_TYPES}
              selected={formData.serviceType}
              onSelect={(v) => updateField('serviceType', v)}
            />

            <MultiChipSelector
              label="Chemical History"
              options={CHEMICAL_HISTORY_ITEMS}
              selected={formData.chemicalHistory}
              onToggle={(v) => toggleArray('chemicalHistory', v)}
            />

            <MultiChipSelector
              label="Sensitivities"
              options={SENSITIVITIES}
              selected={formData.sensitivities}
              onToggle={(v) => toggleArray('sensitivities', v)}
            />

            <ChipSelector
              label="Last Chemical Service"
              options={LAST_SERVICE_OPTIONS}
              selected={formData.lastChemicalService as LastServiceType}
              onSelect={(v) => updateField('lastChemicalService', v)}
            />
          </View>
        );

      // ─── STEP 4: Target ────────────────────────────────────────────────────
      case 4:
        return (
          <View style={stepStyles.container}>
            <Text style={stepStyles.stepTitle}>Target Look</Text>

            <LevelSlider
              label="Target Level"
              value={formData.targetLevel}
              onChange={(v) => updateField('targetLevel', v)}
            />

            <ToneSelector
              label="Target Tone"
              value={formData.targetTone}
              onChange={(v) => updateField('targetTone', v)}
            />
          </View>
        );

      // ─── STEP 5: Condition ─────────────────────────────────────────────────
      case 5:
        return (
          <View style={stepStyles.container}>
            <Text style={stepStyles.stepTitle}>Hair Condition</Text>

            <ChipSelector
              label="Condition Type"
              options={CONDITION_TYPES}
              selected={formData.conditionType}
              onSelect={(v) => updateField('conditionType', v)}
            />

            <ChipSelector
              label="Porosity"
              options={POROSITY}
              selected={formData.porosity}
              onSelect={(v) => updateField('porosity', v)}
            />

            <GraySlider
              value={formData.grayPercent}
              onChange={(v) => updateField('grayPercent', v)}
            />

            <MultiChipSelector
              label="Problem Indicators"
              options={PROBLEM_INDICATORS.map((p) => ({
                value: p.key,
                label: p.label,
                desc: p.desc,
              }))}
              selected={formData.problemIndicators}
              onToggle={(v) => toggleArray('problemIndicators', v)}
            />
          </View>
        );

      // ─── STEP 6: Review & Generate ─────────────────────────────────────────
      case 6:
        return (
          <View style={stepStyles.container}>
            <Text style={stepStyles.stepTitle}>Review & Generate</Text>

            <SummarySection formData={formData} />

            {/* Brand Preferences */}
            <View style={{ marginTop: 16 }}>
              <Text style={chipStyles.label}>Brand Preference</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                  {BRANDS.map((brand) => (
                    <TouchableOpacity
                      key={brand}
                      style={[
                        chipStyles.chip,
                        formData.brandPreference === brand && chipStyles.chipActive,
                      ]}
                      onPress={() =>
                        updateField(
                          'brandPreference',
                          formData.brandPreference === brand ? '' : brand
                        )
                      }
                    >
                      <Text
                        style={[
                          chipStyles.chipText,
                          formData.brandPreference === brand && chipStyles.chipTextActive,
                        ]}
                      >
                        {brand}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Developer Preference */}
            <View style={{ marginTop: 12 }}>
              <Text style={chipStyles.label}>Developer Preference</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['10vol', '20vol', '30vol', '40vol'].map((dev) => (
                  <TouchableOpacity
                    key={dev}
                    style={[
                      chipStyles.chip,
                      formData.developerPreference === dev && chipStyles.chipActive,
                    ]}
                    onPress={() =>
                      updateField(
                        'developerPreference',
                        formData.developerPreference === dev ? '' : dev
                      )
                    }
                  >
                    <Text
                      style={[
                        chipStyles.chipText,
                        formData.developerPreference === dev && chipStyles.chipTextActive,
                      ]}
                    >
                      {dev}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Error */}
            {error && (
              <View style={stepStyles.errorBox}>
                <AlertTriangle size={16} color={COLORS.danger} />
                <Text style={stepStyles.errorText}>{error}</Text>
              </View>
            )}

            {/* Result shown after generation */}
            {result && <ResultCard result={result} />}

            {/* Reset */}
            <TouchableOpacity style={stepStyles.resetBtn} onPress={handleReset}>
              <RotateCcw size={16} color={COLORS.textSecondary} />
              <Text style={stepStyles.resetText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  // ─── Main Render ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Formulate</Text>
            <Text style={styles.headerSubtitle}>
              Step {step} of {STEPS.length}
            </Text>
          </View>
          {step > 1 && (
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetLink}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
          <View style={{ height: 24 }} />
        </ScrollView>

        {/* Bottom Navigation */}
        <NavButtons
          step={step}
          totalSteps={STEPS.length}
          onBack={handleBack}
          onNext={step === 6 ? handleGenerate : handleNext}
          nextLabel={step === 6 ? (loading ? 'Generating...' : 'Generate') : 'Next'}
          disabled={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const stepStyles = StyleSheet.create({
  container: { padding: 16 },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12,
  },
  photoIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(147,51,234,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTextBlock: { flex: 1 },
  photoCardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  photoCardDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.purple,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 20,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  generateBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  errorText: { color: COLORS.danger, fontSize: 13, fontWeight: '500', flex: 1 },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 12,
  },
  resetText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  resetLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.purple,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
