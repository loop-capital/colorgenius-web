import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageIcon, ChevronRight } from 'lucide-react-native';

const COLORS = {
  bg: '#0F0F1A',
  card: '#161620',
  cardBorder: 'rgba(255,255,255,0.06)',
  textPrimary: '#F5F5F7',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  purple: '#9333EA',
};

export default function GalleryScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <ImageIcon size={32} color={COLORS.purple} />
          <Text style={styles.title}>Gallery</Text>
          <Text style={styles.subtitle}>Your photo collection</Text>
        </View>

        <TouchableOpacity style={styles.card} onPress={() => alert('Before & After gallery - coming in next update!')}>
          <Text style={styles.cardTitle}>Before & After</Text>
          <Text style={styles.cardDesc}>24 photos</Text>
          <ChevronRight size={20} color={COLORS.textMuted} style={styles.cardArrow} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => alert('Analysis Photos gallery - coming in next update!')}>
          <Text style={styles.cardTitle}>Analysis Photos</Text>
          <Text style={styles.cardDesc}>18 photos</Text>
          <ChevronRight size={20} color={COLORS.textMuted} style={styles.cardArrow} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => alert('Color Swatches gallery - coming in next update!')}>
          <Text style={styles.cardTitle}>Color Swatches</Text>
          <Text style={styles.cardDesc}>12 photos</Text>
          <ChevronRight size={20} color={COLORS.textMuted} style={styles.cardArrow} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 20 },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginTop: 12 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  cardArrow: { marginTop: 8, alignSelf: 'flex-end' },
});
