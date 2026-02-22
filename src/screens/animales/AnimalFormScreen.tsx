import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, HelperText, SegmentedButtons } from 'react-native-paper';
import { useAnimales } from '@/database/hooks/useAnimales';
import { Colors } from '@/constants/colors';
import { RAZAS_GANADO, ESTADOS_ANIMAL } from '@/constants/categories';
import type { AnimalesScreenProps } from '@/navigation/types';
import type { AnimalInput } from '@/database/models/Animal';

export function AnimalFormScreen({ route, navigation }: AnimalesScreenProps<'AnimalForm'>) {
  const editId = route.params?.id;
  const { createAnimal, updateAnimal, getAnimal } = useAnimales();

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [sexo, setSexo] = useState<'H' | 'M'>('H');
  const [estado, setEstado] = useState('activo');
  const [peso, setPeso] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editId) {
      getAnimal(editId).then((animal) => {
        if (animal) {
          setCodigo(animal.codigo);
          setNombre(animal.nombre || '');
          setRaza(animal.raza);
          setSexo(animal.sexo as 'H' | 'M');
          setEstado(animal.estado);
          setPeso(animal.peso_actual?.toString() || '');
          setFechaNacimiento(animal.fecha_nacimiento || '');
          setNotas(animal.notas || '');
        }
      });
    }
  }, [editId, getAnimal]);

  const handleSave = async () => {
    if (!codigo.trim()) {
      setError('El c\u00f3digo es obligatorio');
      return;
    }
    if (!raza.trim()) {
      setError('La raza es obligatoria');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data: AnimalInput = {
        codigo: codigo.trim(),
        nombre: nombre.trim() || null,
        raza: raza.trim(),
        sexo,
        estado: estado as AnimalInput['estado'],
        peso_actual: peso ? parseFloat(peso) : null,
        fecha_nacimiento: fechaNacimiento.trim() || null,
        id_madre: null,
        id_padre: null,
        foto_uri: null,
        notas: notas.trim() || null,
      };

      if (editId) {
        await updateAnimal(editId, data);
      } else {
        await createAnimal(data);
      }
      navigation.goBack();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      if (message.includes('UNIQUE')) {
        setError('Ya existe un animal con este c\u00f3digo');
      } else {
        setError(`Error al guardar: ${message}`);
      }
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
          label="Código / Arete *"
          value={codigo}
          onChangeText={setCodigo}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="tag" />}
        />

        <TextInput
          label="Nombre (opcional)"
          value={nombre}
          onChangeText={setNombre}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="label-outline" />}
        />

        <TextInput
          label="Raza *"
          value={raza}
          onChangeText={setRaza}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="cow" />}
        />

        <SegmentedButtons
          value={sexo}
          onValueChange={(val) => setSexo(val as 'H' | 'M')}
          buttons={[
            { value: 'H', label: 'Hembra' },
            { value: 'M', label: 'Macho' },
          ]}
          style={styles.segmented}
        />

        <TextInput
          label="Peso actual (kg)"
          value={peso}
          onChangeText={setPeso}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          left={<TextInput.Icon icon="weight-kilogram" />}
        />

        <TextInput
          label="Fecha nacimiento (AAAA-MM-DD)"
          value={fechaNacimiento}
          onChangeText={setFechaNacimiento}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="calendar" />}
          placeholder="2023-01-15"
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

        {error ? (
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
          icon="content-save"
        >
          {editId ? 'Actualizar' : 'Guardar Animal'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 16,
    gap: 4,
  },
  input: {
    marginBottom: 8,
  },
  segmented: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    height: 52,
  },
});
