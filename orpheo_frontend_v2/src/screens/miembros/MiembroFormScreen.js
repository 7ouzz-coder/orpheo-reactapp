// src/screens/miembros/MiembroFormScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Redux
import { createMiembro, updateMiembro } from '../../store/slices/miembrosSlice';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

const MiembroFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  const miembro = route.params?.miembro;
  const isEditing = !!miembro;

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombres: miembro?.nombres || '',
    apellidos: miembro?.apellidos || '',
    rut: miembro?.rut || '',
    email: miembro?.email || '',
    telefono: miembro?.telefono || '',
    direccion: miembro?.direccion || '',
    fecha_nacimiento: miembro?.fecha_nacimiento || '',
    grado: miembro?.grado || 'aprendiz',
    estado: miembro?.estado || 'activo',
    fecha_iniciacion: miembro?.fecha_iniciacion || '',
    fecha_exaltacion: miembro?.fecha_exaltacion || '',
    padrino: miembro?.padrino || '',
    profesion: miembro?.profesion || '',
    empresa: miembro?.empresa || '',
    educacion: miembro?.educacion || '',
    observaciones: miembro?.observaciones || '',
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }

    if (!formData.rut.trim()) {
      newErrors.rut = 'El RUT es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
      return;
    }

    setSaving(true);
    
    try {
      if (isEditing) {
        await dispatch(updateMiembro({ 
          id: miembro.id, 
          data: formData 
        })).unwrap();
        Alert.alert('Éxito', 'Miembro actualizado correctamente');
      } else {
        await dispatch(createMiembro(formData)).unwrap();
        Alert.alert('Éxito', 'Miembro creado correctamente');
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error || 'No se pudo guardar el miembro');
    } finally {
      setSaving(false);
    }
  };

  // Actualizar campo del formulario
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Componente de campo de entrada
  const FormField = ({ 
    label, 
    field, 
    placeholder, 
    keyboardType = 'default',
    multiline = false,
    numberOfLines = 1,
    required = false 
  }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.textInputMultiline,
          errors[field] && styles.textInputError
        ]}
        value={formData[field]}
        onChangeText={(value) => updateField(field, value)}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoCapitalize={field === 'email' ? 'none' : 'words'}
        autoCorrect={false}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  // Componente de selector
  const FormSelector = ({ label, field, options, required = false }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.selectorContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectorOption,
              formData[field] === option.value && styles.selectorOptionActive
            ]}
            onPress={() => updateField(field, option.value)}
          >
            <Text style={[
              styles.selectorOptionText,
              formData[field] === option.value && styles.selectorOptionTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.safeContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Miembro' : 'Nuevo Miembro'}
          </Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={saving}
          >
            <Text style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Información Personal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            
            <FormField
              label="Nombres"
              field="nombres"
              placeholder="Ej: Juan Carlos"
              required
            />
            
            <FormField
              label="Apellidos"
              field="apellidos"
              placeholder="Ej: Pérez González"
              required
            />
            
            <FormField
              label="RUT"
              field="rut"
              placeholder="Ej: 12.345.678-9"
              required
            />
            
            <FormField
              label="Email"
              field="email"
              placeholder="Ej: juan@email.com"
              keyboardType="email-address"
              required
            />
            
            <FormField
              label="Teléfono"
              field="telefono"
              placeholder="Ej: +56 9 1234 5678"
              keyboardType="phone-pad"
            />
            
            <FormField
              label="Dirección"
              field="direccion"
              placeholder="Ej: Av. Principal 123, Santiago"
              multiline
              numberOfLines={2}
            />
            
            <FormField
              label="Fecha de Nacimiento"
              field="fecha_nacimiento"
              placeholder="Ej: 1980-05-15"
            />
          </View>

          {/* Información Masónica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Masónica</Text>
            
            <FormSelector
              label="Grado"
              field="grado"
              options={[
                { value: 'aprendiz', label: 'Aprendiz' },
                { value: 'companero', label: 'Compañero' },
                { value: 'maestro', label: 'Maestro' },
              ]}
              required
            />
            
            <FormSelector
              label="Estado"
              field="estado"
              options={[
                { value: 'activo', label: 'Activo' },
                { value: 'inactivo', label: 'Inactivo' },
                { value: 'suspendido', label: 'Suspendido' },
              ]}
              required
            />
            
            <FormField
              label="Fecha de Iniciación"
              field="fecha_iniciacion"
              placeholder="Ej: 2020-03-15"
            />
            
            <FormField
              label="Fecha de Exaltación"
              field="fecha_exaltacion"
              placeholder="Ej: 2022-06-20"
            />
            
            <FormField
              label="Padrino"
              field="padrino"
              placeholder="Nombre del padrino masónico"
            />
          </View>

          {/* Información Profesional */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Profesional</Text>
            
            <FormField
              label="Profesión"
              field="profesion"
              placeholder="Ej: Ingeniero Civil"
            />
            
            <FormField
              label="Empresa"
              field="empresa"
              placeholder="Ej: Empresa XYZ S.A."
            />
            
            <FormField
              label="Educación"
              field="educacion"
              placeholder="Ej: Universitaria Completa"
            />
          </View>

          {/* Observaciones */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observaciones</Text>
            
            <FormField
              label="Observaciones"
              field="observaciones"
              placeholder="Notas adicionales sobre el miembro..."
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Espaciado final */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  saveButtonDisabled: {
    color: colors.disabled,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  textInputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  selectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectorOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  selectorOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectorOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  selectorOptionTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
});

export default MiembroFormScreen;