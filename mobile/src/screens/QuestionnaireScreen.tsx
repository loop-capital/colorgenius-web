// ============================================================
// QuestionnaireScreen — 3-Step Client Intake
// Step 1: Client Profile  →  Step 2: Hair Characteristics  →  Step 3: Review
// Saves client via createClient(), then navigates to Formulate with autoPopulateData
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, ChevronLeft, CheckCircle2, User, Phone, Mail, FileText } from 'lucide-react-native';
import { createClient } from '../api/client';
import {
  TEXTURES,
  HAIR_PATTERNS,
  DENSITIES,
  POROSITY,
  type TextureType,
  type HairPatternType,
  type DensityType,
  type Porosity,
} from '../types';

// ─── Theme ───────────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#0A0A1A',
  card: '#12121F',
  cardBorder: 'rgba(255,255,255,0.08)',
  textPrimary: '#F5F5F7',
  textSecondary: 'rgba(255,255,255,0.5)',
  textMuted: 'rgba(255,255,255,0.35)',
  purple: '#9333EA',
  pink: '#EC4899',
  green: '#10B981',
  yellow: '#F59E0B',
  danger: '#EF4444',
  success: '#22C55E',
  chipBorder: 'rgba(255,255,255,0.12)',
  chipBg: 'rgba(255,255,255,0.05)',
  chipActiveBg: 'rgba(147,51,234,0.2)',
  chipActiveBorder: '#9333EA',
};

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: 'Client Profile', label: 'Profile' },
  { id: 2, title: 'Hair Characteristics', label: 'Hair' },
  { id: 3, title: 'Review', label: 'Review' },
] as const;

const PERMANENT_SENSITIVITIES = [
  { value: 'ppd_allergy', label: 'PPD Allergy', desc: 'Allergic to PPD — use PPD-free alternatives' },
  { value: 'ammonia_sensitivity', label: 'Ammonia Sensitivity', desc: 'Sensitive to ammonia in color products' },
  { value: 'scalp_sensitivity', label: 'Scalp Sensitivity', desc: 'Easily irritated or reactive scalp' },
];

const SCALP_TYPES = [
  { value: 'normal', label: 'Normal', desc: 'Balanced, no issues' },
  { value: 'oily_scalp', label: 'Oily Scalp', desc: 'Excess sebum production' },
  { value: 'dry_scalp', label: 'Dry Scalp', desc: 'Dry, flaky, or tight scalp' },
  { value: 'psoriasis_eczema', label: 'Psoriasis / Eczema', desc: 'Chronic scalp condition' },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  clientName: string;
  phone: string;
  email: string;
  salonNotes: string;
  texture: TextureType | '';
  hairPattern: HairPatternType | '';
  density: DensityType | '';
  porosity: Porosity | '';
  grayPercent: number;
  sensitivities: string[];
  scalpType: string;
}

