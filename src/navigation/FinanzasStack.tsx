import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FinanzasScreen } from '@/screens/finanzas/FinanzasScreen';
import { IngresoFormScreen } from '@/screens/finanzas/IngresoFormScreen';
import { GastoFormScreen } from '@/screens/finanzas/GastoFormScreen';
import type { FinanzasStackParamList } from './types';
import { Colors } from '@/constants/colors';

const Stack = createNativeStackNavigator<FinanzasStackParamList>();

export function FinanzasStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="FinanzasHome"
        component={FinanzasScreen}
        options={{ title: 'Finanzas' }}
      />
      <Stack.Screen
        name="IngresoForm"
        component={IngresoFormScreen}
        options={({ route }) => ({
          title: route.params?.id ? 'Editar Ingreso' : 'Nuevo Ingreso',
        })}
      />
      <Stack.Screen
        name="GastoForm"
        component={GastoFormScreen}
        options={({ route }) => ({
          title: route.params?.id ? 'Editar Gasto' : 'Nuevo Gasto',
        })}
      />
    </Stack.Navigator>
  );
}
