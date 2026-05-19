import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Bell,
  Bluetooth,
  Palette,
  Shield,
  CircleQuestionMark,
  LogOut,
  ChevronRight,
  Moon,
  Wifi,
  Smartphone,
} from 'lucide-react-native';
import { clearAuthToken, getSettings, saveNotifications, saveDarkMode, saveAutoSync, saveDefaultBrand, getDefaultBrand } from '../api/client';

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({ icon, title, subtitle, onPress, right, danger }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {right || (onPress && <ChevronRight size={18} color="#D1D5DB" />)}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [defaultBrand, setDefaultBrand] = useState('Wella');
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        setNotifications(settings.notifications);
        setDarkMode(settings.darkMode);
        setAutoSync(settings.autoSync);
        const brand = await getDefaultBrand();
        if (brand) setDefaultBrand(brand);
      } catch (e) {
        // Fallback to defaults
      } finally {
        setLoadingSettings(false);
      }
    })();
  }, []);

  const handleNotificationsToggle = async (value: boolean) => {
    setNotifications(value);
    try { await saveNotifications(value); } catch {}
  };

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkMode(value);
    try { await saveDarkMode(value); } catch {}
  };

  const handleAutoSyncToggle = async (value: boolean) => {
    setAutoSync(value);
    try { await saveAutoSync(value); } catch {}
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await clearAuthToken();
            Alert.alert('Signed Out', 'You have been signed out.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile */}
        <TouchableOpacity style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>CG</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Stylist</Text>
            <Text style={styles.profileEmail}>colorgenius.co</Text>
          </View>
          <ChevronRight size={20} color="#D1D5DB" />
        </TouchableOpacity>

        {/* General */}
        <SectionHeader title="General" />
        <View style={styles.section}>
          <SettingRow
            icon={<User size={20} color="#7C3AED" />}
            title="Account"
            subtitle="Profile, email, password"
          />
          <SettingRow
            icon={<Bell size={20} color="#F59E0B" />}
            title="Notifications"
            subtitle="Push notifications"
            right={
              <Switch
                value={notifications}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
                thumbColor={notifications ? '#7C3AED' : '#FFF'}
              />
            }
          />
          <SettingRow
            icon={<Moon size={20} color="#6366F1" />}
            title="Dark Mode"
            right={
              <Switch
                value={darkMode}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
                thumbColor={darkMode ? '#7C3AED' : '#FFF'}
              />
            }
          />
        </View>

        {/* Devices */}
        <SectionHeader title="Devices & BLE" />
        <View style={styles.section}>
          <SettingRow
            icon={<Bluetooth size={20} color="#3B82F6" />}
            title="Bluetooth Devices"
            subtitle="Acaia scales, sensors"
          />
          <SettingRow
            icon={<Smartphone size={20} color="#8B5CF6" />}
            title="Connected Devices"
            subtitle="Manage paired devices"
          />
          <SettingRow
            icon={<Wifi size={20} color="#10B981" />}
            title="Auto Sync"
            subtitle="Sync formulations automatically"
            right={
              <Switch
                value={autoSync}
                onValueChange={handleAutoSyncToggle}
                trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
                thumbColor={autoSync ? '#7C3AED' : '#FFF'}
              />
            }
          />
        </View>

        {/* Formulation */}
        <SectionHeader title="Formulation" />
        <View style={styles.section}>
          <SettingRow
            icon={<Palette size={20} color="#EC4899" />}
            title="Default Brand"
            subtitle="Wella"
          />
          <SettingRow
            icon={<Palette size={20} color="#F97316" />}
            title="Shade Database"
            subtitle="3,454 shades • 21 brands"
          />
        </View>

        {/* Security */}
        <SectionHeader title="Security" />
        <View style={styles.section}>
          <SettingRow
            icon={<Shield size={20} color="#14B8A6" />}
            title="Privacy & Data"
          />
          <SettingRow
            icon={<Shield size={20} color="#06B6D4" />}
            title="App Permissions"
          />
        </View>

        {/* Support */}
        <SectionHeader title="Support" />
        <View style={styles.section}>
          <SettingRow
            icon={<CircleQuestionMark size={20} color="#6B7280" />}
            title="Help Center"
            subtitle="colorgenius.co/help"
          />
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <SettingRow
            icon={<LogOut size={20} color="#EF4444" />}
            title="Sign Out"
            onPress={handleLogout}
            danger
          />
        </View>

        <Text style={styles.version}>COLORgenius Mobile v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F9FAFB' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  scroll: { paddingTop: 12 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  profileAvatarText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '700', color: '#111827' },
  profileEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },

  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 4,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  settingSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  dangerText: { color: '#EF4444' },

  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 24,
  },
});
