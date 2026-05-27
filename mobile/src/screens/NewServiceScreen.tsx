import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, User, Phone, Mail, X, ChevronRight, Calendar, Clock, FlaskConical } from 'lucide-react-native';
import { getClients, createClient, getClientLastConsultation, type Client, type LastConsultationData } from '../api/client';
import FormulaPicker from '../components/FormulaPicker';

// ─── Theme ───────────────────────────────────────────────────────────────────

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

// ─── Add Client Modal ──────────────────────────────────────────────────────

function AddClientModal({ visible, onClose, onAdded }: {
  visible: boolean;
  onClose: () => void;
  onAdded: (client: Client) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a client name');
      return;
    }
    setSaving(true);
    try {
      const result = await createClient({ name: name.trim(), email: email.trim(), phone: phone.trim() });
      onAdded(result.client);
      setName('');
      setEmail('');
      setPhone('');
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create client');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={modalStyles.container} edges={['top']}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#A1A1AA" />
          </TouchableOpacity>
          <Text style={modalStyles.title}>New Client</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={[modalStyles.save, saving && { opacity: 0.5 }]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={modalStyles.form}>
          <View style={modalStyles.field}>
            <User size={18} color="#71717A" />
            <TextInput
              style={modalStyles.input}
              placeholder="Full name"
              placeholderTextColor="#71717A"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={modalStyles.field}>
            <Mail size={18} color="#71717A" />
            <TextInput
              style={modalStyles.input}
              placeholder="Email (optional)"
              placeholderTextColor="#71717A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={modalStyles.field}>
            <Phone size={18} color="#71717A" />
            <TextInput
              style={modalStyles.input}
              placeholder="Phone (optional)"
              placeholderTextColor="#71717A"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#161620',
  },
  title: { fontSize: 17, fontWeight: '700', color: '#F5F5F7' },
  save: { fontSize: 16, fontWeight: '700', color: '#9333EA' },
  form: { padding: 16, gap: 12 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161620',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 10,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#F5F5F7' },
});

// ─── Last Consultation Preview ───────────────────────────────────────────────

function ConsultationPreview({ consultation }: { consultation: LastConsultationData }) {
  return (
    <View style={previewStyles.container}>
      <View style={previewStyles.header}>
        <Clock size={14} color={COLORS.purple} />
        <Text style={previewStyles.headerText}>Last Consultation Data</Text>
      </View>
      <View style={previewStyles.row}>
        <Text style={previewStyles.label}>Texture</Text>
        <Text style={previewStyles.value}>{consultation.texture}</Text>
      </View>
      <View style={previewStyles.row}>
        <Text style={previewStyles.label}>Current Level</Text>
        <Text style={previewStyles.value}>Level {consultation.currentLevel}</Text>
      </View>
      <View style={previewStyles.row}>
        <Text style={previewStyles.label}>Last Service</Text>
        <Text style={previewStyles.value}>{consultation.lastServiceType || 'N/A'}</Text>
      </View>
      <View style={previewStyles.row}>
        <Text style={previewStyles.label}>Condition</Text>
        <Text style={previewStyles.value}>{consultation.conditionType}</Text>
      </View>
    </View>
  );
}

const previewStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(147,51,234,0.08)',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.purple,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: { fontSize: 12, color: COLORS.textSecondary },
  value: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
});

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function NewServiceScreen({ navigation }: any) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [consultation, setConsultation] = useState<LastConsultationData | null>(null);
  const [loadingConsultation, setLoadingConsultation] = useState(false);
  const [showFormulaPicker, setShowFormulaPicker] = useState(false);

  const loadClients = useCallback(async () => {
    try {
      const result = await getClients(search || undefined);
      setClients(result.clients || []);
    } catch (e: any) {
      console.warn('[NewServiceScreen] loadClients failed:', e?.message);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(loadClients, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  const handleClientAdded = (client: Client) => {
    setClients(prev => [client, ...prev]);
  };

  const handleSelectClient = async (client: Client) => {
    setSelectedClient(client);
    setLoadingConsultation(true);
    try {
      const result = await getClientLastConsultation(client.id);
      setConsultation(result.consultation);
    } catch {
      setConsultation(null);
    } finally {
      setLoadingConsultation(false);
    }
  };

  const handleStartService = () => {
    if (!selectedClient) return;

    const autoPopulateData: Record<string, any> = {};

    if (consultation) {
      // Map consultation data to FormState fields
      autoPopulateData.texture = consultation.texture;
      autoPopulateData.hairPattern = consultation.hairPattern;
      autoPopulateData.density = consultation.density;
      autoPopulateData.currentLevel = consultation.currentLevel;
      autoPopulateData.currentTone = consultation.currentTone;
      autoPopulateData.lastServiceType = consultation.lastServiceType;
      autoPopulateData.chemicalHistory = consultation.chemicalHistory;
      autoPopulateData.sensitivities = consultation.sensitivities;
      autoPopulateData.lastChemicalService = consultation.lastChemicalService;
      autoPopulateData.targetLevel = consultation.targetLevel;
      autoPopulateData.targetTone = consultation.targetTone;
      autoPopulateData.conditionType = consultation.conditionType;
      autoPopulateData.porosity = consultation.porosity;
      autoPopulateData.grayPercent = consultation.grayPercent;
      autoPopulateData.problemIndicators = consultation.problemIndicators;
    }

    navigation.navigate('Formulate', {
      autoPopulateData,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
    });
  };

  const renderClient = ({ item }: { item: Client }) => {
    const isSelected = selectedClient?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.clientCard, isSelected && styles.clientCardSelected]}
        onPress={() => handleSelectClient(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(item.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.name}</Text>
          <Text style={styles.clientMeta}>
            {item.email || item.phone || 'No contact info'}
          </Text>
          {item.lastVisit && (
            <View style={styles.visitRow}>
              <Calendar size={12} color="#A1A1AA" />
              <Text style={styles.visitText}>
                Last visit: {new Date(item.lastVisit).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>New Service</Text>
          <Text style={styles.headerSubtitle}>Select a client to start</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Plus size={20} color="#FFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Search size={18} color="#71717A" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clients..."
          placeholderTextColor="#71717A"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Selected Client Info + Consultation Preview */}
      {selectedClient && (
        <View style={styles.selectedSection}>
          <Text style={styles.selectedLabel}>Selected Client</Text>
          <View style={styles.selectedClientCard}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {(selectedClient.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </Text>
            </View>
            <View style={styles.selectedClientInfo}>
              <Text style={styles.selectedClientName}>{selectedClient.name}</Text>
              <Text style={styles.selectedClientMeta}>{selectedClient.email || selectedClient.phone || ''}</Text>
            </View>
          </View>

          {loadingConsultation ? (
            <ActivityIndicator size="small" color={COLORS.purple} style={{ marginTop: 12 }} />
          ) : consultation ? (
            <ConsultationPreview consultation={consultation} />
          ) : (
            <View style={styles.noConsultation}>
              <Text style={styles.noConsultationText}>No previous consultation found</Text>
              <Text style={styles.noConsultationSubtext}>Starting with fresh data</Text>
            </View>
          )}

          {/* Start Service Button */}
          <TouchableOpacity style={styles.startBtn} onPress={handleStartService}>
            <Text style={styles.startBtnText}>Start Color Service</Text>
            <ChevronRight size={18} color="#FFF" />
          </TouchableOpacity>

          {/* Select Formula Button */}
          <TouchableOpacity
            style={styles.selectFormulaBtn}
            onPress={() => setShowFormulaPicker(true)}
            activeOpacity={0.8}
          >
            <FlaskConical size={18} color={COLORS.purple} />
            <Text style={styles.selectFormulaText}>Select Saved Formula</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Client List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : clients.length === 0 ? (
        <View style={styles.center}>
          <User size={48} color="#9333EA" />
          <Text style={styles.emptyTitle}>
            {search ? 'No results' : 'No clients yet'}
          </Text>
          <Text style={styles.emptyText}>
            {search ? 'Try a different search' : 'Add your first client to get started'}
          </Text>
          {!search && (
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAdd(true)}>
              <Plus size={18} color="#FFF" />
              <Text style={styles.emptyBtnText}>Add Client</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={clients}
          renderItem={renderClient}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <AddClientModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={handleClientAdded}
      />

      {/* Formula Picker Modal */}
      <Modal
        visible={showFormulaPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFormulaPicker(false)}
      >
        <View style={formulaPickerStyles.overlay}>
          <View style={formulaPickerStyles.content}>
            <FormulaPicker
              visible={showFormulaPicker}
              onSelect={(formula) => {
                setShowFormulaPicker(false);
                navigation.navigate('Formulate', {
                  autoPopulateData: formula,
                  clientId: selectedClient?.id,
                  clientName: selectedClient?.name,
                });
              }}
              onClose={() => setShowFormulaPicker(false)}
              onCreateNew={() => {
                setShowFormulaPicker(false);
                navigation.navigate('Formulate');
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.purple,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: COLORS.textPrimary },

  selectedSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  selectedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  selectedClientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(147,51,234,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLargeText: { fontSize: 18, fontWeight: '700', color: COLORS.purple },
  selectedClientInfo: { flex: 1 },
  selectedClientName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  selectedClientMeta: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },

  noConsultation: {
    marginTop: 12,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    alignItems: 'center',
  },
  noConsultationText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  noConsultationSubtext: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },

  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },

  list: { paddingHorizontal: 16, paddingBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },

  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  clientCardSelected: {
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(147,51,234,0.08)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(147,51,234,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: COLORS.purple },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  clientMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  visitRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  visitText: { fontSize: 11, color: COLORS.textSecondary },

  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: { fontSize: 12, fontWeight: '700', color: '#FFF' },

  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginTop: 12 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 6 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.purple,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  selectFormulaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.purple,
    paddingVertical: 14,
    marginTop: 10,
  },
  selectFormulaText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.purple,
  },
});

const formulaPickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 16,
    flex: 1,
  },
});