const INITIAL_DATA: FormData = {
  clientName: '',
  phone: '',
  email: '',
  salonNotes: '',
  texture: '',
  hairPattern: '',
  density: '',
  porosity: '',
  grayPercent: 0,
  sensitivities: [],
  scalpType: '',
};

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <View style={styles.stepIndicatorContainer}>
      <View style={styles.stepRow}>
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isLast = idx === STEPS.length - 1;

          return (
            <React.Fragment key={step.id}>
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, isActive && styles.stepCircleActive, isCompleted && styles.stepCircleCompleted]}>
                  {isCompleted ? (
                    <CheckCircle2 size={14} color="#FFF" />
                  ) : (
                    <Text style={[styles.stepCircleText, (isActive || isCompleted) && styles.stepCircleTextActive]}>
                      {step.id}
                    </Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]} numberOfLines={1}>
                  {step.label}
                </Text>
              </View>
              {!isLast && <View style={[styles.stepConnector, isCompleted && styles.stepConnectorCompleted]} />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

// ─── Gray Slider ─────────────────────────────────────────────────────────────

function GraySlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Gray Percentage</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Text style={{ color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', width: 48, textAlign: 'center' }}>{value}%</Text>
        <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${value}%`, backgroundColor: COLORS.purple, borderRadius: 3 }} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
        {[0, 25, 50, 75, 100].map((pct) => (
          <TouchableOpacity key={pct} onPress={() => onChange(pct)} style={{ alignItems: 'center' }}>
            <View style={{
              width: 16, height: 16, borderRadius: 8, borderWidth: 2,
              borderColor: value >= pct ? COLORS.purple : COLORS.chipBorder,
              backgroundColor: value >= pct ? COLORS.purple : 'transparent',
              marginBottom: 4,
            }} />
            <Text style={{ fontSize: 10, color: COLORS.textMuted }}>{pct}%</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Multi-Chip Selector ─────────────────────────────────────────────────────

function MultiChipSelector({ label, options, selected, onToggle }: {
  label: string;
  options: { value: string; label: string; desc?: string }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.chipGrid}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => onToggle(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{opt.label}</Text>
              {opt.desc && <Text style={styles.chipDesc} numberOfLines={1}>{opt.desc}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Single-Chip Selector ────────────────────────────────────────────────────

function SingleChipSelector<T extends string>({ label, options, selected, onSelect }: {
  label: string;
  options: { value: T; label: string; desc?: string; color?: string }[];
  selected: T;
  onSelect: (v: T) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.chipGrid}>
        {options.map((opt) => {
          const isSelected = opt.value === selected;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.7}
            >
              {opt.color && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: opt.color, marginRight: 6 }} />}
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{opt.label}</Text>
              {opt.desc && <Text style={styles.chipDesc} numberOfLines={1}>{opt.desc}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function QuestionnaireScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }, []
  );

  const toggleSensitivity = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      sensitivities: prev.sensitivities.includes(value)
        ? prev.sensitivities.filter((v) => v !== value)
        : [...prev.sensitivities, value],
    }));
  }, []);

  const handleNext = () => {
    if (step === 1 && !formData.clientName.trim()) {
      Alert.alert('Required', 'Please enter the client name');
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSaveClient = async () => {
    if (!formData.clientName.trim()) {
      Alert.alert('Required', 'Please enter the client name');
      return;
    }
    setLoading(true);
    try {
      await createClient({
        name: formData.clientName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        notes: formData.salonNotes.trim() || undefined,
        conditions: [
          ...(formData.texture ? [`Texture: ${formData.texture}`] : []),
          ...(formData.hairPattern ? [`Pattern: ${formData.hairPattern}`] : []),
          ...(formData.density ? [`Density: ${formData.density}`] : []),
          ...(formData.porosity ? [`Porosity: ${formData.porosity}`] : []),
          ...(formData.grayPercent > 0 ? [`Gray: ${formData.grayPercent}%`] : []),
          ...(formData.scalpType ? [`Scalp: ${formData.scalpType}`] : []),
          ...formData.sensitivities,
        ],
      });
      Alert.alert('Success', `Client "${formData.clientName}" saved!`, [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndFormulate = async () => {
    if (!formData.clientName.trim()) {
      Alert.alert('Required', 'Please enter the client name');
      return;
    }
    setLoading(true);
    try {
      const response = await createClient({
        name: formData.clientName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        notes: formData.salonNotes.trim() || undefined,
        conditions: [
          ...(formData.texture ? [`Texture: ${formData.texture}`] : []),
          ...(formData.hairPattern ? [`Pattern: ${formData.hairPattern}`] : []),
          ...(formData.density ? [`Density: ${formData.density}`] : []),
          ...(formData.porosity ? [`Porosity: ${formData.porosity}`] : []),
          ...(formData.grayPercent > 0 ? [`Gray: ${formData.grayPercent}%`] : []),
          ...(formData.scalpType ? [`Scalp: ${formData.scalpType}`] : []),
          ...formData.sensitivities,
        ],
      });
      if (response.client?.id) {
        navigation.navigate('Formulate', {
          clientId: response.client.id,
          clientName: formData.clientName,
          autoPopulateData: {
            texture: formData.texture,
            hairPattern: formData.hairPattern,
            density: formData.density,
            condition: { porosity: formData.porosity, grayPercent: formData.grayPercent },
            sensitivities: formData.sensitivities,
          },
        });
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render Steps ────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Client Profile</Text>
      <Text style={styles.stepDesc}>Enter your client's basic information</Text>
      <View style={styles.inputGroup}>
        <View style={styles.inputRow}>
          <User size={18} color={COLORS.textSecondary} />
          <TextInput style={styles.input} placeholder="Client Name *" placeholderTextColor={COLORS.textMuted}
            value={formData.clientName} onChangeText={(v) => updateField('clientName', v)} />
        </View>
        <View style={styles.inputRow}>
          <Phone size={18} color={COLORS.textSecondary} />
          <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad" value={formData.phone} onChangeText={(v) => updateField('phone', v)} />
        </View>
        <View style={styles.inputRow}>
          <Mail size={18} color={COLORS.textSecondary} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address" autoCapitalize="none" value={formData.email} onChangeText={(v) => updateField('email', v)} />
        </View>
        <View style={styles.inputRow}>
          <FileText size={18} color={COLORS.textSecondary} />
          <TextInput style={[styles.input, styles.textArea]} placeholder="Salon Notes" placeholderTextColor={COLORS.textMuted}
            multiline numberOfLines={3} value={formData.salonNotes} onChangeText={(v) => updateField('salonNotes', v)} />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Hair Characteristics</Text>
      <Text style={styles.stepDesc}>Document permanent hair traits for this client</Text>
      <SingleChipSelector label="Texture" options={TEXTURES} selected={formData.texture} onSelect={(v) => updateField('texture', v)} />
      <SingleChipSelector label="Hair Pattern" options={HAIR_PATTERNS} selected={formData.hairPattern} onSelect={(v) => updateField('hairPattern', v)} />
      <SingleChipSelector label="Density" options={DENSITIES} selected={formData.density} onSelect={(v) => updateField('density', v)} />
      <SingleChipSelector label="Porosity" options={POROSITY.map((p) => ({ ...p, desc: undefined }))} selected={formData.porosity} onSelect={(v) => updateField('porosity', v)} />
      <GraySlider value={formData.grayPercent} onChange={(v) => updateField('grayPercent', v)} />
      <MultiChipSelector label="Sensitivities" options={PERMANENT_SENSITIVITIES} selected={formData.sensitivities} onToggle={toggleSensitivity} />
      <SingleChipSelector label="Scalp Type" options={SCALP_TYPES} selected={formData.scalpType} onSelect={(v) => updateField('scalpType', v)} />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review</Text>
      <Text style={styles.stepDesc}>Review client info and hair characteristics</Text>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSectionTitle}>Client Profile</Text>
        <Text style={styles.reviewText}>{formData.clientName || 'Not provided'}</Text>
        {formData.phone ? <Text style={styles.reviewSubtext}>{formData.phone}</Text> : null}
        {formData.email ? <Text style={styles.reviewSubtext}>{formData.email}</Text> : null}
        {formData.salonNotes ? <Text style={styles.reviewSubtext}>Notes: {formData.salonNotes}</Text> : null}
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSectionTitle}>Hair Characteristics</Text>
        {formData.texture ? <Text style={styles.reviewText}>Texture: {TEXTURES.find((t) => t.value === formData.texture)?.label}</Text> : null}
        {formData.hairPattern ? <Text style={styles.reviewText}>Pattern: {HAIR_PATTERNS.find((p) => p.value === formData.hairPattern)?.label}</Text> : null}
        {formData.density ? <Text style={styles.reviewText}>Density: {DENSITIES.find((d) => d.value === formData.density)?.label}</Text> : null}
        {formData.porosity ? <Text style={styles.reviewText}>Porosity: {POROSITY.find((p) => p.value === formData.porosity)?.label}</Text> : null}
        <Text style={styles.reviewText}>Gray: {formData.grayPercent}%</Text>
        {formData.sensitivities.length > 0 && (
          <Text style={styles.reviewSubtext}>
            Sensitivities: {formData.sensitivities.map((s) => PERMANENT_SENSITIVITIES.find((sen) => sen.value === s)?.label).filter(Boolean).join(', ')}
          </Text>
        )}
        {formData.scalpType ? <Text style={styles.reviewSubtext}>Scalp: {SCALP_TYPES.find((s) => s.value === formData.scalpType)?.label}</Text> : null}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.saveBtn, loading && styles.saveBtnDisabled]} onPress={handleSaveClient} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator size="small" color="#FFF" /> : <><CheckCircle2 size={18} color="#FFF" /><Text style={styles.saveBtnText}>Save Client</Text></>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.formulateBtn, loading && styles.saveBtnDisabled]} onPress={handleSaveAndFormulate} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator size="small" color="#FFF" /> : <><ChevronRight size={18} color="#FFF" /><Text style={styles.formulateBtnText}>Save & Formulate</Text></>}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <StepIndicator currentStep={step} />
        <ScrollView contentContainerStyle={styles.scroll}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          <View style={{ height: 40 }} />
        </ScrollView>
        <View style={styles.buttonRow}>
          {step > 1 && (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <ChevronLeft size={20} color={COLORS.textSecondary} />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}
          {step < 3 && (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>Next</Text>
              <ChevronRight size={20} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 100 },
  stepIndicatorContainer: { paddingVertical: 16, paddingHorizontal: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stepItem: { alignItems: 'center' },
  stepCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  stepCircleActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  stepCircleCompleted: { backgroundColor: 'rgba(147,51,234,0.3)', borderColor: COLORS.purple },
  stepCircleText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  stepCircleTextActive: { color: '#FFF' },
  stepLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 4 },
  stepLabelActive: { color: COLORS.purple, fontWeight: '600' },
  stepConnector: { width: 24, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 4 },
  stepConnectorCompleted: { backgroundColor: 'rgba(147,51,234,0.5)' },
  stepContent: { marginTop: 8 },
  stepTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  stepDesc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },
  inputGroup: { gap: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.cardBorder, paddingHorizontal: 12, gap: 8 },
  input: { flex: 1, height: 48, color: COLORS.textPrimary, fontSize: 15 },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12, textTransform: 'uppercase' as any, letterSpacing: 0.5 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.cardBorder, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },
  chipActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  chipText: { fontSize: 13, color: COLORS.textSecondary },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  chipDesc: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  reviewCard: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.cardBorder, padding: 16, marginBottom: 12, gap: 4 },
  reviewSectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.purple, marginBottom: 4 },
  reviewText: { fontSize: 15, color: COLORS.textPrimary, marginBottom: 2 },
  reviewSubtext: { fontSize: 13, color: COLORS.textSecondary },
  actionButtons: { gap: 12, marginTop: 8 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.purple, borderRadius: 14, paddingVertical: 14, gap: 8 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  formulateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.pink, borderRadius: 14, paddingVertical: 14, gap: 8 },
  formulateBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.cardBorder, backgroundColor: COLORS.bg },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backBtnText: { fontSize: 15, color: COLORS.textSecondary },
  nextBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.purple, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, gap: 6 },
  nextBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
});
