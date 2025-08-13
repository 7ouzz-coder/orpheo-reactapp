import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

// Redux
import { 
  selectUser, 
  selectIsLoading,
  updateProfile 
} from '../../store/slices/authSlice';

// Components
import TabSafeView from '../../components/common/TabSafeView';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize, wp, hp } from '../../styles/globalStyles';

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loading = useSelector(selectIsLoading);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    avatar: null,
  });

  // Estados de UI
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setFormData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        fecha_nacimiento: user.fecha_nacimiento || '',
        avatar: user.avatar || null,
      });
    }
  }, [user]);

  // Actualizar campo del formulario
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.telefono && !/^\+?[\d\s\-\(\)]+$/.test(formData.telefono)) {
      newErrors.telefono = 'Teléfono inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Seleccionar imagen de perfil
  const selectImage = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tu galería para cambiar la foto de perfil',
          [{ text: 'OK' }]
        );
        return;
      }

      // Mostrar opciones
      Alert.alert(
        'Cambiar foto de perfil',
        'Selecciona una opción',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Cámara', onPress: () => openCamera() },
          { text: 'Galería', onPress: () => openGallery() },
        ]
      );

    } catch (error) {
      console.error('❌ Error solicitando permisos:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron obtener los permisos',
      });
    }
  };

  // Abrir cámara
  const openCamera = async () => {
    try {
      setImageLoading(true);
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateField('avatar', result.assets[0].uri);
        Toast.show({
          type: 'success',
          text1: 'Foto actualizada',
          text2: 'Nueva foto de perfil seleccionada',
        });
      }
    } catch (error) {
      console.error('❌ Error con cámara:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo tomar la foto',
      });
    } finally {
      setImageLoading(false);
    }
  };

  // Abrir galería
  const openGallery = async () => {
    try {
      setImageLoading(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateField('avatar', result.assets[0].uri);
        Toast.show({
          type: 'success',
          text1: 'Foto actualizada',
          text2: 'Nueva foto de perfil seleccionada',
        });
      }
    } catch (error) {
      console.error('❌ Error con galería:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo seleccionar la imagen',
      });
    } finally {
      setImageLoading(false);
    }
  };

  // Guardar cambios
  const saveChanges = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Formulario incompleto',
        text2: 'Por favor revisa los campos marcados',
      });
      return;
    }

    try {
      setSaving(true);

      console.log('💾 Guardando cambios del perfil:', formData);

      // Preparar datos para enviar
      const updateData = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
        fecha_nacimiento: formData.fecha_nacimiento,
      };

      // Si hay nueva imagen, incluirla
      if (formData.avatar && formData.avatar !== user.avatar) {
        updateData.avatar = formData.avatar;
      }

      // Dispatch a Redux
      await dispatch(updateProfile(updateData)).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Perfil actualizado',
        text2: 'Tus datos han sido guardados correctamente',
      });

      // Volver a la pantalla anterior
      navigation.goBack();

    } catch (error) {
      console.error('❌ Error guardando perfil:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudieron guardar los cambios',
      });
    } finally {
      setSaving(false);
    }
  };

  // Cancelar cambios
  const cancelChanges = () => {
    Alert.alert(
      'Cancelar cambios',
      '¿Estás seguro de que deseas cancelar? Se perderán los cambios no guardados.',
      [
        { text: 'Continuar editando', style: 'cancel' },
        { 
          text: 'Cancelar cambios', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        },
      ]
    );
  };

  if (loading) {
    return (
      <TabSafeView style={styles.container}>
        <LoadingSpinner />
      </TabSafeView>
    );
  }

  return (
    <TabSafeView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Foto de perfil */}
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={selectImage}
            disabled={imageLoading}
          >
            {imageLoading ? (
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <>
                {formData.avatar ? (
                  <Image source={{ uri: formData.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Icon name="account" size={60} color={colors.textSecondary} />
                  </View>
                )}
                
                <View style={styles.avatarOverlay}>
                  <Icon name="camera" size={20} color={colors.white} />
                </View>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.avatarLabel}>Toca para cambiar foto</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          
          {/* Nombres */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nombres <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.nombres && styles.inputError]}
              value={formData.nombres}
              onChangeText={(value) => updateField('nombres', value)}
              placeholder="Ingresa tus nombres"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
            {errors.nombres && (
              <Text style={styles.errorText}>{errors.nombres}</Text>
            )}
          </View>

          {/* Apellidos */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Apellidos <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.apellidos && styles.inputError]}
              value={formData.apellidos}
              onChangeText={(value) => updateField('apellidos', value)}
              placeholder="Ingresa tus apellidos"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
            {errors.apellidos && (
              <Text style={styles.errorText}>{errors.apellidos}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
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
              placeholder="+56 9 1234 5678"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
            {errors.telefono && (
              <Text style={styles.errorText}>{errors.telefono}</Text>
            )}
          </View>

          {/* Dirección */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección</Text>
            <TextInput
              style={styles.textArea}
              value={formData.direccion}
              onChangeText={(value) => updateField('direccion', value)}
              placeholder="Ingresa tu dirección"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Fecha de nacimiento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha de nacimiento</Text>
            <TextInput
              style={styles.input}
              value={formData.fecha_nacimiento}
              onChangeText={(value) => updateField('fecha_nacimiento', value)}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>
              Formato: DD/MM/AAAA
            </Text>
          </View>

        </View>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={cancelChanges}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={saveChanges}
            disabled={saving}
          >
            {saving ? (
              <>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={styles.saveButtonText}>Guardando...</Text>
              </>
            ) : (
              <>
                <Icon name="content-save" size={20} color={colors.white} />
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Espaciado inferior */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </TabSafeView>
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

  // Avatar section
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  avatarLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Form
  form: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.white,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.white,
    height: 100,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary,
    gap: spacing.sm,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },

  bottomSpacer: {
    height: spacing.xl,
  },
});

export default EditProfileScreen;