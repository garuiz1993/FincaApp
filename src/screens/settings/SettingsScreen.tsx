import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, List, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';
import { logout } from '@/services/firebase/authService';
import { SyncStatusBadge } from '@/components/common/SyncStatusBadge';
import { Colors } from '@/constants/colors';

export function SettingsScreen() {
  const { user } = useAuthStore();
  const { isOnline, lastSyncTime } = useAppStore();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Perfil */}
      <Card style={styles.card}>
        <Card.Content style={styles.profileContent}>
          <View style={styles.avatar}>
            <Icon name="account-circle" size={56} color={Colors.primary} />
          </View>
          <Text style={styles.email}>{user?.email || 'Usuario'}</Text>
          <SyncStatusBadge />
        </Card.Content>
      </Card>

      {/* Opciones */}
      <Card style={styles.card}>
        <List.Item
          title="Estado de conexión"
          description={isOnline ? 'Conectado' : 'Sin conexión'}
          left={(props) => <List.Icon {...props} icon="wifi" />}
        />
        <Divider />
        <List.Item
          title="Última sincronización"
          description={lastSyncTime || 'Nunca'}
          left={(props) => <List.Icon {...props} icon="sync" />}
        />
        <Divider />
        <List.Item
          title="Versión"
          description="1.0.0 - Fase 1 (MVP)"
          left={(props) => <List.Icon {...props} icon="information" />}
        />
      </Card>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        textColor={Colors.error}
        icon="logout"
      >
        Cerrar Sesión
      </Button>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    elevation: 2,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  avatar: {
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  logoutButton: {
    margin: 16,
    borderColor: Colors.error,
    borderRadius: 8,
  },
  bottomSpace: {
    height: 32,
  },
});
