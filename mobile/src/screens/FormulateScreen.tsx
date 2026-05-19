import React, { useState } from 'react';
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
import { Camera, Palette, RotateCcw, ChevronRight } from 'lucide-react-native';
import { submitFormulation, FormulationInput } from '../api/client';

// ─── Inline types ────────────────────────────────────────────────────────────
type HairConditionType = 'virgin' | 'previously_colored' | 'damaged' | 'highly_damaged';
type Porosity = 'low' | 'normal' | 'high';
type Tone = 'neutral' | 'warm' | 'cool' | 'ash' | 'golden' | 'copper' |
  'red' | 'violet' | 'pearl' | 'beige' | 'mahogany' | 'chocolate';

// ─── Inline constants ────────────────────────────────────────────────────────
const HAIR_LEVEL_NAMES: Record<number, string> = {
  1: 'Black', 2: 'Very Dark Brown', 3: 'Dark Brown', 4: 'Medium Brown',
  5: 'Light Brown', 6: 'Dark Blonde', 7: 'Medium Blonde', 8: 'Light Blonde',
  9: 'Very Light Blonde', 10: 'Platinum',
};

const TONES: Tone[] = [
  'neutral', 'warm', 'cool', 'ash', 'golden', 'copper',
  'red', 'violet', 'pearl', 'beige', 'mahogany', 'chocolate',
];

const TONE_COLORS: Record<string, string> = {
  neutral: '#B0A090', warm: '#D4A574', cool: '#7BA7C9', ash: '#8FA39A',
  golden: '#C9A84C', copper: '#B87333', red: '#C94C4C', violet: '#9B59B6',
  pearl: '#D5C8E0', beige: '#C9B99A', mahogany: '#6E3B3B', chocolate: '#5C3317',
};

const HAIR_TYPES: { value: HairConditionType; label: string }[] = [
  { value: 'virgin', label: 'Virgin' },
  { value: 'previously_colored', label: 'Previously Colored' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'highly_damaged', label: 'Highly Damaged' },
];

const POROSITY: { value: Porosity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
];

const BRANDS = [
  'Wella', 'Redken', 'Schwarzkopf', 'Igora', 'Pravana',
  'Matrix', "L'Oréal", 'Goldwell', 'Davines', 'Kenra',
  'Pulp Riot', 'Joico', 'Olaplex', 'Moroccanoil',
];

// ─── Inline LevelSlider ──────────────────────────────────────────────────────
function levelColor(lvl: number): string {
  const colors = [
    '#1C1C1C', '#2E1A0E', '#3E2723', '#5D4037', '#795548',
    '#A1887F', '#C8A96E', '#D4B86A', '#E8D5A3', '#F5E6C8',
  ];
  return colors[lvl - 1] ?? '#888';
}

