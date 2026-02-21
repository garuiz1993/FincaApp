import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Card, Text, FAB, Divider, SegmentedButtons } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFinanzas } from '@/database/hooks/useFinanzas';
import { Colors } from '@/constants/colors';
import { getCurrentMonthRange } from '@/utils/dateUtils';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { FinanzasScreenProps } from '@/navigation/types';

export function FinanzasScreen({ navigation }: FinanzasScreenProps<'FinanzasHome'>) {
  const { ingresos, gastos, loading, loadIngresos, loadGastos, getTotales } = useFinanzas();
  const [tab, setTab] = useState('ingresos');
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const { start, end } = getCurrentMonthRange();
      loadIngresos(start, end);
      loadGastos(start, end);
      getTotales(start, end).then((t) => {
        setTotalIngresos(t.ingresos);
        setTotalGastos(t.gastos);
      });
    }, [loadIngresos, loadGastos, getTotales])
  );

  const balance = totalIngresos - totalGastos;

  return (
    <View style={styles.container}>
      {/* Resumen */}
      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, { backgroundColor: Colors.success }]}>
          <Card.Content style={styles.summaryContent}>
            <Icon name="arrow-up-circle" size={20} color={Colors.white} />
            <Text style={styles.summaryLabel}>Ingresos</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalIngresos)}</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.summaryCard, { backgroundColor: Colors.error }]}>
          <Card.Content style={styles.summaryContent}>
            <Icon name="arrow-down-circle" size={20} color={Colors.white} />
            <Text style={styles.summaryLabel}>Gastos</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalGastos)}</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.balanceCard}>
        <Card.Content style={styles.balanceContent}>
          <Text style={styles.balanceLabel}>Balance del Mes</Text>
          <Text style={[styles.balanceValue, { color: balance >= 0 ? Colors.success : Colors.error }]}>
            {formatCurrency(balance)}
          </Text>
        </Card.Content>
      </Card>

      {/* Tabs */}
      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        buttons={[
          { value: 'ingresos', label: 'Ingresos' },
          { value: 'gastos', label: 'Gastos' },
        ]}
        style={styles.tabs}
      />

      {/* Lista */}
      <FlatList
        data={tab === 'ingresos' ? ingresos : gastos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <Card.Content style={styles.itemContent}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemDesc}>
                  {item.descripcion || ('tipo' in item ? item.tipo : (item as { categoria?: string }).categoria)}
                </Text>
                <Text style={styles.itemDate}>{formatDate(item.fecha)}</Text>
              </View>
              <Text
                style={[styles.itemMonto, { color: tab === 'ingresos' ? Colors.success : Colors.error }]}
              >
                {tab === 'ingresos' ? '+' : '-'}{formatCurrency(item.monto)}
              </Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay {tab} registrados este mes</Text>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          if (tab === 'ingresos') {
            navigation.navigate('IngresoForm', {});
          } else {
            navigation.navigate('GastoForm', {});
          }
        }}
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
  summaryLabel: {
    color: Colors.white,
    fontSize: 12,
    marginTop: 4,
  },
  summaryValue: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceCard: {
    marginHorizontal: 12,
    borderRadius: 12,
    elevation: 2,
  },
  balanceContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  balanceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  tabs: {
    margin: 12,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 80,
    gap: 6,
  },
  itemCard: {
    borderRadius: 10,
    elevation: 1,
    marginBottom: 4,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  itemDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemMonto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
});
