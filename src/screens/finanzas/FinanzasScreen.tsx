import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, FAB, Divider, TouchableRipple } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFinanzas } from '@/database/hooks/useFinanzas';
import { Colors } from '@/constants/colors';
import { getCurrentMonthRange } from '@/utils/dateUtils';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TIPOS_INGRESO, CATEGORIAS_GASTO } from '@/constants/categories';
import type { FinanzasScreenProps } from '@/navigation/types';

export function FinanzasScreen({ navigation }: FinanzasScreenProps<'FinanzasHome'>) {
  const { ingresos, gastos, loading, loadIngresos, loadGastos, getTotales } = useFinanzas();
  const [tab, setTab] = useState<'ingresos' | 'gastos'>('ingresos');
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

  const getItemIcon = (item: { tipo?: string; categoria?: string }) => {
    if ('tipo' in item && item.tipo) {
      const found = TIPOS_INGRESO.find((t) => t.value === item.tipo);
      return found?.icon || 'cash-plus';
    }
    if ('categoria' in item && item.categoria) {
      const found = CATEGORIAS_GASTO.find((c) => c.value === item.categoria);
      return found?.icon || 'cash-minus';
    }
    return 'cash';
  };

  const getItemLabel = (item: { descripcion?: string | null; tipo?: string; categoria?: string }) => {
    if (item.descripcion) return item.descripcion;
    if ('tipo' in item && item.tipo) {
      const found = TIPOS_INGRESO.find((t) => t.value === item.tipo);
      return found?.label || item.tipo;
    }
    if ('categoria' in item && item.categoria) {
      const found = CATEGORIAS_GASTO.find((c) => c.value === item.categoria);
      return found?.label || item.categoria;
    }
    return '';
  };

  return (
    <View style={styles.container}>
      {/* Resumen */}
      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, { backgroundColor: Colors.success }]}>
          <Card.Content style={styles.summaryContent}>
            <Icon name="arrow-up-circle" size={24} color={Colors.white} />
            <Text style={styles.summaryLabel}>Ingresos</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalIngresos)}</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.summaryCard, { backgroundColor: Colors.error }]}>
          <Card.Content style={styles.summaryContent}>
            <Icon name="arrow-down-circle" size={24} color={Colors.white} />
            <Text style={styles.summaryLabel}>Gastos</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalGastos)}</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.balanceCard}>
        <Card.Content style={styles.balanceContent}>
          <Icon
            name="scale-balance"
            size={20}
            color={balance >= 0 ? Colors.success : Colors.error}
          />
          <Text style={styles.balanceLabel}>Balance del Mes</Text>
          <Text style={[styles.balanceValue, { color: balance >= 0 ? Colors.success : Colors.error }]}>
            {formatCurrency(balance)}
          </Text>
        </Card.Content>
      </Card>

      {/* Tabs grandes */}
      <View style={styles.tabRow}>
        <TouchableRipple
          onPress={() => setTab('ingresos')}
          style={[styles.tabButton, tab === 'ingresos' && styles.tabButtonActiveIngresos]}
          borderless
        >
          <View style={styles.tabInner}>
            <Icon
              name="arrow-up-circle"
              size={22}
              color={tab === 'ingresos' ? Colors.white : Colors.success}
            />
            <Text style={[styles.tabLabel, tab === 'ingresos' && styles.tabLabelActive]}>
              Ingresos
            </Text>
          </View>
        </TouchableRipple>
        <TouchableRipple
          onPress={() => setTab('gastos')}
          style={[styles.tabButton, tab === 'gastos' && styles.tabButtonActiveGastos]}
          borderless
        >
          <View style={styles.tabInner}>
            <Icon
              name="arrow-down-circle"
              size={22}
              color={tab === 'gastos' ? Colors.white : Colors.error}
            />
            <Text style={[styles.tabLabel, tab === 'gastos' && styles.tabLabelActive]}>
              Gastos
            </Text>
          </View>
        </TouchableRipple>
      </View>

      {/* Lista */}
      <FlatList
        data={tab === 'ingresos' ? ingresos : gastos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <Card.Content style={styles.itemContent}>
              <View style={[
                styles.itemIconCircle,
                { backgroundColor: (tab === 'ingresos' ? Colors.success : Colors.error) + '15' },
              ]}>
                <Icon
                  name={getItemIcon(item as { tipo?: string; categoria?: string })}
                  size={22}
                  color={tab === 'ingresos' ? Colors.success : Colors.error}
                />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemDesc}>
                  {getItemLabel(item as { descripcion?: string | null; tipo?: string; categoria?: string })}
                </Text>
                <View style={styles.itemDateRow}>
                  <Icon name="calendar" size={12} color={Colors.textSecondary} />
                  <Text style={styles.itemDate}>{formatDate(item.fecha)}</Text>
                </View>
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
          <View style={styles.emptyContainer}>
            <Icon
              name={tab === 'ingresos' ? 'cash-plus' : 'cash-minus'}
              size={48}
              color={Colors.textSecondary}
            />
            <Text style={styles.empty}>No hay {tab} registrados este mes</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        label={tab === 'ingresos' ? 'Ingreso' : 'Gasto'}
        style={[styles.fab, { backgroundColor: tab === 'ingresos' ? Colors.success : Colors.error }]}
        color={Colors.white}
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
    padding: 10,
  },
  summaryLabel: {
    color: Colors.white,
    fontSize: 12,
    marginTop: 4,
  },
  summaryValue: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceCard: {
    marginHorizontal: 12,
    borderRadius: 12,
    elevation: 2,
  },
  balanceContent: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 2,
  },
  balanceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabRow: {
    flexDirection: 'row',
    margin: 12,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  tabButtonActiveIngresos: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  tabButtonActiveGastos: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  tabLabelActive: {
    color: Colors.white,
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
    gap: 12,
  },
  itemIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
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
  itemDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  itemDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemMonto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 8,
  },
  empty: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
