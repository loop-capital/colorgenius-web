/**
 * useAcaiaScale — React hook for Acaia BLE scale integration
 *
 * Provides a simple interface for components to connect to and read from
 * Acaia Pearl/Lunar scales via Bluetooth LE.
 *
 * Usage:
 *   const { weight, status, connect, disconnect, error } = useAcaiaScale();
 *
 * Features:
 *   - Auto-reconnect on unexpected disconnect
 *   - Heartbeat ping to keep scale awake
 *   - Weight stability detection
 *   - Battery level tracking
 *   - Clean cleanup on unmount
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AcaiaBLE,
  AcaiaDevice,
  ScaleState,
  ScaleWeight,
  ScaleEvent,
  getAcaiaBLE,
} from '../utils/acaiaBLE';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UseAcaiaScaleState {
  /** Current weight in grams (tare-adjusted) */
  weight: number;
  /** Weight unit (currently always 'g') */
  unit: 'g' | 'oz';
  /** Current connection status */
  status: ScaleState['status'];
  /** Battery level (0-100), undefined if not yet read */
  batteryLevel?: number;
  /** Last error message, cleared on next action */
  error?: string;
  /** Connected device info, null if not connected */
  device: AcaiaDevice | null;
  /** Whether the current weight reading is stable */
  weightStable: boolean;
  /** Whether a connection attempt is in progress */
  connecting: boolean;
}

interface UseAcaiaScaleReturn extends UseAcaiaScaleState {
  /** Scan for Acaia devices and return the list */
  scan: () => Promise<AcaiaDevice[]>;
  /** Connect to a specific device by ID (or first found if omitted) */
  connect: (deviceId?: string) => Promise<void>;
  /** Disconnect from the scale */
  disconnect: () => Promise<void>;
  /** Zero the scale */
  tare: () => Promise<void>;
  /** Request battery level from the scale */
  requestBattery: () => Promise<void>;
  /** Check if BLE is available on this device */
  checkBleAvailable: () => Promise<{ available: boolean; error?: string }>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAcaiaScale(): UseAcaiaScaleReturn {
  const [state, setState] = useState<UseAcaiaScaleState>({
    weight: 0,
    unit: 'g',
    status: 'disconnected',
    batteryLevel: undefined,
    error: undefined,
    device: null,
    weightStable: false,
    connecting: false,
  });

  const scaleRef = useRef<AcaiaBLE | null>(null);
  const autoReconnectRef = useRef(true);

  // ─── Get scale instance ──────────────────────────────────────────────────
  const getScale = useCallback(() => {
    if (!scaleRef.current) {
      scaleRef.current = getAcaiaBLE();
    }
    return scaleRef.current;
  }, []);

  // ─── Event Handlers ──────────────────────────────────────────────────────

  const handleWeight = useCallback((e: ScaleEvent) => {
    if (e.weight) {
      setState((s) => ({
        ...s,
        weight: e.weight!.value,
        weightStable: e.weight!.stable,
      }));
    }
  }, []);

  const handleConnection = useCallback(
    (e: ScaleEvent) => {
      const isConnected = e.connected ?? false;
      setState((s) => ({
        ...s,
        status: isConnected ? 'connected' : 'disconnected',
        error: isConnected ? undefined : s.error,
        weight: isConnected ? s.weight : 0,
        weightStable: isConnected ? s.weightStable : false,
        connecting: false,
      }));

      // Clear device on disconnect
      if (!isConnected) {
        setState((s) => ({ ...s, device: null }));
      }
    },
    []
  );

  const handleError = useCallback((e: ScaleEvent) => {
    setState((s) => ({
      ...s,
      error: e.error || 'Unknown error',
      status: 'error',
    }));
  }, []);

  const handleBattery = useCallback((e: ScaleEvent) => {
    if (e.battery != null) {
      setState((s) => ({ ...s, batteryLevel: e.battery! }));
    }
  }, []);

  // ─── Wire up event listeners ─────────────────────────────────────────────

  useEffect(() => {
    const scale = getScale();

    scale.addEventListener('weight', handleWeight);
    scale.addEventListener('connection', handleConnection);
    scale.addEventListener('error', handleError);
    scale.addEventListener('battery', handleBattery);

    // Check if already connected (e.g., from a previous render)
    if (scale.connected) {
      setState((s) => ({
        ...s,
        status: 'connected',
        device: scale.info,
      }));
    }

    return () => {
      scale.removeEventListener('weight', handleWeight);
      scale.removeEventListener('connection', handleConnection);
      scale.removeEventListener('error', handleError);
      scale.removeEventListener('battery', handleBattery);
    };
  }, [getScale, handleWeight, handleConnection, handleError, handleBattery]);

  // ─── Cleanup on unmount ──────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      // On unmount, disconnect if we're the ones who connected
      // Don't destroy the singleton — other components may still use it
      if (scaleRef.current?.connected) {
        autoReconnectRef.current = false;
        scaleRef.current.disconnect().catch(() => {});
      }
    };
  }, []);

  // ─── Scan ────────────────────────────────────────────────────────────────

  const scan = useCallback(async (): Promise<AcaiaDevice[]> => {
    const scale = getScale();
    setState((s) => ({ ...s, status: 'scanning', error: undefined }));

    try {
      const devices = await scale.scan();
      setState((s) => ({ ...s, status: 'disconnected' }));
      return devices;
    } catch (err: any) {
      const msg = err?.message || 'Scan failed';
      setState((s) => ({
        ...s,
        status: 'error',
        error: msg,
      }));
      throw err;
    }
  }, [getScale]);

  // ─── Connect ─────────────────────────────────────────────────────────────

  const connect = useCallback(
    async (deviceId?: string): Promise<void> => {
      const scale = getScale();
      setState((s) => ({ ...s, connecting: true, error: undefined }));

      try {
        // If no deviceId provided, scan first and connect to the first device found
        if (!deviceId) {
          setState((s) => ({ ...s, status: 'scanning' }));
          const devices = await scale.scan();

          if (devices.length === 0) {
            throw new Error('No Acaia scale found. Make sure your scale is on and in pairing mode.');
          }

          deviceId = devices[0].id;
        }

        // Connect
        const device = await scale.connect(deviceId);

        setState((s) => ({
          ...s,
          status: 'connected',
          device,
          connecting: false,
          error: undefined,
        }));

        // Request battery after connection
        try {
          await scale.requestBattery();
        } catch {
          // Non-fatal
        }
      } catch (err: any) {
        const msg = err?.message || 'Connection failed';
        setState((s) => ({
          ...s,
          status: 'error',
          connecting: false,
          error: msg,
        }));
        throw err;
      }
    },
    [getScale]
  );

  // ─── Disconnect ──────────────────────────────────────────────────────────

  const disconnect = useCallback(async (): Promise<void> => {
    autoReconnectRef.current = false;
    const scale = getScale();

    try {
      await scale.disconnect();
    } catch (err: any) {
      // Ignore disconnect errors
    }

    setState({
      weight: 0,
      unit: 'g',
      status: 'disconnected',
      batteryLevel: undefined,
      error: undefined,
      device: null,
      weightStable: false,
      connecting: false,
    });

    // Re-enable auto-reconnect for future connections
    autoReconnectRef.current = true;
  }, [getScale]);

  // ─── Tare ────────────────────────────────────────────────────────────────

  const tare = useCallback(async (): Promise<void> => {
    const scale = getScale();
    setState((s) => ({ ...s, error: undefined }));

    try {
      await scale.tare();
    } catch (err: any) {
      setState((s) => ({ ...s, error: err?.message || 'Tare failed' }));
    }
  }, [getScale]);

  // ─── Request Battery ─────────────────────────────────────────────────────

  const requestBattery = useCallback(async (): Promise<void> => {
    const scale = getScale();

    try {
      await scale.requestBattery();
    } catch {
      // Non-fatal
    }
  }, [getScale]);

  // ─── Check BLE Available ─────────────────────────────────────────────────

  const checkBleAvailable = useCallback(async () => {
    const scale = getScale();
    return scale.checkBleAvailable();
  }, [getScale]);

  return {
    ...state,
    scan,
    connect,
    disconnect,
    tare,
    requestBattery,
    checkBleAvailable,
  };
}

