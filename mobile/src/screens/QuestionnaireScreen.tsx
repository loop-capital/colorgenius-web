// ============================================================
// QuestionnaireScreen — 4-Step Consultation (matches web app)
// Steps: Client Profile → Current Hair State → Desired Result → Review
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
import { submitFormulation } from '../api/client';
import {
  HAIR_LEVEL_NAMES,
  TONES,
  CONDITION_TYPES,
  BRANDS,
  type ToneValue,
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
  purpleGlow: 'rgba(147,51,234,0.3)',
  pink: '#EC4899',
  green: '#10B981',
  yellow: '#F59E0B',
  danger: '#EF4444',
  success: '#22C55E',
};

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: 'Client Profile', label: 'Profile' },
  { id: 2, title: 'Current Hair State', label: 'Current' },
  { id: 3, title: 'Desired Result', label: 'Desired' },
  { id: 4, title: 'Review & Submit', label: 'Review' },
] as const;

const HAIR_CONDITIONS = [
  { id: 'virgin', label: 'Virgin Hair' },
  { id: 'previously_colored', label: 'Previously Colored' },
  { id: 'bleached', label: 'Bleached / Lightened' },
  { id: 'damaged', label: 'Damaged' },
  { id: 'gray', label: 'Gray Coverage Needed' },
  { id: 'dry', label: 'Dry / Brittle' },
  { id: 'oily', label: 'Oily Scalp' },
  { id: 'fine', label: 'Fine / Thin' },
  { id: 'thick', label: 'Thick / Coarse' },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  clientName: string;
  phone: string;
  email: string;
  salonNotes: string;
  currentLevel: number;
  currentTone: string;
  hairCondition: string[];
  targetLevel: number;
  targetTone: string;
  brandPreference: string;
  linePreference: string;
  specialRequests: string;
}

const INITIAL_DATA: FormData = {
  clientName: '',
  phone: '',
  email: '',
  salonNotes: '',
  currentLevel: 5,
  currentTone: 'N',
  hairCondition: [],
  targetLevel: 7,
  targetTone: 'N',
  brandPreference: '',
  linePreference: '',
  specialRequests: '',
};

// ─── Level Selector ──────────────────────────────────────────────────────────

function LevelSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.levelSection}>
      <Text style={styles.levelLabel}>{label}</Text>
      <View style={styles.levelRow}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={[styles.levelChip, value === lvl && styles.levelChipActive]}
            onPress={() => onChange(lvl)}
          >
            <Text
              style={[
                styles.levelChipText,
                value === lvl && styles.levelChipTextActive,
              ]}
            >
              {lvl}
            </Text>
            <Text style={styles.levelName}>{HAIR_LEVEL_NAMES[lvl]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Tone Selector ─────────────────────────────────────────────────────────

function ToneSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.toneSection}>
      <Text style={styles.toneLabel}>{label}</Text>
      <View style={styles.toneGrid}>
        {TONES.map((tone) => (
          <TouchableOpacity
            key={tone.value}
            style={[styles.toneChip, value === tone.value && styles.toneChipActive]}
            onPress={() => onChange(tone.value)}
          >
            <View style={[styles.toneSwatch, { backgroundColor: tone.color }]} />
            <Text
              style={[
                styles.toneChipText,
                value === tone.value && styles.toneChipTextActive,
              ]}
            >
              {tone.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Condition Selector ────────────────────────────────────────────────────

function ConditionSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((c) => c !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <View style={styles.conditionSection}>
      <Text style={styles.conditionLabel}>Hair Condition (select all that apply)</Text>
      <View style={styles.conditionGrid}>
        {HAIR_CONDITIONS.map((cond) => (
          <TouchableOpacity
            key={cond.id}
            style={[
              styles.conditionChip,
              value.includes(cond.id) && styles.conditionChipActive,
            ]}
            onPress={() => toggle(cond.id)}
          >
            <Text
              style={[
                styles.conditionChipText,
                value.includes(cond.id) && styles.conditionChipTextActive,
              ]}
            >
              {cond.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <View style={styles.stepIndicatorContainer}>
      <View style={styles.stepRow}>
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isLast = step.id === STEPS.length;

          return (
            <React.Fragment key={step.id}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    isActive && styles.stepCircleActive,
                    isCompleted && styles.stepCircleCompleted,
                  ]}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={14} color="#FFF" />
                  ) : (
                    <Text
                      style={[
                        styles.stepCircleText,
                        (isActive || isCompleted) && styles.stepCircleTextActive,
                      ]}
                    >
                      {step.id}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isActive && styles.stepLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.stepConnector,
                    isCompleted && styles.stepConnectorCompleted,
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

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function QuestionnaireScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleNext = () => {
    if (step === 1 && !formData.clientName.trim()) {
      Alert.alert('Required', 'Please enter the client name');
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Build formulation input from consultation data
      const input = {
        hairTexture: 'medium' as const,
        hairPattern: 'straight' as const,
        hairDensity: 'medium' as const,
        currentLevel: formData.currentLevel,
        currentTone: formData.currentTone as ToneValue,
        targetLevel: formData.targetLevel,
        targetTone: formData.targetTone as ToneValue,
        brand: formData.brandPreference || undefined,
        line: formData.linePreference || undefined,
        lastServiceType: undefined,
        chemicalHistory: [],
        sensitivities: [],
        porosity: 'normal' as const,
        condition: formData.hairCondition as any,
        problemIndicators: [],
        specialRequests: formData.specialRequests,
        scalpCondition: undefined,
      };

      const result = await submitFormulation(input);
      if (result.success) {
        Alert.alert('Success', 'Consultation saved! Formula created.', [
          {
            text: 'View Formula',
            onPress: () => navigation.navigate('Formulate', { initialStep: 6 }),
          },
          { text: 'Done', style: 'cancel' },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create formula');
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
          <TextInput
            style={styles.input}
            placeholder="Client Name *"
            placeholderTextColor={COLORS.textMuted}
            value={formData.clientName}
            onChangeText={(v) => updateField('clientName', v)}
          />
        </View>

        <View style={styles.inputRow}>
          <Phone size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(v) => updateField('phone', v)}
          />
        </View>

        <View style={styles.inputRow}>
          <Mail size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(v) => updateField('email', v)}
          />
        </View>

        <View style={styles.inputRow}>
          <FileText size={18} color={COLORS.textSecondary} />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Salon Notes"
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            value={formData.salonNotes}
            onChangeText={(v) => updateField('salonNotes', v)}
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Current Hair State</Text>
      <Text style={styles.stepDesc}>Document the current hair condition</Text>

      <LevelSelector
        label="Current Level"
        value={formData.currentLevel}
        onChange={(v) => updateField('currentLevel', v)}
      />

      <ToneSelector
        label="Current Tone"
        value={formData.currentTone}
        onChange={(v) => updateField('currentTone', v)}
      />

      <ConditionSelector
        value={formData.hairCondition}
        onChange={(v) => updateField('hairCondition', v)}
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Desired Result</Text>
      <Text style={styles.stepDesc}>Define the target color and preferences</Text>

      <LevelSelector
        label="Target Level"
        value={formData.targetLevel}
        onChange={(v) => updateField('targetLevel', v)}
      />

      <ToneSelector
        label="Target Tone"
        value={formData.targetTone}
        onChange={(v) => updateField('targetTone', v)}
      />

      {/* Brand Preference */}
      <View style={styles.brandSection}>
        <Text style={styles.brandLabel}>Brand Preference</Text>
        <View style={styles.brandGrid}>
          {BRANDS.map((brand) => (
            <TouchableOpacity
              key={brand}
              style={[
                styles.brandChip,
                formData.brandPreference === brand && styles.brandChipActive,
              ]}
              onPress={() => updateField('brandPreference', brand)}
            >
              <Text
                style={[
                  styles.brandChipText,
                  formData.brandPreference === brand && styles.brandChipTextActive,
                ]}
              >
                {brand}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Special Requests */}
      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Special requests or notes..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={3}
          value={formData.specialRequests}
          onChangeText={(v) => updateField('specialRequests', v)}
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review & Submit</Text>
      <Text style={styles.stepDesc}>Review all details before creating the formula</Text>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSectionTitle}>Client</Text>
        <Text style={styles.reviewText}>{formData.clientName || 'Not provided'}</Text>
        {formData.phone && <Text style={styles.reviewSubtext}>{formData.phone}</Text>}
        {formData.email && <Text style={styles.reviewSubtext}>{formData.email}</Text>}

        <Text style={styles.reviewSectionTitle}>Current State</Text>
        <Text style={styles.reviewText}>
          Level {formData.currentLevel} — {TONES.find((t) => t.value === formData.currentTone)?.label || 'Natural'}
        </Text>
        {formData.hairCondition.length > 0 && (
          <Text style={styles.reviewSubtext}>
            {formData.hairCondition.map((c) => HAIR_CONDITIONS.find((h) => h.id === c)?.label).join(', ')}
          </Text>
        )}

        <Text style={styles.reviewSectionTitle}>Desired Result</Text>
        <Text style={styles.reviewText}>
          Level {formData.targetLevel} — {TONES.find((t) => t.value === formData.targetTone)?.label || 'Natural'}
        </Text>
        {formData.brandPreference && (
          <Text style={styles.reviewSubtext}>Brand: {formData.brandPreference}</Text>
        )}
        {formData.specialRequests && (
          <Text style={styles.reviewSubtext}>Notes: {formData.specialRequests}</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StepIndicator currentStep={step} />

        <ScrollView contentContainerStyle={styles.scroll}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.buttonRow}>
          {step > 1 && (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <ChevronLeft size={20} color={COLORS.textSecondary} />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}

          {step < 4 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>Next</Text>
              <ChevronRight size={20} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Text style={styles.nextBtnText}>Create Formula</Text>
                  <ChevronRight size={20} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 100,
  },

  // Step Indicator
  stepIndicatorContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  stepCircleCompleted: {
    backgroundColor: 'rgba(147,51,234,0.3)',
    borderColor: COLORS.purple,
  },
  stepCircleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  stepCircleTextActive: {
    color: '#FFF',
  },
  stepLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  stepLabelActive: {
    color: COLORS.purple,
    fontWeight: '600',
  },
  stepConnector: {
    width: 24,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 4,
  },
  stepConnectorCompleted: {
    backgroundColor: 'rgba(147,51,234,0.5)',
  },

  // Step Content
  stepContent: {
    marginTop: 8,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },

  // Inputs
  inputGroup: {
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // Level Selector
  levelSection: {
    marginBottom: 20,
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelChip: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  levelChipActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  levelChipText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  levelChipTextActive: {
    color: '#FFF',
  },
  levelName: {
    fontSize: 8,
    color: COLORS.textSecondary,
  },

  // Tone Selector
  toneSection: {
    marginBottom: 20,
  },
  toneLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  toneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  toneChipActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  toneSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  toneChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  toneChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },

  // Condition Selector
  conditionSection: {
    marginBottom: 20,
  },
  conditionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionChip: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  conditionChipActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  conditionChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  conditionChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },

  // Brand Selector
  brandSection: {
    marginBottom: 20,
  },
  brandLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  brandChip: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  brandChipActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  brandChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  brandChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },

  // Review
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    gap: 8,
  },
  reviewSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.purple,
    marginTop: 8,
  },
  reviewText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  reviewSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    backgroundColor: COLORS.bg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});
