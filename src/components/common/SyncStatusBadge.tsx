import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppStore } from '@/stores/useAppStore';
import { Colors } from '@/constants/colors';

export function SyncStatusBadge() {
  const { isOnline, isSyncing } = useAppStore();

  return (
    <View style={[styles.container, { backgroundColor: isOnline ? Colors.success : Colors.warning }]}>
      <Icon
        name={isSyncing ? 'sync' : isOnline ? 'cloud-check' : 'cloud-off-outline'}
        size={14}
        color={Colors.white}
      />
      <Text style={styles.text}>
        {isSyncing ? 'Sincronizando...' : isOnline ? 'En línea' : 'Sin conexión'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  text: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
});
