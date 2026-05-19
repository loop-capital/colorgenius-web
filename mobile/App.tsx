import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Home, Palette, Camera, Users, TrendingUp, Settings } from 'lucide-react-native';

import HomeScreen from './src/screens/HomeScreen';
import FormulateScreen from './src/screens/FormulateScreen';
import CameraScreen from './src/screens/CameraScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const ACTIVE   = '#9333EA';
const INACTIVE = '#71717A';
const BG       = '#0A0A0F';
const BORDER   = '#1A1A2E';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: BG,
            borderTopColor: BORDER,
            borderTopWidth: 1,
            paddingBottom: 6,
            paddingTop: 6,
            height: 60,
          },
          tabBarActiveTintColor: ACTIVE,
          tabBarInactiveTintColor: INACTIVE,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
        />
        <Tab.Screen
          name="Formulate"
          component={FormulateScreen}
          options={{ tabBarIcon: ({ color, size }) => <Palette color={color} size={size} /> }}
        />
        <Tab.Screen
          name="Camera"
          component={CameraScreen}
          options={{ tabBarIcon: ({ color, size }) => <Camera color={color} size={size} /> }}
        />
        <Tab.Screen
          name="Clients"
          component={ClientsScreen}
          options={{ tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }}
        />
        <Tab.Screen
          name="Community"
          component={CommunityScreen}
          options={{ tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} /> }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
