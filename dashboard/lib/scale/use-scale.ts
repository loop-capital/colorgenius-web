'use client';
/// <reference types="web-bluetooth" />

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AcaiaScale, ScaleDevice, ScaleWeight, ScaleEvent,
  connectScale, disconnectScale, getAllScales, getScale,
} from '@/lib/scale/acaia';

interface UseScaleState {
  connected: boolean;
  connecting: boolean;
  device: ScaleDevice | null;
  weight: ScaleWeight | null;
  battery: number | null;
  error: string | null;
}

interface UseScaleReturn extends UseScaleState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  tare: () => Promise<void>;
  isSupported: boolean;
}

export function useScale(): UseScaleReturn {
  const [state, setState] = useState<UseScaleState>({
    connected: false,
    connecting: false,
    device: null,
    weight: null,
    battery: null,
    error: null,
  });

  const scaleRef = useRef<AcaiaScale | null>(null);

  const isSupported = typeof navigator !== 'undefined' && !!navigator.bluetooth;

  // Check for existing connection on mount
  useEffect(() => {
    const existing = getAllScales()[0];
    if (existing?.connected) {
      scaleRef.current = existing;
      setState(s => ({
        ...s,
        connected: true,
        device: existing.info,
      }));
    }
  }, []);

  const handleWeight = useCallback((e: ScaleEvent) => {
    if (e.weight) {
      setState(s => ({ ...s, weight: e.weight! }));
    }
  }, []);

  const handleConnection = useCallback((e: ScaleEvent) => {
    setState(s => ({
      ...s,
      connected: e.connected ?? false,
      error: e.connected ? null : s.error,
      weight: e.connected ? s.weight : null,
    }));
  }, []);

  const handleError = useCallback((e: ScaleEvent) => {
    setState(s => ({ ...s, error: e.error || 'Unknown error' }));
  }, []);

  const handleBattery = useCallback((e: ScaleEvent) => {
    if (e.battery != null) {
      setState(s => ({ ...s, battery: e.battery! }));
    }
  }, []);

  const connect = useCallback(async () => {
    if (!isSupported) {
      setState(s => ({ ...s, error: 'Web Bluetooth not supported — use Chrome or Edge' }));
      return;
    }

    setState(s => ({ ...s, connecting: true, error: null }));

    try {
      const scale = await connectScale();
      scaleRef.current = scale;

      scale.addEventListener('weight', handleWeight);
      scale.addEventListener('connection', handleConnection);
      scale.addEventListener('error', handleError);
      scale.addEventListener('battery', handleBattery);

      setState(s => ({
        ...s,
        connected: true,
        connecting: false,
        device: scale.info,
        error: null,
      }));
    } catch (err: any) {
      setState(s => ({
        ...s,
        connecting: false,
        error: err?.message || 'Connection failed',
      }));
    }
  }, [isSupported, handleWeight, handleConnection, handleError, handleBattery]);

  const disconnect = useCallback(async () => {
    if (scaleRef.current) {
      scaleRef.current.removeEventListener('weight', handleWeight);
      scaleRef.current.removeEventListener('connection', handleConnection);
      scaleRef.current.removeEventListener('error', handleError);
      scaleRef.current.removeEventListener('battery', handleBattery);

      await disconnectScale(scaleRef.current.deviceId);
      scaleRef.current = null;
    }

    setState({
      connected: false,
      connecting: false,
      device: null,
      weight: null,
      battery: null,
      error: null,
    });
  }, [handleWeight, handleConnection, handleError, handleBattery]);

  const tare = useCallback(async () => {
    if (scaleRef.current?.connected) {
      await scaleRef.current.tare();
    }
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    tare,
    isSupported,
  };
}

// ─── Standalone capture hook (for "weigh and capture" flow) ──────────────────

interface CaptureResult {
  grams: number;
  timestamp: number;
  stable: boolean;
}

interface UseScaleCaptureReturn {
  capturing: boolean;
  captured: CaptureResult | null;
  startCapture: () => void;
  cancelCapture: () => void;
}

export function useScaleCapture(onCapture: (grams: number) => void): UseScaleCaptureReturn {
  const [capturing, setCapturing] = useState(false);
  const [captured, setCaptured] = useState<CaptureResult | null>(null);
  const stableCountRef = useRef(0);

  const startCapture = useCallback(() => {
    setCapturing(true);
    setCaptured(null);
    stableCountRef.current = 0;
  }, []);

  const cancelCapture = useCallback(() => {
    setCapturing(false);
    setCaptured(null);
  }, []);

  // Listen for stable weight when capturing
  useEffect(() => {
    if (!capturing) return;

    const scale = getAllScales()[0];
    if (!scale) return;

    const handler = (e: ScaleEvent) => {
      if (!e.weight) return;

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
