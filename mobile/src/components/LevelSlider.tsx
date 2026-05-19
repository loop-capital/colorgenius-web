// ============================================================
// LevelSlider — Hair level picker (1–10) with named levels
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { HAIR_LEVEL_NAMES } from '../types';

interface LevelSliderProps {
  value: number;
  onChange: (level: number) => void;
  label?: string;
}

export default function LevelSlider({ value, onChange, label }: LevelSliderProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Level name display */}
      <Text style={styles.levelName}>
        Level {value} — {HAIR_LEVEL_NAMES[value] ?? ''}
      </Text>

      {/* Numbered buttons */}
      <View style={styles.row}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
          <Pressable
            key={lvl}
            onPress={() => onChange(lvl)}
            style={[
              styles.dot,
              lvl === value && styles.dotActive,
              { backgroundColor: levelColor(lvl) },
            ]}
          >
            <Text style={[styles.dotLabel, lvl === value && styles.dotLabelActive]}>
              {lvl}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function levelColor(lvl: number): string {
  // Gradient from near-black to pale blonde
  const colors = [
    '#1C1C1C', '#2E1A0E', '#3E2723', '#5D4037', '#795548',
    '#A1887F', '#C8A96E', '#D4B86A', '#E8D5A3', '#F5E6C8',
  ];
  return colors[lvl - 1] ?? '#888';
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    color: '#D4A574',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  levelName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dotActive: {
    borderColor: '#D4A574',
  },
  dotLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  dotLabelActive: {
    color: '#D4A574',
  },
});
