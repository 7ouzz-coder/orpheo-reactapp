// src/screens/miembros/MiembroFormScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Redux
import {
  createMiembro,
  updateMiembro,
  fetchMiembroById,
  clearMiembroSeleccionado,
  selectMiembroSeleccionado,
  selectLoadingCreate,
  selectLoadingUpdate,
  selectLoadingDetail,
  selectError,
} from '../../store/slices/miembrosSlice';

// Components
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Services
import { miembrosService } from '../../services/miembrosService';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize } from '../../styles/globalStyles';

// Utils
import { formatRUT } from '../../utils/helpers';

const MiembroFormScreen = ({ route, navigation }) => {
  const { miembroId } = route.params || {};
  const dispatch = useDispatch();
  const isEditing = !!miembroId;

  // Selectores Redux
  const miembro = useSelector(selectMiembroSeleccionado);
  const loadingCreate = useSelector(selectLoadingCreate);
  const loadingUpdate = useSelector(selectLoadingUpdate);
  const loadingDetail = useSelector(selectLoadingDetail);
  const error = useSelector(selectError);

  const loading = loadingCreate || loadingUpdate;

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    rut: '',
    email: '',
    telefono: '',
    grado: 'aprendiz',
    estado: 'activo',
    direccion: '',
    ciudadNacimiento: '',
    profesion: '',
    fechaNacimiento: null,
    fechaIniciacion: null,
    fechaIngreso: null,
  });

  // Estados para validación
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Estados para date pickers
  const [showDatePicker, setShowDatePicker] = useState({
    fechaNacimiento: false,
    fechaIniciacion: false,
    fechaIngreso: false,
  });

  // Cargar miembro si estamos editando
  useEffect(() => {
    if (isEditing) {
      console.log(`✏️ Editando miembro ID: ${miembroId}`);
      dispatch(fetchMiembroById(miembroId));
    } else {
      console.log('➕ Creando nuevo miembro');
    }

    // Configurar título del header
    navigation.setOptions({
      title: isEditing ? 'Editar Miembro' : 'Nuevo Miembro',
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={[styles.headerButton, { opacity: loading ? 0.5 : 1 }]}
        >
          <Text style={styles.headerButtonText}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      ),
    });

    // Limpiar al desmontar
    return () => {
      if (isEditing) {
        dispatch(clearMiembroSeleccionado());
      }
    };
  }, [miembroId, isEditing, navigation, loading]);

  // Llenar formulario cuando se cargue el miembro
  useEffect(() => {
    if (miembro && isEditing) {
      console.log('📝 Llenando formulario con datos del miembro');
      setFormData({
        nombres: miembro.nombres || '',
        apellidos: miembro.apellidos || '',
        rut: miembro.rut || '',
        email: miembro.email || '',
        telefono: miembro.telefono || '',
        grado: miembro.grado || 'aprendiz',
        estado: miembro.estado || 'activo',
        direccion: miembro.direccion || '',
        ciudadNacimiento: miembro.ciudadNacimiento || '',
        profesion: miembro.profesion || '',
        fechaNacimiento: miembro.fechaNacimiento ? new Date(miembro.fechaNacimiento) : null,
        fechaIniciacion: miembro.fechaIniciacion ? new Date(miembro.fechaIniciacion) : null,
        fechaIngreso: miembro.fechaIngreso ? new Date(miembro.fechaIngreso) : null,
      });
    }
  }, [miembro, isEditing]);

  // Manejar cambios en inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Formatear RUT automáticamente
    if (field === 'rut') {
      const formatted = miembrosService.formatRUT(value);
      if (formatted !== value) {
        setFormData(prev => ({ ...prev, [field]: formatted }));
      }
    }
  };

  // Manejar blur de inputs
  const handleInputBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  // Validar campo individual
  const validateField = (field, value) => {
    let error = null;

    switch (field) {
      case 'nombres':
        if (!value?.trim()) {
          error = 'Los nombres son requeridos';
        }
        break;
      case 'apellidos':
        if (!value?.trim()) {
          error = 'Los apellidos son requeridos';
        }
        break;
      case 'rut':
        if (!value?.trim()) {
          error = 'El RUT es requerido';
        } else if (!miembrosService.validateRUT(value)) {
          error = 'El RUT no es válido';
        }
        break;
      case 'email':
        if (value && !miembrosService.validateEmail(value)) {
          error = 'El email no es válido';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  // Validar todo el formulario
  const validateForm = () => {
    const validation = miembrosService.validateMiembroData(formData);
    
    if (!validation.isValid) {
      const newErrors = {};
      validation.errors.forEach(error => {
        if (error.includes('nombres')) newErrors.nombres = error;
        if (error.includes('apellidos')) newErrors.apellidos = error;
        if (error.includes('RUT')) newErrors.rut = error;
        if (error.includes('email')) newErrors.email = error;
      });
      setErrors(newErrors);
    }

    return validation.isValid;
  };

  // Manejar cambio de fecha
  const handleDateChange = (field, event, selectedDate) => {
    setShowDatePicker(prev => ({ ...prev, [field]: false }));
    
    if (selectedDate) {
      handleInputChange(field, selectedDate);
    }
  };

  // Manejar guardado
  const handleSave = async () => {
    console.log('💾 Intentando guardar miembro');

    // Marcar todos los campos como touched
    const allFields = ['nombres', 'apellidos', 'rut', 'email'];
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // Validar formulario
    if (!validateForm()) {
      Alert.alert('Error de Validación', 'Por favor corrige los errores en el formulario');
      return;
    }

    try {
      // Preparar datos para envío
      const dataToSend = {
        ...formData,
        fechaNacimiento: formData.fechaNacimiento ? formData.fechaNacimiento.toISOString() : null,
        fechaIniciacion: formData.fechaIniciacion ? formData.fechaIniciacion.toISOString() : null,
        fechaIngreso: formData.fechaIngreso ? formData.fechaIngreso.toISOString() : null,
      };

      if (isEditing) {
        await dispatch(updateMiembro({ id: miembroId, data: dataToSend })).unwrap();
      } else {
        await dispatch(createMiembro(dataToSend)).unwrap();
      }

      console.log('✅ Miembro guardado exitosamente');
      navigation.goBack();
    } catch (error) {
      console.error('❌ Error al guardar miembro:', error);
    }
  };

  // Renderizar input de texto
  const renderTextInput = (field, placeholder, options = {}) => {
    const hasError = touched[field] && errors[field];
    
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {placeholder}
          {options.required && <Text style={styles.required}> *</Text>}
        </Text>
        <TextInput
          style={[
            styles.textInput,
            hasError && styles.textInputError
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          onBlur={() => handleInputBlur(field)}
          {...options}
        />
        {hasError && (
          <Text style={styles.errorText}>{errors[field]}</Text>
        )}
      </View>
    );
  };

  // Renderizar selector
  const renderSelector = (field, placeholder, options) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{placeholder}</Text>
      <View style={styles.selectorContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectorOption,
              formData[field] === option.value && styles.selectorOptionSelected
            ]}
            onPress={() => handleInputChange(field, option.value)}
          >
            <Text style={[
              styles.selectorOptionText,
              formData[field] === option.value && styles.selectorOptionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Renderizar date picker
  const renderDatePicker = (field, placeholder) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{placeholder}</Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => setShowDatePicker(prev => ({ ...prev, [field]: true }))}
      >
        <Text style={[
          styles.dateInputText,
          !formData[field] && styles.dateInputPlaceholder
        ]}>
          {formData[field] 
            ? formData[field].toLocaleDateString('es-CL')
            : `Seleccionar ${placeholder.toLowerCase()}`
          }
        </Text>
        <Icon name="calendar" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {showDatePicker[field] && (
        <DateTimePicker
          value={formData[field] || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange(field, event, date)}
          maximumDate={new Date()}
        />
      )}
    </View>
  );

  // Mostrar loading si estamos cargando datos
  if (isEditing && loadingDetail) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Cargando información del miembro...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Información básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          {renderTextInput('nombres', 'Nombres', { 
            required: true,
            autoCapitalize: 'words'
          })}
          
          {renderTextInput('apellidos', 'Apellidos', { 
            required: true,
            autoCapitalize: 'words'
          })}
          
          {renderTextInput('rut', 'RUT', { 
            required: true,
            placeholder: 'Ej: 12.345.678-9'
          })}
        </View>

        {/* Información de contacto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Contacto</Text>
          
          {renderTextInput('email', 'Email', { 
            keyboardType: 'email-address',
            autoCapitalize: 'none'
          })}
          
          {renderTextInput('telefono', 'Teléfono', { 
            keyboardType: 'phone-pad',
            placeholder: 'Ej: +56 9 1234 5678'
          })}
          
          {renderTextInput('direccion', 'Dirección', { 
            multiline: true,
            numberOfLines: 2
          })}
        </View>

        {/* Información masónica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Masónica</Text>
          
          {renderSelector('grado', 'Grado', [
            { value: 'aprendiz', label: 'Aprendiz' },
            { value: 'companero', label: 'Compañero' },
            { value: 'maestro', label: 'Maestro' },
          ])}
          
          {renderSelector('estado', 'Estado', [
            { value: 'activo', label: 'Activo' },
            { value: 'inactivo', label: 'Inactivo' },
            { value: 'suspendido', label: 'Suspendido' },
            { value: 'irradiado', label: 'Irradiado' },
          ])}
          
          {renderDatePicker('fechaIniciacion', 'Fecha de Iniciación')}
          {renderDatePicker('fechaIngreso', 'Fecha de Ingreso')}
        </View>

        {/* Información personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          {renderDatePicker('fechaNacimiento', 'Fecha de Nacimiento')}
          
          {renderTextInput('ciudadNacimiento', 'Ciudad de Nacimiento', { 
            autoCapitalize: 'words'
          })}
          
          {renderTextInput('profesion', 'Profesión', { 
            autoCapitalize: 'words'
          })}
        </View>

        {/* Botón guardar en el contenido */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { opacity: loading ? 0.5 : 1 }
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <LoadingSpinner size="small" color={colors.white} />
          ) : (
            <Icon name="content-save" size={20} color={colors.white} />
          )}
          <Text style={styles.saveButtonText}>
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar Miembro' : 'Crear Miembro')}
          </Text>
        </TouchableOpacity>

        {/* Espacio extra para el teclado */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  content: {
    flex: 1,
  },
  
  headerButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  headerButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  
  section: {
    marginBottom: spacing.lg,
  },
  
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  
  inputContainer: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  
  inputLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  
  required: {
    color: colors.error,
  },
  
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    minHeight: 48,
  },
  
  textInputError: {
    borderColor: colors.error,
  },
  
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  
  selectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  
  selectorOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  
  selectorOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  selectorOptionText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  
  selectorOptionTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    minHeight: 48,
  },
  
  dateInputText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  
  dateInputPlaceholder: {
    color: colors.textSecondary,
  },
  
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  
  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  
  bottomSpacer: {
    height: spacing.xxl,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});

export default MiembroFormScreen;