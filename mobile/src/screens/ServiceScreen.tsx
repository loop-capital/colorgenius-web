import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CirclePlus, ChevronRight, ClipboardList } from 'lucide-react-native';

const COLORS = {
  bg: '#0F0F1A',
  card: '#161620',
  cardBorder: 'rgba(255,255,255,0.06)',
  textPrimary: '#F5F5F7',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  purple: '#9333EA',
};

export default function ServiceScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>New Service</Text>
        <Text style={styles.subtitle}>Start a new color service</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('NewServiceSelect')}
        >
          <View style={styles.iconBg}>
            <CirclePlus size={28} color={COLORS.purple} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.cardTitle}>New Color Service</Text>
            <Text style={styles.cardDesc}>Select a client and create a custom formulation</Text>
          </View>
          <ChevronRight size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Consultation')}
        >
          <View style={styles.iconBg}>
            <ClipboardList size={28} color={COLORS.purple} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.cardTitle}>Consultation</Text>
            <Text style={styles.cardDesc}>Client intake questionnaire</Text>
          </View>
          <ChevronRight size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, marginBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  iconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(147,51,234,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textBlock: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
});
