import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Divider, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAnimales } from '@/database/hooks/useAnimales';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { Colors } from '@/constants/colors';
import { formatDate } from '@/utils/formatters';
import type { AnimalesScreenProps } from '@/navigation/types';
import type { Animal } from '@/database/models/Animal';

export function AnimalDetailScreen({ route, navigation }: AnimalesScreenProps<'AnimalDetail'>) {
  const { id } = route.params;
  const { getAnimal } = useAnimales();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await getAnimal(id);
      setAnimal(data);
      setLoading(false);
    };
    load();
  }, [id, getAnimal]);

  if (loading) return <LoadingScreen />;
  if (!animal) return <Text style={{ padding: 20 }}>Animal no encontrado</Text>;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.iconBig}>
            <Icon name="cow" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.code}>{animal.codigo}</Text>
          {animal.nombre ? <Text style={styles.name}>{animal.nombre}</Text> : null}
          <Chip style={styles.estadoChip}>{animal.estado}</Chip>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Información General</Text>
          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Raza:</Text>
            <Text style={styles.value}>{animal.raza}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Sexo:</Text>
            <Text style={styles.value}>{animal.sexo === 'H' ? 'Hembra' : 'Macho'}</Text>
          </View>
          {animal.fecha_nacimiento && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nacimiento:</Text>
              <Text style={styles.value}>{formatDate(animal.fecha_nacimiento)}</Text>
            </View>
          )}
          {animal.peso_actual && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Peso:</Text>
              <Text style={styles.value}>{animal.peso_actual} kg</Text>
            </View>
          )}
          {animal.notas && (
            <View style={styles.notasContainer}>
              <Text style={styles.label}>Notas:</Text>
              <Text style={styles.notas}>{animal.notas}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('AnimalForm', { id: animal.id })}
        style={styles.editButton}
        icon="pencil"
      >
        Editar Animal
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
  headerContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  code: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  name: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  estadoChip: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  notasContainer: {
    paddingVertical: 8,
  },
  notas: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 4,
    lineHeight: 20,
  },
  editButton: {
    margin: 16,
    borderRadius: 8,
  },
  bottomSpace: {
    height: 24,
  },
});
