'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2, AlertTriangle, Check } from 'lucide-react';
import {
  describeUpdate,
  fieldLabel,
  type DictationResponse,
} from '@/lib/consultation/field-mapping';

// ─── Web Speech API types (same pattern as components/custom/voice-assistant.tsx) ───

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export interface DictationWidgetProps {
  /** Called with normalized field updates (dotted keys, e.g. 'condition.grayPercent'). */
  onFieldsUpdate: (updates: Record<string, unknown>) => void;
  /** Current field values, passed to the mapping API as context. */
  currentFields?: Record<string, unknown>;
  disabled?: boolean;
}

type DictationState = 'idle' | 'listening' | 'processing' | 'error';

const ERROR_FRIENDLY: Record<string, string> = {
  'no-speech': "Didn't catch that — hold the button and speak again.",
  'audio-capture': 'No microphone found on this device.',
  'not-allowed': 'Microphone access was blocked — allow it in the browser and try again.',
  'service-not-allowed': 'Speech recognition is not allowed in this browser.',
};

/**
 * DictationWidget — push-to-talk button that transcribes spoken consultation
 * notes (browser Web Speech API) and maps them onto consultation fields via
 * POST /api/consultation/dictate.
 *
 * The parent owns the field state: onFieldsUpdate receives a flat object of
 * dotted-key updates; the parent merges them into its form state (dot-paths
 * like 'condition.grayPercent' resolve into nested objects).
 */
export default function DictationWidget({ onFieldsUpdate, currentFields, disabled = false }: DictationWidgetProps) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [state, setState] = useState<DictationState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastTranscript, setLastTranscript] = useState('');
  const [filled, setFilled] = useState<Array<[string, unknown]>>([]);
  const [unmatched, setUnmatched] = useState<string[]>([]);
  const [error, setError] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalRef = useRef('');
  const holdingRef = useRef(false);

  useEffect(() => {
    setSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const submitTranscript = async (transcript: string) => {
    setState('processing');
    setError('');
    try {
      const res = await fetch('/api/consultation/dictate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, currentFields: currentFields ?? {} }),
      });
      const data = (await res.json()) as DictationResponse & { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Dictation mapping failed. Fill in the fields by hand.');
        setState('error');
        return;
      }
      const updates = data.updates ?? {};
      setFilled(Object.entries(updates));
      setUnmatched(data.unmatched ?? []);
      setLastTranscript(transcript);
      if (Object.keys(updates).length > 0) onFieldsUpdate(updates);
      setState('idle');
    } catch {
      setError('Dictation mapping failed (network error). Fill in the fields by hand.');
      setState('error');
    }
  };

  const startListening = () => {
    if (!supported || state !== 'idle' || disabled) return;
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    finalRef.current = '';
    setInterimTranscript('');
    setError('');

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results.item(i);
        const text = result.item(0).transcript;
        if (result.isFinal) finalRef.current += text;
        else interim += text;
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: { error: string }) => {
      if (event.error === 'aborted') return;
      setError(ERROR_FRIENDLY[event.error] ?? `Speech recognition error: ${event.error}`);
      setState('error');
      holdingRef.current = false;
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      const final = finalRef.current.trim();
      setInterimTranscript('');
      if (final.length > 0) {
        void submitTranscript(final);
      } else {
        // Functional update: keep 'error'/'processing' states set by onerror,
        // only drop back from 'listening' when nothing was heard.
        setState((s) => (s === 'listening' ? 'idle' : s));
      }
    };

    recognitionRef.current = recognition;
    holdingRef.current = true;
    setState('listening');
    try {
      recognition.start();
    } catch {
      holdingRef.current = false;
      setState('idle');
    }
  };

  const stopListening = () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    recognitionRef.current?.stop();
  };

  const isSupported = supported === true;
  const buttonDisabled = !isSupported || disabled || state === 'processing';
  const unsupportedTitle = supported === false
    ? "Voice dictation isn't supported in this browser — fill in the fields by hand."
    : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          aria-label="Hold to dictate consultation notes"
          aria-pressed={state === 'listening'}
          title={unsupportedTitle ?? 'Hold to dictate — release to map to fields'}
          disabled={buttonDisabled}
          onPointerDown={startListening}
          onPointerUp={stopListening}
          onPointerLeave={stopListening}
          onPointerCancel={stopListening}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 999,
            border: state === 'listening' ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(147,51,234,0.4)',
            background: state === 'listening' ? 'rgba(239,68,68,0.15)' : 'rgba(147,51,234,0.08)',
            color: state === 'listening' ? '#F87171' : '#A855F7',
            cursor: buttonDisabled ? 'not-allowed' : 'pointer',
            opacity: buttonDisabled ? 0.5 : 1,
            fontSize: 14,
            fontWeight: 600,
            userSelect: 'none',
            touchAction: 'none',
          }}
        >
          {state === 'processing' ? (
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          ) : isSupported ? (
            <Mic size={16} />
          ) : (
            <MicOff size={16} />
          )}
          {state === 'listening' ? 'Listening… release to fill' : state === 'processing' ? 'Mapping…' : 'Hold to dictate'}
        </button>
        {(state === 'listening' && interimTranscript) && (
          <span style={{ fontSize: 13, color: '#A1A1AA', fontStyle: 'italic', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {interimTranscript}
          </span>
        )}
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#F87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '8px 12px' }}>
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}

      {lastTranscript && filled.length > 0 && (
        <div style={{ fontSize: 13, color: '#71717A' }}>
          Heard: <span style={{ color: '#D4D4D8', fontStyle: 'italic' }}>&ldquo;{lastTranscript}&rdquo;</span>
        </div>
      )}

      {filled.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }} aria-live="polite">
          {filled.map(([key, value]) => (
            <span
              key={key}
              title={`Field: ${fieldLabel(key)}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 500,
                padding: '5px 10px',
                borderRadius: 999,
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.35)',
                color: '#4ADE80',
              }}
            >
              <Check size={12} />
              {describeUpdate(key, value)}
            </span>
          ))}
        </div>
      )}

      {lastTranscript && filled.length === 0 && unmatched.length === 0 && state !== 'processing' && !error && (
        <div style={{ fontSize: 13, color: '#71717A' }}>
          Nothing mapped from that — try phrasing like &ldquo;current level 6, target copper 7, 40 percent gray&rdquo;.
        </div>
      )}

      {unmatched.length > 0 && (
        <div style={{ fontSize: 13, color: '#FBBF24', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Couldn&rsquo;t map these — fill by hand:</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {unmatched.map((u, i) => (
              <li key={i} style={{ marginBottom: 2 }}>&ldquo;{u}&rdquo;</li>
            ))}
          </ul>
        </div>
      )}

      {supported === false && (
        <div style={{ fontSize: 12, color: '#71717A' }}>
          Voice dictation needs a browser with speech recognition (Chrome, Edge, or Safari).
        </div>
      )}
    </div>
  );
}
