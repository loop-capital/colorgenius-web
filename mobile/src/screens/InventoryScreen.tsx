// ============================================================
// InventoryScreen — Real inventory dashboard matching web app
// Features: Stats, filter tabs, +/- stock adjustment, status bar
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Plus,
  Minus,
  Lock,
  RefreshCw,
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
  pink: '#EC4899',
  amber: '#F59E0B',
  red: '#EF4444',
  success: '#22C55E',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface InventoryItem {
  id: string;
  brand: string;
  line: string;
  shadeCode: string;
  shadeName: string;
  currentGrams: number;
  reorderPoint: number;
  lastUsed: string;
  costPerGram: number;
}

const STORAGE_KEY = 'cg-inventory';

// ─── Component ─────────────────────────────────────────────────────────────

export default function InventoryScreen({ navigation }: any) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [canEdit, setCanEdit] = useState(true); // TODO: Check user role

  // ─── Load from AsyncStorage cache ────────────────────────────────────────

  const loadCached = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed: InventoryItem[] = JSON.parse(cached);
        if (parsed.length > 0) setItems(parsed);
      }
    } catch (e) {
      console.warn('Failed to load cached inventory:', e);
    }
  }, []);

  // ─── Fetch from API ──────────────────────────────────────────────────────

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest<{
        items: Array<{
          id: string;
          salonId: string;
          brand: string;
          shadeCode: string;
          shadeName: string | null;
          quantity: number;
          unit: string | null;
          lowStockThreshold: number | null;
          lastUpdated: string | null;
        }>;
        total: number;
      }>('/v1/inventory?limit=500');

      const mapped: InventoryItem[] = (response.items || []).map((it) => ({
        id: it.id,
        brand: it.brand,
        line: it.brand,
        shadeCode: it.shadeCode,
        shadeName: it.shadeName || it.shadeCode,
        currentGrams: it.quantity || 0,
        reorderPoint: it.lowStockThreshold || 0,
        lastUsed: it.lastUpdated || new Date().toISOString(),
        costPerGram: 0,
      }));

      setItems(mapped);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
    } catch (e) {
      console.warn('Failed to fetch inventory:', e);
      // Keep cached items on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCached();
    fetchInventory();
  }, [loadCached, fetchInventory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInventory();
    setRefreshing(false);
  };

  // ─── Stock Adjustment ──────────────────────────────────────────────────────

  const handleAdjust = async (id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newGrams = Math.max(0, item.currentGrams + delta);

    const updated = items.map((i) =>
      i.id === id ? { ...i, currentGrams: newGrams } : i
    );
    setItems(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Sync to API
    try {
      await apiRequest('/v1/inventory', {
        method: 'POST',
        body: {
          brand: item.brand,
          shadeCode: item.shadeCode,
          shadeName: item.shadeName,
          quantity: newGrams,
          unit: 'g',
          lowStockThreshold: item.reorderPoint > 0 ? item.reorderPoint : undefined,
        },
      });
    } catch (e) {
      console.warn('Inventory adjustment sync error:', e);
    }
  };

  // ─── Derived Data ──────────────────────────────────────────────────────────

  const filteredItems = items.filter((item) => {
    if (filter === 'low') return item.currentGrams > 0 && item.currentGrams <= item.reorderPoint;
    if (filter === 'out') return item.currentGrams === 0;
    return true;
  });

  const lowStock = items.filter(
    (i) => i.currentGrams > 0 && i.currentGrams <= i.reorderPoint
  ).length;
  const outOfStock = items.filter((i) => i.currentGrams === 0).length;
  const totalValue = items.reduce((sum, i) => sum + i.currentGrams * i.costPerGram, 0);

  // ─── Render Stat Card ────────────────────────────────────────────────────

  const StatCard = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: string | number;
    color?: string;
  }) => (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : undefined]}>
        {value}
      </Text>
    </View>
  );

  // ─── Render Item ───────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const isLow = item.currentGrams > 0 && item.currentGrams <= item.reorderPoint;
    const isOut = item.currentGrams === 0;
    const pct = Math.min(100, (item.currentGrams / Math.max(item.reorderPoint * 3, 1)) * 100);
    const barColor = isOut ? COLORS.red : isLow ? COLORS.amber : COLORS.purple;
    const borderColor = isOut
      ? 'rgba(239,68,68,0.3)'
      : isLow
      ? 'rgba(245,158,11,0.3)'
      : COLORS.cardBorder;

    return (
      <View style={[styles.itemCard, { borderColor }]}>
        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemCode} numberOfLines={1}>
              {item.shadeCode} {item.shadeName}
            </Text>
            {isOut && <AlertTriangle size={16} color={COLORS.red} />}
            {isLow && !isOut && <TrendingDown size={16} color={COLORS.amber} />}
          </View>
          <Text style={styles.itemMeta}>
            {item.brand} · {item.line}
          </Text>
          {/* Status bar */}
          <View style={styles.barBg}>
            <View
              style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]}
            />
          </View>
        </View>

        <View style={styles.itemControls}>
          {canEdit ? (
            <>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => handleAdjust(item.id, -10)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Minus size={14} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.gramsText}>{item.currentGrams}g</Text>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => handleAdjust(item.id, 10)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Plus size={14} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.readOnlyRow}>
              <Lock size={12} color={COLORS.textMuted} />
              <Text style={styles.gramsText}>{item.currentGrams}g</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Inventory</Text>
          <Text style={styles.headerSubtitle}>{items.length} items</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <RefreshCw size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard label="Total Items" value={items.length} />
        <StatCard label="Low Stock" value={lowStock} color={COLORS.amber} />
        <StatCard label="Value" value={`$${totalValue.toFixed(0)}`} color={COLORS.purple} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {[
          { key: 'all' as const, label: `All (${items.length})` },
          { key: 'low' as const, label: `Low (${lowStock})` },
          { key: 'out' as const, label: `Out (${outOfStock})` },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              filter === f.key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f.key && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Low Stock Banner */}
      {lowStock > 0 && filter === 'all' && (
        <View style={styles.alertBanner}>
          <AlertTriangle size={16} color={COLORS.amber} />
          <Text style={styles.alertText}>
            {lowStock} item{lowStock !== 1 ? 's' : ''} below reorder point. Restock soon.
          </Text>
        </View>
      )}

      {/* List */}
      {loading && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.centered}>
          <Package size={48} color="rgba(255,255,255,0.06)" />
          <Text style={styles.emptyTitle}>
            {filter === 'all' ? 'No inventory items' : `No ${filter === 'low' ? 'low stock' : 'out of stock'} items`}
          </Text>
          <Text style={styles.emptySubtext}>Add items via the web dashboard</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  headerLeft: { flex: 1 },
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
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  // Filters
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterChipActive: {
    backgroundColor: 'rgba(147,51,234,0.15)',
    borderColor: 'rgba(147,51,234,0.4)',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#A855F7',
    fontWeight: '700',
  },

  // Alert
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  alertText: {
    fontSize: 12,
    color: COLORS.amber,
    fontWeight: '500',
    flex: 1,
  },

  // List
  listContainer: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
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
  },

  // Item Card
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    gap: 12,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemCode: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flexShrink: 1,
  },
  itemMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  barBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  controlBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gramsText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: COLORS.textPrimary,
    minWidth: 42,
    textAlign: 'center',
  },
  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
