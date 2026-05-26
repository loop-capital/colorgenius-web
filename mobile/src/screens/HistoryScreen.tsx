import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History, Search, Filter, Clock, Palette } from 'lucide-react-native';
import { getHistory, type HistoryEntry } from '../api/client';

const COLORS = {
  bg: '#0F0F1A',
  card: '#161620',
  cardBorder: 'rgba(255,255,255,0.06)',
  textPrimary: '#F5F5F7',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  purple: '#9333EA',
};

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Formulations', value: 'formulation' },
  { label: 'Services', value: 'service' },
  { label: 'Clients', value: 'client' },
];

export default function HistoryScreen({ navigation }: any) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchHistory = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    
    const data = await getHistory({
      search: searchTerm || undefined,
      type: activeFilter !== 'all' ? activeFilter : undefined,
    });
    setEntries(data);
    
    if (refresh) setRefreshing(false);
    else setLoading(false);
  }, [searchTerm, activeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchHistory(), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, activeFilter]);

  useEffect(() => { fetchHistory(); }, []);

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchHistory(true)} tintColor={COLORS.purple} />}
      >
        <View style={styles.header}>
          <History size={32} color={COLORS.purple} />
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Past services and formulations</Text>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Search size={16} color={COLORS.textMuted} />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search clients, brands..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
          />
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setActiveFilter(f.value)}
              style={[styles.filterPill, activeFilter === f.value && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, activeFilter === f.value && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Entries */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.purple} />
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.center}>
            <Clock size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No history yet</Text>
            <Text style={styles.emptySubtext}>Your formulations and services will appear here</Text>
          </View>
        ) : (
          entries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.card}
              onPress={() => {
                // Navigate to formulation details or client profile
                if (entry.clientName) {
                  navigation.navigate('ClientCollection', { clientId: entry.id, clientName: entry.clientName });
                }
              }}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Palette size={16} color={COLORS.purple} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{entry.clientName || 'Unknown Client'}</Text>
                  <Text style={styles.cardDesc}>
                    {entry.brand ? `${entry.brand} — ` : ''}
                    {entry.serviceType || 'Formulation'}
                    {entry.targetLevel ? ` → Level ${entry.targetLevel}` : ''}
                    {entry.targetTone ? ` ${entry.targetTone}` : ''}
                  </Text>
                </View>
                <Text style={styles.cardTime}>{formatTime(entry.createdAt)}</Text>
              </View>
              {entry.satisfaction != null && (
                <View style={styles.satisfactionRow}>
                  <Text style={styles.satisfactionLabel}>Satisfaction</Text>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text key={star} style={[styles.star, star <= entry.satisfaction! ? styles.starFilled : styles.starEmpty]}>★</Text>
                    ))}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginTop: 12 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6, textAlign: 'center' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  filterScroll: { marginBottom: 16 },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    marginRight: 8,
  },
  filterPillActive: { backgroundColor: 'rgba(147,51,234,0.15)', borderColor: 'rgba(147,51,234,0.4)' },
  filterText: { fontSize: 13, color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.purple, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(147,51,234,0.1)', justifyContent: 'center', alignItems: 'center',
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  cardTime: { fontSize: 12, color: COLORS.textMuted },
  satisfactionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)',
  },
  satisfactionLabel: { fontSize: 12, color: COLORS.textMuted },
  stars: { flexDirection: 'row', gap: 2 },
  star: { fontSize: 14 },
  starFilled: { color: '#FBBF24' },
  starEmpty: { color: 'rgba(255,255,255,0.1)' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.textMuted, marginTop: 16 },
  emptySubtext: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, textAlign: 'center' },
});
