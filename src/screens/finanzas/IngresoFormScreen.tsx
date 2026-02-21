import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, HelperText, SegmentedButtons } from 'react-native-paper';
import { useFinanzas } from '@/database/hooks/useFinanzas';
import { Colors } from '@/constants/colors';
import { getToday } from '@/utils/dateUtils';
import { TIPOS_INGRESO } from '@/constants/categories';
import type { FinanzasScreenProps } from '@/navigation/types';

export function IngresoFormScreen({ navigation }: FinanzasScreenProps<'IngresoForm'>) {
  const { createIngreso } = useFinanzas();
  const [fecha, setFecha] = useState(getToday());
  const [tipo, setTipo] = useState('venta_leche');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
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
      await createIngreso({
        fecha,
        tipo: tipo as 'venta_leche' | 'venta_animal' | 'venta_subproducto' | 'otro',
        descripcion: descripcion.trim() || null,
        monto: parseFloat(monto),
        cantidad: cantidad ? parseFloat(cantidad) : null,
        precio_unitario: precioUnitario ? parseFloat(precioUnitario) : null,
        notas: notas.trim() || null,
      });
      navigation.goBack();
    } catch {
      setError('Error al guardar el ingreso');
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
          value={tipo}
          onValueChange={setTipo}
          buttons={TIPOS_INGRESO.map((t) => ({ value: t.value, label: t.label }))}
          style={styles.segmented}
          density="small"
        />

        <TextInput
          label="Monto total *"
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

        <View style={styles.row}>
          <TextInput
            label="Cantidad"
            value={cantidad}
            onChangeText={setCantidad}
            mode="outlined"
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
          />
          <TextInput
            label="Precio unit."
            value={precioUnitario}
            onChangeText={setPrecioUnitario}
            mode="outlined"
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
          />
        </View>

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
          Guardar Ingreso
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
  row: { flexDirection: 'row', gap: 8 },
  halfInput: { flex: 1 },
  button: { marginTop: 16, borderRadius: 8 },
  buttonContent: { height: 52 },
});
