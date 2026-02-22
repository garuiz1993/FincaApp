import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, HelperText, Text, TouchableRipple } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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

        <Text style={styles.fieldLabel}>Categor\u00eda del gasto</Text>
        <View style={styles.catGrid}>
          {CATEGORIAS_GASTO.map((c) => (
            <TouchableRipple
              key={c.value}
              onPress={() => setCategoria(c.value)}
              style={[
                styles.catCard,
                categoria === c.value && styles.catCardActive,
              ]}
              borderless
            >
              <View style={styles.catCardInner}>
                <View style={[
                  styles.catIconCircle,
                  categoria === c.value && styles.catIconCircleActive,
                ]}>
                  <Icon
                    name={c.icon}
                    size={24}
                    color={categoria === c.value ? Colors.white : Colors.error}
                  />
                </View>
                <Text
                  style={[
                    styles.catLabel,
                    categoria === c.value && styles.catLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {c.label}
                </Text>
              </View>
            </TouchableRipple>
          ))}
        </View>

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
          label="Descripci\u00f3n"
          value={descripcion}
          onChangeText={setDescripcion}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="text" />}
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
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  catCard: {
    width: '30%',
    flexGrow: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.errorContainer,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    elevation: 1,
  },
  catCardActive: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorContainer,
    elevation: 3,
  },
  catCardInner: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 6,
  },
  catIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.errorContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catIconCircleActive: {
    backgroundColor: Colors.error,
  },
  catLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  catLabelActive: {
    fontWeight: 'bold',
    color: Colors.error,
  },
  button: { marginTop: 16, borderRadius: 8 },
  buttonContent: { height: 52 },
});
