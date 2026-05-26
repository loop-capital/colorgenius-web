import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClipboardList, ChevronRight, Camera, Palette, Activity, HeartPulse } from 'lucide-react-native';

const COLORS = {
  bg: '#0F0F1A',
  card: '#161620',
  cardBorder: 'rgba(255,255,255,0.06)',
  textPrimary: '#F5F5F7',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  purple: '#9333EA',
  pink: '#EC4899',
  green: '#10B981',
  yellow: '#F59E0B',
};

export default function QuestionnaireScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <ClipboardList size={32} color={COLORS.purple} />
          <Text style={styles.title}>Consultation</Text>
          <Text style={styles.subtitle}>Complete the client intake questionnaire</Text>
        </View>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Formulate', { initialStep: 3 })}>
          <View style={styles.iconBg}>
            <Activity size={24} color={COLORS.purple} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.cardTitle}>Hair History</Text>
            <Text style={styles.cardDesc}>Previous color services and chemical history</Text>
          </View>
          <ChevronRight size={20} color={COLORS.textMuted} style={styles.cardArrow} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Formulate', { initialStep: 4 })}>
          <View style={styles.iconBg}>
            <Palette size={24} color={COLORS.pink} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.cardTitle}>Desired Result</Text>
            <Text style={styles.cardDesc}>Target color, tone, and service goals</Text>
          </View>
          <ChevronRight size={20} color={COLORS.textMuted} style={styles.cardArrow} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Formulate', { initialStep: 5 })}>
          <View style={styles.iconBg}>
            <HeartPulse size={24} color={COLORS.green} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.cardTitle}>Hair Condition</Text>
            <Text style={styles.cardDesc}>Current porosity, texture, and health</Text>
          </View>
          <ChevronRight size={20} color={COLORS.textMuted} style={styles.cardArrow} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Formulate', { initialStep: 2 })}>
          <View style={styles.iconBg}>
            <Camera size={24} color={COLORS.yellow} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.cardTitle}>Scalp Assessment</Text>
            <Text style={styles.cardDesc}>Sensitivity and scalp condition</Text>
          </View>
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
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textBlock: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  cardArrow: { marginTop: 8, alignSelf: 'flex-end' },
});
