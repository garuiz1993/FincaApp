import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/app/AppProviders';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
      <StatusBar style="auto" />
    </AppProviders>
  );
}
