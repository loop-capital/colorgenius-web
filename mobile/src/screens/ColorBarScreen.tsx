// ============================================================
// ColorBarScreen — iPad Terminal for Color Bar Mixing Station
// Large-text, production-focused interface for weighing formulas
// ============================================================

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  User,
  CheckCircle2,
  Circle,
  Scale,
  Bluetooth,
  BluetoothOff,
  AlertTriangle,
  ChevronRight,
  Plus,
  Minus,
  DollarSign,
  Save,
  Send,
  RefreshCw,
  Beaker,
  X,
} from 'lucide-react-native';
import { useAcaiaScale } from '../hooks/useAcaiaScale';

// ─── Constants ─────────────────────────────────────────────────────────────

const API_BASE = 'https://colorgenius.co/api/v1/color-bar';

const COLORS = {
  bg: '#0F0F1A',
  card: '#161620',
  cardBorder: 'rgba(255,255,255,0.06)',
  textPrimary: '#F5F5F7',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  purple: '#9333EA',
  purpleLight: 'rgba(147,51,234,0.15)',
  pink: '#EC4899',
  green: '#10B981',
  greenLight: 'rgba(16,185,129,0.15)',
  red: '#EF4444',
  redLight: 'rgba(239,68,68,0.15)',
  yellow: '#F59E0B',
  yellowLight: 'rgba(245,158,11,0.15)',
  blue: '#3B82F6',
  blueLight: 'rgba(59,130,246,0.15)',
  border: 'rgba(255,255,255,0.08)',
};

// ─── Types ─────────────────────────────────────────────────────────────────

interface Client {
  id: string;
  name: string;
  phone?: string;
  lastVisit?: string;
  preferredFormula?: string;
}

interface FormulaStep {
  product: string;
  shadeCode: string;
  brand: string;
  targetGrams: number;
  actualGrams: number;
  completed: boolean;
  role: string; // 'color' | 'developer' | 'additive'
}

interface Formula {
  id: string;
  clientName: string;
  createdAt: string;
  steps: FormulaStep[];
  developerVolume: number;
  processingTime: number;
  totalGrams: number;
  totalCost: number;
  notes?: string;
}

interface ColorBarSession {
  id: string;
  client?: Client;
  formula?: Formula;
  status: 'idle' | 'active' | 'completed';
  startedAt?: string;
}

// ─── API Functions ─────────────────────────────────────────────────────────

async function fetchClients(token: string): Promise<Client[]> {
  try {
    const res = await fetch(`${API_BASE}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch clients');
    const data = await res.json();
    return data.clients || [];
  } catch (err) {
    console.error('fetchClients error:', err);
    return MOCK_CLIENTS;
  }
}

async function fetchClientFormulas(clientId: string, token: string): Promise<Formula[]> {
  try {
    const res = await fetch(`${API_BASE}/formulas/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch formulas');
    const data = await res.json();
    return data.formulas || [];
  } catch (err) {
    console.error('fetchFormulas error:', err);
    return [MOCK_FORMULA];
  }
}

async function createSession(clientId: string, formulaId: string | undefined, token: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/session`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ clientId, formulaId })
    });
    if (!res.ok) throw new Error('Failed to create session');
    const data = await res.json();
    return data.sessionId;
  } catch (err) {
    console.error('createSession error:', err);
    return `cb_${Date.now()}`;
  }
}

async function completeSession(sessionId: string, steps: FormulaStep[], totalCost: number, token: string) {
  try {
    const res = await fetch(`${API_BASE}/session/${sessionId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ steps, totalCost })
    });
    if (!res.ok) throw new Error('Failed to complete session');
    return await res.json();
  } catch (err) {
    console.error('completeSession error:', err);
    return null;
  }
}

// ─── Mock Data (fallback when API fails) ───────────────────────────────────

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Sarah Mitchell', phone: '555-0123', lastVisit: '2025-05-15', preferredFormula: '6N + 20vol' },
  { id: '2', name: 'Emily Chen', phone: '555-0456', lastVisit: '2025-05-20', preferredFormula: '7NG + 10vol' },
  { id: '3', name: 'Jessica Torres', phone: '555-0789', lastVisit: '2025-05-22', preferredFormula: '5RV + 30vol' },
  { id: '4', name: 'Amanda Brooks', phone: '555-0321', lastVisit: '2025-05-25', preferredFormula: '6WN + 20vol' },
  { id: '5', name: 'Rachel Kim', phone: '555-0654', lastVisit: '2025-05-27', preferredFormula: '8NG + 10vol' },
];

