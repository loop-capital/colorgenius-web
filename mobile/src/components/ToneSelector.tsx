// ============================================================
// ToneSelector — Grid of tone chips
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TONES, type ToneValue } from '../types';

interface ToneSelectorProps {
  value: ToneValue;
  onChange: (tone: ToneValue) => void;
  label?: string;
}

export default function ToneSelector({ value, onChange, label }: ToneSelectorProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.grid}>
        {TONES.map((tone) => {
          const selected = tone.value === value;
          return (
            <Pressable
              key={tone.value}
              onPress={() => onChange(tone.value)}
              style={[
                styles.chip,
                selected && { backgroundColor: tone.color + '40', borderColor: tone.color },
              ]}
            >
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: tone.color },
                  selected && styles.colorDotActive,
                ]}
              />
              <Text
                style={[
                  styles.chipText,
                  selected && styles.chipTextSelected,
                ]}
              >
                {tone.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333355',
    backgroundColor: '#1A1A2E',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  colorDotActive: {
    borderColor: '#FFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
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
