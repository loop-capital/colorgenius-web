// ============================================================
// ManualFormulaEntry — Reusable manual formula entry form
// Used by: FormulateScreen (Step 5 "Add Formula"), LibraryScreen
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  Trash2,
  X,
  Save,
  ShoppingBag,
  FlaskConical,
} from 'lucide-react-native';
import { saveFormulation } from '../api/client';
import { BRANDS, type FormulationResult } from '../types';

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
  green: '#22C55E',
  danger: '#EF4444',
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ManualProductRow {
  id: string;
  brand: string;
  shadeCode: string;
  productName: string;
  grams: string;
  developerVolume: string;
  processingTime: string;
  notes: string;
}

export interface ManualFormulaData {
  name: string;
  clientName: string;
  products: ManualProductRow[];
  globalDeveloperVolume: string;
  globalProcessingTime: string;
  application: string;
  notes: string;
  isPublic?: boolean;
}

interface ManualFormulaEntryProps {
  onClose: () => void;
  onSaved?: (result: FormulationResult) => void;
  initialData?: Partial<ManualFormulaData>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const EMPTY_ROW: ManualProductRow = {
  id: '',
  brand: '',
  shadeCode: '',
  productName: '',
  grams: '',
  developerVolume: '',
  processingTime: '',
  notes: '',
};

function createEmptyRow(): ManualProductRow {
  return { ...EMPTY_ROW, id: generateId() };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ManualFormulaEntry({ onClose, onSaved, initialData }: ManualFormulaEntryProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [clientName, setClientName] = useState(initialData?.clientName || '');
  const [products, setProducts] = useState<ManualProductRow[]>(
    initialData?.products?.length ? initialData.products.map((p) => ({ ...p, id: p.id || generateId() })) : [createEmptyRow()]
  );
  const [globalDeveloperVolume, setGlobalDeveloperVolume] = useState(initialData?.globalDeveloperVolume || '');
  const [globalProcessingTime, setGlobalProcessingTime] = useState(initialData?.globalProcessingTime || '');
  const [application, setApplication] = useState(initialData?.application || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [saving, setSaving] = useState(false);
  const [showBrandPicker, setShowBrandPicker] = useState<string | null>(null);

  const updateProduct = useCallback((id: string, field: keyof ManualProductRow, value: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }, []);

  const addProductRow = useCallback(() => {
    setProducts((prev) => [...prev, createEmptyRow()]);
  }, []);

  const removeProductRow = useCallback((id: string) => {
    setProducts((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const validate = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a formula name');
      return false;
    }
    const validProducts = products.filter(
      (p) => p.brand.trim() && p.shadeCode.trim() && p.productName.trim()
    );
    if (validProducts.length === 0) {
      Alert.alert('Required', 'Please fill in at least one product with brand, shade code, and name');
      return false;
    }
    return true;
  };

  const buildFormulationResult = (): FormulationResult => {
    const steps = products
      .filter((p) => p.brand.trim() && p.shadeCode.trim() && p.productName.trim())
      .map((p) => ({
        role: 'Color',
        grams: p.grams ? parseInt(p.grams, 10) || 0 : 0,
        product: {
          brand: p.brand,
          shadeCode: p.shadeCode,
          name: p.productName,
          ratio: '1:1',
        },
        developer: p.developerVolume ? { volume: parseInt(p.developerVolume, 10) || 0 } : undefined,
        notes: p.notes,
      }));

    return {
      success: true,
      steps,
      developerVolume: globalDeveloperVolume ? parseInt(globalDeveloperVolume, 10) || 0 : 0,
      processingTime: globalProcessingTime || '30 min',
      application: application || 'Full Head',
      notes: notes || undefined,
      brand: steps[0]?.product?.brand || '',
      line: '',
      confidence: 100,
    };
  };

  const handleSave = async (isPublic = false) => {
    if (!validate()) return;
    setSaving(true);

    try {
      const result = buildFormulationResult();
      const payload = {
        name: name.trim(),
        clientName: clientName.trim() || undefined,
        brand: result.steps[0]?.product?.brand || '',
        line: '',
        developerVolume: globalDeveloperVolume,
        processingTime: globalProcessingTime,
        application: application || 'Full Head',
        notes: notes || undefined,
        isPublic,
        components: products
          .filter((p) => p.brand.trim() && p.shadeCode.trim() && p.productName.trim())
          .map((p) => ({
            componentType: 'color',
            brand: p.brand,
            shadeCode: p.shadeCode,
            shadeName: p.productName,
            grams: p.grams ? parseInt(p.grams, 10) || 0 : 0,
            developerVolume: p.developerVolume ? parseInt(p.developerVolume, 10) : undefined,
            processingTime: p.processingTime || undefined,
            notes: p.notes || undefined,
          })),
      };

      await saveFormulation(payload);
      Alert.alert('Success', isPublic ? 'Formula listed on Marketplace!' : 'Formula saved to your library!', [
        { text: 'OK', onPress: () => onSaved?.(result) },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save formula');
    } finally {
      setSaving(false);
    }
  };

  const renderBrandPicker = (productId: string) => (
    <View style={styles.brandPickerOverlay}>
      <View style={styles.brandPickerCard}>
        <View style={styles.brandPickerHeader}>
          <Text style={styles.brandPickerTitle}>Select Brand</Text>
          <TouchableOpacity onPress={() => setShowBrandPicker(null)}>
            <X size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {BRANDS.map((brand) => (
            <TouchableOpacity
              key={brand}
              style={styles.brandPickerItem}
              onPress={() => {
                updateProduct(productId, 'brand', brand);
                setShowBrandPicker(null);
              }}
            >
              <Text style={styles.brandPickerItemText}>{brand}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <FlaskConical size={20} color={COLORS.purple} />
            <Text style={styles.headerTitle}>Add Formula</Text>
          </View>
          <View style={styles.closeBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Formula Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Formula Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Summer Balayage"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Client Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Client Name (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Jennifer Martinez"
              placeholderTextColor={COLORS.textMuted}
              value={clientName}
              onChangeText={setClientName}
            />
          </View>

          {/* Product Rows */}
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>Products</Text>
            {products.map((product, index) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productCardHeader}>
                  <Text style={styles.productCardTitle}>Product {index + 1}</Text>
                  {products.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeProductRow(product.id)}
                      style={styles.removeBtn}
                    >
                      <Trash2 size={16} color={COLORS.danger} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Brand Picker */}
                <TouchableOpacity
                  style={styles.pickerField}
                  onPress={() => setShowBrandPicker(product.id)}
                >
                  <Text style={product.brand ? styles.pickerFieldText : styles.pickerFieldPlaceholder}>
                    {product.brand || 'Select Brand *'}
                  </Text>
                </TouchableOpacity>

                {/* Shade Code */}
                <TextInput
                  style={styles.input}
                  placeholder="Shade Code * (e.g., 7/73)"
                  placeholderTextColor={COLORS.textMuted}
                  value={product.shadeCode}
                  onChangeText={(v) => updateProduct(product.id, 'shadeCode', v)}
                  autoCapitalize="characters"
                />

                {/* Product Name */}
                <TextInput
                  style={styles.input}
                  placeholder="Product Name * (e.g., Golden Blonde)"
                  placeholderTextColor={COLORS.textMuted}
                  value={product.productName}
                  onChangeText={(v) => updateProduct(product.id, 'productName', v)}
                />

                {/* Grams & Developer Volume Row */}
                <View style={styles.rowFields}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Grams"
                    placeholderTextColor={COLORS.textMuted}
                    value={product.grams}
                    onChangeText={(v) => updateProduct(product.id, 'grams', v)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Developer (vol)"
                    placeholderTextColor={COLORS.textMuted}
                    value={product.developerVolume}
                    onChangeText={(v) => updateProduct(product.id, 'developerVolume', v)}
                    keyboardType="numeric"
                  />
                </View>

                {/* Processing Time */}
                <TextInput
                  style={styles.input}
                  placeholder="Processing Time (e.g., 30 min)"
                  placeholderTextColor={COLORS.textMuted}
                  value={product.processingTime}
                  onChangeText={(v) => updateProduct(product.id, 'processingTime', v)}
                />

                {/* Notes */}
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Notes for this product..."
                  placeholderTextColor={COLORS.textMuted}
                  value={product.notes}
                  onChangeText={(v) => updateProduct(product.id, 'notes', v)}
                  multiline
                  numberOfLines={2}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.addRowBtn} onPress={addProductRow}>
              <Plus size={18} color={COLORS.purple} />
              <Text style={styles.addRowBtnText}>Add Another Product</Text>
            </TouchableOpacity>
          </View>

          {/* Global Settings */}
          <View style={styles.fieldGroup}>
            <Text style={styles.sectionTitle}>Global Settings</Text>
            <View style={styles.rowFields}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Developer Volume (e.g., 30)"
                placeholderTextColor={COLORS.textMuted}
                value={globalDeveloperVolume}
                onChangeText={setGlobalDeveloperVolume}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Processing Time (e.g., 35 min)"
                placeholderTextColor={COLORS.textMuted}
                value={globalProcessingTime}
                onChangeText={setGlobalProcessingTime}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Application Method (e.g., Full Head, Root Touch-Up)"
              placeholderTextColor={COLORS.textMuted}
              value={application}
              onChangeText={setApplication}
            />
          </View>

          {/* Notes */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Formula Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="General notes about this formula..."
              placeholderTextColor={COLORS.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={() => handleSave(false)}
            disabled={saving}
          >
            <Save size={18} color="#FFF" />
            <Text style={styles.saveBtnText}>
              {saving ? 'Saving...' : 'Save to My Formulas'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.marketplaceBtn, saving && styles.saveBtnDisabled]}
            onPress={() => handleSave(true)}
            disabled={saving}
          >
            <ShoppingBag size={18} color="#FFF" />
            <Text style={styles.marketplaceBtnText}>
              {saving ? 'Saving...' : 'List on Marketplace'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Brand Picker Modal */}
        {showBrandPicker && renderBrandPicker(showBrandPicker)}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scroll: {
    padding: 16,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  pickerField: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    justifyContent: 'center',
  },
  pickerFieldText: {
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  pickerFieldPlaceholder: {
    color: COLORS.textMuted,
    fontSize: 15,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  productsSection: {
    marginBottom: 20,
  },
  productCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 12,
  },
  productCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.purple,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239,68,68,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.purple,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addRowBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.purple,
  },
  bottomActions: {
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    backgroundColor: COLORS.bg,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.purple,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  marketplaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.pink,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: COLORS.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  marketplaceBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  // Brand Picker Overlay
  brandPickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  brandPickerCard: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingTop: 16,
  },
  brandPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  brandPickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  brandPickerItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  brandPickerItemText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
});
