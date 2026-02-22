import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, TextInput, Button, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSQLiteContext } from 'expo-sqlite';
import { ProduccionRepository } from '@/database/repositories/ProduccionRepository';
import { Colors } from '@/constants/colors';
import { getToday, getCurrentMonthRange } from '@/utils/dateUtils';
import { formatLiters, formatCurrency } from '@/utils/formatters';
import type { ProduccionScreenProps } from '@/navigation/types';

export function ProduccionDiariaScreen({ navigation }: ProduccionScreenProps<'ProduccionDiaria'>) {
  const db = useSQLiteContext();
  const [fecha, setFecha] = useState(getToday());
  const [litrosTotal, setLitrosTotal] = useState('');
  const [precioLitro, setPrecioLitro] = useState('');
  const [produccionMes, setProduccionMes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const repo = new ProduccionRepository(db);

      // Cargar registro del día si existe
      const registros = await repo.getByFecha(fecha);
      if (registros.length > 0) {
        const reg = registros[0];
        setLitrosTotal(reg.total > 0 ? reg.total.toString() : '');
      } else {
        setLitrosTotal('');
      }

      // Total del mes
      const { start, end } = getCurrentMonthRange();
      const totalMes = await repo.getTotalByRango(start, end);
      setProduccionMes(totalMes);

      // Cargar precio guardado
      const precioGuardado = await db.getFirstAsync<{ value: string }>(
        `SELECT value FROM configuracion WHERE key = 'precio_litro'`
      ).catch(() => null);
      if (precioGuardado) {
        setPrecioLitro(precioGuardado.value);
      }

      setSaved(false);
    } finally {
      setLoading(false);
    }
  }, [db, fecha]);

  useFocusEffect(
    useCallback(() => {
      db.execAsync(`
        CREATE TABLE IF NOT EXISTS configuracion (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `).then(() => loadData());
    }, [loadData, db])
  );

  const handleSave = async () => {
    const total = parseFloat(litrosTotal) || 0;

    if (total <= 0) {
      Alert.alert('Atención', 'Ingresa la producción del día');
      return;
    }

    setLoading(true);
    try {
      const repo = new ProduccionRepository(db);
      await repo.upsert({
        id_animal: 'LOTE_GENERAL',
        fecha,
        litros_manana: 0,
        litros_tarde: 0,
        notas: null,
      });

      // Actualizar el total directamente
      await db.runAsync(
        `UPDATE produccion SET total = ?, updated_at = datetime('now'), synced = 0
         WHERE id_animal = 'LOTE_GENERAL' AND fecha = ? AND deleted = 0`,
        [total, fecha]
      );

      // Guardar precio si se ingresó
      if (precioLitro) {
        await db.runAsync(
          `INSERT OR REPLACE INTO configuracion (key, value) VALUES ('precio_litro', ?)`,
          [precioLitro]
        );
      }

      const { start, end } = getCurrentMonthRange();
      const totalMes = await repo.getTotalByRango(start, end);
      setProduccionMes(totalMes);

      setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  const totalHoy = parseFloat(litrosTotal) || 0;
  const precio = parseFloat(precioLitro) || 0;
  const ingresoEstimadoHoy = totalHoy * precio;
  const ingresoEstimadoMes = produccionMes * precio;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="water-outline" size={22} color={Colors.white} />
        <Text style={styles.headerTitle}>Producción Diaria</Text>
        <Text style={styles.headerDate}>{fecha}</Text>
      </View>

      {/* Registro del día */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="water" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Registro del Día</Text>
          </View>
          <Divider style={styles.divider} />

          <Text style={styles.inputLabel}>Producción total del lote (litros)</Text>
          <TextInput
            value={litrosTotal}
            onChangeText={(val) => { setLitrosTotal(val); setSaved(false); }}
            mode="outlined"
            keyboardType="numeric"
            placeholder="0.0"
            style={styles.bigInput}
            contentStyle={styles.bigInputContent}
            left={<TextInput.Icon icon="water" />}
          />

          {totalHoy > 0 && (
            <View style={styles.totalRow}>
              <Icon name="check-circle" size={20} color={Colors.primaryDark} />
              <Text style={styles.totalLabel}>Total del día:</Text>
              <Text style={styles.totalValue}>{formatLiters(totalHoy)}</Text>
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            icon={saved ? 'check-circle' : 'content-save'}
          >
            {saved ? 'Guardado' : 'Guardar Producción'}
          </Button>
        </Card.Content>
      </Card>

      {/* Precio y estimación */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="currency-usd" size={20} color={Colors.success} />
            <Text style={styles.sectionTitle}>Estimación de Ingresos</Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.precioRow}>
            <Icon name="tag-outline" size={18} color={Colors.secondary} />
            <Text style={styles.precioLabel}>Precio por litro:</Text>
            <TextInput
              value={precioLitro}
              onChangeText={setPrecioLitro}
              mode="outlined"
              keyboardType="numeric"
              placeholder="0.00"
              dense
              style={styles.precioInput}
              left={<TextInput.Icon icon="cash" />}
            />
          </View>

          {precio > 0 && (
            <>
              <View style={styles.estimacionRow}>
                <View style={styles.estimacionItem}>
                  <Icon name="calendar-today" size={16} color={Colors.info} />
                  <Text style={styles.estimacionLabel}>Hoy</Text>
                  <Text style={styles.estimacionValue}>{formatCurrency(ingresoEstimadoHoy)}</Text>
                </View>
                <View style={styles.estimacionItem}>
                  <Icon name="calendar-month" size={16} color={Colors.success} />
                  <Text style={styles.estimacionLabel}>Mes</Text>
                  <Text style={styles.estimacionValueBig}>{formatCurrency(ingresoEstimadoMes)}</Text>
                </View>
              </View>

              <View style={styles.produccionMesRow}>
                <Icon name="water" size={16} color={Colors.primary} />
                <Text style={styles.produccionMesLabel}>Producción acumulada del mes:</Text>
                <Text style={styles.produccionMesValue}>{formatLiters(produccionMes)}</Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Botón historial */}
      <Button
        mode="outlined"
        icon="history"
        onPress={() => navigation.navigate('ProduccionHistorial')}
        style={styles.historyButton}
        contentStyle={styles.historyButtonContent}
      >
        Ver Historial de Producción
      </Button>

      <View style={{ height: 32 }} />
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
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    paddingTop: 12,
    gap: 8,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  headerDate: {
    color: Colors.primaryContainer,
    fontSize: 14,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    elevation: 2,
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
  },
  divider: {
    marginVertical: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  bigInput: {
    fontSize: 20,
  },
  bigInputContent: {
    height: 56,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 8,
    gap: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primaryDark,
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  saveButtonContent: {
    height: 52,
  },
  precioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  precioLabel: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  precioInput: {
    width: 140,
  },
  estimacionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  estimacionItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    gap: 4,
  },
  estimacionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  estimacionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.success,
  },
  estimacionValueBig: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success,
  },
  produccionMesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  produccionMesLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  produccionMesValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  historyButton: {
    margin: 16,
    borderRadius: 8,
    borderColor: Colors.primary,
  },
  historyButtonContent: {
    height: 48,
  },
});
