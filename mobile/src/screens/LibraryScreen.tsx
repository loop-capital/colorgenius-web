// ============================================================
// LibraryScreen — Formula Library (matches web app)
// Tabs: My Formulas | Marketplace
// Features: Search, filter by brand/tone, formula cards, detail view
// ============================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  X,
  FlaskConical,
  Grid3X3,
  LayoutList,
  ChevronRight,
  Filter,
  Bookmark,
  ShoppingBag,
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

interface Shade {
  code: string;
  name: string;
  hex: string;
}

interface Formula {
  id: string;
  name: string;
  clientName: string;
  brand: string;
  line: string;
  createdAt: string;
  tags: string[];
  developer: string;
  developerVolume: string;
  totalVolume: string;
  processingTime: string;
  application: string;
  coverage: string;
  notes: string;
  shades: Shade[];
  confidence: number;
}

// ─── Mock Data (fallback) ────────────────────────────────────────────────────

const MOCK_FORMULAS: Formula[] = [
  {
    id: '1',
    name: 'Summer Balayage Formula',
    clientName: 'Jennifer Martinez',
    brand: 'Wella',
    line: 'Koleston Perfect ME+',
    createdAt: '2026-04-20',
    tags: ['balayage', 'summer'],
    developer: '30Vol',
    developerVolume: '30ml',
    totalVolume: '60ml',
    processingTime: '35 min',
    application: 'Balayage',
    coverage: 'Partial',
    notes: 'Apply to mid-lengths and ends using balayage technique.',
    shades: [
      { code: '7/73', name: 'Golden Blonde', hex: '#C08C5A' },
      { code: '8/73', name: 'Light Golden Blonde', hex: '#D4AA7D' },
    ],
    confidence: 94,
  },
  {
    id: '2',
    name: 'Root Touch-Up — Natural Brown',
    clientName: 'Sarah Chen',
    brand: 'Schwarzkopf',
    line: 'Igora Royal',
    createdAt: '2026-04-18',
    tags: ['root-touch-up', 'gray-coverage'],
    developer: '10Vol',
    developerVolume: '20ml',
    totalVolume: '40ml',
    processingTime: '30 min',
    application: 'Root application',
    coverage: 'Full',
    notes: 'Section hair into quadrants. Apply directly to regrowth only.',
    shades: [
      { code: '5-0', name: 'Light Brown Natural', hex: '#7D5038' },
    ],
    confidence: 91,
  },
  {
    id: '3',
    name: 'Vivid Rose Gold Blend',
    clientName: 'Mia Johnson',
    brand: 'Joico',
    line: 'Color Intensity',
    createdAt: '2026-04-15',
    tags: ['vivid', 'rose-gold'],
    developer: '15Vol',
    developerVolume: '25ml',
    totalVolume: '50ml',
    processingTime: '20 min',
    application: 'Global',
    coverage: 'Full',
    notes: 'Pre-lighten to level 8 before applying.',
    shades: [
      { code: 'R', name: 'Vivid Red', hex: '#D44444' },
      { code: 'P', name: 'Pink', hex: '#E892A0' },
    ],
    confidence: 87,
  },
];

// ─── Tone Options ────────────────────────────────────────────────────────────

