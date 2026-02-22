import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, HelperText, Text, TouchableRipple } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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

        <Text style={styles.fieldLabel}>Tipo de ingreso</Text>
        <View style={styles.tipoGrid}>
          {TIPOS_INGRESO.map((t) => (
            <TouchableRipple
              key={t.value}
              onPress={() => setTipo(t.value)}
              style={[
                styles.tipoCard,
                tipo === t.value && styles.tipoCardActive,
              ]}
              borderless
            >
              <View style={styles.tipoCardInner}>
                <View style={[
                  styles.tipoIconCircle,
                  tipo === t.value && styles.tipoIconCircleActive,
                ]}>
                  <Icon
                    name={t.icon}
                    size={28}
                    color={tipo === t.value ? Colors.white : Colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.tipoLabel,
                    tipo === t.value && styles.tipoLabelActive,
                  ]}
                  numberOfLines={2}
                >
                  {t.label}
                </Text>
              </View>
            </TouchableRipple>
          ))}
        </View>

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
          left={<TextInput.Icon icon="text" />}
        />

        <View style={styles.row}>
          <TextInput
            label="Cantidad"
            value={cantidad}
            onChangeText={setCantidad}
            mode="outlined"
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
            left={<TextInput.Icon icon="numeric" />}
          />
          <TextInput
            label="Precio unit."
            value={precioUnitario}
            onChangeText={setPrecioUnitario}
            mode="outlined"
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
            left={<TextInput.Icon icon="tag-outline" />}
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
          left={<TextInput.Icon icon="note-text" />}
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
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  tipoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  tipoCard: {
    width: '47%',
    flexGrow: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primaryContainer,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    elevation: 1,
  },
  tipoCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryContainer,
    elevation: 3,
  },
  tipoCardInner: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 8,
  },
  tipoIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipoIconCircleActive: {
    backgroundColor: Colors.primary,
  },
  tipoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  tipoLabelActive: {
    color: Colors.primaryDark,
    fontWeight: 'bold',
  },
  row: { flexDirection: 'row', gap: 8 },
  halfInput: { flex: 1 },
  button: { marginTop: 16, borderRadius: 8 },
  buttonContent: { height: 52 },
});
