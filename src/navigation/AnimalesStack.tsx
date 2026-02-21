import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AnimalesListScreen } from '@/screens/animales/AnimalesListScreen';
import { AnimalDetailScreen } from '@/screens/animales/AnimalDetailScreen';
import { AnimalFormScreen } from '@/screens/animales/AnimalFormScreen';
import type { AnimalesStackParamList } from './types';
import { Colors } from '@/constants/colors';

const Stack = createNativeStackNavigator<AnimalesStackParamList>();

export function AnimalesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="AnimalesList"
        component={AnimalesListScreen}
        options={{ title: 'Mis Animales' }}
      />
      <Stack.Screen
        name="AnimalDetail"
        component={AnimalDetailScreen}
        options={{ title: 'Detalle Animal' }}
      />
      <Stack.Screen
        name="AnimalForm"
        component={AnimalFormScreen}
        options={({ route }) => ({
          title: route.params?.id ? 'Editar Animal' : 'Nuevo Animal',
        })}
      />
    </Stack.Navigator>
  );
}