const TONE_OPTIONS = [
  { value: 'N', label: 'Natural', color: '#9C8B7A' },
  { value: 'A', label: 'Ash', color: '#8A7D6E' },
  { value: 'G', label: 'Gold', color: '#C4A35A' },
  { value: 'K', label: 'Copper', color: '#B87333' },
  { value: 'R', label: 'Red', color: '#A03030' },
  { value: 'V', label: 'Violet', color: '#7B68A6' },
  { value: 'P', label: 'Pearl', color: '#B8B0C4' },
  { value: 'B', label: 'Beige', color: '#C4B5A0' },
  { value: 'M', label: 'Mahogany', color: '#6B3A3A' },
  { value: 'Ch', label: 'Chocolate', color: '#4A2C2A' },
  { value: 'W', label: 'Warm', color: '#D4A574' },
  { value: 'C', label: 'Cool', color: '#7D8B9A' },
];

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function LibraryScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'my-formulas' | 'marketplace'>('my-formulas');
  const [formulas, setFormulas] = useState<Formula[]>(MOCK_FORMULAS);
  const [marketplaceFormulas, setMarketplaceFormulas] = useState<Formula[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterTone, setFilterTone] = useState('');
  const [loading, setLoading] = useState(false);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch formulas from API
  const fetchFormulas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest<{ items: any[] }>('/v1/formulas/list?limit=100');
      if (response.items?.length > 0) {
        const mapped = response.items.map((f: any) => ({
          id: f.id,
          name: f.name || 'Untitled Formula',
          clientName: f.clientName || 'Unknown',
          brand: f.brand || 'Unknown',
          line: f.productLine || '',
          createdAt: f.createdAt || new Date().toISOString(),
          tags: f.tags || [],
          developer: f.developerVolume ? f.developerVolume + 'Vol' : '20Vol',
          developerVolume: f.developerVolume ? f.developerVolume + 'ml' : '60ml',
          totalVolume: f.totalVolume || '60ml',
          processingTime: f.processingTime ? f.processingTime + ' min' : '30 min',
          application: f.application || 'Full Head',
          coverage: f.coverage || 'Roots',
          notes: f.notes || '',
          shades: (f.components || [])
            .filter((c: any) => c.componentType === 'color')
            .map((c: any) => ({
              code: c.shadeCode || '?',
              name: c.shadeName || c.shadeCode || 'Unknown',
              hex: '#9333EA',
            })),
          confidence: f.confidence || 85,
        }));
        setFormulas(mapped);
      }
    } catch (e) {
      console.warn('Failed to fetch formulas, using mock data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFormulas();
  }, [fetchFormulas]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFormulas();
    setRefreshing(false);
  };

  // Fetch marketplace
  const fetchMarketplace = useCallback(async () => {
    if (marketplaceFormulas.length > 0) return;
    try {
      setMarketplaceLoading(true);
      const response = await apiRequest<{ formulas?: any[]; data?: any[] }>('/marketplace/browse');
      const data = response.formulas || response.data || [];
      const mapped = data.map((f: any) => ({
        id: f.id,
        name: f.name || f.brand + ' Formula',
        clientName: f.creator || 'Community',
        brand: f.brand || 'Unknown',
        line: f.line || '',
        createdAt: f.createdAt || new Date().toISOString(),
        tags: f.tags || [],
        developer: f.developerVolume || '20Vol',
        developerVolume: f.developerVolume || '60ml',
        totalVolume: f.totalVolume || '60ml',
        processingTime: f.processingTime || '30 min',
        application: f.application || 'Full Head',
        coverage: f.coverage || 'Roots',
        notes: f.notes || '',
        shades: f.shades || [],
        confidence: f.confidence || 85,
      }));
      setMarketplaceFormulas(mapped);
    } catch (e) {
      console.warn('Failed to fetch marketplace');
    } finally {
      setMarketplaceLoading(false);
    }
  }, [marketplaceFormulas.length]);

  const brands = useMemo(() => {
    const list = activeTab === 'my-formulas' ? formulas : marketplaceFormulas;
    return Array.from(new Set(list.map((f) => f.brand)));
  }, [formulas, marketplaceFormulas, activeTab]);

  const filteredFormulas = useMemo(() => {
    const list = activeTab === 'my-formulas' ? formulas : marketplaceFormulas;
    let result = [...list];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.clientName.toLowerCase().includes(q) ||
          f.brand.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filterBrand) {
      result = result.filter((f) => f.brand === filterBrand);
    }

    if (filterTone) {
      result = result.filter((f) =>
        f.shades.some((s) => s.code.toLowerCase().includes(filterTone.toLowerCase()))
      );
    }

    return result;
  }, [formulas, marketplaceFormulas, activeTab, searchTerm, filterBrand, filterTone]);

  const renderFormulaCard = ({ item: formula }: { item: Formula }) => (
    <TouchableOpacity
      style={styles.formulaCard}
      onPress={() => setSelectedFormula(formula)}
      activeOpacity={0.7}
    >
      <View style={styles.formulaHeader}>
        <View style={styles.formulaTitleRow}>
          <FlaskConical size={16} color={COLORS.purple} />
          <Text style={styles.formulaName} numberOfLines={1}>
            {formula.name}
          </Text>
        </View>
        <View
          style={[
            styles.confidenceBadge,
            {
              backgroundColor:
                formula.confidence >= 90
                  ? 'rgba(20,184,166,0.1)'
                  : 'rgba(245,158,11,0.1)',
              borderColor:
                formula.confidence >= 90
                  ? 'rgba(20,184,166,0.3)'
                  : 'rgba(245,158,11,0.3)',
            },
          ]}
        >
          <Text
            style={[
              styles.confidenceText,
              {
                color: formula.confidence >= 90 ? COLORS.teal : '#F59E0B',
              },
            ]}
          >
            {formula.confidence}%
          </Text>
        </View>
      </View>

      <Text style={styles.clientName}>{formula.clientName}</Text>

      <View style={styles.brandRow}>
        <Text style={styles.brandText}>{formula.brand}</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.lineText}>{formula.line}</Text>
      </View>

      {/* Shade swatches */}
      <View style={styles.shadesRow}>
        {formula.shades.map((shade) => (
          <View key={shade.code} style={styles.shadeItem}>
            <View style={[styles.shadeSwatch, { backgroundColor: shade.hex }]} />
            <Text style={styles.shadeCode}>{shade.code}</Text>
          </View>
        ))}
      </View>

      {/* Tags */}
      <View style={styles.tagsRow}>
        {formula.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.formulaFooter}>
        <Text style={styles.footerText}>{formula.application}</Text>
        <Text style={styles.footerText}>{formula.processingTime}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFormulaListItem = ({ item: formula }: { item: Formula }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => setSelectedFormula(formula)}
      activeOpacity={0.7}
    >
      <View style={styles.listLeft}>
        <Text style={styles.listName} numberOfLines={1}>
          {formula.name}
        </Text>
        <Text style={styles.listMeta}>
          {formula.clientName} · {formula.brand}
        </Text>
        <View style={styles.listShades}>
          {formula.shades.map((shade) => (
            <View key={shade.code} style={styles.listShadeItem}>
              <View style={[styles.listSwatch, { backgroundColor: shade.hex }]} />
              <Text style={styles.listShadeCode}>{shade.code}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.listRight}>
        <Text
          style={[
            styles.listConfidence,
            { color: formula.confidence >= 90 ? COLORS.teal : '#F59E0B' },
          ]}
        >
          {formula.confidence}%
        </Text>
        <ChevronRight size={18} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Formula Library</Text>
          <Text style={styles.headerSubtitle}>
            Browse, search, and manage your color formulas
          </Text>
        </View>
        <TouchableOpacity
          style={styles.viewModeBtn}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          {viewMode === 'grid' ? (
            <LayoutList size={18} color={COLORS.textSecondary} />
          ) : (
            <Grid3X3 size={18} color={COLORS.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-formulas' && styles.tabActive]}
          onPress={() => setActiveTab('my-formulas')}
        >
          <Bookmark
            size={14}
            color={activeTab === 'my-formulas' ? '#0A0A1A' : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'my-formulas' && styles.tabTextActive,
            ]}
          >
            My Formulas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'marketplace' && styles.tabActive]}
          onPress={() => {
            setActiveTab('marketplace');
            fetchMarketplace();
          }}
        >
          <ShoppingBag
            size={14}
            color={activeTab === 'marketplace' ? '#0A0A1A' : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'marketplace' && styles.tabTextActive,
            ]}
          >
            Marketplace
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Search size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search formulas..."
          placeholderTextColor={COLORS.textMuted}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <X size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} color={showFilters ? COLORS.purple : COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          {/* Brand filter */}
          <Text style={styles.filterLabel}>Brand</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !filterBrand && styles.filterChipActive,
                ]}
                onPress={() => setFilterBrand('')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !filterBrand && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {brands.map((brand) => (
                <TouchableOpacity
                  key={brand}
                  style={[
                    styles.filterChip,
                    filterBrand === brand && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setFilterBrand(filterBrand === brand ? '' : brand)
                  }
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
          </ScrollView>

          {/* Tone filter */}
          <Text style={styles.filterLabel}>Tone</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              <TouchableOpacity
                style={[styles.filterChip, !filterTone && styles.filterChipActive]}
                onPress={() => setFilterTone('')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !filterTone && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {TONE_OPTIONS.map((tone) => (
                <TouchableOpacity
                  key={tone.value}
                  style={[
                    styles.toneChip,
                    filterTone === tone.value && styles.toneChipActive,
                  ]}
                  onPress={() =>
                    setFilterTone(filterTone === tone.value ? '' : tone.value)
                  }
                >
                  <View
                    style={[styles.toneSwatch, { backgroundColor: tone.color }]}
                  />
                  <Text
                    style={[
                      styles.toneChipText,
                      filterTone === tone.value && styles.toneChipTextActive,
                    ]}
                  >
                    {tone.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Active filters summary */}
          {(filterBrand || filterTone) && (
            <View style={styles.activeFilters}>
              {filterBrand && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>{filterBrand}</Text>
                  <TouchableOpacity onPress={() => setFilterBrand('')}>
                    <X size={12} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
              {filterTone && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>
                    {TONE_OPTIONS.find((t) => t.value === filterTone)?.label}
                  </Text>
                  <TouchableOpacity onPress={() => setFilterTone('')}>
                    <X size={12} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity onPress={() => { setFilterBrand(''); setFilterTone(''); }}>
                <Text style={styles.clearFilters}>Clear all</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Results count */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>
          Showing {filteredFormulas.length} of{' '}
          {activeTab === 'my-formulas' ? formulas.length : marketplaceFormulas.length}{' '}
          formulas
        </Text>
      </View>

      {/* Formula List */}
      {loading || marketplaceLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </View>
      ) : filteredFormulas.length === 0 ? (
        <View style={styles.centered}>
          <FlaskConical size={48} color="rgba(255,255,255,0.06)" />
          <Text style={styles.emptyTitle}>No formulas found</Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'my-formulas'
              ? 'Save your first formula to build your library.'
              : 'Community formulas will appear here once published.'}
          </Text>
        </View>
      ) : viewMode === 'grid' ? (
        <FlatList
          data={filteredFormulas}
          renderItem={renderFormulaCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <FlatList
          data={filteredFormulas}
          renderItem={renderFormulaListItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Detail Modal */}
      <Modal
        visible={!!selectedFormula}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedFormula(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedFormula && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>
                      {selectedFormula.name}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {selectedFormula.brand} · {selectedFormula.line}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedFormula(null)}
                    style={styles.closeBtn}
                  >
                    <X size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Info Cards */}
                  <View style={styles.infoGrid}>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Client</Text>
                      <Text style={styles.infoValue}>
                        {selectedFormula.clientName}
                      </Text>
                      <Text style={styles.infoLabel}>Created</Text>
                      <Text style={styles.infoValue}>
                        {new Date(selectedFormula.createdAt).toLocaleDateString()}
                      </Text>
                      <Text style={styles.infoLabel}>Application</Text>
                      <Text style={styles.infoValue}>
                        {selectedFormula.application}
                      </Text>
                    </View>

                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Developer</Text>
                      <Text style={styles.infoValue}>
                        {selectedFormula.developer} ({selectedFormula.developerVolume})
                      </Text>
                      <Text style={styles.infoLabel}>Total Volume</Text>
                      <Text style={styles.infoValue}>
                        {selectedFormula.totalVolume}
                      </Text>
                      <Text style={styles.infoLabel}>Processing</Text>
                      <Text style={styles.infoValue}>
                        {selectedFormula.processingTime}
                      </Text>
                    </View>
                  </View>

                  {/* Shades */}
                  <Text style={styles.sectionTitle}>Shades</Text>
                  <View style={styles.shadesGrid}>
                    {selectedFormula.shades.map((shade) => (
                      <View key={shade.code} style={styles.shadeCard}>
                        <View
                          style={[
                            styles.shadeCardSwatch,
                            { backgroundColor: shade.hex },
                          ]}
                        />
                        <Text style={styles.shadeCardCode}>{shade.code}</Text>
                        <Text style={styles.shadeCardName}>{shade.name}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Tags */}
                  <Text style={styles.sectionTitle}>Tags</Text>
                  <View style={styles.tagsRow}>
                    {selectedFormula.tags.map((tag) => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Notes */}
                  <Text style={styles.sectionTitle}>Application Notes</Text>
                  <Text style={styles.notesText}>{selectedFormula.notes}</Text>

                  <View style={{ height: 40 }} />
                </ScrollView>

                {/* Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => setSelectedFormula(null)}
                  >
                    <Text style={styles.secondaryBtnText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryBtn}>
                    <Text style={styles.primaryBtnText}>Use Formula</Text>
                    <ChevronRight size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  viewModeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  tabActive: {
    backgroundColor: COLORS.teal,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#0A0A1A',
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Filters
  filtersPanel: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
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
  toneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  toneChipActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  toneSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  toneChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  toneChipTextActive: {
    color: '#FFF',
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(147,51,234,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeFilterText: {
    fontSize: 11,
    color: COLORS.purple,
  },
  clearFilters: {
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },

  // Results
  resultsBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // List
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

  // Formula Card (Grid)
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
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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

  // List Item
  listItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 8,
    alignItems: 'center',
  },
  listLeft: {
    flex: 1,
    gap: 4,
  },
  listName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  listMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  listShades: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  listShadeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listSwatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  listShadeCode: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: COLORS.textMuted,
  },
  listRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  listConfidence: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
    gap: 2,
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  shadesGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
  },
  shadeCard: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 10,
    minWidth: 80,
  },
  shadeCardSwatch: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  shadeCardCode: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  shadeCardName: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  notesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  primaryBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    paddingVertical: 14,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
