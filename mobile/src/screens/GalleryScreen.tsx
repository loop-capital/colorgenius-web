// ============================================================
// GalleryScreen — Color Gallery Feed (matches web app)
// Features: Before/After photos, sort, filter, voting, detail view
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heart,
  MessageCircle,
  Eye,
  TrendingUp,
  Clock,
  Filter,
  X,
  ChevronDown,
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
  teal: '#14B8A6',
  danger: '#EF4444',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface Photo {
  id: string;
  beforeUrl?: string;
  afterUrl: string;
  caption?: string;
  hairType?: string;
  porosity?: string;
  levelBefore?: number;
  levelAfter?: number;
  developerVol?: string;
  stylistName?: string;
  stylistAvatar?: string;
  upvotes: number;
  downvotes: number;
  score: number;
  viewCount: number;
  commentCount: number;
  tags: string[];
  createdAt: string;
  brand?: string;
  shades?: string[];
}

// ─── Mock Data (fallback) ────────────────────────────────────────────────────

const MOCK_PHOTOS: Photo[] = [
  {
    id: '1',
    beforeUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37a?w=400',
    afterUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400',
    caption: 'From brassy orange to cool ash blonde in one session. Used Wella Koleston Perfect 9/16 with 30vol developer.',
    hairType: 'Fine / Medium',
    porosity: 'Normal',
    levelBefore: 6,
    levelAfter: 9,
    developerVol: '30Vol',
    stylistName: 'Emma Richardson',
    upvotes: 234,
    downvotes: 3,
    score: 231,
    viewCount: 1205,
    commentCount: 18,
    tags: ['transformation', 'ash-blonde', 'correction'],
    createdAt: '2026-05-20T10:00:00Z',
    brand: 'Wella',
    shades: ['9/16'],
  },
  {
    id: '2',
    beforeUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37a?w=400',
    afterUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
    caption: 'Soft balayage for a warm, dimensional look. Lived-in color that grows out beautifully.',
    hairType: 'Thick / Coarse',
    porosity: 'Low',
    levelBefore: 4,
    levelAfter: 7,
    developerVol: '20Vol',
    stylistName: 'Jessica Park',
    upvotes: 189,
    downvotes: 2,
    score: 187,
    viewCount: 890,
    commentCount: 12,
    tags: ['balayage', 'warm', 'dimensional'],
    createdAt: '2026-05-18T14:30:00Z',
    brand: 'Davines',
    shades: ['7.35', '8.04'],
  },
  {
    id: '3',
    afterUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
    caption: 'Vivid copper transformation. Pre-lightened to level 7 before applying custom vivid mix.',
    hairType: 'Medium',
    porosity: 'High',
    levelBefore: 3,
    levelAfter: 7,
    developerVol: '40Vol',
    stylistName: 'Marco DeLuca',
    upvotes: 156,
    downvotes: 5,
    score: 151,
    viewCount: 678,
    commentCount: 8,
    tags: ['vivid', 'copper', 'creative'],
    createdAt: '2026-05-15T09:00:00Z',
    brand: 'Joico',
    shades: ['7CC'],
  },
];

