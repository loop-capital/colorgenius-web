import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Star, Sparkles, Heart, Eye } from 'lucide-react-native';
import { getPublicGallery, getTrendingGallery, browseMarketplace } from '../api/client';

interface TabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon: React.ReactNode;
}

function TabButton({ label, active, onPress, icon }: TabButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function PhotoCard({ item, index }: { item: any; index: number }) {
  return (
    <View style={styles.photoCard}>
      <View style={styles.photoPlaceholder}>
        <Sparkles size={32} color="#9333EA" />
      </View>
      <View style={styles.photoInfo}>
        <Text style={styles.photoTitle} numberOfLines={1}>
          {item.title || item.description || `Formulation #${index + 1}`}
        </Text>
        <Text style={styles.photoMeta}>
          {item.stylist_name || 'COLORgenius Community'}
        </Text>
        <View style={styles.photoStats}>
          <View style={styles.photoStat}>
            <Heart size={14} color="#EF4444" />
            <Text style={styles.photoStatText}>{item.likes || Math.floor(Math.random() * 50) + 10}</Text>
          </View>
          <View style={styles.photoStat}>
            <Eye size={14} color="#A1A1AA" />
            <Text style={styles.photoStatText}>{item.views || Math.floor(Math.random() * 200) + 50}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function MarketplaceItem({ item }: { item: any }) {
  return (
    <TouchableOpacity style={styles.marketCard} onPress={() => alert('Marketplace item detail - coming in next update!')}>
      <View style={styles.marketBadge}>
        <Text style={styles.marketBadgeText}>{item.category || 'Formula'}</Text>
      </View>
      <Text style={styles.marketTitle} numberOfLines={2}>
        {item.title || item.name || 'Custom Formulation'}
      </Text>
      <Text style={styles.marketCreator} numberOfLines={1}>
        by {item.creator_name || 'Community Stylist'}
      </Text>
      <View style={styles.marketFooter}>
        <Text style={styles.marketPrice}>
          {item.price ? `$${item.price}` : 'Free'}
        </Text>
        <TouchableOpacity style={styles.marketBtn} onPress={() => alert('View marketplace item - coming in next update!')}>
          <Text style={styles.marketBtnText}>View</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<'trending' | 'gallery' | 'marketplace'>('trending');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [marketplace, setMarketplace] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        getTrendingGallery(),
        getPublicGallery(1),
        browseMarketplace({ page: 1 }),
      ]);

      if (results[0].status === 'fulfilled') {
        setTrending(results[0].value.photos || []);
      }
      if (results[1].status === 'fulfilled') {
        setGallery(results[1].value.photos || []);
      }
      if (results[2].status === 'fulfilled') {
        setMarketplace(results[2].value.items || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Sample data for prototype when API returns empty
  const samplePhotos = trending.length > 0 ? trending : Array.from({ length: 8 }, (_, i) => ({
    id: `sample-${i}`,
    title: ['Balayage Blend', 'Root Melt', 'Platinum Lift', 'Copper Glow', 'Brunette Dimension', 'Vivid Violet', 'Honey Blonde', 'Silver Fox'][i],
    stylist_name: ['Sarah M.', 'James K.', 'Maria L.', 'Alex T.', 'Chris R.', 'Dana P.', 'Lin W.', 'Omar F.'][i],
    likes: Math.floor(Math.random() * 80) + 20,
    views: Math.floor(Math.random() * 300) + 100,
  }));

  const sampleMarket = marketplace.length > 0 ? marketplace : Array.from({ length: 6 }, (_, i) => ({
    id: `mkt-${i}`,
    title: ['Professional Balayage Formula', 'Gray Coverage System', 'Platinum Toning Guide', 'Vivid Color Maintenance', 'Root Touch-Up Kit', 'Dimensional Brunette'][i],
    category: ['Technique', 'Coverage', 'Toning', 'Maintenance', 'Roots', 'Dimension'][i],
    creator_name: ['ColorMaster', 'GrayGone', 'PlatinumPro', 'VividVibes', 'RootRescue', 'DimensionQueen'][i],
    price: [29, 19, 24, 15, 12, 22][i],
  }));

  const data = activeTab === 'trending' ? samplePhotos : activeTab === 'gallery' ? gallery : marketplace;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TabButton
          label="Trending"
          active={activeTab === 'trending'}
          onPress={() => setActiveTab('trending')}
          icon={<TrendingUp size={16} color={activeTab === 'trending' ? '#9333EA' : '#A1A1AA'} />}
        />
        <TabButton
          label="Gallery"
          active={activeTab === 'gallery'}
          onPress={() => setActiveTab('gallery')}
          icon={<Star size={16} color={activeTab === 'gallery' ? '#9333EA' : '#A1A1AA'} />}
        />
        <TabButton
          label="Marketplace"
          active={activeTab === 'marketplace'}
          onPress={() => setActiveTab('marketplace')}
          icon={<Sparkles size={16} color={activeTab === 'marketplace' ? '#9333EA' : '#A1A1AA'} />}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {activeTab === 'marketplace' ? (
            <View style={styles.marketGrid}>
              {(sampleMarket).map((item: any) => (
                <MarketplaceItem key={item.id} item={item} />
              ))}
            </View>
          ) : (
            (data.length > 0 ? data : samplePhotos).map((item: any, index: number) => (
              <PhotoCard key={item.id || index} item={item} index={index} />
            ))
          )}

          {data.length === 0 && activeTab === 'gallery' && (
            <View style={styles.empty}>
              <Sparkles size={48} color="#9333EA" />
              <Text style={styles.emptyTitle}>No photos yet</Text>
              <Text style={styles.emptyText}>
                Share your formulations to the gallery and inspire the community
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#F5F5F7' },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#161620',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tabActive: { backgroundColor: 'rgba(147,51,234,0.15)', borderColor: '#9333EA' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#A1A1AA' },
  tabTextActive: { color: '#9333EA' },

  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  photoCard: {
    flexDirection: 'row',
    backgroundColor: '#161620',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  photoPlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: 'rgba(147,51,234,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  photoTitle: { fontSize: 15, fontWeight: '700', color: '#F5F5F7' },
  photoMeta: { fontSize: 12, color: '#A1A1AA', marginTop: 2 },
  photoStats: { flexDirection: 'row', gap: 12, marginTop: 6 },
  photoStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  photoStatText: { fontSize: 12, color: '#A1A1AA' },

  marketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  marketCard: {
    width: '48%',
    backgroundColor: '#161620',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  marketBadge: {
    backgroundColor: 'rgba(147,51,234,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  marketBadgeText: { fontSize: 10, fontWeight: '700', color: '#9333EA', textTransform: 'uppercase' },
  marketTitle: { fontSize: 14, fontWeight: '700', color: '#F5F5F7' },
  marketCreator: { fontSize: 11, color: '#A1A1AA', marginTop: 4 },
  marketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  marketPrice: { fontSize: 16, fontWeight: '800', color: '#10B981' },
  marketBtn: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  marketBtnText: { color: '#161620', fontSize: 11, fontWeight: '700' },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#A1A1AA', marginTop: 12 },
  emptyText: { fontSize: 14, color: '#A1A1AA', textAlign: 'center', marginTop: 6, paddingHorizontal: 40 },
});
