import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProduccionDiariaScreen } from '@/screens/produccion/ProduccionDiariaScreen';
import { ProduccionHistorialScreen } from '@/screens/produccion/ProduccionHistorialScreen';
import type { ProduccionStackParamList } from './types';
import { Colors } from '@/constants/colors';

const Stack = createNativeStackNavigator<ProduccionStackParamList>();

export function ProduccionStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="ProduccionDiaria"
        component={ProduccionDiariaScreen}
        options={{ title: 'Producción Diaria' }}
      />
      <Stack.Screen
        name="ProduccionHistorial"
        component={ProduccionHistorialScreen}
        options={{ title: 'Historial Producción' }}
      />
    </Stack.Navigator>
  );
}