const BRANDS = ['Wella', 'Davines', 'Schwarzkopf', 'Joico', 'Lanza', 'Goldwell', 'Matrix', 'Redken'];
const LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function GalleryScreen({ navigation }: any) {
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'score' | 'recent' | 'featured'>('score');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [votedPhotos, setVotedPhotos] = useState<Set<string>>(new Set());

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('sort', sortBy);
      params.append('limit', '20');
      params.append('offset', '0');
      if (filterBrand) params.append('brand', filterBrand);
      if (filterLevel) params.append('level', filterLevel);

      const data = await apiRequest<{
        items: any[];
        total: number;
      }>(`/v1/gallery/photos?${params}`);

      if (data.items?.length > 0) {
        const mapped: Photo[] = data.items.map((p: any) => ({
          id: p.id,
          beforeUrl: p.beforeUrl,
          afterUrl: p.afterUrl,
          caption: p.caption,
          hairType: p.hairType,
          porosity: p.porosity,
          levelBefore: p.levelBefore,
          levelAfter: p.levelAfter,
          developerVol: p.developerVol,
          stylistName: p.stylistName,
          stylistAvatar: p.stylistAvatar,
          upvotes: p.upvotes || 0,
          downvotes: p.downvotes || 0,
          score: p.score || 0,
          viewCount: p.viewCount || 0,
          commentCount: p.commentCount || 0,
          tags: p.tags || [],
          createdAt: p.createdAt,
          brand: p.brand,
          shades: p.shades,
        }));
        setPhotos(mapped);
      }
    } catch (e) {
      console.warn('Gallery fetch failed, using mock data');
    } finally {
      setLoading(false);
    }
  }, [sortBy, filterBrand, filterLevel]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPhotos();
    setRefreshing(false);
  };

  const handleVote = async (photoId: string, direction: 'up' | 'down') => {
    if (votedPhotos.has(photoId)) return;

    try {
      await apiRequest(`/v1/gallery/photos/${photoId}/vote`, {
        method: 'POST',
        body: { direction },
      });

      // Optimistic update
      setPhotos((prev) =>
        prev.map((p) => {
          if (p.id === photoId) {
            return {
              ...p,
              upvotes: p.upvotes + (direction === 'up' ? 1 : 0),
              downvotes: p.downvotes + (direction === 'down' ? 1 : 0),
              score:
                p.score +
                (direction === 'up' ? 1 : -1),
            };
          }
          return p;
        })
      );
      setVotedPhotos((prev) => new Set([...prev, photoId]));
    } catch (e) {
      console.warn('Vote failed');
    }
  };

  const renderPhotoCard = ({ item: photo }: { item: Photo }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedPhoto(photo)}
      activeOpacity={0.8}
    >
      {/* Before/After Images */}
      <View style={styles.imageContainer}>
        {photo.beforeUrl ? (
          <View style={styles.beforeAfterRow}>
            <View style={styles.halfImage}>
              <Image source={{ uri: photo.beforeUrl }} style={styles.photo} />
              <View style={styles.labelBadge}>
                <Text style={styles.labelText}>BEFORE</Text>
              </View>
            </View>
            <View style={styles.halfImage}>
              <Image source={{ uri: photo.afterUrl }} style={styles.photo} />
              <View style={[styles.labelBadge, styles.afterBadge]}>
                <Text style={styles.labelText}>AFTER</Text>
              </View>
            </View>
          </View>
        ) : (
          <Image source={{ uri: photo.afterUrl }} style={styles.fullPhoto} />
        )}
      </View>

      {/* Info Row */}
      <View style={styles.infoRow}>
        <View style={styles.stylistInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {photo.stylistName?.split(' ').map((n) => n[0]).join('') || '?'}
            </Text>
          </View>
          <View>
            <Text style={styles.stylistName}>{photo.stylistName || 'Unknown'}</Text>
            <Text style={styles.metaText}>
              {photo.brand || 'Unknown'} · Lv.{photo.levelAfter || '?'}
            </Text>
          </View>
        </View>
        <View style={styles.scoreBadge}>
          <TrendingUp size={12} color={COLORS.teal} />
          <Text style={styles.scoreText}>{photo.score}</Text>
        </View>
      </View>

      {/* Caption */}
      {photo.caption && (
        <Text style={styles.caption} numberOfLines={2}>
          {photo.caption}
        </Text>
      )}

      {/* Tags */}
      <View style={styles.tagsRow}>
        {photo.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleVote(photo.id, 'up')}
          disabled={votedPhotos.has(photo.id)}
        >
          <Heart
            size={18}
            color={votedPhotos.has(photo.id) ? COLORS.pink : COLORS.textMuted}
            fill={votedPhotos.has(photo.id) ? COLORS.pink : 'transparent'}
          />
          <Text style={styles.actionText}>{photo.upvotes}</Text>
        </TouchableOpacity>

        <View style={styles.actionBtn}>
          <MessageCircle size={18} color={COLORS.textMuted} />
          <Text style={styles.actionText}>{photo.commentCount}</Text>
        </View>

        <View style={styles.actionBtn}>
          <Eye size={18} color={COLORS.textMuted} />
          <Text style={styles.actionText}>{photo.viewCount}</Text>
        </View>

        <Text style={styles.timeText}>
          {new Date(photo.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Color Gallery</Text>
          <Text style={styles.headerSubtitle}>
            Inspiring transformations worldwide
          </Text>
        </View>
      </View>

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.sortChips}>
            {[
              { key: 'score', label: 'Trending', icon: TrendingUp },
              { key: 'recent', label: 'Recent', icon: Clock },
              { key: 'featured', label: 'Featured', icon: Heart },
            ].map(({ key, label, icon: Icon }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.sortChip,
                  sortBy === key && styles.sortChipActive,
                ]}
                onPress={() => setSortBy(key as any)}
              >
                <Icon
                  size={14}
                  color={sortBy === key ? '#0A0A1A' : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.sortChipText,
                    sortBy === key && styles.sortChipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.sortChip,
                showFilters && styles.sortChipActive,
              ]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter
                size={14}
                color={showFilters ? '#0A0A1A' : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.sortChipText,
                  showFilters && styles.sortChipTextActive,
                ]}
              >
                Filter
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
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
              {BRANDS.map((brand) => (
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

          <Text style={styles.filterLabel}>Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !filterLevel && styles.filterChipActive,
                ]}
                onPress={() => setFilterLevel('')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !filterLevel && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {LEVELS.map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[
                    styles.filterChip,
                    filterLevel === String(lvl) && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setFilterLevel(filterLevel === String(lvl) ? '' : String(lvl))
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterLevel === String(lvl) && styles.filterChipTextActive,
                    ]}
                  >
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Photo List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No photos yet</Text>
          <Text style={styles.emptySubtext}>
            Share your transformations to inspire others.
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhotoCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Detail Modal */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPhoto && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Transformation</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedPhoto(null)}
                    style={styles.closeBtn}
                  >
                    <X size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Large Before/After */}
                  <View style={styles.modalImages}>
                    {selectedPhoto.beforeUrl ? (
                      <View style={styles.modalBeforeAfter}>
                        <View style={styles.modalHalf}>
                          <Image
                            source={{ uri: selectedPhoto.beforeUrl }}
                            style={styles.modalPhoto}
                          />
                          <View style={styles.modalLabel}>
                            <Text style={styles.modalLabelText}>BEFORE</Text>
                          </View>
                        </View>
                        <View style={styles.modalHalf}>
                          <Image
                            source={{ uri: selectedPhoto.afterUrl }}
                            style={styles.modalPhoto}
                          />
                          <View style={[styles.modalLabel, styles.modalLabelAfter]}>
                            <Text style={styles.modalLabelText}>AFTER</Text>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: selectedPhoto.afterUrl }}
                        style={styles.modalFullPhoto}
                      />
                    )}
                  </View>

                  {/* Info */}
                  <View style={styles.modalInfo}>
                    <View style={styles.modalStylistRow}>
                      <View style={styles.modalAvatar}>
                        <Text style={styles.modalAvatarText}>
                          {selectedPhoto.stylistName
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('') || '?'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.modalStylistName}>
                          {selectedPhoto.stylistName}
                        </Text>
                        <Text style={styles.modalMeta}>
                          {selectedPhoto.brand} · {selectedPhoto.developerVol}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.levelRow}>
                      <View style={styles.levelItem}>
                        <Text style={styles.levelLabel}>Before</Text>
                        <Text style={styles.levelValue}>
                          Level {selectedPhoto.levelBefore || '?'}
                        </Text>
                      </View>
                      <ChevronDown
                        size={20}
                        color={COLORS.textMuted}
                        style={{ transform: [{ rotate: '-90deg' }] }}
                      />
                      <View style={styles.levelItem}>
                        <Text style={styles.levelLabel}>After</Text>
                        <Text style={styles.levelValue}>
                          Level {selectedPhoto.levelAfter || '?'}
                        </Text>
                      </View>
                    </View>

                    {selectedPhoto.caption && (
                      <Text style={styles.modalCaption}>
                        {selectedPhoto.caption}
                      </Text>
                    )}

                    <View style={styles.modalTags}>
                      {selectedPhoto.tags.map((tag) => (
                        <View key={tag} style={styles.modalTag}>
                          <Text style={styles.modalTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.modalStats}>
                      <View style={styles.statItem}>
                        <Heart size={16} color={COLORS.pink} />
                        <Text style={styles.statText}>{selectedPhoto.upvotes}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <MessageCircle size={16} color={COLORS.textMuted} />
                        <Text style={styles.statText}>
                          {selectedPhoto.commentCount}
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Eye size={16} color={COLORS.textMuted} />
                        <Text style={styles.statText}>{selectedPhoto.viewCount}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={{ height: 40 }} />
                </ScrollView>
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

  // Sort Bar
  sortBar: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sortChips: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  sortChipActive: {
    backgroundColor: COLORS.purple,
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sortChipTextActive: {
    color: '#0A0A1A',
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

  // List
  listContainer: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
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
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Photo Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 220,
  },
  beforeAfterRow: {
    flexDirection: 'row',
    flex: 1,
  },
  halfImage: {
    flex: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  fullPhoto: {
    width: '100%',
    height: '100%',
  },
  labelBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  afterBadge: {
    left: undefined,
    right: 8,
  },
  labelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    paddingBottom: 8,
  },
  stylistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  stylistName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(20,184,166,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.teal,
  },
  caption: {
    fontSize: 13,
    color: COLORS.textSecondary,
    paddingHorizontal: 14,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
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

  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 16,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  timeText: {
    marginLeft: 'auto',
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '95%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImages: {
    height: 280,
  },
  modalBeforeAfter: {
    flexDirection: 'row',
    flex: 1,
  },
  modalHalf: {
    flex: 1,
    position: 'relative',
  },
  modalPhoto: {
    width: '100%',
    height: '100%',
  },
  modalFullPhoto: {
    width: '100%',
    height: '100%',
  },
  modalLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modalLabelAfter: {
    left: undefined,
    right: 12,
  },
  modalLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },

  modalInfo: {
    padding: 20,
    gap: 14,
  },
  modalStylistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  modalStylistName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalMeta: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
  },
  levelItem: {
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  levelValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalCaption: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  modalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalTag: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modalTagText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  modalStats: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
