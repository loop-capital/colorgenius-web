// ============================================================
// FormulaPicker — Reusable formula selection component
// Used by: QuestionnaireScreen, NewServiceScreen
// ============================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  X,
  FlaskConical,
  ChevronRight,
  Plus,
  Bookmark,
} from 'lucide-react-native';
import { apiRequest } from '../api/client';

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
  teal: '#14B8A6',
  pink: '#EC4899',
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FormulaItem {
  id: string;
  name: string;
  clientName?: string;
  brand: string;
  line?: string;
  createdAt: string;
  tags: string[];
  developerVolume?: string;
  processingTime?: string;
  application?: string;
  notes?: string;
  shades: Shade[];
  confidence?: number;
  components?: any[];
}

interface Shade {
  code: string;
  name: string;
  hex?: string;
}

interface FormulaPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (formula: FormulaItem) => void;
  onCreateNew?: () => void;
  title?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FormulaPicker({
  visible,
  onClose,
  onSelect,
  onCreateNew,
  title = 'Select Formula',
}: FormulaPickerProps) {
  const [formulas, setFormulas] = useState<FormulaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchFormulas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest<{ items?: any[]; data?: any[]; formulas?: any[] }>('/v1/formulas/list?limit=100');
      const rawItems = response.items || response.data || response.formulas || [];
      const mapped: FormulaItem[] = rawItems.map((f: any) => ({
        id: f.id || String(Math.random()),
        name: f.name || 'Untitled Formula',
        clientName: f.clientName || f.client_name,
        brand: f.brand || 'Unknown',
        line: f.productLine || f.line || '',
        createdAt: f.createdAt || f.created_at || new Date().toISOString(),
        tags: f.tags || [],
        developerVolume: f.developerVolume || f.developer_vol || '',
        processingTime: f.processingTime || f.processing_time || '',
        application: f.application || '',
        notes: f.notes || '',
        shades: (f.components || f.shades || [])
          .filter((c: any) => (c.componentType === 'color' || c.shadeCode || c.code))
          .map((c: any) => ({
            code: c.shadeCode || c.code || '?',
            name: c.shadeName || c.name || c.shadeCode || '?',
            hex: c.hex || '#9333EA',
          })),
        confidence: f.confidence || 85,
        components: f.components || [],
      }));
      setFormulas(mapped);
    } catch (err: any) {
      console.warn('[FormulaPicker] Failed to fetch formulas:', err?.message);
      setError('Failed to load formulas. Using offline data.');
      // Fallback to some mock formulas
      setFormulas([
        {
          id: 'mock-1',
          name: 'Summer Balayage Formula',
          clientName: 'Jennifer Martinez',
          brand: 'Wella',
          line: 'Koleston Perfect ME+',
          createdAt: '2026-04-20',
          tags: ['balayage', 'summer'],
          developerVolume: '30',
          processingTime: '35 min',
          application: 'Balayage',
          shades: [
            { code: '7/73', name: 'Golden Blonde', hex: '#C08C5A' },
            { code: '8/73', name: 'Light Golden Blonde', hex: '#D4AA7D' },
          ],
          confidence: 94,
        },
        {
          id: 'mock-2',
          name: 'Root Touch-Up — Natural Brown',
          clientName: 'Sarah Chen',
          brand: 'Schwarzkopf',
          line: 'Igora Royal',
          createdAt: '2026-04-18',
          tags: ['root-touch-up', 'gray-coverage'],
          developerVolume: '10',
          processingTime: '30 min',
          application: 'Root application',
          shades: [
            { code: '5-0', name: 'Light Brown Natural', hex: '#7D5038' },
          ],
          confidence: 91,
        },
        {
          id: 'mock-3',
          name: 'Vivid Rose Gold Blend',
          clientName: 'Mia Johnson',
          brand: 'Joico',
          line: 'Color Intensity',
          createdAt: '2026-04-15',
          tags: ['vivid', 'rose-gold'],
          developerVolume: '15',
          processingTime: '20 min',
          application: 'Global',
          shades: [
            { code: 'R', name: 'Vivid Red', hex: '#D44444' },
            { code: 'P', name: 'Pink', hex: '#E892A0' },
          ],
          confidence: 87,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchFormulas();
    }
  }, [visible, fetchFormulas]);

  const brands = useMemo(() => {
    return Array.from(new Set(formulas.map((f) => f.brand)));
  }, [formulas]);

  const filteredFormulas = useMemo(() => {
    let result = [...formulas];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.clientName || '').toLowerCase().includes(q) ||
          f.brand.toLowerCase().includes(q) ||
          f.shades.some((s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) ||
          f.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filterBrand) {
      result = result.filter((f) => f.brand === filterBrand);
    }

    return result;
  }, [formulas, searchTerm, filterBrand]);

  const renderFormulaItem = ({ item }: { item: FormulaItem }) => (
    <TouchableOpacity
      style={styles.formulaCard}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
      activeOpacity={0.7}
    >
      <View style={styles.formulaHeader}>
        <View style={styles.formulaTitleRow}>
          <FlaskConical size={16} color={COLORS.purple} />
          <Text style={styles.formulaName} numberOfLines={1}>{item.name}</Text>
        </View>
        {item.confidence && (
          <View
            style={[
              styles.confidenceBadge,
              {
                backgroundColor:
                  item.confidence >= 90
                    ? 'rgba(20,184,166,0.1)'
                    : 'rgba(245,158,11,0.1)',
                borderColor:
                  item.confidence >= 90
                    ? 'rgba(20,184,166,0.3)'
                    : 'rgba(245,158,11,0.3)',
              },
            ]}
          >
            <Text
              style={[
                styles.confidenceText,
                { color: item.confidence >= 90 ? COLORS.teal : '#F59E0B' },
              ]}
            >
              {item.confidence}%
            </Text>
          </View>
        )}
      </View>

      {item.clientName && (
        <Text style={styles.clientName}>{item.clientName}</Text>
      )}

      <View style={styles.brandRow}>
        <Text style={styles.brandText}>{item.brand}</Text>
        {item.line && (
          <>
            <Text style={styles.dot}> · </Text>
            <Text style={styles.lineText}>{item.line}</Text>
          </>
        )}
      </View>

      {/* Shade swatches */}
      {item.shades.length > 0 && (
        <View style={styles.shadesRow}>
          {item.shades.map((shade) => (
            <View key={shade.code} style={styles.shadeItem}>
              <View
                style={[styles.shadeSwatch, { backgroundColor: shade.hex || '#9333EA' }]}
              />
              <Text style={styles.shadeCode}>{shade.code}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {item.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.formulaFooter}>
        <Text style={styles.footerText}>{item.application || 'Full Head'}</Text>
        <Text style={styles.footerText}>
          {item.developerVolume ? `${item.developerVolume}vol` : ''}
          {item.developerVolume && item.processingTime ? ' · ' : ''}
          {item.processingTime || ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Bookmark size={20} color={COLORS.purple} />
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Search size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, brand, shade..."
            placeholderTextColor={COLORS.textMuted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <X size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Brand Filter */}
        {brands.length > 0 && (
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, !filterBrand && styles.filterChipActive]}
              onPress={() => setFilterBrand('')}
            >
              <Text style={[!filterBrand && styles.filterChipTextActive, styles.filterChipText]}>All</Text>
            </TouchableOpacity>
            {brands.slice(0, 6).map((brand) => (
              <TouchableOpacity
                key={brand}
                style={[styles.filterChip, filterBrand === brand && styles.filterChipActive]}
                onPress={() => setFilterBrand(filterBrand === brand ? '' : brand)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterBrand === brand && styles.filterChipTextActive,
                  ]}
                >
                  {brand}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Formula List */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.purple} />
          </View>
        ) : filteredFormulas.length === 0 ? (
          <View style={styles.centered}>
            <FlaskConical size={48} color="rgba(255,255,255,0.06)" />
            <Text style={styles.emptyTitle}>No formulas found</Text>
            <Text style={styles.emptySubtext}>
              {searchTerm || filterBrand
                ? 'Try adjusting your search or filters'
                : 'Save formulas to see them here'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredFormulas}
            renderItem={renderFormulaItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Create New Button */}
        {onCreateNew && (
          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.createNewBtn} onPress={() => { onCreateNew(); onClose(); }}>
              <Plus size={18} color="#FFF" />
              <Text style={styles.createNewBtnText}>Create New Formula</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  filterChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  // Formula Card
  formulaCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 12,
  },
  formulaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  formulaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  formulaName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  confidenceBadge: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '700',
  },
  clientName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  brandText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  dot: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  lineText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  shadesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  shadeItem: {
    alignItems: 'center',
    gap: 4,
  },
  shadeSwatch: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  shadeCode: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tagChip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  formulaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  bottomActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    backgroundColor: COLORS.bg,
  },
  createNewBtn: {
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
  createNewBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
