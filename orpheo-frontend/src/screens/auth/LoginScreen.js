import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Redux
import { 
  login, 
  clearError, 
  selectIsLoading, 
  selectError, 
  selectLoginAttempts 
} from '../../store/slices/authSlice';

// Services
import authService from '../../services/authService';

// Styles
import { colors } from '../../styles/colors';

const LoginScreen = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const loginAttempts = useSelector(selectLoginAttempts);

  // Estados locales
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isBlocked, setIsBlocked] = useState(false);

  // Limpiar errores al montar el componente
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Verificar si está bloqueado por intentos fallidos
  useEffect(() => {
    if (loginAttempts >= 5) {
      setIsBlocked(true);
      Alert.alert(
        'Cuenta Bloqueada',
        'Has excedido el número máximo de intentos de login. Contacta al administrador.',
        [{ text: 'Entendido' }]
      );
    }
  }, [loginAttempts]);

  // Manejar cambios en los inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Limpiar error general
    if (error) {
      dispatch(clearError());
    }
  };

  // Validar formulario
  const validateForm = () => {
    const validation = authService.validateLoginCredentials(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }

    setErrors({});
    return true;
  };

  // Manejar login
  const handleLogin = async () => {
    if (isBlocked) {
      Alert.alert(
        'Cuenta Bloqueada',
        'Contacta al administrador para desbloquear tu cuenta.'
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(login(formData)).unwrap();
      // El navegador se encargará de cambiar a la pantalla principal
    } catch (error) {
      console.log('Error en login:', error);
      // El error se maneja automáticamente en el slice
    }
  };

  // Usuarios de prueba para desarrollo
  const testUsers = [
    { email: 'admin@orpheo.com', password: 'admin123456', role: 'SuperAdmin', grado: 'Maestro' },
    { email: 'juan.perez@orpheo.com', password: 'maestro123', role: 'Admin', grado: 'Maestro' },
    { email: 'maria.rodriguez@orpheo.com', password: 'companero123', role: 'General', grado: 'Compañero' },
    { email: 'pedro.lopez@orpheo.com', password: 'aprendiz123', role: 'General', grado: 'Aprendiz' }
  ];

  // Función para login rápido (solo en desarrollo)
  const quickLogin = (user) => {
    setFormData({
      email: user.email,
      password: user.password
    });
    
    // Auto-login después de un breve delay
    setTimeout(() => {
      handleLogin();
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="triangle" size={60} color={colors.primary} />
            </View>
            <Text style={styles.title}>ORPHEO</Text>
            <Text style={styles.subtitle}>Sistema de Gestión Masónica</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Icon name="email" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="tu.email@ejemplo.com"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Contraseña */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputWrapper}>
                <Icon name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Tu contraseña"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Icon 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Error general */}
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={20} color={colors.error} />
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            )}

            {/* Intentos fallidos */}
            {loginAttempts > 0 && loginAttempts < 5 && (
              <View style={styles.warningContainer}>
                <Icon name="alert" size={20} color={colors.warning} />
                <Text style={styles.warningText}>
                  Intentos fallidos: {loginAttempts}/5
                </Text>
              </View>
            )}

            {/* Botón de login */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                (isLoading || isBlocked) && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={isLoading || isBlocked}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Icon name="login" size={20} color={colors.white} />
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Usuarios de prueba (solo en desarrollo) */}
          {__DEV__ && (
            <View style={styles.testUsers}>
              <Text style={styles.testUsersTitle}>Usuarios de Prueba:</Text>
              {testUsers.map((user, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.testUserButton}
                  onPress={() => quickLogin(user)}
                  disabled={isLoading}
                >
                  <Text style={styles.testUserText}>
                    {user.role} - {user.grado}
                  </Text>
                  <Text style={styles.testUserEmail}>{user.email}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 15,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 10,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: 5,
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.error,
    marginLeft: 8,
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  warningText: {
    fontSize: 14,
    color: colors.warning,
    marginLeft: 8,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
  testUsers: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  testUsersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  testUserButton: {
    backgroundColor: colors.primaryLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  testUserText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  testUserEmail: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});

export default LoginScreen;