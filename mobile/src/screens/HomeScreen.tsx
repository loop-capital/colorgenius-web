import React, { useEffect, useState } from 'react';
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
import { Camera, Palette, Users, Package, Sparkles, ChevronRight } from 'lucide-react-native';
import { healthCheck, getTrendingGallery, getProducts } from '../api/client';

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function QuickAction({ icon, title, subtitle, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.quickActionIcon}>{icon}</View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: any) {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ formulations: 0, clients: 0, products: 0 });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      await healthCheck();
      setApiStatus('connected');
      // Load quick stats
      try {
        const [prods] = await Promise.all([getProducts()]);
        setStats(s => ({ ...s, products: prods.products?.length || 0 }));
      } catch {}
    } catch {
      setApiStatus('offline');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkConnection();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome to</Text>
            <Text style={styles.title}>COLORgenius</Text>
          </View>
          <View style={[styles.statusBadge, apiStatus === 'connected' ? styles.statusOnline : styles.statusOffline]}>
            <View style={[styles.statusDot, apiStatus === 'connected' ? styles.dotOnline : styles.dotOffline]} />
            <Text style={styles.statusText}>
              {apiStatus === 'checking' ? 'Connecting...' : apiStatus === 'connected' ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Hero Card */}
        <TouchableOpacity style={styles.heroCard} onPress={() => navigation.navigate('Formulate')}>
          <View style={styles.heroGradient}>
            <Sparkles size={32} color="#FFFFFF" />
            <Text style={styles.heroTitle}>New Formulation</Text>
            <Text style={styles.heroSubtitle}>
              Capture photos, analyze hair, and generate professional color formulations
            </Text>
            <View style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Start Formulating</Text>
              <ChevronRight size={18} color="#7C3AED" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.products}</Text>
            <Text style={styles.statLabel}>Shades</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>21</Text>
            <Text style={styles.statLabel}>Brands</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3,454+</Text>
            <Text style={styles.statLabel}>Database</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <QuickAction
          icon={<Camera size={24} color="#7C3AED" />}
          title="Take Photo"
          subtitle="Capture hair for analysis"
          onPress={() => navigation.navigate('Formulate', { screen: 'Camera' })}
        />
        <QuickAction
          icon={<Palette size={24} color="#EC4899" />}
          title="Browse Shades"
          subtitle="3,454+ shades across 21 brands"
          onPress={() => navigation.navigate('Formulate')}
        />
        <QuickAction
          icon={<Users size={24} color="#F59E0B" />}
          title="Manage Clients"
          subtitle="View history and formulations"
          onPress={() => navigation.navigate('Clients')}
        />
        <QuickAction
          icon={<Package size={24} color="#10B981" />}
          title="Community"
          subtitle="Trending formulas and gallery"
          onPress={() => navigation.navigate('Community')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 16, paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: '#6B7280' },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginTop: 2 },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusOnline: { backgroundColor: '#ECFDF5' },
  statusOffline: { backgroundColor: '#FEF2F2' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  dotOnline: { backgroundColor: '#10B981' },
  dotOffline: { backgroundColor: '#EF4444' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#374151' },

  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  heroGradient: {
    backgroundColor: '#7C3AED',
    padding: 24,
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#DDD6FE',
    marginTop: 8,
    lineHeight: 20,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 16,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C3AED',
    marginRight: 4,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statNumber: { fontSize: 20, fontWeight: '800', color: '#7C3AED' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionContent: { flex: 1 },
  quickActionTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  quickActionSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});
