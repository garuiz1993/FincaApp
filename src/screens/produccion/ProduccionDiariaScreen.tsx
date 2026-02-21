import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, TextInput, Button, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSQLiteContext } from 'expo-sqlite';
import { AnimalRepository } from '@/database/repositories/AnimalRepository';
import { useProduccion } from '@/database/hooks/useProduccion';
import { EmptyState } from '@/components/common/EmptyState';
import { Colors } from '@/constants/colors';
import { getToday } from '@/utils/dateUtils';
import { formatLiters } from '@/utils/formatters';
import type { Animal } from '@/database/models/Animal';
import type { ProduccionScreenProps } from '@/navigation/types';

interface AnimalProduccion {
  animal: Animal;
  manana: string;
  tarde: string;
}

export function ProduccionDiariaScreen({ navigation }: ProduccionScreenProps<'ProduccionDiaria'>) {
  const db = useSQLiteContext();
  const { upsertProduccion, getTotalDiario, loadByFecha, registros } = useProduccion();
  const [fecha] = useState(getToday());
  const [animalesData, setAnimalesData] = useState<AnimalProduccion[]>([]);
  const [totalDia, setTotalDia] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const animalRepo = new AnimalRepository(db);
      const activos = await animalRepo.getActivos();
      await loadByFecha(fecha);

      const data = activos.map((animal) => {
        const reg = registros.find((r) => r.id_animal === animal.id);
        return {
          animal,
          manana: reg?.litros_manana?.toString() || '',
          tarde: reg?.litros_tarde?.toString() || '',
        };
      });
      setAnimalesData(data);

      const total = await getTotalDiario(fecha);
      setTotalDia(total);
    } finally {
      setLoading(false);
    }
  }, [db, fecha, loadByFecha, registros, getTotalDiario]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSave = async (animalId: string, manana: string, tarde: string) => {
    const litrosManana = parseFloat(manana) || 0;
    const litrosTarde = parseFloat(tarde) || 0;

    await upsertProduccion({
      id_animal: animalId,
      fecha,
      litros_manana: litrosManana,
      litros_tarde: litrosTarde,
      notas: null,
    });

    const total = await getTotalDiario(fecha);
    setTotalDia(total);
  };

  const updateAnimalData = (index: number, field: 'manana' | 'tarde', value: string) => {
    setAnimalesData((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const renderAnimal = ({ item, index }: { item: AnimalProduccion; index: number }) => (
    <Card style={styles.animalCard}>
      <Card.Content>
        <View style={styles.animalHeader}>
          <Icon name="cow" size={20} color={Colors.primary} />
          <Text style={styles.animalCode}>{item.animal.codigo}</Text>
          {item.animal.nombre && <Text style={styles.animalName}> - {item.animal.nombre}</Text>}
        </View>
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mañana (L)</Text>
            <TextInput
              value={item.manana}
              onChangeText={(val) => updateAnimalData(index, 'manana', val)}
              onBlur={() => handleSave(item.animal.id, item.manana, item.tarde)}
              mode="outlined"
              keyboardType="numeric"
              dense
              style={styles.litrosInput}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tarde (L)</Text>
            <TextInput
              value={item.tarde}
              onChangeText={(val) => updateAnimalData(index, 'tarde', val)}
              onBlur={() => handleSave(item.animal.id, item.manana, item.tarde)}
              mode="outlined"
              keyboardType="numeric"
              dense
              style={styles.litrosInput}
            />
          </View>
          <View style={styles.totalGroup}>
            <Text style={styles.inputLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatLiters((parseFloat(item.manana) || 0) + (parseFloat(item.tarde) || 0))}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Resumen del día */}
      <View style={styles.summary}>
        <Icon name="calendar-today" size={18} color={Colors.white} />
        <Text style={styles.summaryDate}>{fecha}</Text>
        <View style={styles.summaryTotal}>
          <Text style={styles.summaryTotalLabel}>Total:</Text>
          <Text style={styles.summaryTotalValue}>{formatLiters(totalDia)}</Text>
        </View>
      </View>

      {animalesData.length === 0 ? (
        <EmptyState
          icon="cow"
          title="Sin animales activos"
          description="Registra animales primero para comenzar a ingresar la producción diaria"
        />
      ) : (
        <FlatList
          data={animalesData}
          renderItem={renderAnimal}
          keyExtractor={(item) => item.animal.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadData}
        />
      )}

      <Button
        mode="text"
        icon="history"
        onPress={() => navigation.navigate('ProduccionHistorial')}
        style={styles.historyButton}
      >
        Ver Historial
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 12,
    paddingHorizontal: 16,
  },
  summaryDate: {
    color: Colors.white,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  summaryTotal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    color: Colors.primaryContainer,
    fontSize: 14,
    marginRight: 4,
  },
  summaryTotalValue: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    padding: 12,
    gap: 8,
  },
  animalCard: {
    borderRadius: 10,
    elevation: 1,
    marginBottom: 4,
  },
  animalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  animalCode: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
    color: Colors.text,
  },
  animalName: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  inputGroup: {
    flex: 2,
  },
  totalGroup: {
    flex: 1,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  litrosInput: {
    height: 40,
    fontSize: 16,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    paddingTop: 8,
  },
  historyButton: {
    margin: 8,
  },
});
