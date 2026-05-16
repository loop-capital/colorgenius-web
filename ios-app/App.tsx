import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';
import FormulateScreen from './src/screens/FormulateScreen';
import type { FormulaComponent } from './src/types';

const COLORS = {
  background: '#0F0F0F',
  surface: '#171717',
  surfaceElevated: '#1A1A1A',
  primary: '#14B8A6',
  primaryDark: '#0D9488',
  text: '#F5F5F7',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  border: 'rgba(255,255,255,0.1)',
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
};

const WEIGHT_SCALE_SERVICE = '0000181d-0000-1000-8000-00805f9b34fb';
const WEIGHT_MEASUREMENT_CHAR = '00002a9d-0000-1000-8000-00805f9b34fb';

interface ScaleReading {
  weight: number;
  unit: 'kg' | 'g';
  timestamp: number;
  stable: boolean;
}

type Tab = 'scale' | 'formulate';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('scale');
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [scaleReading, setScaleReading] = useState<ScaleReading | null>(null);
  const [tareWeight, setTareWeight] = useState(0);
  const [isTared, setIsTared] = useState(false);
  const [formulaComponents, setFormulaComponents] = useState<FormulaComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<number | null>(null);
  const [bleError, setBleError] = useState<string | null>(null);
  const [bluetoothAvailable, setBluetoothAvailable] = useState(true);
  const bleManagerRef = useRef<BleManager | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let manager: BleManager;
    try {
      manager = new BleManager();
      bleManagerRef.current = manager;
    } catch (e) {
      console.warn('BLE not available:', e);
      setBluetoothAvailable(false);
      return;
    }

    const subscription = manager.onStateChange((state) => {
      if (state === State.PoweredOn) {
        setBleError(null);
      } else {
        setBleError('Enable Bluetooth to connect to your scale.');
      }
    }, true);

    return () => {
      subscription.remove();
      manager.destroy();
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, []);

  const scanForScale = async () => {
    if (!bleManagerRef.current) return;
    setBleError(null);
    setIsScanning(true);
    let found = false;

    bleManagerRef.current.startDeviceScan(null, null, (scanError, device) => {
      if (scanError) {
        setBleError(scanError.message ?? 'Scan failed');
        setIsScanning(false);
        return;
      }
      if (device?.name?.toLowerCase().includes('scale') && !found) {
        found = true;
        bleManagerRef.current?.stopDeviceScan();
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
        connectToScale(device);
      }
    });

    scanTimeoutRef.current = setTimeout(() => {
      bleManagerRef.current?.stopDeviceScan();
      setIsScanning(false);
      if (!found) {
        Alert.alert('No Scale Found', 'Make sure your Bluetooth scale is powered on and nearby.');
      }
    }, 10000);
  };

  const connectToScale = async (device: Device) => {
    try {
      setIsScanning(false);
      const connected = await device.connect();
      const deviceWithServices = await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(deviceWithServices);

      deviceWithServices.monitorCharacteristicForService(
        WEIGHT_SCALE_SERVICE,
        WEIGHT_MEASUREMENT_CHAR,
        (monitorError, characteristic) => {
          if (monitorError) {
            console.error('Monitor error:', monitorError);
            return;
          }
          if (characteristic?.value) {
            const binaryString = atob(characteristic.value);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const flags = bytes[0];
            const isKg = (flags & 0x01) === 0;
            const view = new DataView(bytes.buffer);
            const weight = view.getFloat32(1, true);
            setScaleReading({
              weight: isKg ? weight * 1000 : weight,
              unit: 'g',
              timestamp: Date.now(),
              stable: true,
            });
          }
        }
      );

      Alert.alert('Connected', `Connected to ${device.name ?? 'scale'}`);
    } catch {
      Alert.alert('Connection Failed', 'Could not connect to scale. Please try again.');
    }
  };

  const disconnectScale = async () => {
    if (connectedDevice) {
      try {
        await connectedDevice.cancelConnection();
      } catch {
        // already disconnected — treat as success
      }
      setConnectedDevice(null);
      setScaleReading(null);
      setIsTared(false);
    }
  };

  const handleTare = () => {
    if (scaleReading) {
      setTareWeight(scaleReading.weight);
      setIsTared(true);
    }
  };

  const getDisplayWeight = () => {
    if (!scaleReading) return '0.0';
    const net = isTared ? scaleReading.weight - tareWeight : scaleReading.weight;
    return Math.max(0, net).toFixed(1);
  };

  const handleAddToScale = (components: FormulaComponent[]) => {
    setFormulaComponents(components);
    setSelectedComponent(0);
    setActiveTab('scale');
  };

  const recordWeight = () => {
    if (selectedComponent === null) return;
    const weight = parseFloat(getDisplayWeight());
    setFormulaComponents(prev =>
      prev.map((c, i) => (i === selectedComponent ? { ...c, actualGrams: weight } : c))
    );
    const next = formulaComponents.findIndex((c, i) => i > selectedComponent && c.actualGrams === 0);
    setSelectedComponent(next >= 0 ? next : null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {activeTab === 'formulate' ? (
        <FormulateScreen onAddToScale={handleAddToScale} />
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>ColorGenius</Text>
            <Text style={styles.headerSubtitle}>Scale Integration</Text>
          </View>

          {!bluetoothAvailable && (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>Bluetooth is not available on this device.</Text>
            </View>
          )}
          {bleError && !isScanning && (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>{bleError}</Text>
            </View>
          )}

          <ScrollView style={styles.content}>
            {/* Scale Connection Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Bluetooth Scale</Text>

              {connectedDevice ? (
                <View style={styles.connectedSection}>
                  <View style={styles.connectionStatus}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>
                      Connected to {connectedDevice.name ?? 'Scale'}
                    </Text>
                  </View>

                  <View style={styles.weightDisplay}>
                    <Text style={styles.weightValue}>{getDisplayWeight()}</Text>
                    <Text style={styles.weightUnit}>g</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.button, isTared && styles.buttonActive]}
                    onPress={handleTare}
                  >
                    <Text style={styles.buttonText}>{isTared ? 'Tared' : 'Tare Scale'}</Text>
                  </TouchableOpacity>

                  {selectedComponent !== null && formulaComponents[selectedComponent] && (
                    <TouchableOpacity style={[styles.button, styles.buttonRecord]} onPress={recordWeight}>
                      <Text style={styles.buttonText}>
                        Record — {formulaComponents[selectedComponent].shadeName}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={disconnectScale}>
                    <Text style={styles.buttonTextSecondary}>Disconnect</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.disconnectedSection}>
                  <Text style={styles.statusTextMuted}>No scale connected</Text>
                  <TouchableOpacity
                    style={[styles.button, (isScanning || !bluetoothAvailable) && styles.buttonDisabled]}
                    onPress={scanForScale}
                    disabled={isScanning || !bluetoothAvailable}
                  >
                    {isScanning ? (
                      <ActivityIndicator color={COLORS.text} />
                    ) : (
                      <Text style={styles.buttonText}>Scan for Scale</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Formula Components */}
            {formulaComponents.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Formula Components</Text>
                {formulaComponents.map((component, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.componentRow,
                      selectedComponent === index && styles.componentRowSelected,
                    ]}
                    onPress={() => setSelectedComponent(index)}
                  >
                    <View style={[styles.componentSwatch, { backgroundColor: component.hex }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.componentName}>{component.shadeName}</Text>
                      <Text style={styles.componentCode}>{component.shadeCode}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[
                        styles.componentWeight,
                        component.actualGrams > 0 && styles.componentWeightDone,
                      ]}>
                        {component.actualGrams > 0 ? `${component.actualGrams.toFixed(1)}g` : '—'}
                      </Text>
                      <Text style={styles.componentTarget}>of {component.targetGrams}g</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Instructions */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>How to Use</Text>
              <Text style={styles.instructionText}>1. Tap "Formulate" to build a hair color formula</Text>
              <Text style={styles.instructionText}>2. Tap "Add to Scale" to load it here</Text>
              <Text style={styles.instructionText}>3. Turn on your Bluetooth scale and tap "Scan"</Text>
              <Text style={styles.instructionText}>4. Place empty bowl on scale, tap "Tare Scale"</Text>
              <Text style={styles.instructionText}>5. Tap a component, add color, then tap "Record"</Text>
            </View>
          </ScrollView>
        </>
      )}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'scale' && styles.tabItemActive]}
          onPress={() => setActiveTab('scale')}
        >
          <Text style={[styles.tabLabel, activeTab === 'scale' && styles.tabLabelActive]}>Scale</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'formulate' && styles.tabItemActive]}
          onPress={() => setActiveTab('formulate')}
        >
          <Text style={[styles.tabLabel, activeTab === 'formulate' && styles.tabLabelActive]}>Formulate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  banner: {
    backgroundColor: COLORS.danger + '20',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.danger + '40',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  bannerText: {
    color: COLORS.danger,
    fontSize: 13,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  connectedSection: {
    alignItems: 'center',
  },
  disconnectedSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  statusText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  statusTextMuted: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginBottom: 16,
  },
  weightDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 24,
  },
  weightValue: {
    fontSize: 72,
    fontWeight: '200',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  weightUnit: {
    fontSize: 24,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  buttonRecord: {
    backgroundColor: COLORS.primaryDark,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonActive: {
    backgroundColor: COLORS.success,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  componentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderRadius: 8,
  },
  componentRowSelected: {
    backgroundColor: COLORS.primary + '18',
  },
  componentSwatch: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginRight: 12,
  },
  componentName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  componentCode: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  componentWeight: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  componentWeightDone: {
    color: COLORS.success,
  },
  componentTarget: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  instructionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 60,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  tabLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
