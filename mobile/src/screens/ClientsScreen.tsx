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
import { Search, Plus, User, Phone, Mail, X, ChevronRight, Calendar } from 'lucide-react-native';
import { getClients, createClient, Client } from '../api/client';

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

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const loadClients = useCallback(async () => {
    try {
      const result = await getClients(search || undefined);
      setClients(result.clients || []);
    } catch {}
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

  const renderClient = ({ item }: { item: Client }) => (
    <TouchableOpacity style={styles.clientCard} onPress={() => alert(`Client ${item.name} detail - coming in next update!`)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
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
      <ChevronRight size={20} color="#71717A" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
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
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
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
            {search ? 'Try a different search' : 'Add your first client to track formulations and history'}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#F5F5F7' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#9333EA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161620',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#F5F5F7' },

  list: { paddingHorizontal: 16, paddingBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },

  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161620',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
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
  avatarText: { fontSize: 15, fontWeight: '700', color: '#9333EA' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 15, fontWeight: '600', color: '#F5F5F7' },
  clientMeta: { fontSize: 12, color: '#A1A1AA', marginTop: 2 },
  visitRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  visitText: { fontSize: 11, color: '#A1A1AA' },

  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#F5F5F7', marginTop: 12 },
  emptyText: { fontSize: 14, color: '#A1A1AA', textAlign: 'center', marginTop: 6 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#9333EA',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
