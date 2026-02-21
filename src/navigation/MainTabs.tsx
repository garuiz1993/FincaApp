import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { AnimalesStack } from './AnimalesStack';
import { ProduccionStack } from './ProduccionStack';
import { FinanzasStack } from './FinanzasStack';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import type { MainTabParamList } from './types';
import { Colors } from '@/constants/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AnimalesTab"
        component={AnimalesStack}
        options={{
          tabBarLabel: 'Animales',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cow" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProduccionTab"
        component={ProduccionStack}
        options={{
          tabBarLabel: 'Producción',
          tabBarIcon: ({ color, size }) => (
            <Icon name="water" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="FinanzasTab"
        component={FinanzasStack}
        options={{
          tabBarLabel: 'Finanzas',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cash-multiple" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MasTab"
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Configuración',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          tabBarLabel: 'Más',
          tabBarIcon: ({ color, size }) => (
            <Icon name="dots-horizontal" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
