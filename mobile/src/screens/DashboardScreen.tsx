import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LayoutDashboard, Sparkles, ChevronRight, Users, Package } from 'lucide-react-native';

const COLORS = {
  bg: '#0F0F1A',
  card: '#161620',
  cardBorder: 'rgba(255,255,255,0.06)',
  textPrimary: '#F5F5F7',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  purple: '#9333EA',
  pink: '#EC4899',
  green: '#10B981',
  yellow: '#F59E0B',
};

export default function DashboardScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>
        </View>

        {/* Hero Card */}
        <TouchableOpacity style={styles.heroCard} onPress={() => navigation.navigate('NewService')}>
          <View style={styles.heroGradient}>
            <Sparkles size={32} color="#F5F5F7" />
            <Text style={styles.heroTitle}>New Formulation</Text>
            <Text style={styles.heroSubtitle}>
              Start a new color service for your client
            </Text>
            <View style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Start Formulating</Text>
              <ChevronRight size={18} color={COLORS.purple} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Services Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>48</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3,454+</Text>
            <Text style={styles.statLabel}>Shades</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Clients')}>
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(147,51,234,0.1)' }]}>
            <Users size={24} color={COLORS.purple} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Clients</Text>
            <Text style={styles.actionSubtitle}>View history and formulations</Text>
          </View>
          <ChevronRight size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Library')}>
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(236,72,153,0.1)' }]}>
            <Package size={24} color={COLORS.pink} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Browse Library</Text>
            <Text style={styles.actionSubtitle}>3,454+ shades across 21 brands</Text>
          </View>
          <ChevronRight size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: COLORS.textSecondary },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, marginTop: 2 },

  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroGradient: {
    backgroundColor: COLORS.purple,
    padding: 24,
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F5F5F7',
    marginTop: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    lineHeight: 20,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161620',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 16,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.purple,
    marginRight: 4,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statNumber: { fontSize: 20, fontWeight: '800', color: COLORS.purple },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  actionSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});
