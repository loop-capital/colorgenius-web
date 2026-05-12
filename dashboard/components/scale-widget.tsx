'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bluetooth, BluetoothConnected, RotateCcw, Battery, BatteryLow, Scale, X, AlertCircle, Zap } from 'lucide-react';
import { useScale } from '@/lib/scale/use-scale';

interface ScaleWidgetProps {
  onWeightCapture?: (grams: number) => void;
  compact?: boolean;
  className?: string;
}

export function ScaleWidget({ onWeightCapture, compact = false, className = '' }: ScaleWidgetProps) {
  const { connected, connecting, device, weight, battery, error, connect, disconnect, tare, isSupported } = useScale();

  if (!isSupported && typeof window !== 'undefined') {
    return (
      <div className={`rounded-xl p-3 flex items-center gap-2 ${className}`}
        style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
        <AlertCircle className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
        <p className="text-xs" style={{ color: 'var(--cg-text-secondary)' }}>
          Bluetooth scales require Chrome or Edge browser
        </p>
      </div>
    );
  }

  // Compact mode — just the weight display + connect button
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {connected ? (
          <>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <BluetoothConnected className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-xs font-mono font-bold" style={{ color: '#10B981' }}>
                {weight ? `${weight.value.toFixed(1)}g` : '0.0g'}
              </span>
              {weight?.stable && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              )}
            </div>
            <button onClick={tare} className="p-1.5 rounded-lg hover:bg-white/5" title="Tare">
              <RotateCcw className="w-3.5 h-3.5" style={{ color: 'var(--cg-text-tertiary)' }} />
            </button>
          </>
        ) : (
          <button onClick={connect} disabled={connecting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: 'rgba(147, 51, 234, 0.1)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              color: '#A855F7',
            }}>
            <Bluetooth className="w-3.5 h-3.5" />
            {connecting ? 'Pairing...' : 'Pair Scale'}
          </button>
        )}
      </div>
    );
  }

  // Full widget
  return (
    <div className={`rounded-2xl overflow-hidden ${className}`}
      style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Connection State */}
      {!connected ? (
        <div className="p-5 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'rgba(147, 51, 234, 0.1)' }}>
            <Scale className="w-8 h-8 text-[#9333EA]" />
          </div>
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--cg-text-primary)' }}>
            Acaia Scale
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--cg-text-tertiary)' }}>
            Connect your Pearl or Lunar for precise weight measurement
          </p>

          {error && (
            <div className="mb-3 p-2 rounded-lg text-xs" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
              {error}
            </div>
          )}

          <button onClick={connect} disabled={connecting}
            className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}>
            <Bluetooth className="w-4 h-4" />
            {connecting ? 'Scanning...' : 'Pair Acaia Scale'}
          </button>

          <p className="text-[10px] mt-2" style={{ color: 'var(--cg-text-tertiary)' }}>
            Make sure your scale is on and in pairing mode
          </p>
        </div>
      ) : (
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <BluetoothConnected className="w-4 h-4 text-[#10B981]" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>
                  {device?.name || 'Acaia Scale'}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--cg-text-tertiary)' }}>
                  {device?.model} · Connected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {battery != null && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {battery < 20 ? <BatteryLow className="w-3.5 h-3.5 text-red-400" /> : <Battery className="w-3.5 h-3.5 text-[#10B981]" />}
                  <span className="text-[10px] font-mono" style={{ color: 'var(--cg-text-secondary)' }}>{battery}%</span>
                </div>
              )}
              <button onClick={disconnect} className="p-1.5 rounded-lg hover:bg-white/5" title="Disconnect">
                <X className="w-3.5 h-3.5" style={{ color: 'var(--cg-text-tertiary)' }} />
              </button>
            </div>
          </div>

          {/* Weight Display */}
          <div className="text-center py-6 rounded-xl mb-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={weight?.value?.toFixed(1) || '0.0'}
                initial={{ opacity: 0.5, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.1 }}
              >
                <p className="text-5xl font-mono font-bold tracking-tight" style={{ color: 'var(--cg-text-primary)' }}>
                  {weight ? weight.value.toFixed(1) : '0.0'}
                  <span className="text-xl font-normal ml-1" style={{ color: 'var(--cg-text-tertiary)' }}>g</span>
                </p>
                {weight?.stable && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-1 mt-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="text-[10px] font-medium text-[#10B981]">STABLE</span>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={tare}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[0.98]"
              style={{ background: 'rgba(147, 51, 234, 0.15)', color: '#A855F7' }}>
              <RotateCcw className="w-4 h-4" /> Tare
            </button>
            {onWeightCapture && weight && weight.value > 0 && weight.stable && (
              <button onClick={() => onWeightCapture(weight.value)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}>
                <Zap className="w-4 h-4" /> Capture {weight.value.toFixed(1)}g
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Inline weight badge (for formula builder) ──────────────────────────────

export function ScaleWeightBadge() {
  const { connected, weight, device } = useScale();

  if (!connected) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
      style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
      <BluetoothConnected className="w-3 h-3 text-[#10B981]" />
      <span className="text-[10px] font-mono font-bold" style={{ color: '#10B981' }}>
        {weight ? `${weight.value.toFixed(1)}g` : '—'}
      </span>
      {weight?.stable && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />}
      <span className="text-[10px]" style={{ color: 'var(--cg-text-tertiary)' }}>{device?.model}</span>
    </div>
  );
}
