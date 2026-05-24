import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ChevronRight, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadPhoto, analyzePhoto } from '../api/client';

const COLORS = {
  bg: '#0F0F1A',
  card: '#161620',
  cardBorder: 'rgba(255,255,255,0.06)',
  textPrimary: '#F5F5F7',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  purple: '#9333EA',
};

export default function AnalyzeScreen({ navigation }: any) {
  const [uploading, setUploading] = useState(false);

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'COLORgenius needs access to your photos to upload hair analysis images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setUploading(true);
      try {
        const sessionId = `mobile-${Date.now()}`;
        const uploadResult = await uploadPhoto(uri, sessionId, 'roots');
        if (uploadResult.data?.id) {
          try { await analyzePhoto(uploadResult.data.id); } catch {}
        }
        Alert.alert(
          'Photo Uploaded',
          'Photo uploaded successfully! Analysis will be available shortly.',
          [
            { text: 'Take Another', onPress: () => {} },
            { text: 'View Results', onPress: () => navigation.navigate('Formulate', { photoId: uploadResult.data?.id, analysis: uploadResult.data }) },
          ]
        );
      } catch (err: any) {
        Alert.alert('Upload Failed', err.message || 'Please try again');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Camera size={32} color={COLORS.purple} />
          <Text style={styles.title}>Analyze</Text>
          <Text style={styles.subtitle}>Take or upload a photo for AI assessment</Text>
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Camera')}
        >
          <View style={styles.iconBg}>
            <Camera size={28} color={COLORS.purple} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.cardTitle}>Take Photo</Text>
            <Text style={styles.cardDesc}>Capture hair for AI analysis</Text>
          </View>
          <ChevronRight size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, uploading && styles.cardDisabled]}
          onPress={pickFromGallery}
          disabled={uploading}
        >
          <View style={styles.iconBg}>
            {uploading ? (
              <ActivityIndicator size="small" color={COLORS.purple} />
            ) : (
              <ImageIcon size={28} color={COLORS.purple} />
            )}
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.cardTitle}>{uploading ? 'Uploading...' : 'Upload from Gallery'}</Text>
            <Text style={styles.cardDesc}>Select existing photo</Text>
          </View>
          {!uploading && <ChevronRight size={20} color={COLORS.textMuted} />}
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
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(147,51,234,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textBlock: { flex: 1 },
  cardDisabled: { opacity: 0.5 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
});
