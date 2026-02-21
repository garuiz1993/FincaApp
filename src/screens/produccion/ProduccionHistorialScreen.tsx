import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '@/constants/colors';
import { formatDate, formatLiters } from '@/utils/formatters';
import { getCurrentMonthRange } from '@/utils/dateUtils';

interface DailyTotal {
  fecha: string;
  total: number;
  animales: number;
}

export function ProduccionHistorialScreen() {
  const db = useSQLiteContext();
  const [historial, setHistorial] = useState<DailyTotal[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistorial = useCallback(async () => {
    setLoading(true);
    try {
      const { start, end } = getCurrentMonthRange();
      const rows = await db.getAllAsync<DailyTotal>(
        `SELECT fecha, COALESCE(SUM(total), 0) as total, COUNT(DISTINCT id_animal) as animales
         FROM produccion WHERE fecha BETWEEN ? AND ? AND deleted = 0
         GROUP BY fecha ORDER BY fecha DESC`,
        [start, end]
      );
      setHistorial(rows);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadHistorial();
    }, [loadHistorial])
  );

  const renderItem = ({ item }: { item: DailyTotal }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.dateContainer}>
          <Icon name="calendar" size={18} color={Colors.primary} />
          <Text style={styles.date}>{formatDate(item.fecha)}</Text>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={styles.detailValue}>{formatLiters(item.total)}</Text>
            <Text style={styles.detailLabel}>Total</Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailValue}>{item.animales}</Text>
            <Text style={styles.detailLabel}>Animales</Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailValue}>
              {item.animales > 0 ? formatLiters(item.total / item.animales) : '0 L'}
            </Text>
            <Text style={styles.detailLabel}>Promedio</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={historial}
        renderItem={renderItem}
        keyExtractor={(item) => item.fecha}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadHistorial}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay registros de producción este mes</Text>
        }
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
  cardContent: {},
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
  },
  divider: {
    marginVertical: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detail: {
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 40,
    fontSize: 14,
  },
});
