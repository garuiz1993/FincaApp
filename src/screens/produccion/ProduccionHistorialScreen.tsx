import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '@/constants/colors';
import { formatDate, formatLiters, formatCurrency } from '@/utils/formatters';
import { getCurrentMonthRange } from '@/utils/dateUtils';

interface DailyRecord {
  fecha: string;
  total: number;
}

export function ProduccionHistorialScreen() {
  const db = useSQLiteContext();
  const [historial, setHistorial] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [precioLitro, setPrecioLitro] = useState(0);

  const loadHistorial = useCallback(async () => {
    setLoading(true);
    try {
      const { start, end } = getCurrentMonthRange();
      const rows = await db.getAllAsync<DailyRecord>(
        `SELECT fecha, total
         FROM produccion
         WHERE fecha BETWEEN ? AND ? AND deleted = 0
         ORDER BY fecha DESC`,
        [start, end]
      );
      setHistorial(rows);

      const precioGuardado = await db.getFirstAsync<{ value: string }>(
        `SELECT value FROM configuracion WHERE key = 'precio_litro'`
      ).catch(() => null);
      if (precioGuardado) {
        setPrecioLitro(parseFloat(precioGuardado.value) || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadHistorial();
    }, [loadHistorial])
  );

  const totalMes = historial.reduce((sum, r) => sum + r.total, 0);

  const renderItem = ({ item }: { item: DailyRecord }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.dateContainer}>
          <Icon name="calendar" size={18} color={Colors.primary} />
          <Text style={styles.date}>{formatDate(item.fecha)}</Text>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Icon name="water" size={18} color={Colors.primary} />
            <Text style={[styles.detailValue, styles.totalValue]}>{formatLiters(item.total)}</Text>
            <Text style={styles.detailLabel}>Producción</Text>
          </View>
          {precioLitro > 0 && (
            <View style={styles.detail}>
              <Icon name="cash" size={18} color={Colors.success} />
              <Text style={[styles.detailValue, { color: Colors.success }]}>
                {formatCurrency(item.total * precioLitro)}
              </Text>
              <Text style={styles.detailLabel}>Estimado</Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Resumen del mes */}
      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, { backgroundColor: Colors.primary }]}>
          <Card.Content style={styles.summaryContent}>
            <Icon name="water" size={24} color={Colors.white} />
            <Text style={styles.summaryValue}>{formatLiters(totalMes)}</Text>
            <Text style={styles.summaryLabel}>Total Mes</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.summaryCard, { backgroundColor: Colors.success }]}>
          <Card.Content style={styles.summaryContent}>
            <Icon name="cash-multiple" size={24} color={Colors.white} />
            <Text style={styles.summaryValue}>
              {precioLitro > 0 ? formatCurrency(totalMes * precioLitro) : '--'}
            </Text>
            <Text style={styles.summaryLabel}>Ingreso Est.</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.summaryCard, { backgroundColor: Colors.info }]}>
          <Card.Content style={styles.summaryContent}>
            <Icon name="counter" size={24} color={Colors.white} />
            <Text style={styles.summaryValue}>{historial.length}</Text>
            <Text style={styles.summaryLabel}>Días</Text>
          </Card.Content>
        </Card>
      </View>

      <FlatList
        data={historial}
        renderItem={renderItem}
        keyExtractor={(item) => item.fecha}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadHistorial}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="clipboard-text-clock-outline" size={56} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Sin registros</Text>
            <Text style={styles.emptyDesc}>No hay registros de producción este mes</Text>
          </View>
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
  summaryRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
  },
  summaryContent: {
    alignItems: 'center',
    padding: 8,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
    gap: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  totalValue: {
    fontSize: 18,
    color: Colors.primaryDark,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
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
  },
});
