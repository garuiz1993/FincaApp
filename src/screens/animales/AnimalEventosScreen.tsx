import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, TextInput, Button, Divider, FAB, Portal, Modal, TouchableRipple } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSQLiteContext } from 'expo-sqlite';
import { EventoAnimalRepository } from '@/database/repositories/EventoAnimalRepository';
import { Colors } from '@/constants/colors';
import { TIPOS_EVENTO_ANIMAL } from '@/constants/categories';
import { getToday } from '@/utils/dateUtils';
import { formatDate } from '@/utils/formatters';
import type { AnimalesScreenProps } from '@/navigation/types';
import type { EventoAnimal } from '@/database/models/EventoAnimal';

export function AnimalEventosScreen({ route }: AnimalesScreenProps<'AnimalEventos'>) {
  const { id, nombre } = route.params;
  const db = useSQLiteContext();
  const [eventos, setEventos] = useState<EventoAnimal[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [tipo, setTipo] = useState('vacunacion');
  const [fecha, setFecha] = useState(getToday());
  const [descripcion, setDescripcion] = useState('');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  const loadEventos = useCallback(async () => {
    setLoading(true);
    try {
      const repo = new EventoAnimalRepository(db);
      const data = await repo.getByAnimal(id);
      setEventos(data);
    } finally {
      setLoading(false);
    }
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      loadEventos();
    }, [loadEventos])
  );

  const handleSave = async () => {
    if (!descripcion.trim()) {
      Alert.alert('Atención', 'La descripción del evento es obligatoria');
      return;
    }

    setSaving(true);
    try {
      const repo = new EventoAnimalRepository(db);
      await repo.create({
        id_animal: id,
        tipo,
        fecha,
        descripcion: descripcion.trim(),
        notas: notas.trim() || null,
      });

      setModalVisible(false);
      setDescripcion('');
      setNotas('');
      setTipo('vacunacion');
      setFecha(getToday());
      await loadEventos();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el evento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (evento: EventoAnimal) => {
    Alert.alert(
      'Eliminar Evento',
      '¿Estás seguro de eliminar este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const repo = new EventoAnimalRepository(db);
            await repo.softDelete(evento.id);
            await loadEventos();
          },
        },
      ]
    );
  };

  const getEventoIcon = (tipoEvento: string) => {
    const found = TIPOS_EVENTO_ANIMAL.find((t) => t.value === tipoEvento);
    return found?.icon || 'clipboard-text';
  };

  const getEventoLabel = (tipoEvento: string) => {
    const found = TIPOS_EVENTO_ANIMAL.find((t) => t.value === tipoEvento);
    return found?.label || tipoEvento;
  };

  const getEventoColor = (tipoEvento: string) => {
    switch (tipoEvento) {
      case 'vacunacion': return Colors.success;
      case 'desparasitacion': return Colors.warning;
      case 'tratamiento': return Colors.error;
      case 'revision': return Colors.info;
      case 'parto': return '#E91E63';
      default: return Colors.textSecondary;
    }
  };

  const renderEvento = ({ item }: { item: EventoAnimal }) => (
    <Card style={styles.eventCard} onLongPress={() => handleDelete(item)}>
      <Card.Content style={styles.eventContent}>
        <View style={[styles.eventIconContainer, { backgroundColor: getEventoColor(item.tipo) + '20' }]}>
          <Icon name={getEventoIcon(item.tipo)} size={24} color={getEventoColor(item.tipo)} />
        </View>
        <View style={styles.eventInfo}>
          <View style={styles.eventHeader}>
            <Text style={[styles.eventTipo, { color: getEventoColor(item.tipo) }]}>
              {getEventoLabel(item.tipo)}
            </Text>
            <View style={styles.eventDateRow}>
              <Icon name="calendar" size={12} color={Colors.textSecondary} />
              <Text style={styles.eventDate}>{formatDate(item.fecha)}</Text>
            </View>
          </View>
          <Text style={styles.eventDesc}>{item.descripcion}</Text>
          {item.notas ? <Text style={styles.eventNotas}>{item.notas}</Text> : null}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header info */}
      <View style={styles.header}>
        <Icon name="cow" size={20} color={Colors.white} />
        <Text style={styles.headerTitle}>Eventos de {nombre || 'Animal'}</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{eventos.length}</Text>
        </View>
      </View>

      <FlatList
        data={eventos}
        renderItem={renderEvento}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadEventos}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="clipboard-text-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Sin eventos registrados</Text>
            <Text style={styles.emptyDesc}>
              Agrega vacunaciones, tratamientos y otros eventos importantes
            </Text>
          </View>
        }
      />

      {/* FAB para agregar evento */}
      <FAB
        icon="plus"
        label="Nuevo Evento"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

      {/* Modal para nuevo evento */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.modalHeader}>
            <Icon name="clipboard-plus" size={24} color={Colors.primary} />
            <Text style={styles.modalTitle}>Nuevo Evento</Text>
          </View>
          <Divider style={styles.modalDivider} />

          {/* Tipo de evento - botones grandes con iconos */}
          <Text style={styles.fieldLabel}>Tipo de evento</Text>
          <View style={styles.tipoGrid}>
            {TIPOS_EVENTO_ANIMAL.map((t) => (
              <TouchableRipple
                key={t.value}
                onPress={() => setTipo(t.value)}
                style={[
                  styles.tipoButton,
                  tipo === t.value && styles.tipoButtonActive,
                ]}
                borderless
              >
                <View style={styles.tipoButtonInner}>
                  <Icon
                    name={t.icon}
                    size={22}
                    color={tipo === t.value ? Colors.white : Colors.primary}
                  />
                  <Text
                    style={[
                      styles.tipoButtonLabel,
                      tipo === t.value && styles.tipoButtonLabelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {t.label}
                  </Text>
                </View>
              </TouchableRipple>
            ))}
          </View>

          <TextInput
            label="Fecha"
            value={fecha}
            onChangeText={setFecha}
            mode="outlined"
            style={styles.modalInput}
            left={<TextInput.Icon icon="calendar" />}
          />

          <TextInput
            label="Descripción *"
            value={descripcion}
            onChangeText={setDescripcion}
            mode="outlined"
            style={styles.modalInput}
            left={<TextInput.Icon icon="text" />}
            placeholder="Ej: Vacuna contra fiebre aftosa"
          />

          <TextInput
            label="Notas adicionales"
            value={notas}
            onChangeText={setNotas}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.modalInput}
            left={<TextInput.Icon icon="note-text" />}
          />

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
              icon="close"
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              style={styles.modalButton}
              icon="check"
            >
              Guardar
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    paddingTop: 12,
    gap: 8,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  headerBadgeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
    paddingBottom: 80,
    gap: 8,
  },
  eventCard: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 8,
  },
  eventContent: {
    flexDirection: 'row',
    gap: 12,
  },
  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTipo: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  eventDesc: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  eventNotas: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
  modal: {
    backgroundColor: Colors.white,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalDivider: {
    marginVertical: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  tipoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tipoButton: {
    width: '30%',
    flexGrow: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  tipoButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tipoButtonInner: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 4,
  },
  tipoButtonLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  tipoButtonLabelActive: {
    color: Colors.white,
  },
  modalInput: {
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalButton: {
    borderRadius: 8,
  },
});