// ─── Standalone Capture Hook ─────────────────────────────────────────────────

/**
 * useAcaiaCapture — Hook for "weigh and capture" workflow
 *
 * Listens for a stable weight reading and calls onCapture with the value.
 * Used in the Color Bar bowl-weighing flow.
 *
 * Usage:
 *   const { capturing, captured, startCapture, cancelCapture } = useAcaiaCapture((grams) => {
 *     console.log(`Captured ${grams}g`);
 *   });
 */
interface CaptureResult {
  grams: number;
  timestamp: number;
  stable: boolean;
}

export function useAcaiaCapture(onCapture: (grams: number) => void) {
  const [capturing, setCapturing] = useState(false);
  const [captured, setCaptured] = useState<CaptureResult | null>(null);

  const startCapture = useCallback(() => {
    setCapturing(true);
    setCaptured(null);
  }, []);

  const cancelCapture = useCallback(() => {
    setCapturing(false);
    setCaptured(null);
  }, []);

  useEffect(() => {
    if (!capturing) return;

    const scale = getAcaiaBLE();

    const handler = (e: ScaleEvent) => {
      if (!e.weight) return;

      // Wait for a stable weight reading > 0
      if (e.weight.stable && e.weight.value > 0) {
        const result: CaptureResult = {
          grams: Math.round(e.weight.value * 10) / 10,
          timestamp: Date.now(),
          stable: true,
        };
        setCaptured(result);
        setCapturing(false);
        onCapture(result.grams);
      }
    };

    scale.addEventListener('weight', handler);
    return () => scale.removeEventListener('weight', handler);
  }, [capturing, onCapture]);

  return { capturing, captured, startCapture, cancelCapture };
}
