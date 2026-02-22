import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Divider, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSQLiteContext } from 'expo-sqlite';
import { useAnimales } from '@/database/hooks/useAnimales';
import { EventoAnimalRepository } from '@/database/repositories/EventoAnimalRepository';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { Colors } from '@/constants/colors';
import { formatDate } from '@/utils/formatters';
import { TIPOS_EVENTO_ANIMAL } from '@/constants/categories';
import type { AnimalesScreenProps } from '@/navigation/types';
import type { Animal } from '@/database/models/Animal';
import type { EventoAnimal } from '@/database/models/EventoAnimal';

export function AnimalDetailScreen({ route, navigation }: AnimalesScreenProps<'AnimalDetail'>) {
  const { id } = route.params;
  const db = useSQLiteContext();
  const { getAnimal } = useAnimales();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventosRecientes, setEventosRecientes] = useState<EventoAnimal[]>([]);
  const [totalEventos, setTotalEventos] = useState(0);

  const loadData = useCallback(async () => {
    const data = await getAnimal(id);
    setAnimal(data);

    const eventoRepo = new EventoAnimalRepository(db);
    const recientes = await eventoRepo.getRecentByAnimal(id, 3);
    const count = await eventoRepo.getCountByAnimal(id);
    setEventosRecientes(recientes);
    setTotalEventos(count);
    setLoading(false);
  }, [id, getAnimal, db]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'produccion': return Colors.success;
      case 'gestante': return Colors.info;
      case 'seca': return Colors.warning;
      case 'activo': return Colors.primary;
      default: return Colors.textSecondary;
    }
  };

  const getEventoIcon = (tipo: string) => {
    const found = TIPOS_EVENTO_ANIMAL.find((t) => t.value === tipo);
    return found?.icon || 'clipboard-text';
  };

  const getEventoLabel = (tipo: string) => {
    const found = TIPOS_EVENTO_ANIMAL.find((t) => t.value === tipo);
    return found?.label || tipo;
  };

  const getEventoColor = (tipo: string) => {
    switch (tipo) {
      case 'vacunacion': return Colors.success;
      case 'desparasitacion': return Colors.warning;
      case 'tratamiento': return Colors.error;
      case 'revision': return Colors.info;
      case 'parto': return '#E91E63';
      default: return Colors.textSecondary;
    }
  };

  if (loading) return <LoadingScreen />;
  if (!animal) return <Text style={{ padding: 20 }}>Animal no encontrado</Text>;

  return (
    <ScrollView style={styles.container}>
      {/* Header del animal */}
      <Card style={styles.card}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.iconBig}>
            <Icon name="cow" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.code}>{animal.codigo}</Text>
          {animal.nombre ? <Text style={styles.name}>{animal.nombre}</Text> : null}
          <Chip
            style={[styles.estadoChip, { backgroundColor: getEstadoColor(animal.estado) }]}
            textStyle={{ color: Colors.white, fontWeight: '600' }}
            icon={() => <Icon name="circle" size={8} color={Colors.white} />}
          >
            {animal.estado}
          </Chip>
        </Card.Content>
      </Card>

      {/* Informacion General */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="information-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Informaci\u00f3n General</Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Icon name="dna" size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Raza:</Text>
            </View>
            <Text style={styles.value}>{animal.raza}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Icon name="gender-male-female" size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Sexo:</Text>
            </View>
            <Text style={styles.value}>{animal.sexo === 'H' ? 'Hembra' : 'Macho'}</Text>
          </View>
          {animal.fecha_nacimiento && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabelRow}>
                <Icon name="cake-variant" size={16} color={Colors.textSecondary} />
                <Text style={styles.label}>Nacimiento:</Text>
              </View>
              <Text style={styles.value}>{formatDate(animal.fecha_nacimiento)}</Text>
            </View>
          )}
          {animal.peso_actual && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabelRow}>
                <Icon name="weight-kilogram" size={16} color={Colors.textSecondary} />
                <Text style={styles.label}>Peso:</Text>
              </View>
              <Text style={styles.value}>{animal.peso_actual} kg</Text>
            </View>
          )}
          {animal.notas && (
            <View style={styles.notasContainer}>
              <View style={styles.infoLabelRow}>
                <Icon name="note-text-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.label}>Notas:</Text>
              </View>
              <Text style={styles.notas}>{animal.notas}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Eventos Recientes */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="clipboard-text-clock" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Eventos Recientes</Text>
            {totalEventos > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalEventos}</Text>
              </View>
            )}
          </View>
          <Divider style={styles.divider} />

          {eventosRecientes.length > 0 ? (
            <>
              {eventosRecientes.map((evento) => (
                <View key={evento.id} style={styles.eventoRow}>
                  <View style={[styles.eventoIcon, { backgroundColor: getEventoColor(evento.tipo) + '20' }]}>
                    <Icon name={getEventoIcon(evento.tipo)} size={18} color={getEventoColor(evento.tipo)} />
                  </View>
                  <View style={styles.eventoInfo}>
                    <Text style={[styles.eventoTipo, { color: getEventoColor(evento.tipo) }]}>
                      {getEventoLabel(evento.tipo)}
                    </Text>
                    <Text style={styles.eventoDesc} numberOfLines={1}>
                      {evento.descripcion}
                    </Text>
                  </View>
                  <Text style={styles.eventoFecha}>{formatDate(evento.fecha)}</Text>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.noEventos}>
              <Icon name="clipboard-text-outline" size={32} color={Colors.textSecondary} />
              <Text style={styles.noEventosText}>Sin eventos registrados</Text>
            </View>
          )}

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('AnimalEventos', { id: animal.id, nombre: animal.nombre || animal.codigo })}
            style={styles.eventosButton}
            contentStyle={styles.eventosButtonContent}
            icon="clipboard-list"
          >
            {totalEventos > 0 ? 'Ver Todos los Eventos' : 'Agregar Primer Evento'}
          </Button>
        </Card.Content>
      </Card>

      {/* Boton editar */}
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AnimalForm', { id: animal.id })}
        style={styles.editButton}
        contentStyle={styles.editButtonContent}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    marginLeft: 22,
    lineHeight: 20,
  },
  eventoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  eventoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventoInfo: {
    flex: 1,
  },
  eventoTipo: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  eventoDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  eventoFecha: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  noEventos: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  noEventosText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  eventosButton: {
    marginTop: 12,
    borderRadius: 8,
    borderColor: Colors.primary,
  },
  eventosButtonContent: {
    height: 44,
  },
  editButton: {
    margin: 16,
    borderRadius: 8,
  },
  editButtonContent: {
    height: 48,
  },
  bottomSpace: {
    height: 24,
  },
});
