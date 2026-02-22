import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, TextInput, Button, Divider, IconButton } from 'react-native-paper';
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
  const [litrosManana, setLitrosManana] = useState('');
  const [litrosTarde, setLitrosTarde] = useState('');
  const [precioLitro, setPrecioLitro] = useState('');
  const [totalDia, setTotalDia] = useState(0);
  const [produccionMes, setProduccionMes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const repo = new ProduccionRepository(db);

      // Cargar registro del dia si existe
      const registros = await repo.getByFecha(fecha);
      if (registros.length > 0) {
        const reg = registros[0];
        setLitrosManana(reg.litros_manana > 0 ? reg.litros_manana.toString() : '');
        setLitrosTarde(reg.litros_tarde > 0 ? reg.litros_tarde.toString() : '');
      } else {
        setLitrosManana('');
        setLitrosTarde('');
      }

      // Total del dia
      const total = await repo.getTotalByFecha(fecha);
      setTotalDia(total);

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
      // Crear tabla configuracion si no existe
      db.execAsync(`
        CREATE TABLE IF NOT EXISTS configuracion (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `).then(() => loadData());
    }, [loadData, db])
  );

  const handleSave = async () => {
    const manana = parseFloat(litrosManana) || 0;
    const tarde = parseFloat(litrosTarde) || 0;

    if (manana === 0 && tarde === 0) {
      Alert.alert('Atenci\u00f3n', 'Ingresa al menos un valor de producci\u00f3n');
      return;
    }

    setLoading(true);
    try {
      const repo = new ProduccionRepository(db);
      // Usar un ID general "LOTE" para produccion general
      await repo.upsert({
        id_animal: 'LOTE_GENERAL',
        fecha,
        litros_manana: manana,
        litros_tarde: tarde,
        notas: null,
      });

      // Guardar precio si se ingreso
      if (precioLitro) {
        await db.runAsync(
          `INSERT OR REPLACE INTO configuracion (key, value) VALUES ('precio_litro', ?)`,
          [precioLitro]
        );
      }

      const total = await repo.getTotalByFecha(fecha);
      setTotalDia(total);

      const { start, end } = getCurrentMonthRange();
      const totalMes = await repo.getTotalByRango(start, end);
      setProduccionMes(totalMes);

      setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  const totalHoy = (parseFloat(litrosManana) || 0) + (parseFloat(litrosTarde) || 0);
  const precio = parseFloat(precioLitro) || 0;
  const ingresoEstimadoHoy = totalHoy * precio;
  const { start, end } = getCurrentMonthRange();
  const ingresoEstimadoMes = produccionMes * precio;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="water-outline" size={22} color={Colors.white} />
        <Text style={styles.headerTitle}>Producci\u00f3n Diaria</Text>
        <Text style={styles.headerDate}>{fecha}</Text>
      </View>

      {/* Registro del dia */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="clock-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Registro del D\u00eda</Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Icon name="weather-sunny" size={16} color={Colors.warning} />
                <Text style={styles.inputLabel}>Ma\u00f1ana (L)</Text>
              </View>
              <TextInput
                value={litrosManana}
                onChangeText={setLitrosManana}
                mode="outlined"
                keyboardType="numeric"
                placeholder="0.0"
                style={styles.bigInput}
                contentStyle={styles.bigInputContent}
              />
            </View>
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Icon name="weather-night" size={16} color={Colors.info} />
                <Text style={styles.inputLabel}>Tarde (L)</Text>
              </View>
              <TextInput
                value={litrosTarde}
                onChangeText={setLitrosTarde}
                mode="outlined"
                keyboardType="numeric"
                placeholder="0.0"
                style={styles.bigInput}
                contentStyle={styles.bigInputContent}
              />
            </View>
          </View>

          <View style={styles.totalRow}>
            <Icon name="sigma" size={20} color={Colors.primary} />
            <Text style={styles.totalLabel}>Total del d\u00eda:</Text>
            <Text style={styles.totalValue}>{formatLiters(totalHoy)}</Text>
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            icon={saved ? 'check-circle' : 'content-save'}
          >
            {saved ? 'Guardado' : 'Guardar Producci\u00f3n'}
          </Button>
        </Card.Content>
      </Card>

      {/* Precio y estimacion */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="currency-usd" size={20} color={Colors.success} />
            <Text style={styles.sectionTitle}>Estimaci\u00f3n de Ingresos</Text>
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
                <Text style={styles.produccionMesLabel}>Producci\u00f3n acumulada del mes:</Text>
                <Text style={styles.produccionMesValue}>{formatLiters(produccionMes)}</Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Boton historial */}
      <Button
        mode="outlined"
        icon="history"
        onPress={() => navigation.navigate('ProduccionHistorial')}
        style={styles.historyButton}
        contentStyle={styles.historyButtonContent}
      >
        Ver Historial de Producci\u00f3n
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  bigInput: {
    fontSize: 20,
  },
  bigInputContent: {
    height: 52,
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
