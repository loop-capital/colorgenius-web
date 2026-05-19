// ============================================================
// ToneSelector — Grid of tone chips
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TONES, type Tone } from '../types';

interface ToneSelectorProps {
  value: Tone;
  onChange: (tone: Tone) => void;
  label?: string;
}

// Subtle per-tone accent colours
const TONE_COLORS: Record<string, string> = {
  neutral: '#B0A090',
  warm: '#D4A574',
  cool: '#7BA7C9',
  ash: '#8FA39A',
  golden: '#C9A84C',
  copper: '#B87333',
  red: '#C94C4C',
  violet: '#9B59B6',
  pearl: '#D5C8E0',
  beige: '#C9B99A',
  mahogany: '#6E3B3B',
  chocolate: '#5C3317',
};

export default function ToneSelector({ value, onChange, label }: ToneSelectorProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.grid}>
        {TONES.map((tone) => {
          const selected = tone === value;
          const accent = TONE_COLORS[tone] ?? '#D4A574';
          return (
            <Pressable
              key={tone}
              onPress={() => onChange(tone)}
              style={[
                styles.chip,
                selected && { backgroundColor: accent, borderColor: accent },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selected && styles.chipTextSelected,
                ]}
              >
                {capitalize(tone)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    color: '#D4A574',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333355',
    backgroundColor: '#1A1A2E',
  },
  chipText: {
    color: '#AAAACC',
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
