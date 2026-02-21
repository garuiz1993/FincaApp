import { MD3LightTheme } from 'react-native-paper';
import { Colors } from './colors';

export const appTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    primaryContainer: Colors.primaryContainer,
    secondary: Colors.secondary,
    secondaryContainer: Colors.secondaryContainer,
    surface: Colors.surface,
    background: Colors.background,
    error: Colors.error,
    errorContainer: Colors.errorContainer,
  },
};

export type AppTheme = typeof appTheme;
