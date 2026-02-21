import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '@/constants/colors';
import { SyncStatusBadge } from '@/components/common/SyncStatusBadge';
import { ProduccionRepository } from '@/database/repositories/ProduccionRepository';
import { AnimalRepository } from '@/database/repositories/AnimalRepository';
import { IngresoRepository } from '@/database/repositories/IngresoRepository';
import { GastoRepository } from '@/database/repositories/GastoRepository';
import { getToday, getCurrentMonthRange } from '@/utils/dateUtils';
import { formatLiters, formatCurrency } from '@/utils/formatters';

export function HomeScreen() {
  const db = useSQLiteContext();
  const [totalHoy, setTotalHoy] = useState(0);
  const [totalAnimales, setTotalAnimales] = useState(0);
  const [ingresosMes, setIngresosMes] = useState(0);
  const [gastosMes, setGastosMes] = useState(0);
  const [produccionMes, setProduccionMes] = useState(0);

  const loadDashboard = useCallback(async () => {
    const prodRepo = new ProduccionRepository(db);
    const animalRepo = new AnimalRepository(db);
    const ingresoRepo = new IngresoRepository(db);
    const gastoRepo = new GastoRepository(db);

    const hoy = getToday();
    const { start, end } = getCurrentMonthRange();

    const [todayTotal, animalesCount, ingTotal, gastTotal, prodMes] = await Promise.all([
      prodRepo.getTotalByFecha(hoy),
      animalRepo.count(),
      ingresoRepo.getTotalByRango(start, end),
      gastoRepo.getTotalByRango(start, end),
      prodRepo.getTotalByRango(start, end),
    ]);

    setTotalHoy(todayTotal);
    setTotalAnimales(animalesCount);
    setIngresosMes(ingTotal);
    setGastosMes(gastTotal);
    setProduccionMes(prodMes);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const balance = ingresosMes - gastosMes;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>FincaApp</Text>
          <Text style={styles.date}>Gestión Agropecuaria</Text>
        </View>
        <SyncStatusBadge />
      </View>

      {/* Producción de hoy */}
      <Card style={styles.cardPrimary}>
        <Card.Content style={styles.cardRow}>
          <View style={styles.cardIconContainer}>
            <Icon name="water" size={32} color={Colors.white} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardLabel}>Producción Hoy</Text>
            <Text style={styles.cardValueBig}>{formatLiters(totalHoy)}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Estadísticas rápidas */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="cow" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{totalAnimales}</Text>
            <Text style={styles.statLabel}>Animales</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="water" size={24} color={Colors.info} />
            <Text style={styles.statValue}>{formatLiters(produccionMes)}</Text>
            <Text style={styles.statLabel}>Mes</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Resumen financiero */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Resumen Financiero del Mes</Text>
          <Divider style={styles.divider} />
          <View style={styles.financeRow}>
            <View style={styles.financeItem}>
              <Icon name="arrow-up-circle" size={20} color={Colors.success} />
              <Text style={styles.financeLabel}>Ingresos</Text>
              <Text style={[styles.financeValue, { color: Colors.success }]}>
                {formatCurrency(ingresosMes)}
              </Text>
            </View>
            <View style={styles.financeItem}>
              <Icon name="arrow-down-circle" size={20} color={Colors.error} />
              <Text style={styles.financeLabel}>Gastos</Text>
              <Text style={[styles.financeValue, { color: Colors.error }]}>
                {formatCurrency(gastosMes)}
              </Text>
            </View>
            <View style={styles.financeItem}>
              <Icon name="scale-balance" size={20} color={balance >= 0 ? Colors.success : Colors.error} />
              <Text style={styles.financeLabel}>Balance</Text>
              <Text style={[styles.financeValue, { color: balance >= 0 ? Colors.success : Colors.error }]}>
                {formatCurrency(balance)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.primary,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  date: {
    fontSize: 14,
    color: Colors.primaryContainer,
    marginTop: 2,
  },
  cardPrimary: {
    margin: 16,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    elevation: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: Colors.primaryContainer,
  },
  cardValueBig: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  divider: {
    marginVertical: 12,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financeItem: {
    alignItems: 'center',
    flex: 1,
  },
  financeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  financeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  bottomSpace: {
    height: 24,
  },
});