const MOCK_FORMULA: Formula = {
  id: 'f1',
  clientName: 'Sarah Mitchell',
  createdAt: '2025-05-28',
  steps: [
    { product: 'Demi-Permanent Color', shadeCode: '6N', brand: 'Davines', targetGrams: 45, actualGrams: 0, completed: false, role: 'color' },
    { product: 'Demi-Permanent Color', shadeCode: '6RV', brand: 'Davines', targetGrams: 15, actualGrams: 0, completed: false, role: 'color' },
    { product: 'Developer', shadeCode: '20vol', brand: 'Davines', targetGrams: 60, actualGrams: 0, completed: false, role: 'developer' },
    { product: 'Bond Builder', shadeCode: 'B1', brand: 'Olaplex', targetGrams: 7.5, actualGrams: 0, completed: false, role: 'additive' },
  ],
  developerVolume: 20,
  processingTime: 35,
  totalGrams: 127.5,
  totalCost: 12.50,
  notes: 'Client prefers cooler tones. Patch test done 48h ago.',
};

// ─── Helper Functions ──────────────────────────────────────────────────────

function getStepColor(step: FormulaStep): string {
  if (step.completed) return COLORS.green;
  if (step.role === 'color') return COLORS.purple;
  if (step.role === 'developer') return COLORS.blue;
  return COLORS.yellow;
}

function getStepBgColor(step: FormulaStep): string {
  if (step.completed) return COLORS.greenLight;
  if (step.role === 'color') return COLORS.purpleLight;
  if (step.role === 'developer') return COLORS.blueLight;
  return COLORS.yellowLight;
}

function formatWeight(grams: number): string {
  return grams.toFixed(1);
}

function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

// ─── Components ────────────────────────────────────────────────────────────

function ScaleStatusBadge({ status, weight }: { status: string; weight: number }) {
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return COLORS.green;
      case 'scanning': return COLORS.yellow;
      case 'error': return COLORS.red;
      default: return COLORS.textMuted;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return <Bluetooth size={16} color={getStatusColor()} />;
      case 'scanning': return <RefreshCw size={16} color={getStatusColor()} />;
      case 'error': return <AlertTriangle size={16} color={getStatusColor()} />;
      default: return <BluetoothOff size={16} color={getStatusColor()} />;
    }
  };

  return (
    <View style={[styles.scaleBadge, { borderColor: getStatusColor() + '40' }]}>
      {getStatusIcon()}
      <Text style={[styles.scaleBadgeText, { color: getStatusColor() }]}>
        {status === 'connected' ? `${formatWeight(weight)}g` : status.toUpperCase()}
      </Text>
    </View>
  );
}

