import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';

// Hooks y servicios
import { useMiembros } from '../../hooks/useMiembros';

// Componentes
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Estilos
import { colors } from '../../styles/colors';
import { wp, hp, fontSize, spacing } from '../../utils/dimensions';

// Validaciones
import { validarRUT, formatearRUT, validarEmail, validarTelefono } from '../../utils/validators';

const MiembroFormScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { miembroId, mode = 'create' } = route.params || {};
  
  const isEditMode = mode === 'edit' && miembroId;

  // Hook personalizado de miembros
  const {
    miembroActual,
    loading,
    error,
    getMiembro,
    createNewMiembro,
    updateExistingMiembro,
    clearErrors,
  } = useMiembros();

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    rut: '',
    email: '',
    telefono: '',
    grado: 'aprendiz',
    estado: 'activo',
    fecha_ingreso: new Date(),
    fecha_nacimiento: new Date(),
    direccion: '',
    ciudad_nacimiento: '',
    profesion: '',
    observaciones: '',
  });

  // Estados de UI
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Opciones para los selectores
  const gradosOptions = [
    { value: 'aprendiz', label: 'Aprendiz', icon: 'school' },
    { value: 'companero', label: 'Compañero', icon: 'hammer-wrench' },
    { value: 'maestro', label: 'Maestro', icon: 'crown' },
  ];

  const estadosOptions = [
    { value: 'activo', label: 'Activo', icon: 'check-circle' },
    { value: 'inactivo', label: 'Inactivo', icon: 'pause-circle' },
    { value: 'suspendido', label: 'Suspendido', icon: 'cancel' },
  ];

  // Cargar datos del miembro si es modo edición
  useEffect(() => {
    if (isEditMode) {
      loadMiembroData();
    }
  }, [isEditMode, miembroId]);

  // Llenar formulario con datos del miembro
  useEffect(() => {
    if (isEditMode && miembroActual) {
      setFormData({
        nombres: miembroActual.nombres || '',
        apellidos: miembroActual.apellidos || '',
        rut: miembroActual.rut || '',
        email: miembroActual.email || '',
        telefono: miembroActual.telefono || '',
        grado: miembroActual.grado || 'aprendiz',
        estado: miembroActual.estado || 'activo',
        fecha_ingreso: miembroActual.fecha_ingreso ? new Date(miembroActual.fecha_ingreso) : new Date(),
        fecha_nacimiento: miembroActual.fecha_nacimiento ? new Date(miembroActual.fecha_nacimiento) : new Date(),
        direccion: miembroActual.direccion || '',
        ciudad_nacimiento: miembroActual.ciudad_nacimiento || '',
        profesion: miembroActual.profesion || '',
        observaciones: miembroActual.observaciones || '',
      });
    }
  }, [isEditMode, miembroActual]);

  // Configurar header de navegación
  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Editar Miembro' : 'Nuevo Miembro',
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSave}
          disabled={isSubmitting || loading.create || loading.update}
        >
          {(isSubmitting || loading.create || loading.update) ? (
            <LoadingSpinner size="small" color={colors.primary} />
          ) : (
            <Icon name="check" size={wp(5)} color={colors.primary} />
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, isEditMode, isSubmitting, loading, handleSave]);

  // Cargar datos del miembro
  const loadMiembroData = async () => {
    try {
      await getMiembro(miembroId);
    } catch (error) {
      console.error('Error cargando miembro:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cargar la información del miembro',
      });
      navigation.goBack();
    }
  };

  // Actualizar campo del formulario
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Nombres (requerido)
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    } else if (formData.nombres.trim().length < 2) {
      newErrors.nombres = 'Los nombres deben tener al menos 2 caracteres';
    }

    // Apellidos (requerido)
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    } else if (formData.apellidos.trim().length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }

    // RUT (requerido y válido)
    if (!formData.rut.trim()) {
      newErrors.rut = 'El RUT es requerido';
    } else if (!validarRUT(formData.rut)) {
      newErrors.rut = 'El RUT no es válido';
    }

    // Email (requerido y válido)
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validarEmail(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Teléfono (opcional pero si existe debe ser válido)
    if (formData.telefono.trim() && !validarTelefono(formData.telefono)) {
      newErrors.telefono = 'El teléfono no es válido';
    }

    // Validar fechas
    const hoy = new Date();
    
    if (formData.fecha_nacimiento >= hoy) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento debe ser anterior a hoy';
    }

    if (formData.fecha_ingreso > hoy) {
      newErrors.fecha_ingreso = 'La fecha de ingreso no puede ser futura';
    }

    if (formData.fecha_nacimiento >= formData.fecha_ingreso) {
      newErrors.fecha_ingreso = 'La fecha de ingreso debe ser posterior al nacimiento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar guardado
  const handleSave = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Formulario inválido',
        text2: 'Por favor corrige los errores antes de continuar',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para enviar
      const dataToSend = {
        ...formData,
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        rut: formatearRUT(formData.rut),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
        ciudad_nacimiento: formData.ciudad_nacimiento.trim(),
        profesion: formData.profesion.trim(),
        observaciones: formData.observaciones.trim(),
        fecha_ingreso: formData.fecha_ingreso.toISOString().split('T')[0],
        fecha_nacimiento: formData.fecha_nacimiento.toISOString().split('T')[0],
      };

      if (isEditMode) {
        await updateExistingMiembro(miembroId, dataToSend);
        Toast.show({
          type: 'success',
          text1: 'Miembro actualizado',
          text2: `${formData.nombres} ha sido actualizado exitosamente`,
        });
      } else {
        await createNewMiembro(dataToSend);
        Toast.show({
          type: 'success',
          text1: 'Miembro creado',
          text2: `${formData.nombres} ha sido agregado exitosamente`,
        });
      }

      navigation.goBack();

    } catch (error) {
      console.error('Error guardando miembro:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || `No se pudo ${isEditMode ? 'actualizar' : 'crear'} el miembro`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    Alert.alert(
      'Cancelar',
      '¿Estás seguro de que deseas cancelar? Se perderán todos los cambios no guardados.',
      [
        { text: 'Continuar editando', style: 'cancel' },
        { 
          text: 'Cancelar', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        },
      ]
    );
  };

  // Manejar cambio de fecha
  const handleDateChange = (event, selectedDate, field) => {
    setShowDatePicker(null);
    
    if (selectedDate) {
      updateField(field, selectedDate);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (date) => {
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Renderizar campo de texto
  const renderTextInput = (
    field,
    label,
    placeholder,
    options = {}
  ) => {
    const hasError = !!errors[field];
    
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {label}
          {options.required && <Text style={styles.required}> *</Text>}
        </Text>
        
        <TextInput
          style={[
            styles.textInput,
            hasError && styles.textInputError,
            options.multiline && styles.textInputMultiline,
          ]}
          value={formData[field]}
          onChangeText={(value) => updateField(field, value)}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline={options.multiline}
          numberOfLines={options.numberOfLines || 1}
          keyboardType={options.keyboardType || 'default'}
          autoCapitalize={options.autoCapitalize || 'words'}
          autoCorrect={options.autoCorrect !== false}
          maxLength={options.maxLength}
          editable={!isSubmitting && !loading.create && !loading.update}
        />
        
        {hasError && (
          <Text style={styles.errorText}>{errors[field]}</Text>
        )}
      </View>
    );
  };

  // Renderizar selector (Picker)
  const renderPicker = (field, label, options, required = false) => {
    const hasError = !!errors[field];
    
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        
        <View style={[styles.pickerContainer, hasError && styles.pickerContainerError]}>
          <Picker
            selectedValue={formData[field]}
            onValueChange={(value) => updateField(field, value)}
            style={styles.picker}
            enabled={!isSubmitting && !loading.create && !loading.update}
          >
            {options.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
        
        {hasError && (
          <Text style={styles.errorText}>{errors[field]}</Text>
        )}
      </View>
    );
  };

  // Renderizar selector de fecha
  const renderDatePicker = (field, label, required = false) => {
    const hasError = !!errors[field];
    
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        
        <TouchableOpacity
          style={[
            styles.dateButton,
            hasError && styles.dateButtonError,
          ]}
          onPress={() => setShowDatePicker(field)}
          disabled={isSubmitting || loading.create || loading.update}
        >
          <Icon name="calendar" size={wp(5)} color={colors.textSecondary} />
          <Text style={styles.dateButtonText}>
            {formatDate(formData[field])}
          </Text>
          <Icon name="chevron-down" size={wp(4)} color={colors.textSecondary} />
        </TouchableOpacity>
        
        {showDatePicker === field && (
          <DateTimePicker
            value={formData[field]}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => handleDateChange(event, date, field)}
            maximumDate={field === 'fecha_nacimiento' ? new Date() : undefined}
          />
        )}
        
        {hasError && (
          <Text style={styles.errorText}>{errors[field]}</Text>
        )}
      </View>
    );
  };

  // Estado de carga inicial
  if (isEditMode && loading.detail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Cargando información del miembro...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Información básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Básica</Text>
            
            {renderTextInput(
              'nombres',
              'Nombres',
              'Ingresa los nombres',
              { required: true, maxLength: 100 }
            )}
            
            {renderTextInput(
              'apellidos',
              'Apellidos',
              'Ingresa los apellidos',
              { required: true, maxLength: 100 }
            )}
            
            {renderTextInput(
              'rut',
              'RUT',
              'Ej: 12.345.678-9',
              { 
                required: true, 
                maxLength: 12,
                autoCapitalize: 'none',
                keyboardType: 'numeric'
              }
            )}
          </View>

          {/* Información de contacto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de Contacto</Text>
            
            {renderTextInput(
              'email',
              'Correo Electrónico',
              'ejemplo@correo.com',
              { 
                required: true,
                keyboardType: 'email-address',
                autoCapitalize: 'none',
                autoCorrect: false,
                maxLength: 255
              }
            )}
            
            {renderTextInput(
              'telefono',
              'Teléfono',
              '+56 9 1234 5678',
              { 
                keyboardType: 'phone-pad',
                maxLength: 20
              }
            )}
            
            {renderTextInput(
              'direccion',
              'Dirección',
              'Calle, número, comuna, ciudad',
              { 
                multiline: true,
                numberOfLines: 2,
                maxLength: 500
              }
            )}
            
            {renderTextInput(
              'ciudad_nacimiento',
              'Ciudad de Nacimiento',
              'Ciudad donde nació',
              { maxLength: 100 }
            )}
          </View>

          {/* Información personal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            
            {renderDatePicker('fecha_nacimiento', 'Fecha de Nacimiento', true)}
            
            {renderTextInput(
              'profesion',
              'Profesión',
              'Ocupación o profesión',
              { maxLength: 100 }
            )}
          </View>

          {/* Información masónica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Masónica</Text>
            
            {renderPicker('grado', 'Grado Masónico', gradosOptions, true)}
            
            {renderPicker('estado', 'Estado del Miembro', estadosOptions, true)}
            
            {renderDatePicker('fecha_ingreso', 'Fecha de Ingreso', true)}
          </View>

          {/* Observaciones */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observaciones</Text>
            
            {renderTextInput(
              'observaciones',
              'Observaciones',
              'Notas adicionales sobre el miembro...',
              { 
                multiline: true,
                numberOfLines: 4,
                maxLength: 1000
              }
            )}
          </View>

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isSubmitting || loading.create || loading.update}
            >
              <Icon name="close" size={wp(4)} color={colors.textSecondary} />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button, 
                styles.saveButton,
                (isSubmitting || loading.create || loading.update) && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={isSubmitting || loading.create || loading.update}
            >
              {(isSubmitting || loading.create || loading.update) ? (
                <LoadingSpinner size="small" color={colors.white} />
              ) : (
                <Icon name="check" size={wp(4)} color={colors.white} />
              )}
              <Text style={styles.saveButtonText}>
                {isEditMode ? 'Actualizar' : 'Crear'} Miembro
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Toast */}
        <Toast />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: spacing.xl,
  },

  // Header button
  headerButton: {
    padding: spacing.sm,
    borderRadius: wp(2),
  },

  // Secciones
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: wp(3),
    padding: spacing.md,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Inputs
  inputContainer: {
    marginBottom: spacing.md,
  },

  inputLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  required: {
    color: colors.error,
  },

  textInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: wp(2),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    minHeight: hp(6),
  },

  textInputError: {
    borderColor: colors.error,
  },

  textInputMultiline: {
    minHeight: hp(12),
    textAlignVertical: 'top',
  },

  // Picker
  pickerContainer: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: wp(2),
    overflow: 'hidden',
  },

  pickerContainerError: {
    borderColor: colors.error,
  },

  picker: {
    height: hp(6),
    color: colors.textPrimary,
  },

  // Date picker
  dateButton: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: wp(2),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: hp(6),
  },

  dateButtonError: {
    borderColor: colors.error,
  },

  dateButtonText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    flex: 1,
    marginLeft: spacing.sm,
  },

  // Error
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },

  // Botones de acción
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },

  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: wp(2),
    gap: spacing.sm,
  },

  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  saveButton: {
    backgroundColor: colors.primary,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  saveButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },

  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default MiembroFormScreen;