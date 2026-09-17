import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Star, Sparkles, Heart, MessageCircle } from 'lucide-react-native';
import { apiRequest } from '../api/client';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CommunityPost {
  id: string;
  type: string;
  content: string;
  formulaLabel: string | null;
  tags: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    tier?: string;
    isVerified?: boolean;
  };
  photos: { id: string; url: string; label?: string }[];
  liked?: boolean;
}

interface MarketplaceListing {
  id: string;
  title: string;
  category: string;
  price_cents: number;
  share_code: string | null;
  creator?: { display_name?: string; first_name?: string };
}

// ─── Tab Button ──────────────────────────────────────────────────────────────

function TabButton({ label, active, onPress, icon }: { label: string; active: boolean; onPress: () => void; icon: React.ReactNode }) {
  return (
    <TouchableOpacity style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      {icon}
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Post Card ───────────────────────────────────────────────────────────────

function PostCard({ post, onLike }: { post: CommunityPost; onLike: (id: string) => void }) {
  const photo = post.photos[0];
  return (
    <View style={styles.postCard}>
      {photo ? (
        <Image source={{ uri: photo.url }} style={styles.postImage} />
      ) : (
        <View style={styles.postImagePlaceholder}>
          <Sparkles size={28} color="#9333EA" />
        </View>
      )}
      <View style={styles.postInfo}>
        <Text style={styles.postAuthor} numberOfLines={1}>
          {post.author.name}{post.author.isVerified ? ' ✓' : ''}
        </Text>
        {post.content ? (
          <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>
        ) : null}
        {post.formulaLabel ? (
          <Text style={styles.postFormula} numberOfLines={1}>{post.formulaLabel}</Text>
        ) : null}
        <View style={styles.postStats}>
          <TouchableOpacity style={styles.postStat} onPress={() => onLike(post.id)}>
            <Heart size={14} color={post.liked ? '#EF4444' : '#A1A1AA'} fill={post.liked ? '#EF4444' : 'transparent'} />
            <Text style={styles.postStatText}>{post.likeCount}</Text>
          </TouchableOpacity>
          <View style={styles.postStat}>
            <MessageCircle size={14} color="#A1A1AA" />
            <Text style={styles.postStatText}>{post.commentCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Marketplace Card ────────────────────────────────────────────────────────

function MarketplaceCard({ item }: { item: MarketplaceListing }) {
  return (
    <TouchableOpacity
      style={styles.marketCard}
      onPress={() => Alert.alert(item.title, `Share code: ${item.share_code || 'N/A'}\nPrice: ${item.price_cents ? `$${(item.price_cents / 100).toFixed(2)}` : 'Free'}`)}
    >
      <View style={styles.marketBadge}>
        <Text style={styles.marketBadgeText}>{item.category || 'Formula'}</Text>
      </View>
      <Text style={styles.marketTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.marketCreator} numberOfLines={1}>
        by {item.creator?.display_name || item.creator?.first_name || 'Community Stylist'}
      </Text>
      <Text style={styles.marketPrice}>
        {item.price_cents ? `$${(item.price_cents / 100).toFixed(2)}` : 'Free'}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<'trending' | 'recent' | 'marketplace'>('trending');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [marketplace, setMarketplace] = useState<MarketplaceListing[]>([]);

  const loadPosts = useCallback(async (tab: 'trending' | 'recent') => {
    const backendTab = tab === 'recent' ? 'all' : 'trending';
    const data = await apiRequest<{ items: CommunityPost[] }>(`/v1/community/posts?tab=${backendTab}&limit=20`);
    return data.items || [];
  }, []);

  const loadMarketplace = useCallback(async () => {
    const data = await apiRequest<{ success: boolean; data?: MarketplaceListing[] }>('/marketplace/browse');
    return data.data || [];
  }, []);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      if (activeTab === 'marketplace') {
        setMarketplace(await loadMarketplace());
      } else {
        setPosts(await loadPosts(activeTab));
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, loadPosts, loadMarketplace]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLike = async (postId: string) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, liked: !p.liked, likeCount: p.likeCount + (p.liked ? -1 : 1) } : p
      )
    );
    try {
      await apiRequest<{ liked: boolean }>(`/v1/community/posts/${postId}/like`, { method: 'POST' });
    } catch (e) {
      // Revert on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, liked: !p.liked, likeCount: p.likeCount + (p.liked ? -1 : 1) } : p
        )
      );
      Alert.alert('Couldn’t save your like', e instanceof Error ? e.message : 'Check your connection and try again.');
    }
  };

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
          label="Recent"
          active={activeTab === 'recent'}
          onPress={() => setActiveTab('recent')}
          icon={<Star size={16} color={activeTab === 'recent' ? '#9333EA' : '#A1A1AA'} />}
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
      ) : loadError ? (
        <View style={styles.center}>
          <Sparkles size={48} color="#9333EA" />
          <Text style={styles.emptyTitle}>Couldn&apos;t load this</Text>
          <Text style={styles.emptyText}>{loadError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); loadData(); }}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {activeTab === 'marketplace' ? (
            marketplace.length === 0 ? (
              <View style={styles.empty}>
                <Sparkles size={48} color="#9333EA" />
                <Text style={styles.emptyTitle}>No formulas listed yet</Text>
                <Text style={styles.emptyText}>Published formulas will show up here.</Text>
              </View>
            ) : (
              <View style={styles.marketGrid}>
                {marketplace.map((item) => (
                  <MarketplaceCard key={item.id} item={item} />
                ))}
              </View>
            )
          ) : posts.length === 0 ? (
            <View style={styles.empty}>
              <Sparkles size={48} color="#9333EA" />
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>
                Share your formulations to the community and inspire others.
              </Text>
            </View>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} onLike={handleLike} />)
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },

  postCard: {
    flexDirection: 'row',
    backgroundColor: '#161620',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  postImage: { width: 90, height: 90 },
  postImagePlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: 'rgba(147,51,234,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  postAuthor: { fontSize: 14, fontWeight: '700', color: '#F5F5F7' },
  postContent: { fontSize: 12, color: '#A1A1AA', marginTop: 2 },
  postFormula: { fontSize: 12, color: '#9333EA', marginTop: 2, fontWeight: '600' },
  postStats: { flexDirection: 'row', gap: 14, marginTop: 6 },
  postStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postStatText: { fontSize: 12, color: '#A1A1AA' },

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
  marketPrice: { fontSize: 16, fontWeight: '800', color: '#10B981', marginTop: 8 },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#A1A1AA', marginTop: 12 },
  emptyText: { fontSize: 14, color: '#A1A1AA', textAlign: 'center', marginTop: 6, paddingHorizontal: 40 },

  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#9333EA',
  },
  retryBtnText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
});
