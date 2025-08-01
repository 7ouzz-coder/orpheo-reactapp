import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform, // ✅ IMPORT AGREGADO
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Redux
import {
  createMiembro,
  updateMiembro,
  fetchMiembroById,
  clearSelectedMiembro,
  selectMiembroSeleccionado,
  selectLoadingCreate,
  selectLoadingUpdate,
  selectLoadingDetail,
  selectError,
} from '../../store/slices/miembrosSlice';

// Components
import TabSafeView from '../../components/common/TabSafeView';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize } from '../../styles/globalStyles';

const MiembroFormScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { miembroId } = route.params || {};
  const isEdit = !!miembroId;
  
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
    fecha_ingreso: '',
    fecha_nacimiento: '',
    direccion: '',
    profesion: '',
    ciudad_nacimiento: '',
  });

  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Cargar datos si es edición
  useFocusEffect(
    React.useCallback(() => {
      if (isEdit && miembroId) {
        console.log(`📝 Cargando datos para editar miembro ID: ${miembroId}`);
        dispatch(fetchMiembroById(miembroId));
      }
      
      return () => {
        if (!isEdit) {
          dispatch(clearSelectedMiembro());
        }
      };
    }, [isEdit, miembroId, dispatch])
  );

  // Llenar formulario con datos del miembro
  useEffect(() => {
    if (isEdit && miembro) {
      console.log('📝 Llenando formulario con datos del miembro');
      const newFormData = {
        nombres: miembro.nombres || '',
        apellidos: miembro.apellidos || '',
        rut: miembro.rut || '',
        email: miembro.email || '',
        telefono: miembro.telefono || '',
        grado: miembro.grado || 'aprendiz',
        estado: miembro.estado || 'activo',
        fecha_ingreso: miembro.fecha_ingreso ? miembro.fecha_ingreso.split('T')[0] : '',
        fecha_nacimiento: miembro.fecha_nacimiento ? miembro.fecha_nacimiento.split('T')[0] : '',
        direccion: miembro.direccion || '',
        profesion: miembro.profesion || '',
        ciudad_nacimiento: miembro.ciudad_nacimiento || '',
      };
      setFormData(newFormData);
      setHasChanges(false);
    }
  }, [isEdit, miembro]);

  // Validaciones del formulario
  const validateForm = () => {
    const newErrors = {};

    // Campos obligatorios
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }

    if (!formData.rut.trim()) {
      newErrors.rut = 'El RUT es requerido';
    } else if (!/^\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]{1}$/.test(formData.rut) && 
               !/^\d{7,8}[-][0-9kK]{1}$/.test(formData.rut)) {
      newErrors.rut = 'Formato de RUT inválido (ej: 12345678-9)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validación de teléfono (opcional pero si se ingresa debe ser válido)
    if (formData.telefono && !/^\+?[0-9\s\-\(\)]{8,15}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }

    // Validación de fechas
    if (formData.fecha_nacimiento) {
      const fechaNac = new Date(formData.fecha_nacimiento);
      const hoy = new Date();
      if (fechaNac >= hoy) {
        newErrors.fecha_nacimiento = 'La fecha de nacimiento debe ser anterior a hoy';
      }
    }

    if (formData.fecha_ingreso) {
      const fechaIng = new Date(formData.fecha_ingreso);
      const hoy = new Date();
      if (fechaIng > hoy) {
        newErrors.fecha_ingreso = 'La fecha de ingreso no puede ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Actualizar campo del formulario
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Manejar guardado
  const handleSave = async () => {
    console.log('💾 Intentando guardar miembro...');
    
    if (!validateForm()) {
      Alert.alert('Error de Validación', 'Por favor corrige los errores en el formulario');
      return;
    }

    try {
      // Preparar datos para enviar
      const dataToSend = { ...formData };
      
      // Convertir fechas a formato ISO si están presentes
      if (dataToSend.fecha_ingreso) {
        dataToSend.fecha_ingreso = new Date(dataToSend.fecha_ingreso).toISOString();
      }
      if (dataToSend.fecha_nacimiento) {
        dataToSend.fecha_nacimiento = new Date(dataToSend.fecha_nacimiento).toISOString();
      }

      if (isEdit) {
        console.log('📝 Actualizando miembro existente...');
        await dispatch(updateMiembro({ 
          id: miembroId, 
          data: dataToSend 
        })).unwrap();
      } else {
        console.log('➕ Creando nuevo miembro...');
        await dispatch(createMiembro(dataToSend)).unwrap();
      }
      
      // Éxito - volver a la pantalla anterior
      setHasChanges(false);
      navigation.goBack();
      
    } catch (error) {
      console.error('❌ Error al guardar miembro:', error);
      Alert.alert(
        'Error al Guardar',
        error || (isEdit ? 'No se pudo actualizar el miembro' : 'No se pudo crear el miembro')
      );
    }
  };

  // Manejar cancelación con confirmación si hay cambios
  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Descartar Cambios',
        '¿Estás seguro de que quieres descartar los cambios?',
        [
          { text: 'Continuar Editando', style: 'cancel' },
          { 
            text: 'Descartar', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // Formatear RUT automáticamente
  const formatRut = (rut) => {
    // Remover puntos y guiones existentes
    const cleanRut = rut.replace(/[^0-9kK]/g, '');
    
    if (cleanRut.length <= 1) return cleanRut;
    
    // Separar dígito verificador
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);
    
    // Formatear cuerpo del RUT
    let formattedBody = body;
    if (body.length > 3) {
      formattedBody = body.slice(0, -3) + '.' + body.slice(-3);
    }
    if (body.length > 6) {
      formattedBody = body.slice(0, -6) + '.' + body.slice(-6, -3) + '.' + body.slice(-3);
    }
    
    return formattedBody + '-' + dv;
  };

  const handleRutChange = (value) => {
    const formatted = formatRut(value);
    updateField('rut', formatted);
  };

  // Opciones para selects
  const gradoOptions = [
    { value: 'aprendiz', label: 'Aprendiz', icon: 'hammer', color: '#10B981' },
    { value: 'companero', label: 'Compañero', icon: 'cog', color: '#F59E0B' },
    { value: 'maestro', label: 'Maestro', icon: 'crown', color: '#8B5CF6' },
  ];

  const estadoOptions = [
    { value: 'activo', label: 'Activo', color: '#10B981' },
    { value: 'inactivo', label: 'Inactivo', color: '#F59E0B' },
    { value: 'suspendido', label: 'Suspendido', color: '#EF4444' },
  ];

  // Loading state
  if (loadingDetail && isEdit && !miembro) {
    return (
      <TabSafeView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando datos del miembro...</Text>
      </TabSafeView>
    );
  }

  return (
    <TabSafeView>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {isEdit ? 'Editar Miembro' : 'Nuevo Miembro'}
          </Text>
          
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveHeaderButton, loading && styles.saveHeaderButtonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.saveHeaderText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.form} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Información Personal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="account" size={20} color={colors.primary} /> Información Personal
            </Text>

            {/* Nombres */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombres *</Text>
              <TextInput
                style={[styles.input, errors.nombres && styles.inputError]}
                value={formData.nombres}
                onChangeText={(value) => updateField('nombres', value)}
                placeholder="Ingresa los nombres"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                returnKeyType="next"
              />
              {errors.nombres && (
                <Text style={styles.errorText}>{errors.nombres}</Text>
              )}
            </View>

            {/* Apellidos */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellidos *</Text>
              <TextInput
                style={[styles.input, errors.apellidos && styles.inputError]}
                value={formData.apellidos}
                onChangeText={(value) => updateField('apellidos', value)}
                placeholder="Ingresa los apellidos"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                returnKeyType="next"
              />
              {errors.apellidos && (
                <Text style={styles.errorText}>{errors.apellidos}</Text>
              )}
            </View>

            {/* RUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>RUT *</Text>
              <TextInput
                style={[styles.input, errors.rut && styles.inputError]}
                value={formData.rut}
                onChangeText={handleRutChange}
                placeholder="12345678-9"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={12}
                returnKeyType="next"
              />
              {errors.rut && (
                <Text style={styles.errorText}>{errors.rut}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(value) => updateField('email', value.toLowerCase())}
                placeholder="ejemplo@email.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Teléfono */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={[styles.input, errors.telefono && styles.inputError]}
                value={formData.telefono}
                onChangeText={(value) => updateField('telefono', value)}
                placeholder="+56912345678"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
              {errors.telefono && (
                <Text style={styles.errorText}>{errors.telefono}</Text>
              )}
            </View>

            {/* Fecha de Nacimiento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha de Nacimiento</Text>
              <TextInput
                style={[styles.input, errors.fecha_nacimiento && styles.inputError]}
                value={formData.fecha_nacimiento}
                onChangeText={(value) => updateField('fecha_nacimiento', value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                returnKeyType="next"
              />
              {errors.fecha_nacimiento && (
                <Text style={styles.errorText}>{errors.fecha_nacimiento}</Text>
              )}
            </View>

            {/* Profesión */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Profesión</Text>
              <TextInput
                style={styles.input}
                value={formData.profesion}
                onChangeText={(value) => updateField('profesion', value)}
                placeholder="Ingresa la profesión"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Ciudad de Nacimiento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ciudad de Nacimiento</Text>
              <TextInput
                style={styles.input}
                value={formData.ciudad_nacimiento}
                onChangeText={(value) => updateField('ciudad_nacimiento', value)}
                placeholder="Ingresa la ciudad de nacimiento"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Dirección */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dirección</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.direccion}
                onChangeText={(value) => updateField('direccion', value)}
                placeholder="Ingresa la dirección completa"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Información Masónica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="compass" size={20} color={colors.primary} /> Información Masónica
            </Text>

            {/* Grado */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Grado Masónico</Text>
              <View style={styles.optionsContainer}>
                {gradoOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      formData.grado === option.value && [
                        styles.optionActive,
                        { borderColor: option.color }
                      ]
                    ]}
                    onPress={() => updateField('grado', option.value)}
                  >
                    <Icon 
                      name={option.icon} 
                      size={20} 
                      color={formData.grado === option.value ? option.color : colors.textMuted} 
                    />
                    <Text style={[
                      styles.optionText,
                      formData.grado === option.value && [
                        styles.optionTextActive,
                        { color: option.color }
                      ]
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Estado */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estado</Text>
              <View style={styles.optionsContainer}>
                {estadoOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      formData.estado === option.value && [
                        styles.optionActive,
                        { borderColor: option.color }
                      ]
                    ]}
                    onPress={() => updateField('estado', option.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      formData.estado === option.value && [
                        styles.optionTextActive,
                        { color: option.color }
                      ]
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Fecha de Ingreso */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha de Ingreso a la Logia</Text>
              <TextInput
                style={[styles.input, errors.fecha_ingreso && styles.inputError]}
                value={formData.fecha_ingreso}
                onChangeText={(value) => updateField('fecha_ingreso', value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                returnKeyType="done"
              />
              {errors.fecha_ingreso && (
                <Text style={styles.errorText}>{errors.fecha_ingreso}</Text>
              )}
            </View>
          </View>

          {/* Espaciado para botón */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Botón de Guardar Flotante */}
        <View style={styles.saveContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Icon name="check" size={20} color={colors.white} />
                <Text style={styles.saveButtonText}>
                  {isEdit ? 'Actualizar' : 'Crear'} Miembro
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TabSafeView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  cancelButton: {
    padding: spacing.sm,
  },
  
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  
  saveHeaderButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  saveHeaderButtonDisabled: {
    opacity: 0.5,
  },
  
  saveHeaderText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },

  // Form
  form: {
    flex: 1,
  },
  
  section: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Input Groups
  inputGroup: {
    marginBottom: spacing.lg,
  },
  
  label: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    minHeight: 48,
  },
  
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.error + '10',
  },
  
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },

  // Options
  optionsContainer: {
    gap: spacing.sm,
  },
  
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  
  optionActive: {
    backgroundColor: colors.background,
    borderWidth: 2,
  },
  
  optionText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  
  optionTextActive: {
    fontWeight: '600',
  },

  // Save Button
  saveContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 25,
    gap: spacing.sm,
    minHeight: 50,
  },
  
  saveButtonDisabled: {
    opacity: 0.5,
  },
  
  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default MiembroFormScreen;