function LevelSlider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label?: string }) {
  return (
    <View style={lvlStyles.container}>
      {label && <Text style={lvlStyles.label}>{label}</Text>}
      <Text style={lvlStyles.levelName}>Level {value} — {HAIR_LEVEL_NAMES[value] ?? ''}</Text>
      <View style={lvlStyles.row}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
          <Pressable
            key={lvl}
            onPress={() => onChange(lvl)}
            style={[lvlStyles.dot, lvl === value && lvlStyles.dotActive, { backgroundColor: levelColor(lvl) }]}
          >
            <Text style={[lvlStyles.dotLabel, lvl === value && lvlStyles.dotLabelActive]}>{lvl}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const lvlStyles = StyleSheet.create({
  container: { marginVertical: 12 },
  label: { color: '#D4A574', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  levelName: { color: '#FFFFFF', fontSize: 16, fontWeight: '500', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  dot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  dotActive: { borderColor: '#D4A574' },
  dotLabel: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  dotLabelActive: { color: '#D4A574' },
});

// ─── Inline ToneSelector ─────────────────────────────────────────────────────
function ToneSelector({ value, onChange, label }: { value: Tone; onChange: (t: Tone) => void; label?: string }) {
  return (
    <View style={toneStyles.container}>
      {label && <Text style={toneStyles.label}>{label}</Text>}
      <View style={toneStyles.grid}>
        {TONES.map((tone) => {
          const selected = tone === value;
          const accent = TONE_COLORS[tone] ?? '#D4A574';
          return (
            <Pressable
              key={tone}
              onPress={() => onChange(tone)}
              style={[toneStyles.chip, selected && { backgroundColor: accent, borderColor: accent }]}
            >
              <Text style={[toneStyles.chipText, selected && toneStyles.chipTextSelected]}>
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
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
  label: { color: '#D4A574', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333355', backgroundColor: '#1A1A2E' },
  chipText: { color: '#AAAACC', fontSize: 13, fontWeight: '500' },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '700' },
});

// ─── ChipSelector ────────────────────────────────────────────────────────────
interface ChipSelectorProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
}

function ChipSelector({ label, options, selected, onSelect }: ChipSelectorProps) {
  return (
    <View style={chipStyles.container}>
      <Text style={chipStyles.label}>{label}</Text>
      <View style={chipStyles.row}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[chipStyles.chip, selected === opt.value && chipStyles.chipActive]}
            onPress={() => onSelect(opt.value)}
          >
            <Text style={[chipStyles.chipText, selected === opt.value && chipStyles.chipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  container: { marginVertical: 12 },
  label: { color: '#D4A574', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333355', backgroundColor: '#1A1A2E' },
  chipActive: { backgroundColor: '#D4A574', borderColor: '#D4A574' },
  chipText: { color: '#AAAACC', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function FormulateScreen({ navigation }: any) {
  const [currentLevel, setCurrentLevel] = useState(5);
  const [currentTone, setCurrentTone] = useState<Tone>('neutral');
  const [targetLevel, setTargetLevel] = useState(7);
  const [targetTone, setTargetTone] = useState<Tone>('ash');
  const [hairType, setHairType] = useState<HairConditionType>('previously_colored');
  const [porosity, setPorosity] = useState<Porosity>('normal');
  const [grayPercent, setGrayPercent] = useState('0');
  const [brandPref, setBrandPref] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFormulate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const input: FormulationInput = {
        currentLevel,
        currentTone,
        targetLevel,
        targetTone,
        condition: { type: hairType, porosity, grayPercent: Number(grayPercent) || 0 },
        brandPreference: brandPref || undefined,
      };
      const response = await submitFormulation(input);
      setResult(response.data);
    } catch (err: any) {
      Alert.alert('Formulation Failed', err.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentLevel(5);
    setCurrentTone('neutral');
    setTargetLevel(7);
    setTargetTone('ash');
    setHairType('previously_colored');
    setPorosity('normal');
    setGrayPercent('0');
    setBrandPref('');
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Formulate</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Camera')}>
            <Camera size={24} color="#D4A574" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity style={styles.cameraCTA} onPress={() => navigation.navigate('Camera')}>
            <Camera size={20} color="#D4A574" />
            <Text style={styles.cameraCTAText}>Take Photo for Auto-Analysis</Text>
            <ChevronRight size={18} color="#D4A574" />
          </TouchableOpacity>

          <Text style={styles.sectionHeader}>Current Hair</Text>
          <LevelSlider label="Level" value={currentLevel} onChange={setCurrentLevel} />
          <ToneSelector label="Tone" value={currentTone} onChange={setCurrentTone} />

          <Text style={styles.sectionHeader}>Target</Text>
          <LevelSlider label="Level" value={targetLevel} onChange={setTargetLevel} />
          <ToneSelector label="Tone" value={targetTone} onChange={setTargetTone} />

          <Text style={styles.sectionHeader}>Hair Condition</Text>
          <ChipSelector label="Type" options={HAIR_TYPES} selected={hairType} onSelect={(v) => setHairType(v as HairConditionType)} />
          <ChipSelector label="Porosity" options={POROSITY} selected={porosity} onSelect={(v) => setPorosity(v as Porosity)} />

          <View style={styles.graySection}>
            <Text style={chipStyles.label}>Gray %</Text>
            <View style={styles.grayRow}>
              <TextInput
                style={styles.grayInput}
                value={grayPercent}
                onChangeText={setGrayPercent}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#555"
                maxLength={3}
              />
              <Text style={styles.grayHint}>%</Text>
            </View>
          </View>

          <View style={styles.brandSection}>
            <Text style={chipStyles.label}>Brand Preference (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {BRANDS.map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[chipStyles.chip, brandPref === b && chipStyles.chipActive]}
                    onPress={() => setBrandPref(brandPref === b ? '' : b)}
                  >
                    <Text style={[chipStyles.chipText, brandPref === b && chipStyles.chipTextActive]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <RotateCcw size={18} color="#AAAACC" />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formulateBtn, loading && styles.formulateBtnDisabled]}
              onPress={handleFormulate}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" size="small" /> : (
                <>
                  <Palette size={20} color="#FFF" />
                  <Text style={styles.formulateText}>Formulate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {result && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Formulation Result</Text>
              {result.steps?.map((step: any, i: number) => (
                <View key={i} style={styles.resultStep}>
                  <Text style={styles.stepRole}>{step.role || `Step ${i + 1}`}</Text>
                  <Text style={styles.stepProduct}>{step.product?.name || step.product || 'N/A'}</Text>
                  {step.grams && <Text style={styles.stepMeta}>{step.grams}g</Text>}
                  {step.notes && <Text style={styles.stepNotes}>{step.notes}</Text>}
                </View>
              ))}
              {!result.steps && (
                <Text style={styles.resultBody}>{JSON.stringify(result, null, 2)}</Text>
              )}
              {result.developerVolume && <Text style={styles.resultMeta}>Developer: {result.developerVolume}</Text>}
              {result.processingTime && <Text style={styles.resultMeta}>Process: {result.processingTime}</Text>}
              {result.application && <Text style={styles.resultMeta}>Application: {result.application}</Text>}
              <TouchableOpacity style={styles.saveBtn}>
                <Text style={styles.saveText}>Save Formulation</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  scroll: { padding: 16 },
  cameraCTA: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', borderRadius: 12, padding: 14, marginBottom: 24, gap: 10, borderWidth: 1, borderColor: '#333355' },
  cameraCTAText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#D4A574' },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 4, marginTop: 16 },
  graySection: { marginVertical: 12 },
  grayRow: { flexDirection: 'row', alignItems: 'center' },
  grayInput: { backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#333355', borderRadius: 12, padding: 12, fontSize: 16, width: 80, textAlign: 'center', fontWeight: '600', color: '#FFFFFF' },
  grayHint: { fontSize: 16, color: '#AAAACC', marginLeft: 8 },
  brandSection: { marginVertical: 12 },
  actions: { flexDirection: 'row', gap: 12, marginVertical: 24 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#333355' },
  resetText: { fontSize: 14, fontWeight: '600', color: '#AAAACC' },
  formulateBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#D4A574', borderRadius: 12, paddingVertical: 14, shadowColor: '#D4A574', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  formulateBtnDisabled: { opacity: 0.6 },
  formulateText: { fontSize: 16, fontWeight: '700', color: '#0D0D1A' },
  resultCard: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333355' },
  resultTitle: { fontSize: 18, fontWeight: '700', color: '#D4A574', marginBottom: 12 },
  resultStep: { backgroundColor: '#0D0D1A', borderRadius: 10, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#D4A574' },
  stepRole: { fontSize: 11, fontWeight: '700', color: '#D4A574', textTransform: 'uppercase' },
  stepProduct: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginTop: 2 },
  stepMeta: { fontSize: 13, color: '#AAAACC', marginTop: 2 },
  stepNotes: { fontSize: 12, color: '#777', marginTop: 4, fontStyle: 'italic' },
  resultBody: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, color: '#AAAACC', backgroundColor: '#0D0D1A', padding: 12, borderRadius: 8, maxHeight: 300 },
  resultMeta: { fontSize: 13, color: '#AAAACC', marginTop: 4 },
  saveBtn: { backgroundColor: '#D4A574', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  saveText: { fontSize: 14, fontWeight: '700', color: '#0D0D1A' },
});
