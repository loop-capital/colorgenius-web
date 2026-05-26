import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu } from 'lucide-react-native';

import DashboardScreen from './src/screens/DashboardScreen';
import ServiceScreen from './src/screens/ServiceScreen';
import FormulateScreen from './src/screens/FormulateScreen';
import NewServiceScreen from './src/screens/NewServiceScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import QuestionnaireScreen from './src/screens/QuestionnaireScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import AnalyzeScreen from './src/screens/AnalyzeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import PricingScreen from './src/screens/PricingScreen';
import CertificationScreen from './src/screens/CertificationScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import CameraScreen from './src/screens/CameraScreen';

import SidebarDrawer from './src/components/SidebarDrawer';

// ─── Theme Tokens ─────────────────────────────────────────────────────────────
const THEME = {
  bgPrimary: '#0F0F1A',
  textPrimary: '#F5F5F7',
  textSecondary: '#A1A1AA',
  surfaceElevated: '#161620',
  borderSubtle: 'rgba(255,255,255,0.06)',
  accent: '#9333EA',
} as const;

// ─── Type Definitions ─────────────────────────────────────────────────────────
export type RootStackParamList = {
  Dashboard: undefined;
  NewService: undefined;
  NewServiceSelect: undefined;
  Formulate: { initialStep?: number; autoPopulateData?: Record<string, any>; clientId?: string; clientName?: string } | undefined;
  Consultation: undefined;
  Clients: undefined;
  Library: undefined;
  Analyze: undefined;
  History: undefined;
  Gallery: undefined;
  Community: undefined;
  Inventory: undefined;
  Pricing: undefined;
  Certification: undefined;
  Settings: undefined;
  Subscription: undefined;
  Camera: undefined;
};

// ─── Navigators ───────────────────────────────────────────────────────────────
const Stack = createStackNavigator<RootStackParamList>();

// ─── Custom Header ────────────────────────────────────────────────────────────
function CustomHeader({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={onOpenDrawer}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Menu size={22} color={THEME.textSecondary} />
        </TouchableOpacity>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>CG</Text>
        </View>
        <Text style={styles.headerTitle}>ColorGenius</Text>
      </View>
    </View>
  );
}

// ─── Screen Wrapper ───────────────────────────────────────────────────────────
function ScreenWithHeader({
  children,
  onOpenDrawer,
}: {
  children: React.ReactNode;
  onOpenDrawer: () => void;
}) {
  return (
    <View style={styles.screenContainer}>
      <CustomHeader onOpenDrawer={onOpenDrawer} />
      <View style={styles.screenContent}>{children}</View>
    </View>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
function AppContent() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigation = useNavigation<any>();

  const handleNavigate = useCallback(
    (route: string) => {
      setDrawerVisible(false);
      setTimeout(() => {
        navigation.navigate(route);
      }, 100);
    },
    [navigation]
  );

  const screenOptions = {
    headerShown: false,
  };

  const wrapScreen = (ScreenComponent: React.ComponentType<any>) =>
    function WrappedScreen(props: any) {
      return (
        <ScreenWithHeader onOpenDrawer={() => setDrawerVisible(true)}>
          <ScreenComponent {...props} />
        </ScreenWithHeader>
      );
    };

  return (
    <>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Dashboard" component={wrapScreen(DashboardScreen)} />
        <Stack.Screen name="NewService" component={wrapScreen(ServiceScreen)} />
        <Stack.Screen name="NewServiceSelect" component={wrapScreen(NewServiceScreen)} />
        <Stack.Screen name="Formulate" component={wrapScreen(FormulateScreen)} />
        <Stack.Screen name="Consultation" component={wrapScreen(QuestionnaireScreen)} />
        <Stack.Screen name="Clients" component={wrapScreen(ClientsScreen)} />
        <Stack.Screen name="Library" component={wrapScreen(LibraryScreen)} />
        <Stack.Screen name="Analyze" component={wrapScreen(AnalyzeScreen)} />
        <Stack.Screen name="History" component={wrapScreen(HistoryScreen)} />
        <Stack.Screen name="Gallery" component={wrapScreen(GalleryScreen)} />
        <Stack.Screen name="Community" component={wrapScreen(CommunityScreen)} />
        <Stack.Screen name="Inventory" component={wrapScreen(InventoryScreen)} />
        <Stack.Screen name="Pricing" component={wrapScreen(PricingScreen)} />
        <Stack.Screen name="Certification" component={wrapScreen(CertificationScreen)} />
        <Stack.Screen name="Settings" component={wrapScreen(SettingsScreen)} />
        <Stack.Screen name="Subscription" component={wrapScreen(SubscriptionScreen)} />
        <Stack.Screen name="Camera" component={wrapScreen(CameraScreen)} />
      </Stack.Navigator>

      <SidebarDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onNavigate={handleNavigate}
      />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppContent />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: THEME.bgPrimary,
  },
  screenContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(15,15,26,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderSubtle,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: THEME.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textPrimary,
    letterSpacing: -0.3,
  },
});
