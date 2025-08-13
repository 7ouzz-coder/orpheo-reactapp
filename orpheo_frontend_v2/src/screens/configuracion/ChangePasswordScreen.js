import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

// Redux (asumiendo que existe una acción para cambiar contraseña)
// import { changePassword } from '../../store/slices/authSlice';

// Components
import TabSafeView from '../../components/common/TabSafeView';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize, wp, hp } from '../../styles/globalStyles';

const ChangePasswordScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  // Estados del formulario
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Estados de UI
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Actualizar campo del formulario
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validar contraseña
  const validatePassword = (password) => {
    const rules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    return {
      isValid: Object.values(rules).every(rule => rule),
      rules,
    };
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Contraseña actual
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    // Nueva contraseña
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else {
      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = 'La contraseña no cumple con los requisitos de seguridad';
      }
    }

    // Confirmar contraseña
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Debes confirmar la nueva contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    if (formData.currentPassword === formData.newPassword && formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cambiar contraseña
  const changePassword = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Formulario incompleto',
        text2: 'Por favor revisa los campos marcados',
      });
      return;
    }

    try {
      setLoading(true);

      console.log('🔐 Cambiando contraseña...');

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Implementar llamada real a la API
      /*
      const result = await dispatch(changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })).unwrap();
      */

      Toast.show({
        type: 'success',
        text1: 'Contraseña actualizada',
        text2: 'Tu contraseña ha sido cambiada exitosamente',
      });

      // Limpiar formulario
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Volver a la pantalla anterior
      navigation.goBack();

    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      
      let errorMessage = 'No se pudo cambiar la contraseña';
      
      // Manejar errores específicos
      if (error.message === 'INVALID_CURRENT_PASSWORD') {
        errorMessage = 'La contraseña actual es incorrecta';
        setErrors({ currentPassword: 'Contraseña incorrecta' });
      } else if (error.message === 'PASSWORD_TOO_WEAK') {
        errorMessage = 'La nueva contraseña es muy débil';
        setErrors({ newPassword: 'Contraseña muy débil' });
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancelar cambios
  const cancelChanges = () => {
    // Verificar si hay cambios sin guardar
    const hasChanges = formData.currentPassword || formData.newPassword || formData.confirmPassword;
    
    if (hasChanges) {
      Alert.alert(
        'Cancelar cambios',
        '¿Estás seguro de que deseas cancelar? Se perderán los cambios.',
        [
          { text: 'Continuar editando', style: 'cancel' },
          { 
            text: 'Cancelar cambios', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // Toggle visibilidad de contraseña
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Obtener fuerza de la contraseña
  const getPasswordStrength = () => {
    if (!formData.newPassword) return { level: 0, text: '', color: colors.textSecondary };
    
    const validation = validatePassword(formData.newPassword);
    const score = Object.values(validation.rules).filter(rule => rule).length;
    
    if (score <= 2) return { level: 1, text: 'Débil', color: colors.error };
    if (score <= 3) return { level: 2, text: 'Regular', color: colors.warning };
    if (score <= 4) return { level: 3, text: 'Buena', color: colors.info };
    return { level: 4, text: 'Muy fuerte', color: colors.success };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <TabSafeView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Instrucciones */}
        <View style={styles.instructionsSection}>
          <Icon name="shield-key" size={48} color={colors.primary} />
          <Text style={styles.instructionsTitle}>Cambiar Contraseña</Text>
          <Text style={styles.instructionsText}>
            Para tu seguridad, necesitamos verificar tu contraseña actual antes de 
            establecer una nueva. Asegúrate de que tu nueva contraseña sea segura 
            y diferente a la anterior.
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          
          {/* Contraseña actual */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Contraseña actual <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.passwordInput, errors.currentPassword && styles.inputError]}
                value={formData.currentPassword}
                onChangeText={(value) => updateField('currentPassword', value)}
                placeholder="Ingresa tu contraseña actual"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPasswords.current}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => togglePasswordVisibility('current')}
              >
                <Icon 
                  name={showPasswords.current ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            {errors.currentPassword && (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            )}
          </View>

          {/* Nueva contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nueva contraseña <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.passwordInput, errors.newPassword && styles.inputError]}
                value={formData.newPassword}
                onChangeText={(value) => updateField('newPassword', value)}
                placeholder="Ingresa tu nueva contraseña"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPasswords.new}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => togglePasswordVisibility('new')}
              >
                <Icon 
                  name={showPasswords.new ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Indicador de fuerza de contraseña */}
            {formData.newPassword && (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthBar}>
                  {[1, 2, 3, 4].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthSegment,
                        level <= passwordStrength.level && {
                          backgroundColor: passwordStrength.color
                        }
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.text}
                </Text>
              </View>
            )}
            
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}
          </View>

          {/* Confirmar contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Confirmar nueva contraseña <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                placeholder="Confirma tu nueva contraseña"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPasswords.confirm}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => togglePasswordVisibility('confirm')}
              >
                <Icon 
                  name={showPasswords.confirm ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

        </View>

        {/* Requisitos de contraseña */}
        <View style={styles.requirementsSection}>
          <Text style={styles.requirementsTitle}>Requisitos de contraseña:</Text>
          
          {formData.newPassword && (
            <PasswordRequirements password={formData.newPassword} />
          )}
          
          <View style={styles.requirementsList}>
            <RequirementItem text="Al menos 8 caracteres" />
            <RequirementItem text="Una letra mayúscula" />
            <RequirementItem text="Una letra minúscula" />
            <RequirementItem text="Un número" />
            <RequirementItem text="Un carácter especial (!@#$%^&*)" />
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={cancelChanges}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={changePassword}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={styles.saveButtonText}>Cambiando...</Text>
              </>
            ) : (
              <>
                <Icon name="shield-check" size={20} color={colors.white} />
                <Text style={styles.saveButtonText}>Cambiar contraseña</Text>
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

// Componente para mostrar requisitos de contraseña
const PasswordRequirements = ({ password }) => {
  const validatePassword = (password) => {
    const rules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    return {
      isValid: Object.values(rules).every(rule => rule),
      rules,
    };
  };
  
  const validation = validatePassword(password);
  
  const requirements = [
    { key: 'length', text: 'Al menos 8 caracteres', valid: validation.rules.length },
    { key: 'uppercase', text: 'Una letra mayúscula', valid: validation.rules.uppercase },
    { key: 'lowercase', text: 'Una letra minúscula', valid: validation.rules.lowercase },
    { key: 'number', text: 'Un número', valid: validation.rules.number },
    { key: 'special', text: 'Un carácter especial', valid: validation.rules.special },
  ];

  return (
    <View style={styles.requirementsList}>
      {requirements.map((req) => (
        <RequirementItem 
          key={req.key} 
          text={req.text} 
          valid={req.valid} 
        />
      ))}
    </View>
  );
};

// Componente individual de requisito
const RequirementItem = ({ text, valid = null }) => {
  const getIconAndColor = () => {
    if (valid === null) return { icon: 'circle-small', color: colors.textSecondary };
    return valid 
      ? { icon: 'check-circle', color: colors.success }
      : { icon: 'close-circle', color: colors.error };
  };

  const { icon, color } = getIconAndColor();

  return (
    <View style={styles.requirementItem}>
      <Icon name={icon} size={16} color={color} />
      <Text style={[styles.requirementText, { color }]}>
        {text}
      </Text>
    </View>
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

  // Instructions
  instructionsSection: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  instructionsTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  instructionsText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Form
  form: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
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
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  passwordToggle: {
    padding: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },

  // Password strength
  passwordStrength: {
    marginTop: spacing.sm,
  },
  strengthBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.xs,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },

  // Requirements
  requirementsSection: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
  },
  requirementsTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  requirementsList: {
    gap: spacing.sm,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  requirementText: {
    fontSize: fontSize.sm,
    flex: 1,
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

export default ChangePasswordScreen;