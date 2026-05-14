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

// ColorGenius Dark Theme
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

// BLE Service UUIDs (Standard Weight Scale Service)
const WEIGHT_SCALE_SERVICE = '0000181d-0000-1000-8000-00805f9b34fb';
const WEIGHT_MEASUREMENT_CHAR = '00002a9d-0000-1000-8000-00805f9b34fb';

interface ScaleReading {
  weight: number;
  unit: 'kg' | 'g';
  timestamp: number;
  stable: boolean;
}

export default function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [scaleReading, setScaleReading] = useState<ScaleReading | null>(null);
  const [tareWeight, setTareWeight] = useState(0);
  const [isTared, setIsTared] = useState(false);
  const [formulaComponents, setFormulaComponents] = useState<Array<{name: string; targetGrams: number; actualGrams: number}>>([]);
  const [error, setError] = useState<string | null>(null);
  const [bluetoothAvailable, setBluetoothAvailable] = useState(true);
  const bleManagerRef = useRef<BleManager | null>(null);

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

    // Monitor Bluetooth state
    const subscription = manager.onStateChange((state) => {
      if (state === State.PoweredOn) {
        console.log('Bluetooth is on');
      } else {
        console.log('Bluetooth state:', state);
        Alert.alert('Bluetooth Required', 'Please enable Bluetooth to connect to scale');
      }
    }, true);

    return () => {
      subscription.remove();
      manager.destroy();
    };
  }, []);

  const scanForScale = async () => {
    if (!bleManagerRef.current) return;

    setIsScanning(true);
    const devices: Device[] = [];

    bleManagerRef.current.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        setIsScanning(false);
        return;
      }

      if (device && device.name?.toLowerCase().includes('scale')) {
        devices.push(device);
        bleManagerRef.current?.stopDeviceScan();
        connectToScale(device);
      }
    });

    // Stop scan after 10 seconds
    setTimeout(() => {
      bleManagerRef.current?.stopDeviceScan();
      setIsScanning(false);
      if (devices.length === 0) {
        Alert.alert('No Scale Found', 'Make sure your Bluetooth scale is powered on and nearby');
      }
    }, 10000);
  };

  const connectToScale = async (device: Device) => {
    try {
      setIsScanning(false);
      const connected = await device.connect();
      const deviceWithServices = await connected.discoverAllServicesAndCharacteristics();
      
      setConnectedDevice(deviceWithServices);
      
      // Monitor weight measurements
      deviceWithServices.monitorCharacteristicForService(
        WEIGHT_SCALE_SERVICE,
        WEIGHT_MEASUREMENT_CHAR,
        (error, characteristic) => {
          if (error) {
            console.error('Monitor error:', error);
            return;
          }
          
          if (characteristic?.value) {
            // Decode base64 without Node.js Buffer (React Native safe)
            const binaryString = atob(characteristic.value);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const flags = bytes[0];
            const isKg = (flags & 0x01) === 0;
            // Read float LE from bytes 1-4
            const view = new DataView(bytes.buffer);
            const weight = view.getFloat32(1, true); // true = little-endian
            
            const reading: ScaleReading = {
              weight: isKg ? weight * 1000 : weight, // Convert to grams
              unit: 'g',
              timestamp: Date.now(),
              stable: true, // Would need to detect stability from multiple readings
            };
            
            setScaleReading(reading);
          }
        }
      );

      Alert.alert('Connected', `Connected to ${device.name || 'scale'}`);
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Connection Failed', 'Could not connect to scale');
    }
  };

  const disconnectScale = async () => {
    if (connectedDevice) {
      await connectedDevice.cancelConnection();
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
    const netWeight = isTared ? scaleReading.weight - tareWeight : scaleReading.weight;
    return Math.max(0, netWeight).toFixed(1);
  };

  const addFormulaComponent = () => {
    // This would integrate with ColorGenius formulation API
    const newComponent = {
      name: 'Color Tube',
      targetGrams: 30,
      actualGrams: parseFloat(getDisplayWeight()) || 0,
    };
    setFormulaComponents([...formulaComponents, newComponent]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ColorGenius</Text>
        <Text style={styles.headerSubtitle}>Scale Integration</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Scale Connection Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bluetooth Scale</Text>
          
          {connectedDevice ? (
            <View style={styles.connectedSection}>
              <View style={styles.connectionStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  Connected to {connectedDevice.name || 'Scale'}
                </Text>
              </View>
              
              {/* Weight Display */}
              <View style={styles.weightDisplay}>
                <Text style={styles.weightValue}>{getDisplayWeight()}</Text>
                <Text style={styles.weightUnit}>g</Text>
              </View>
              
              {/* Tare Button */}
              <TouchableOpacity 
                style={[styles.button, isTared && styles.buttonActive]}
                onPress={handleTare}
              >
                <Text style={styles.buttonText}>
                  {isTared ? 'Tared ✓' : 'Tare Scale'}
                </Text>
              </TouchableOpacity>
              
              {/* Disconnect */}
              <TouchableOpacity 
                style={[styles.button, styles.buttonSecondary]}
                onPress={disconnectScale}
              >
                <Text style={styles.buttonTextSecondary}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.disconnectedSection}>
              <Text style={styles.statusTextMuted}>No scale connected</Text>
              <TouchableOpacity 
                style={[styles.button, isScanning && styles.buttonDisabled]}
                onPress={scanForScale}
                disabled={isScanning}
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
              <View key={index} style={styles.componentRow}>
                <Text style={styles.componentName}>{component.name}</Text>
                <Text style={styles.componentWeight}>
                  {component.actualGrams.toFixed(1)}g / {component.targetGrams}g
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Add Component Button */}
        {connectedDevice && (
          <TouchableOpacity 
            style={[styles.button, styles.buttonPrimary]}
            onPress={addFormulaComponent}
          >
            <Text style={styles.buttonText}>Add to Formula</Text>
          </TouchableOpacity>
        )}

        {/* Instructions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to Use</Text>
          <Text style={styles.instructionText}>1. Turn on your Bluetooth scale</Text>
          <Text style={styles.instructionText}>2. Tap "Scan for Scale"</Text>
          <Text style={styles.instructionText}>3. Place empty bowl on scale</Text>
          <Text style={styles.instructionText}>4. Tap "Tare" to zero</Text>
          <Text style={styles.instructionText}>5. Add color and watch weight</Text>
        </View>
      </ScrollView>
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
    paddingTop: 60,
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
  buttonPrimary: {
    backgroundColor: COLORS.primary,
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
    opacity: 0.6,
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
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  componentName: {
    color: COLORS.text,
    fontSize: 16,
  },
  componentWeight: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  instructionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
});
