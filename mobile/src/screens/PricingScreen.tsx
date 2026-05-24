import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DollarSign, ChevronRight } from 'lucide-react-native';

const COLORS = {
  bg: '#0F0F1A',
  card: '#161620',
  cardBorder: 'rgba(255,255,255,0.06)',
  textPrimary: '#F5F5F7',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  purple: '#9333EA',
};

export default function PricingScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <DollarSign size={32} color={COLORS.purple} />
          <Text style={styles.title}>Pricing Rules</Text>
          <Text style={styles.subtitle}>Manage service pricing</Text>
        </View>

        <TouchableOpacity style={styles.card} onPress={() => alert('Base Pricing detail - coming in next update!')}>
          <Text style={styles.cardTitle}>Base Pricing</Text>
          <Text style={styles.cardDesc}>Standard service rates</Text>
          <ChevronRight size={20} color={COLORS.textMuted} style={styles.cardArrow} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => alert('Add-on Pricing detail - coming in next update!')}>
          <Text style={styles.cardTitle}>Add-on Pricing</Text>
          <Text style={styles.cardDesc}>Extra services and treatments</Text>
          <ChevronRight size={20} color={COLORS.textMuted} style={styles.cardArrow} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => alert('Discount Rules detail - coming in next update!')}>
          <Text style={styles.cardTitle}>Discount Rules</Text>
          <Text style={styles.cardDesc}>Promotions and loyalty</Text>
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