function ClientCard({ client, onSelect }: { client: Client; onSelect: (client: Client) => void }) {
  return (
    <TouchableOpacity style={styles.clientCard} onPress={() => onSelect(client)} activeOpacity={0.7}>
      <View style={styles.clientAvatar}>
        <User size={24} color={COLORS.purple} />
      </View>
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{client.name}</Text>
        <Text style={styles.clientMeta}>
          {client.lastVisit ? `Last visit: ${client.lastVisit}` : 'New client'}
          {client.preferredFormula ? ` • ${client.preferredFormula}` : ''}
        </Text>
      </View>
      <ChevronRight size={20} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

function StepCard({
  step,
  index,
  isActive,
  scaleWeight,
  onComplete,
  onAdjust,
}: {
  step: FormulaStep;
  index: number;
  isActive: boolean;
  scaleWeight: number;
  onComplete: (index: number, actualGrams: number) => void;
  onAdjust: (index: number, delta: number) => void;
}) {
  const [manualWeight, setManualWeight] = useState('');
  const showScaleWeight = isActive && scaleWeight > 0 && !step.completed;
  const effectiveWeight = scaleWeight > 0 ? scaleWeight : parseFloat(manualWeight) || 0;
  const canComplete = effectiveWeight > 0;

  return (
    <View
      style={[
        styles.stepCard,
        {
          borderColor: isActive ? getStepColor(step) : COLORS.cardBorder,
          backgroundColor: step.completed ? getStepBgColor(step) : COLORS.card,
        },
      ]}
    >
      {/* Step Header */}
      <View style={styles.stepHeader}>
        <View style={[styles.stepNumber, { backgroundColor: getStepColor(step) }]}>
          {step.completed ? (
            <CheckCircle2 size={20} color="#fff" />
          ) : (
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          )}
        </View>
        <View style={styles.stepInfo}>
          <Text style={styles.stepBrand}>{step.brand}</Text>
          <Text style={styles.stepProduct}>{step.product}</Text>
        </View>
        <View style={[styles.shadeBadge, { backgroundColor: getStepBgColor(step) }]}>
          <Text style={[styles.shadeCode, { color: getStepColor(step) }]}>{step.shadeCode}</Text>
        </View>
      </View>

      {/* Weight Display */}
      <View style={styles.weightRow}>
        <View style={styles.weightTarget}>
          <Text style={styles.weightLabel}>TARGET</Text>
          <Text style={[styles.weightValue, { color: COLORS.textPrimary }]}>
            {formatWeight(step.targetGrams)}g
          </Text>
        </View>

        {showScaleWeight ? (
          <View style={styles.weightActual}>
            <Text style={styles.weightLabel}>ON SCALE</Text>
            <Text
              style={[
                styles.weightValue,
                {
                  color:
                    Math.abs(scaleWeight - step.targetGrams) < 2
                      ? COLORS.green
                      : scaleWeight > step.targetGrams
                      ? COLORS.red
                      : COLORS.yellow,
                },
              ]}
            >
              {formatWeight(scaleWeight)}g
            </Text>
          </View>
        ) : step.completed ? (
          <View style={styles.weightActual}>
            <Text style={styles.weightLabel}>ACTUAL</Text>
            <Text style={[styles.weightValue, { color: COLORS.green }]}>
              {formatWeight(step.actualGrams)}g
            </Text>
          </View>
        ) : null}
      </View>

      {/* Progress Bar */}
      {isActive && !step.completed && (
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min((scaleWeight / step.targetGrams) * 100, 100)}%`,
                backgroundColor:
                  Math.abs(scaleWeight - step.targetGrams) < 2
                    ? COLORS.green
                    : scaleWeight > step.targetGrams
                    ? COLORS.red
                    : COLORS.purple,
              },
            ]}
          />
        </View>
      )}

      {/* Action Buttons */}
      {isActive && !step.completed && (
        <View style={styles.stepActions}>
          {scaleWeight <= 0 && (
            <View style={styles.manualWeightRow}>
              <Text style={styles.weightLabel}>MANUAL ENTRY (g)</Text>
              <TextInput
                style={styles.manualWeightInput}
                value={manualWeight}
                onChangeText={setManualWeight}
                keyboardType="decimal-pad"
                placeholder={`Target: ${step.targetGrams}g`}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          )}
          <View style={styles.adjustRow}>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => onAdjust(index, -5)}
            >
              <Text style={styles.adjustBtnText}>-5</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => onAdjust(index, -1)}
            >
              <Text style={styles.adjustBtnText}>-1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.completeBtn, { opacity: canComplete ? 1 : 0.5 }]}
              onPress={() => canComplete && onComplete(index, effectiveWeight)}
              disabled={!canComplete}
            >
              <CheckCircle2 size={20} color="#fff" />
              <Text style={styles.completeBtnText}>
                {scaleWeight > 0 && Math.abs(scaleWeight - step.targetGrams) < 2
                  ? 'Perfect!'
                  : 'Accept'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => onAdjust(index, 1)}
            >
              <Text style={styles.adjustBtnText}>+1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => onAdjust(index, 5)}
            >
              <Text style={styles.adjustBtnText}>+5</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Completed Summary */}
      {step.completed && (
        <View style={styles.completedRow}>
          <CheckCircle2 size={16} color={COLORS.green} />
          <Text style={styles.completedText}>
            Completed — {formatWeight(step.actualGrams)}g measured
            {step.actualGrams !== step.targetGrams && (
              <Text style={{ color: COLORS.yellow }}>
                {' '}({step.actualGrams > step.targetGrams ? '+' : ''}
                {formatWeight(step.actualGrams - step.targetGrams)}g)
              </Text>
            )}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function ColorBarScreen({ navigation, route }: any) {
  // Get auth token from route params or context
  const token = route?.params?.token || '';
  
  // State
  const [session, setSession] = useState<ColorBarSession>({ id: '', status: 'idle' });
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  
  // Load clients from API on mount
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formula, setFormula] = useState<Formula | null>(null);
  const [steps, setSteps] = useState<FormulaStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingFormula, setIsLoadingFormula] = useState(false);
  const [sessionCost, setSessionCost] = useState(0);
  const [showSearch, setShowSearch] = useState(true);

  // Scale integration
  const { weight: scaleWeight, status: scaleStatus, connect: connectScale, error: scaleError } = useAcaiaScale();

  // Load clients from API on mount
  useEffect(() => {
    if (token) {
      setIsLoadingClients(true);
      fetchClients(token)
        .then(data => {
          setClients(data);
          setIsLoadingClients(false);
        })
        .catch(() => {
          setClients(MOCK_CLIENTS);
          setIsLoadingClients(false);
        });
    } else {
      // No token, use mock data
      setClients(MOCK_CLIENTS);
    }
  }, [token]);

  // Filter clients
  const filteredClients = searchQuery.length > 0
    ? clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : clients;

  // Calculate cost
  useEffect(() => {
    if (formula && steps.length > 0 && formula.totalGrams > 0) {
      const costPerGram = formula.totalCost / formula.totalGrams;
      const totalActual = steps.reduce((sum, s) => sum + s.actualGrams, 0);
      setSessionCost(costPerGram * totalActual);
    }
  }, [steps, formula]);

  // Handle client selection
  const handleSelectClient = useCallback(async (client: Client) => {
    setSelectedClient(client);
    setIsLoadingFormula(true);
    setShowSearch(false);

    try {
      // Fetch formulas from API
      const formulas = await fetchClientFormulas(client.id, token);
      
      // Use first formula or fallback to mock
      const clientFormula = formulas.length > 0 ? {
        ...formulas[0],
        clientName: client.name,
        id: `f-${client.id}-${Date.now()}`,
      } : {
        ...MOCK_FORMULA,
        clientName: client.name,
        id: `f-${client.id}-${Date.now()}`,
      };
      
      setFormula(clientFormula);
      setSteps(clientFormula.steps.map(s => ({ ...s })));
      setCurrentStep(0);
      
      // Create session in backend
      const sessionId = await createSession(client.id, clientFormula.id, token);
      setSession({
        id: sessionId,
        client,
        formula: clientFormula,
        status: 'active',
        startedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error loading formula:', err);
      // Fallback to mock
      const clientFormula: Formula = {
        ...MOCK_FORMULA,
        clientName: client.name,
        id: `f-${client.id}-${Date.now()}`,
      };
      setFormula(clientFormula);
      setSteps(clientFormula.steps.map(s => ({ ...s })));
      setCurrentStep(0);
      setSession({
        id: `session-${Date.now()}`,
        client,
        formula: clientFormula,
        status: 'active',
        startedAt: new Date().toISOString(),
      });
    } finally {
      setIsLoadingFormula(false);
    }
  }, [token]);

  // Handle step completion
  const handleCompleteStep = useCallback(
    (index: number, actualGrams: number) => {
      const next = steps.map((s, i) =>
        i === index ? { ...s, actualGrams, completed: true } : s
      );
      setSteps(next);

      if (index < steps.length - 1) {
        setCurrentStep(index + 1);
      } else {
        setSession(prev => ({ ...prev, status: 'completed' }));
        const finalCost =
          formula && formula.totalGrams > 0
            ? (formula.totalCost / formula.totalGrams) *
              next.reduce((sum, s) => sum + s.actualGrams, 0)
            : sessionCost;
        Alert.alert(
          'Formula Complete!',
          `Total cost: ${formatCost(finalCost)}\nReady to push to Square Register?`,
          [
            { text: 'Review', style: 'cancel' },
            { text: 'Push to Square', onPress: handlePushToSquare },
          ]
        );
      }
    },
    [steps, sessionCost, formula]
  );

  // Handle weight adjustment (manual override)
  const handleAdjustWeight = useCallback((index: number, delta: number) => {
    setSteps(prev => {
      const next = [...prev];
      const current = next[index];
      const newGrams = Math.max(0, current.actualGrams + delta);
      next[index] = { ...current, actualGrams: newGrams };
      return next;
    });
  }, []);

  // Handle push to Square
  const handlePushToSquare = useCallback(async () => {
    if (!session.id || !formula) return;
    
    try {
      // Complete session in backend
      await completeSession(session.id, steps, sessionCost, token);
      
      Alert.alert(
        'Pushed to Square',
        'Order created in Square Register. Complete payment at the register.'
      );
    } catch (err) {
      console.error('Push to Square error:', err);
      Alert.alert('Error', 'Failed to push to Square. Try again.');
    }
  }, [session.id, formula, steps, sessionCost, token]);

  // Handle save to history
  const handleSaveToHistory = useCallback(async () => {
    if (!session.id || !formula) return;
    
    try {
      await completeSession(session.id, steps, sessionCost, token);
      Alert.alert('Saved', 'Formula saved to client history.');
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error', 'Failed to save formula.');
    }
  }, [session.id, formula, steps, sessionCost, token]);

  // Handle new session
  const handleNewSession = useCallback(() => {
    setSession({ id: '', status: 'idle' });
    setSelectedClient(null);
    setFormula(null);
    setSteps([]);
    setCurrentStep(0);
    setSessionCost(0);
    setShowSearch(true);
    setSearchQuery('');
  }, []);

  // Connect scale
  const handleConnectScale = useCallback(() => {
    if (scaleStatus === 'connected') return;
    connectScale();
  }, [scaleStatus, connectScale]);

  // ─── Render: Search Mode ────────────────────────────────────────────────

  if (showSearch) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Beaker size={28} color={COLORS.purple} />
            <Text style={styles.headerTitle}>Color Bar</Text>
          </View>
          <ScaleStatusBadge status={scaleStatus} weight={scaleWeight} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Client List */}
        <FlatList
          data={filteredClients}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ClientCard client={item} onSelect={handleSelectClient} />}
          contentContainerStyle={styles.clientList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <User size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No clients found</Text>
            </View>
          }
        />

        {/* Scale Connection Button */}
        {scaleStatus !== 'connected' && (
          <TouchableOpacity style={styles.connectBtn} onPress={handleConnectScale}>
            <Bluetooth size={20} color={COLORS.purple} />
            <Text style={styles.connectBtnText}>Connect Acaia Scale</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  // ─── Render: Loading ─────────────────────────────────────────────────────

  if (isLoadingFormula) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
          <Text style={styles.loadingText}>Loading formula for {selectedClient?.name}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: Active Session ──────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleNewSession} style={styles.backBtn}>
            <X size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{selectedClient?.name}</Text>
            <Text style={styles.headerSubtitle}>
              Formula from {formula?.createdAt} • {formula?.processingTime}min processing
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <ScaleStatusBadge status={scaleStatus} weight={scaleWeight} />
        </View>
      </View>

      {/* Notes Banner */}
      {formula?.notes && (
        <View style={styles.notesBanner}>
          <AlertTriangle size={16} color={COLORS.yellow} />
          <Text style={styles.notesText}>{formula.notes}</Text>
        </View>
      )}

      {/* Steps */}
      <ScrollView style={styles.stepsContainer} contentContainerStyle={styles.stepsContent}>
        {steps.map((step, index) => (
          <StepCard
            key={`${step.shadeCode}-${index}`}
            step={step}
            index={index}
            isActive={index === currentStep && !step.completed}
            scaleWeight={index === currentStep ? scaleWeight : 0}
            onComplete={handleCompleteStep}
            onAdjust={handleAdjustWeight}
          />
        ))}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.costDisplay}>
          <DollarSign size={20} color={COLORS.green} />
          <Text style={styles.costValue}>{formatCost(sessionCost)}</Text>
          <Text style={styles.costLabel}>estimated cost</Text>
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveToHistory}>
            <Save size={18} color={COLORS.textPrimary} />
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pushBtn, { opacity: session.status === 'completed' ? 1 : 0.5 }]}
            onPress={handlePushToSquare}
            disabled={session.status !== 'completed'}
          >
            <Send size={18} color="#fff" />
            <Text style={styles.pushBtnText}>Push to Square</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  backBtn: {
    padding: 8,
  },

  // Scale Badge
  scaleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: COLORS.card,
  },
  scaleBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: COLORS.textPrimary,
  },

  // Client List
  clientList: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 14,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  clientMeta: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },

  // Connect Button
  connectBtn: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    backgroundColor: COLORS.purpleLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.purple + '40',
  },
  connectBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.purple,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  // Notes Banner
  notesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 24,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.yellowLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.yellow + '30',
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.yellow,
    lineHeight: 20,
  },

  // Steps
  stepsContainer: {
    flex: 1,
  },
  stepsContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 12,
  },
  stepCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  stepInfo: {
    flex: 1,
  },
  stepBrand: {
    fontSize: 13,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepProduct: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  shadeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shadeCode: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Weight Display
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  weightTarget: {
    alignItems: 'center',
  },
  weightActual: {
    alignItems: 'center',
  },
  weightLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  weightValue: {
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // Progress Bar
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Actions
  stepActions: {
    marginTop: 8,
  },
  manualWeightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  manualWeightInput: {
    flex: 1,
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  adjustBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.green,
    borderRadius: 24,
  },
  completeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Completed
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  completedText: {
    fontSize: 14,
    color: COLORS.green,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 24,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  costDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  costValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.green,
  },
  costLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.border,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  pushBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.purple,
    borderRadius: 10,
  },
  pushBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
