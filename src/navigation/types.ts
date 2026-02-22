import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Main Bottom Tabs
export type MainTabParamList = {
  Inicio: undefined;
  AnimalesTab: NavigatorScreenParams<AnimalesStackParamList>;
  ProduccionTab: NavigatorScreenParams<ProduccionStackParamList>;
  FinanzasTab: NavigatorScreenParams<FinanzasStackParamList>;
  MasTab: undefined;
};

// Animales Stack
export type AnimalesStackParamList = {
  AnimalesList: undefined;
  AnimalDetail: { id: string };
  AnimalForm: { id?: string };
  AnimalEventos: { id: string; nombre?: string };
};

// Produccion Stack
export type ProduccionStackParamList = {
  ProduccionDiaria: undefined;
  ProduccionHistorial: undefined;
};

// Finanzas Stack
export type FinanzasStackParamList = {
  FinanzasHome: undefined;
  IngresoForm: { id?: string };
  GastoForm: { id?: string };
};

// Screen Props helpers
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type AnimalesScreenProps<T extends keyof AnimalesStackParamList> =
  NativeStackScreenProps<AnimalesStackParamList, T>;

export type ProduccionScreenProps<T extends keyof ProduccionStackParamList> =
  NativeStackScreenProps<ProduccionStackParamList, T>;

export type FinanzasScreenProps<T extends keyof FinanzasStackParamList> =
  NativeStackScreenProps<FinanzasStackParamList, T>;
