import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  analyzeHair,
  formulateHair,
  HairInput,
  AnalyzeResult,
  FormulateResult,
  ToneFamily,
  ConditionType,
  Porosity,
  TONES,
  levelToHex,
} from '../services/formulation';
import type { FormulaComponent } from '../types';

const COLORS = {
  background: '#0F0F0F',
  surface: '#171717',
  primary: '#9333EA',
  text: '#F5F5F7',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  border: 'rgba(255,255,255,0.1)',
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
};

type Step = 'photo' | 'input' | 'loading' | 'results';

interface Props {
  onAddToScale: (components: FormulaComponent[]) => void;
}

const CONDITION_OPTIONS: Array<{ value: ConditionType; label: string }> = [
  { value: 'virgin',             label: 'Virgin' },
  { value: 'previously_colored', label: 'Prev. Colored' },
  { value: 'damaged',            label: 'Damaged' },
  { value: 'highly_damaged',     label: 'Highly Damaged' },
];

const GRAY_OPTIONS = [0, 25, 50, 75] as const;
const POROSITY_OPTIONS: Array<{ value: Porosity; label: string }> = [
  { value: 'low',    label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high',   label: 'High' },
];

export default function FormulateScreen({ onAddToScale }: Props) {
  const [step, setStep] = useState<Step>('photo');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Hair input state
  const [currentLevel, setCurrentLevel] = useState(5);
  const [currentTone, setCurrentTone] = useState<ToneFamily>('neutral');
  const [targetLevel, setTargetLevel] = useState(7);
  const [targetTone, setTargetTone] = useState<ToneFamily>('ash');
  const [conditionType, setConditionType] = useState<ConditionType>('previously_colored');
  const [grayPercent, setGrayPercent] = useState(0);
  const [porosity, setPorosity] = useState<Porosity>('normal');

  // Results
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [formulateResult, setFormulateResult] = useState<FormulateResult | null>(null);
  const [loadingStatus, setLoadingStatus] = useState('Analyzing hair...');
  const [error, setError] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to photograph client hair.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setStep('input');
    }
  };

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library access is needed to select a hair photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setStep('input');
    }
  };

  const handleAnalyze = async () => {
    setStep('loading');
    setError(null);

    const input: HairInput = {
      currentLevel,
      currentTone,
      targetLevel,
      targetTone,
      condition: {
        type: conditionType,
        porosity,
        grayPercent,
        highlights: false,
        highlightedPercent: 0,
      },
    };

    try {
      setLoadingStatus('Analyzing hair state...');
      // Both calls use identical input — run in parallel for speed
      const [analyze, formulate] = await Promise.all([
        analyzeHair(input).then(r => {
          setLoadingStatus('Building formula...');
          return r;
        }),
        formulateHair(input),
      ]);

      setAnalyzeResult(analyze);
      setFormulateResult(formulate);
      setStep('results');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      setError(msg);
      setStep('input');
      Alert.alert('Analysis Failed', msg);
    }
  };

  const handleAddToScale = () => {
    if (!formulateResult) return;
    const components: FormulaComponent[] = formulateResult.steps.map(s => ({
      shadeId: s.product.shadeCode,
      shadeName: `${s.product.shadeCode} ${s.product.shadeName}`,
      shadeCode: s.product.shadeCode,
      hex: levelToHex(s.product.level),
      targetGrams: s.grams,
      actualGrams: 0,
    }));
    onAddToScale(components);
  };

  const handleReset = () => {
    setStep('photo');
    setPhotoUri(null);
    setAnalyzeResult(null);
    setFormulateResult(null);
    setError(null);
  };

  // ─── Photo Step ─────────────────────────────────────────────────────────────
  if (step === 'photo') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.centerContent}>
        <Text style={styles.stepTitle}>Step 1 — Hair Photo</Text>
        <Text style={styles.stepSubtitle}>
          Photograph the client's hair to reference while assessing level and tone.
        </Text>

        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoPlaceholderIcon}>📷</Text>
          <Text style={styles.photoPlaceholderText}>No photo yet</Text>
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleTakePhoto}>
          <Text style={styles.btnPrimaryText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={handleChoosePhoto}>
          <Text style={styles.btnSecondaryText}>Choose from Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnGhost} onPress={() => setStep('input')}>
          <Text style={styles.btnGhostText}>Skip Photo →</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ─── Input Step ──────────────────────────────────────────────────────────────
  if (step === 'input') {
    return (
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.inputContent}>
          {photoUri && (
            <Image source={{ uri: photoUri }} style={styles.photoThumb} resizeMode="cover" />
          )}

          <Text style={styles.stepTitle}>Step 2 — Hair Assessment</Text>

          {/* Current Hair */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CURRENT HAIR</Text>
            <Text style={styles.fieldLabel}>Level</Text>
            <LevelPicker value={currentLevel} onChange={setCurrentLevel} />
            <Text style={styles.fieldLabel}>Tone</Text>
            <TonePicker value={currentTone} onChange={setCurrentTone} />
          </View>

          {/* Target */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TARGET</Text>
            <Text style={styles.fieldLabel}>Level</Text>
            <LevelPicker value={targetLevel} onChange={setTargetLevel} />
            <Text style={styles.fieldLabel}>Tone</Text>
            <TonePicker value={targetTone} onChange={setTargetTone} />
          </View>

          {/* Condition */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CONDITION</Text>
            <View style={styles.optionGrid}>
              {CONDITION_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionBtn, conditionType === opt.value && styles.optionBtnActive]}
                  onPress={() => setConditionType(opt.value)}
                >
                  <Text style={[styles.optionBtnText, conditionType === opt.value && styles.optionBtnTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Gray Coverage</Text>
            <View style={styles.optionRow}>
              {GRAY_OPTIONS.map(pct => (
                <TouchableOpacity
                  key={pct}
                  style={[styles.optionBtn, grayPercent === pct && styles.optionBtnActive]}
                  onPress={() => setGrayPercent(pct)}
                >
                  <Text style={[styles.optionBtnText, grayPercent === pct && styles.optionBtnTextActive]}>
                    {pct === 75 ? '75%+' : `${pct}%`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Porosity</Text>
            <View style={styles.optionRow}>
              {POROSITY_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionBtn, porosity === opt.value && styles.optionBtnActive]}
                  onPress={() => setPorosity(opt.value)}
                >
                  <Text style={[styles.optionBtnText, porosity === opt.value && styles.optionBtnTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={[styles.btnPrimary, styles.analyzeBtn]} onPress={handleAnalyze}>
            <Text style={styles.btnPrimaryText}>Analyze & Formulate →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ─── Loading Step ────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{loadingStatus}</Text>
      </View>
    );
  }

  // ─── Results Step ────────────────────────────────────────────────────────────
  const formula = analyzeResult?.formula;
  const formulate = formulateResult;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContent}>
        <View style={styles.resultsHeader}>
          <Text style={styles.stepTitle}>Formula Ready</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetLink}>New Analysis</Text>
          </TouchableOpacity>
        </View>

        {/* Shade Recommendation (from /api/analyze) */}
        {formula && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>SHADE RECOMMENDATION</Text>
            <Text style={styles.brandName}>{formula.brand}</Text>
            <Text style={styles.lineName}>{formula.line}</Text>
            <View style={styles.divider} />
            {formula.steps.map(s => (
              <View key={s.step} style={styles.shadeRow}>
                <View style={[styles.rolePill, roleStyle(s.role)]}>
                  <Text style={styles.rolePillText}>{s.role}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shadeCode}>{s.shadeCode}</Text>
                  <Text style={styles.shadeName}>{s.product}</Text>
                </View>
                <Text style={styles.shadeGrams}>{s.grams}g</Text>
              </View>
            ))}
          </View>
        )}

        {/* Full Formula Steps (from /api/formulate) */}
        {formulate && formulate.steps.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>FORMULA STEPS</Text>
            {formulate.steps.map((s, i) => (
              <View key={i} style={styles.formulaStep}>
                <View style={[styles.stepSwatch, { backgroundColor: levelToHex(s.product.level) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepShadeCode}>{s.product.shadeCode} {s.product.shadeName}</Text>
                  {s.notes && <Text style={styles.stepNote}>{s.notes}</Text>}
                </View>
                <Text style={styles.stepGrams}>{s.grams}g</Text>
              </View>
            ))}
          </View>
        )}

        {/* Developer */}
        {formula && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>DEVELOPER</Text>
            <View style={styles.devRow}>
              <DevStat label="Volume" value={`${formula.developer.volume} vol`} />
              <DevStat label="Amount" value={`${formula.developer.ml} ml`} />
              <DevStat label="Ratio" value={formula.mixingRatio} />
              <DevStat label="Process" value={`${formula.processingTime} min`} />
            </View>
          </View>
        )}

        {/* Notes */}
        {analyzeResult?.instructions.notes && analyzeResult.instructions.notes.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>NOTES</Text>
            {analyzeResult.instructions.notes.map((note, i) => (
              <Text key={i} style={styles.noteText}>• {note}</Text>
            ))}
          </View>
        )}

        {/* Warnings */}
        {analyzeResult?.instructions.warnings && analyzeResult.instructions.warnings.length > 0 && (
          <View style={[styles.card, styles.warningCard]}>
            <Text style={[styles.cardLabel, { color: COLORS.warning }]}>WARNINGS</Text>
            {analyzeResult.instructions.warnings.map((w, i) => (
              <Text key={i} style={styles.warningText}>⚠ {w}</Text>
            ))}
          </View>
        )}

        {/* Add to Scale */}
        <TouchableOpacity style={[styles.btnPrimary, styles.analyzeBtn]} onPress={handleAddToScale}>
          <Text style={styles.btnPrimaryText}>Add to Scale →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LevelPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.levelRow}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
        <TouchableOpacity
          key={n}
          style={[styles.levelBtn, value === n && styles.levelBtnActive]}
          onPress={() => onChange(n)}
        >
          <View style={[styles.levelSwatch, { backgroundColor: levelToHex(n) }]} />
          <Text style={[styles.levelNum, value === n && styles.levelNumActive]}>{n}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function TonePicker({ value, onChange }: { value: ToneFamily; onChange: (v: ToneFamily) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toneScroll}>
      {TONES.map(t => (
        <TouchableOpacity
          key={t.value}
          style={[styles.tonePill, value === t.value && { borderColor: t.color, backgroundColor: t.color + '30' }]}
          onPress={() => onChange(t.value)}
        >
          <View style={[styles.toneDot, { backgroundColor: t.color }]} />
          <Text style={[styles.tonePillText, value === t.value && { color: COLORS.text }]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function DevStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.devStat}>
      <Text style={styles.devStatLabel}>{label}</Text>
      <Text style={styles.devStatValue}>{value}</Text>
    </View>
  );
}

function roleStyle(role: string): object {
  const map: Record<string, object> = {
    primary:   { backgroundColor: '#9333EA20', borderColor: '#9333EA' },
    secondary: { backgroundColor: '#8B5CF620', borderColor: '#8B5CF6' },
    additive:  { backgroundColor: '#F59E0B20', borderColor: '#F59E0B' },
    corrective:{ backgroundColor: '#EF444420', borderColor: '#EF4444' },
  };
  return map[role] ?? {};
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  inputContent: { padding: 16, paddingBottom: 40 },

  stepTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  stepSubtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32 },

  // Photo step
  photoPlaceholder: {
    width: 200, height: 200, borderRadius: 16,
    borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  photoPlaceholderIcon: { fontSize: 40, marginBottom: 8 },
  photoPlaceholderText: { color: COLORS.textMuted, fontSize: 15 },

  photoThumb: { width: '100%', height: 180, borderRadius: 12, marginBottom: 16 },

  btnPrimary: {
    backgroundColor: COLORS.primary, paddingVertical: 15,
    borderRadius: 12, alignItems: 'center', width: '100%', marginBottom: 12,
  },
  btnPrimaryText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  btnSecondary: {
    borderWidth: 1, borderColor: COLORS.border, paddingVertical: 15,
    borderRadius: 12, alignItems: 'center', width: '100%', marginBottom: 12,
  },
  btnSecondaryText: { color: COLORS.textSecondary, fontSize: 16 },
  btnGhost: { paddingVertical: 12, alignItems: 'center', width: '100%' },
  btnGhostText: { color: COLORS.textMuted, fontSize: 15 },

  analyzeBtn: { marginTop: 8 },

  // Form sections
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.primary, letterSpacing: 1, marginBottom: 12 },
  fieldLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8, marginTop: 12 },

  levelRow: { flexDirection: 'row', gap: 4 },
  levelBtn: {
    flex: 1, borderRadius: 8, alignItems: 'center', paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  levelBtnActive: { borderColor: COLORS.primary },
  levelSwatch: { width: 16, height: 6, borderRadius: 3, marginBottom: 3 },
  levelNum: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  levelNumActive: { color: COLORS.primary },

  toneScroll: { flexGrow: 0, marginBottom: 4 },
  tonePill: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, marginRight: 8,
  },
  toneDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  tonePillText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },

  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionRow: { flexDirection: 'row', gap: 8 },
  optionBtn: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  optionBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '20' },
  optionBtnText: { color: COLORS.textMuted, fontSize: 13 },
  optionBtnTextActive: { color: COLORS.primary },

  errorText: { color: COLORS.danger, fontSize: 14, marginBottom: 12 },

  // Loading
  loadingText: { color: COLORS.textSecondary, fontSize: 16, marginTop: 20 },

  // Results
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resetLink: { color: COLORS.primary, fontSize: 15 },

  card: {
    backgroundColor: '#171717', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 14,
  },
  warningCard: { borderColor: COLORS.warning + '60' },
  cardLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: COLORS.textMuted, marginBottom: 12 },

  brandName: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  lineName: { color: COLORS.textSecondary, fontSize: 14, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },

  shadeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rolePill: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, marginRight: 10,
  },
  rolePillText: { fontSize: 10, color: COLORS.text, fontWeight: '600' },
  shadeCode: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  shadeName: { color: COLORS.textSecondary, fontSize: 12, marginTop: 1 },
  shadeGrams: { color: COLORS.primary, fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },

  formulaStep: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  stepSwatch: { width: 28, height: 28, borderRadius: 6, marginRight: 12 },
  stepShadeCode: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  stepNote: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  stepGrams: { color: COLORS.primary, fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },

  devRow: { flexDirection: 'row', justifyContent: 'space-between' },
  devStat: { alignItems: 'center', flex: 1 },
  devStatLabel: { color: COLORS.textMuted, fontSize: 11 },
  devStatValue: { color: COLORS.text, fontSize: 16, fontWeight: '600', marginTop: 4 },

  noteText: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 6, lineHeight: 18 },
  warningText: { color: COLORS.warning, fontSize: 13, marginBottom: 6, lineHeight: 18 },
});
