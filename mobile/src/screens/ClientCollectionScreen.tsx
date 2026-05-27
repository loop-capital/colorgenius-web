// ============================================================
// ClientCollectionScreen — My Saved Gallery Photos
// Features: Grid view, save/unsave, notes, share with stylist
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  X,
  Heart,
  MessageCircle,
  Eye,
  Plus,
  ChevronRight,
  StickyNote,
  Send,
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
  amber: '#F59E0B',
  success: '#22C55E',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface SavedPhoto {
  id: string;
  photoId: string;
  formulaId: string;
  beforeUrl?: string;
  afterUrl: string;
  caption?: string;
  brand?: string;
  shades?: string[];
  stylistName?: string;
  tags: string[];
  upvotes: number;
  commentCount: number;
  viewCount: number;
  notes?: string;
  status: 'saved' | 'booked' | 'completed' | 'archived';
  sharedWithStylistId?: string;
  sharedAt?: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  saved: { label: 'Saved', color: COLORS.textSecondary, bgColor: 'rgba(255,255,255,0.06)' },
  booked: { label: 'Booked', color: COLORS.purple, bgColor: 'rgba(147,51,234,0.1)' },
  completed: { label: 'Completed', color: COLORS.success, bgColor: 'rgba(34,197,94,0.1)' },
  archived: { label: 'Archived', color: COLORS.textMuted, bgColor: 'rgba(255,255,255,0.03)' },
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function ClientCollectionScreen({ navigation }: any) {
  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [selectedPhoto, setSelectedPhoto] = useState<SavedPhoto | null>(null);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareStylistId, setShareStylistId] = useState('');

  // ─── Data Fetching ────────────────────────────────────────────────────────

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
      // For now, fetch from gallery API and map to saved items
      // In production this would be: /api/v1/clients/me/collection
      const response = await apiRequest<{ items: any[]; total: number }>('/v1/gallery/photos?limit=50');
      const items = response.items || [];
      const mapped: SavedPhoto[] = items.map((p: any) => ({
        id: p.id,
        photoId: p.id,
        formulaId: p.formulaId,
        beforeUrl: p.beforeUrl,
        afterUrl: p.afterUrl,
        caption: p.caption,
        brand: p.brand,
        shades: p.shades || [],
        stylistName: p.stylistName,
        tags: p.tags || [],
        upvotes: p.upvotes || 0,
        commentCount: p.commentCount || 0,
        viewCount: p.viewCount || 0,
        notes: '', // Will come from client_photo_collections in production
        status: 'saved',
        createdAt: p.createdAt,
      }));
      setPhotos(mapped);
    } catch (e) {
      console.warn('Failed to fetch collection:', e);
      // Mock fallback
      setPhotos([
        {
          id: 'demo-1',
          photoId: 'demo-1',
          formulaId: 'formula-1',
          beforeUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37a?w=400',
          afterUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400',
          caption: 'From brassy orange to cool ash blonde in one session.',
          brand: 'Wella',
          shades: ['9/16'],
          stylistName: 'Emma Richardson',
          tags: ['transformation', 'ash-blonde', 'correction'],
          upvotes: 234,
          commentCount: 18,
          viewCount: 1205,
          notes: 'Want to book this for next month. Mention my sensitive scalp.',
          status: 'saved',
          createdAt: '2026-05-20T10:00:00Z',
        },
        {
          id: 'demo-2',
          photoId: 'demo-2',
          formulaId: 'formula-2',
          afterUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
          caption: 'Soft balayage for a warm, dimensional look.',
          brand: 'Davines',
          shades: ['7.35', '8.04'],
          stylistName: 'Jessica Park',
          tags: ['balayage', 'warm', 'dimensional'],
          upvotes: 189,
          commentCount: 12,
          viewCount: 890,
          notes: '',
          status: 'booked',
          sharedWithStylistId: 'stylist-1',
          createdAt: '2026-05-18T14:30:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCollection();
    setRefreshing(false);
  };

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleUnsave = async (photoId: string) => {
    try {
      await apiRequest(`/v1/gallery/photos/${photoId}/save`, { method: 'DELETE' });
      setPhotos((prev) => prev.filter((p) => p.photoId !== photoId));
      setSelectedPhoto(null);
    } catch (e) {
      console.warn('Unsave failed:', e);
      Alert.alert('Error', 'Failed to remove photo. Please try again.');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedPhoto) return;
    try {
      await apiRequest(`/v1/gallery/photos/${selectedPhoto.photoId}/notes`, {
        method: 'PATCH',
        body: { notes: editingNotes },
      });
      setPhotos((prev) =>
        prev.map((p) =>
          p.photoId === selectedPhoto.photoId ? { ...p, notes: editingNotes } : p
        )
      );
      setNotesModalVisible(false);
      setSelectedPhoto((prev) => (prev ? { ...prev, notes: editingNotes } : null));
    } catch (e) {
      Alert.alert('Error', 'Failed to save notes');
    }
  };

  const handleShare = async () => {
    if (!selectedPhoto || !shareStylistId.trim()) {
      Alert.alert('Error', 'Please enter a stylist ID to share with');
      return;
    }
    try {
      // POST /api/v1/gallery/photos/{id}/share
      await apiRequest(`/v1/gallery/photos/${selectedPhoto.photoId}/share`, {
        method: 'POST',
        body: { stylistId: shareStylistId },
      });
      setPhotos((prev) =>
        prev.map((p) =>
          p.photoId === selectedPhoto.photoId
            ? { ...p, sharedWithStylistId: shareStylistId, sharedAt: new Date().toISOString() }
            : p
        )
      );
      setSelectedPhoto((prev) =>
        prev ? { ...prev, sharedWithStylistId: shareStylistId, sharedAt: new Date().toISOString() } : null
      );
      setShareModalVisible(false);
      setShareStylistId('');
      Alert.alert('Shared!', 'This transformation has been shared with your stylist.');
    } catch (e) {
      Alert.alert('Error', 'Failed to share with stylist');
    }
  };

  const handleStatusChange = (photoId: string, newStatus: SavedPhoto['status']) => {
    setPhotos((prev) =>
      prev.map((p) => (p.photoId === photoId ? { ...p, status: newStatus } : p))
    );
    setSelectedPhoto((prev) => (prev ? { ...prev, status: newStatus } : null));
  };

  // ─── Filtered List ───────────────────────────────────────────────────────

  const filteredPhotos = filterStatus
    ? photos.filter((p) => p.status === filterStatus)
    : photos;

  // ─── Render Card ───────────────────────────────────────────────────────────

  const renderCard = ({ item: photo }: { item: SavedPhoto }) => {
    const statusInfo = STATUS_LABELS[photo.status];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedPhoto(photo);
          setEditingNotes(photo.notes || '');
        }}
        activeOpacity={0.8}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: photo.afterUrl }} style={styles.photoImage} />
          {photo.beforeUrl && (
            <View style={styles.beforeBadge}>
              <Text style={styles.beforeBadgeText}>B&A</Text>
            </View>
          )}
          {/* Status badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor, borderColor: statusInfo.color }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardCaption} numberOfLines={2}>
            {photo.caption || 'No caption'}
          </Text>
          <View style={styles.cardMetaRow}>
            <Text style={styles.cardMeta}>
              {photo.brand || 'Unknown'} · {photo.stylistName || 'Unknown'}
            </Text>
          </View>

          {/* Tags */}
          {photo.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {photo.tags.slice(0, 3).map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.cardActions}>
            <View style={styles.statRow}>
              <Heart size={14} color={COLORS.pink} />
              <Text style={styles.statText}>{photo.upvotes}</Text>
              <MessageCircle size={14} color={COLORS.textMuted} />
              <Text style={styles.statText}>{photo.commentCount}</Text>
            </View>
            <TouchableOpacity
              style={styles.unsaveBtn}
              onPress={() => handleUnsave(photo.photoId)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <BookmarkCheck size={18} color={COLORS.purple} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Collection</Text>
          <Text style={styles.headerSubtitle}>
            {photos.length} saved {photos.length === 1 ? 'photo' : 'photos'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('GalleryUpload')}
        >
          <Plus size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Status Filters */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterChips}>
            <TouchableOpacity
              style={[styles.filterChip, !filterStatus && styles.filterChipActive]}
              onPress={() => setFilterStatus('')}
            >
              <Text style={[styles.filterChipText, !filterStatus && styles.filterChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {(['saved', 'booked', 'completed'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  filterStatus === status && styles.filterChipActive,
                ]}
                onPress={() => setFilterStatus(filterStatus === status ? '' : status)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterStatus === status && styles.filterChipTextActive,
                  ]}
                >
                  {STATUS_LABELS[status].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Photo Grid */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </View>
      ) : filteredPhotos.length === 0 ? (
        <View style={styles.centered}>
          <Bookmark size={48} color="rgba(255,255,255,0.06)" />
          <Text style={styles.emptyTitle}>No saved photos</Text>
          <Text style={styles.emptySubtext}>
            Save gallery photos to build your collection.
          </Text>
          <TouchableOpacity
            style={styles.emptyActionBtn}
            onPress={() => navigation.navigate('Gallery')}
          >
            <Text style={styles.emptyActionText}>Browse Gallery</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPhotos}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
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
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Saved Photo</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedPhoto(null)}
                    style={styles.closeBtn}
                  >
                    <X size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalScroll}>
                  {/* Images */}
                  <View style={styles.modalImages}>
                    {selectedPhoto.beforeUrl ? (
                      <View style={styles.modalBeforeAfter}>
                        <View style={styles.modalHalf}>
                          <Image source={{ uri: selectedPhoto.beforeUrl }} style={styles.modalPhoto} />
                          <View style={styles.modalLabel}>
                            <Text style={styles.modalLabelText}>BEFORE</Text>
                          </View>
                        </View>
                        <View style={styles.modalHalf}>
                          <Image source={{ uri: selectedPhoto.afterUrl }} style={styles.modalPhoto} />
                          <View style={[styles.modalLabel, { right: 12, left: undefined }]}>
                            <Text style={styles.modalLabelText}>AFTER</Text>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <Image source={{ uri: selectedPhoto.afterUrl }} style={styles.modalFullPhoto} />
                    )}
                  </View>

                  {/* Info */}
                  <View style={styles.modalInfo}>
                    {selectedPhoto.caption && (
                      <Text style={styles.modalCaption}>{selectedPhoto.caption}</Text>
                    )}

                    <View style={styles.metaGrid}>
                      <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Brand</Text>
                        <Text style={styles.metaValue}>{selectedPhoto.brand || 'Unknown'}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Stylist</Text>
                        <Text style={styles.metaValue}>{selectedPhoto.stylistName || 'Unknown'}</Text>
                      </View>
                    </View>

                    {selectedPhoto.shades && selectedPhoto.shades.length > 0 && (
                      <>
                        <Text style={styles.sectionTitle}>Shades</Text>
                        <View style={styles.shadesRow}>
                          {selectedPhoto.shades.map((shade) => (
                            <View key={shade} style={styles.shadeChip}>
                              <Text style={styles.shadeChipText}>{shade}</Text>
                            </View>
                          ))}
                        </View>
                      </>
                    )}

                    {/* Tags */}
                    {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                      <>
                        <Text style={styles.sectionTitle}>Tags</Text>
                        <View style={styles.tagsRow}>
                          {selectedPhoto.tags.map((tag) => (
                            <View key={tag} style={styles.tagChip}>
                              <Text style={styles.tagChipText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      </>
                    )}

                    {/* Stats */}
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Heart size={16} color={COLORS.pink} />
                        <Text style={styles.statValue}>{selectedPhoto.upvotes}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <MessageCircle size={16} color={COLORS.textMuted} />
                        <Text style={styles.statValue}>{selectedPhoto.commentCount}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Eye size={16} color={COLORS.textMuted} />
                        <Text style={styles.statValue}>{selectedPhoto.viewCount}</Text>
                      </View>
                    </View>

                    {/* Status Selector */}
                    <Text style={styles.sectionTitle}>Status</Text>
                    <View style={styles.statusSelector}>
                      {(['saved', 'booked', 'completed'] as const).map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusOption,
                            selectedPhoto.status === status && styles.statusOptionActive,
                            { borderColor: STATUS_LABELS[status].color },
                          ]}
                          onPress={() => handleStatusChange(selectedPhoto.photoId, status)}
                        >
                          <Text
                            style={[
                              styles.statusOptionText,
                              selectedPhoto.status === status && {
                                color: STATUS_LABELS[status].color,
                                fontWeight: '700',
                              },
                            ]}
                          >
                            {STATUS_LABELS[status].label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Notes */}
                    <View style={styles.notesSection}>
                      <View style={styles.notesHeader}>
                        <StickyNote size={16} color={COLORS.textSecondary} />
                        <Text style={styles.sectionTitle}>Your Notes</Text>
                        <TouchableOpacity
                          style={styles.editNotesBtn}
                          onPress={() => {
                            setEditingNotes(selectedPhoto.notes || '');
                            setNotesModalVisible(true);
                          }}
                        >
                          <Text style={styles.editNotesText}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                      {selectedPhoto.notes ? (
                        <Text style={styles.notesText}>{selectedPhoto.notes}</Text>
                      ) : (
                        <Text style={styles.notesEmpty}>No notes yet. Tap Edit to add.</Text>
                      )}
                    </View>

                    {/* Shared info */}
                    {selectedPhoto.sharedWithStylistId && (
                      <View style={styles.sharedBadge}>
                        <Share2 size={14} color={COLORS.teal} />
                        <Text style={styles.sharedText}>
                          Shared with stylist on{' '}
                          {selectedPhoto.sharedAt
                            ? new Date(selectedPhoto.sharedAt).toLocaleDateString()
                            : 'recently'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Modal Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnSecondary]}
                    onPress={() => handleUnsave(selectedPhoto.photoId)}
                  >
                    <Bookmark size={16} color={COLORS.textSecondary} />
                    <Text style={styles.modalBtnSecondaryText}>Remove</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnSecondary]}
                    onPress={() => setShareModalVisible(true)}
                  >
                    <Share2 size={16} color={COLORS.textSecondary} />
                    <Text style={styles.modalBtnSecondaryText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnPrimary]}
                    onPress={() => {
                      navigation.navigate('Gallery');
                      setSelectedPhoto(null);
                    }}
                  >
                    <Text style={styles.modalBtnPrimaryText}>View in Gallery</Text>
                    <ChevronRight size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Notes Edit Modal */}
      <Modal
        visible={notesModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notesModalContent}>
            <Text style={styles.notesModalTitle}>Edit Notes</Text>
            <TextInput
              style={styles.notesModalInput}
              placeholder="Add your notes about this transformation..."
              placeholderTextColor={COLORS.textMuted}
              value={editingNotes}
              onChangeText={setEditingNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.notesModalCharCount}>
              {editingNotes.length}/500
            </Text>
            <View style={styles.notesModalActions}>
              <TouchableOpacity
                style={styles.notesModalBtnSecondary}
                onPress={() => setNotesModalVisible(false)}
              >
                <Text style={styles.notesModalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.notesModalBtnPrimary}
                onPress={handleSaveNotes}
              >
                <Text style={styles.notesModalBtnPrimaryText}>Save Notes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Modal */}
      <Modal
        visible={shareModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notesModalContent}>
            <Text style={styles.notesModalTitle}>Share with Stylist</Text>
            <Text style={styles.shareModalSubtitle}>
              Enter your stylist's ID to share this transformation
            </Text>
            <TextInput
              style={styles.notesModalInput}
              placeholder="Stylist ID..."
              placeholderTextColor={COLORS.textMuted}
              value={shareStylistId}
              onChangeText={setShareStylistId}
              autoCapitalize="none"
            />
            <View style={styles.notesModalActions}>
              <TouchableOpacity
                style={styles.notesModalBtnSecondary}
                onPress={() => {
                  setShareModalVisible(false);
                  setShareStylistId('');
                }}
              >
                <Text style={styles.notesModalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.notesModalBtnPrimary}
                onPress={handleShare}
              >
                <Send size={16} color="#FFF" />
                <Text style={styles.notesModalBtnPrimaryText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Filters
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
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
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFF',
  },

  // List
  listContainer: {
    padding: 12,
    gap: 10,
  },
  columnWrapper: {
    gap: 10,
    marginBottom: 10,
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
    marginBottom: 20,
  },
  emptyActionBtn: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyActionText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Card
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  beforeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  beforeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardInfo: {
    padding: 12,
  },
  cardCaption: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  cardMetaRow: {
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagChipText: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  unsaveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(147,51,234,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
  modalScroll: {
    maxHeight: '75%',
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
  modalCaption: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    minWidth: 80,
  },
  metaLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shadesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  shadeChip: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  shadeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Status selector
  statusSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
  },
  statusOptionActive: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  statusOptionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Notes section
  notesSection: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    gap: 8,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editNotesBtn: {
    marginLeft: 'auto',
  },
  editNotesText: {
    fontSize: 12,
    color: COLORS.purple,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  notesEmpty: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },

  // Shared badge
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(20,184,166,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sharedText: {
    fontSize: 12,
    color: COLORS.teal,
    fontWeight: '500',
  },

  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalBtnSecondary: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modalBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalBtnPrimary: {
    flex: 2,
    backgroundColor: COLORS.purple,
    gap: 4,
  },
  modalBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },

  // Notes/Share Modal
  notesModalContent: {
    backgroundColor: COLORS.bg,
    borderRadius: 24,
    margin: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  notesModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  shareModalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  notesModalInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 14,
    minHeight: 80,
    maxHeight: 150,
  },
  notesModalCharCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  notesModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  notesModalBtnSecondary: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 14,
    alignItems: 'center',
  },
  notesModalBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  notesModalBtnPrimary: {
    flex: 1,
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  notesModalBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});