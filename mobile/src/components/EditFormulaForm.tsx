// ============================================================
// EditFormulaForm — Modal for editing AI-generated formulas
// Allows stylists to modify any field before saving
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { CheckCircle2, FlaskConical } from 'lucide-react-native';
import type { FormulationResult, FormulationStep } from '../types';
// Import COLORS from shared constants or define locally
const COLORS = {
  bg: '#0A0A1A',
  card: '#12121F',
  cardBorder: 'rgba(255,255,255,0.08)',
  textPrimary: '#F5F5F7',
  textSecondary: 'rgba(255,255,255,0.5)',
  textMuted: 'rgba(255,255,255,0.35)',
  purple: '#9333EA',
  pink: '#EC4899',
  danger: '#EF4444',
  success: '#22C55E',
};

interface EditStep {
  id: string;
  brand: string;
  shadeCode: string;
  name: string;
  grams: string;
  developerVolume: string;
  processingTime: string;
  notes: string;
}

interface EditFormulaFormProps {
  result: FormulationResult;
  onSave: (result: FormulationResult) => void;
  onCancel: () => void;
  brands: string[];
}

const BRANDS_DEFAULT = [
  'Wella', 'Schwarzkopf', 'L\'Oréal', 'Redken', 'Matrix',
  'Goldwell', 'Joico', 'Pravana', 'Kenra', 'Pulp Riot',
  'Igora Royal', 'TIGI', 'Rusk', 'Framesi', 'Alfaparf',
  'Davines', 'Kemon', 'Olaplex',
];

export default function EditFormulaForm({ result, onSave, onCancel, brands }: EditFormulaFormProps) {
  const allBrands = brands.length > 0 ? brands : BRANDS_DEFAULT;

  const [editedSteps, setEditedSteps] = useState<EditStep[]>(() =>
    result.steps.map((step) => ({
      id: Math.random().toString(36).slice(2),
      brand: step.product?.brand ?? allBrands[0] ?? '',
      shadeCode: step.product?.shadeCode ?? '',
      name: step.product?.name ?? '',
      grams: step.grams ? String(step.grams) : '',
      developerVolume: step.developer?.volume ? String(step.developer.volume) : '20vol',
      processingTime: '',
      notes: step.notes ?? '',
    }))
  );

  const updateStep = (id: string, field: keyof EditStep, value: string) => {
    setEditedSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addStep = () => {
    setEditedSteps((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        brand: allBrands[0] ?? '',
        shadeCode: '',
        name: '',
        grams: '',
        developerVolume: '20vol',
        processingTime: '',
        notes: '',
      },
    ]);
  };

  const removeStep = (id: string) => {
    setEditedSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    const steps: FormulationStep[] = editedSteps.map((s) => ({
      role: 'color',
      grams: s.grams ? parseInt(s.grams, 10) || 0 : 0,
      product: {
        name: s.name || s.shadeCode,
        brand: s.brand,
        shadeCode: s.shadeCode,
        ratio: '1:1',
      },
      developer: {
        volume: s.developerVolume ? parseInt(s.developerVolume, 10) || 0 : 0,
      },
      notes: s.notes,
    }));

    const updatedResult: FormulationResult = {
      success: true,
      steps,
      brand: editedSteps[0]?.brand ?? '',
      developerVolume: editedSteps[0]?.developerVolume
        ? parseInt(editedSteps[0].developerVolume, 10) || 0
        : 0,
      processingTime: editedSteps[0]?.processingTime ?? '',
      warnings: result.warnings,
      notes: editedSteps.map((s) => s.notes).filter(Boolean).join('\n'),
      strandTestRecommended: result.strandTestRecommended,
    };

    onSave(updatedResult);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Edit Formula</Text>
      <Text style={styles.subtitle}>Modify the AI-generated formula below</Text>

      {editedSteps.map((step, idx) => (
        <View key={step.id} style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>Step {idx + 1}</Text>
            {editedSteps.length > 1 && (
              <TouchableOpacity onPress={() => removeStep(step.id)}>
                <Text style={styles.removeBtn}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Brand */}
          <Text style={styles.label}>Brand *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {allBrands.map((brand) => (
              <TouchableOpacity
                key={brand}
                style={[styles.chip, step.brand === brand && styles.chipActive]}
                onPress={() => updateStep(step.id, 'brand', brand)}
              >
                <Text style={[styles.chipText, step.brand === brand && styles.chipTextActive]}>
                  {brand}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Shade Code */}
          <Text style={styles.label}>Shade Code *</Text>
          <TextInput
            style={styles.input}
            value={step.shadeCode}
            onChangeText={(text) => updateStep(step.id, 'shadeCode', text)}
            placeholder="e.g., 8/3, 7N, 6RV"
            placeholderTextColor="#999"
          />

          {/* Product Name */}
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            value={step.name}
            onChangeText={(text) => updateStep(step.id, 'name', text)}
            placeholder="e.g., Koleston Perfect"
            placeholderTextColor="#999"
          />

          {/* Grams */}
          <Text style={styles.label}>Grams *</Text>
          <TextInput
            style={styles.input}
            value={step.grams}
            onChangeText={(text) => updateStep(step.id, 'grams', text)}
            placeholder="e.g., 30"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          {/* Developer Volume */}
          <Text style={styles.label}>Developer Volume *</Text>
          <View style={styles.devRow}>
            {['10vol', '20vol', '30vol', '40vol'].map((dev) => (
              <TouchableOpacity
                key={dev}
                style={[
                  styles.devBtn,
                  step.developerVolume === dev && styles.devBtnActive,
                ]}
                onPress={() => updateStep(step.id, 'developerVolume', dev)}
              >
                <Text
                  style={[
                    styles.devText,
                    step.developerVolume === dev && styles.devTextActive,
                  ]}
                >
                  {dev}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Processing Time */}
          <Text style={styles.label}>Processing Time (min)</Text>
          <TextInput
            style={styles.input}
            value={step.processingTime}
            onChangeText={(text) => updateStep(step.id, 'processingTime', text)}
            placeholder="e.g., 30"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          {/* Notes */}
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={step.notes}
            onChangeText={(text) => updateStep(step.id, 'notes', text)}
            placeholder="Additional notes..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>
      ))}

      {/* Add Another Step */}
      <TouchableOpacity style={styles.addStepBtn} onPress={addStep}>
        <FlaskConical size={18} color={COLORS.purple} />
        <Text style={styles.addStepText}>Add Another Step</Text>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <CheckCircle2 size={18} color="#FFF" />
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },
  stepCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: { fontSize: 16, fontWeight: '700', color: COLORS.purple },
  removeBtn: { fontSize: 14, color: COLORS.danger, fontWeight: '600' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
  },
  multilineInput: { minHeight: 70, textAlignVertical: 'top' },
  chipScroll: { marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  chipActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: '#FFF' },
  devRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  devBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  devBtnActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  devText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  devTextActive: { color: '#FFF' },
  addStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.purple,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addStepText: { fontSize: 15, fontWeight: '600', color: COLORS.purple },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
  },
  saveText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
