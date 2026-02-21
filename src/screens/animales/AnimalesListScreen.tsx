import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, Card, Text, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAnimales } from '@/database/hooks/useAnimales';
import { EmptyState } from '@/components/common/EmptyState';
import { Colors } from '@/constants/colors';
import type { AnimalesScreenProps } from '@/navigation/types';
import type { Animal } from '@/database/models/Animal';

export function AnimalesListScreen({ navigation }: AnimalesScreenProps<'AnimalesList'>) {
  const { animales, loading, loadAnimales } = useAnimales();

  useFocusEffect(
    useCallback(() => {
      loadAnimales();
    }, [loadAnimales])
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'produccion': return Colors.success;
      case 'gestante': return Colors.info;
      case 'seca': return Colors.warning;
      default: return Colors.textSecondary;
    }
  };

  const renderAnimal = ({ item }: { item: Animal }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('AnimalDetail', { id: item.id })}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.animalIcon}>
          <Icon name="cow" size={28} color={Colors.primary} />
        </View>
        <View style={styles.animalInfo}>
          <Text style={styles.animalCode}>{item.codigo}</Text>
          {item.nombre ? <Text style={styles.animalName}>{item.nombre}</Text> : null}
          <Text style={styles.animalBreed}>{item.raza}</Text>
        </View>
        <Chip
          textStyle={{ fontSize: 11, color: Colors.white }}
          style={[styles.chip, { backgroundColor: getEstadoColor(item.estado) }]}
        >
          {item.estado}
        </Chip>
      </Card.Content>
    </Card>
  );

  if (!loading && animales.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="cow"
          title="Sin animales registrados"
          description="Agrega tu primer animal para comenzar a gestionar tu hato"
          actionLabel="Agregar Animal"
          onAction={() => navigation.navigate('AnimalForm', {})}
        />
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('AnimalForm', {})}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={animales}
        renderItem={renderAnimal}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadAnimales}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AnimalForm', {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    gap: 8,
  },
  card: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  animalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  animalInfo: {
    flex: 1,
  },
  animalCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  animalName: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  animalBreed: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chip: {
    height: 28,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
});
