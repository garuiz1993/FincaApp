import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, HelperText, SegmentedButtons } from 'react-native-paper';
import { useFinanzas } from '@/database/hooks/useFinanzas';
import { Colors } from '@/constants/colors';
import { getToday } from '@/utils/dateUtils';
import { CATEGORIAS_GASTO } from '@/constants/categories';
import type { FinanzasScreenProps } from '@/navigation/types';

export function GastoFormScreen({ navigation }: FinanzasScreenProps<'GastoForm'>) {
  const { createGasto } = useFinanzas();
  const [fecha, setFecha] = useState(getToday());
  const [categoria, setCategoria] = useState('alimentacion');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!monto.trim() || parseFloat(monto) <= 0) {
      setError('El monto es obligatorio y debe ser mayor a 0');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await createGasto({
        fecha,
        categoria: categoria as 'alimentacion' | 'salud' | 'mano_obra' | 'mantenimiento' | 'servicios' | 'inversion' | 'otro',
        descripcion: descripcion.trim() || null,
        monto: parseFloat(monto),
        proveedor: proveedor.trim() || null,
        notas: notas.trim() || null,
      });
      navigation.goBack();
    } catch {
      setError('Error al guardar el gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TextInput
          label="Fecha"
          value={fecha}
          onChangeText={setFecha}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="calendar" />}
        />

        <SegmentedButtons
          value={categoria}
          onValueChange={setCategoria}
          buttons={CATEGORIAS_GASTO.slice(0, 4).map((c) => ({ value: c.value, label: c.label }))}
          style={styles.segmented}
          density="small"
        />

        <TextInput
          label="Monto *"
          value={monto}
          onChangeText={setMonto}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          left={<TextInput.Icon icon="cash" />}
        />

        <TextInput
          label="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Proveedor"
          value={proveedor}
          onChangeText={setProveedor}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="store" />}
        />

        <TextInput
          label="Notas"
          value={notas}
          onChangeText={setNotas}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        {error ? <HelperText type="error" visible>{error}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
          icon="content-save"
        >
          Guardar Gasto
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 16 },
  input: { marginBottom: 10 },
  segmented: { marginBottom: 12 },
  button: { marginTop: 16, borderRadius: 8 },
  buttonContent: { height: 52 },
});
