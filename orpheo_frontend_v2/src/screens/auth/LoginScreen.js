import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Redux
import { 
  login, 
  selectIsLoading, 
  selectError,
  selectLoginAttempts,
  clearError,
  incrementLoginAttempts 
} from '../../store/slices/authSlice';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

const LoginScreen = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const loginAttempts = useSelector(selectLoginAttempts);
  
  // Local state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Limpiar errores al cambiar campos
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
    setValidationErrors({});
  }, [formData.email, formData.password]);

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Validar password
    if (!formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 3) {
      errors.password = 'La contraseña debe tener al menos 3 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar login
  const handleLogin = async () => {
    // Verificar intentos de login
    if (loginAttempts >= 5) {
      Alert.alert(
        'Demasiados Intentos',
        'Has excedido el número máximo de intentos. Espera unos minutos antes de intentar de nuevo.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      console.log('🔐 Iniciando login con:', formData.email);
      await dispatch(login(formData)).unwrap();
      // El navegador se encargará de cambiar a la pantalla principal
    } catch (error) {
      console.log('❌ Error en login:', error);
      dispatch(incrementLoginAttempts());
      
      // Mostrar alert adicional para errores críticos
      if (loginAttempts >= 3) {
        Alert.alert(
          'Error de Login',
          `${error}\n\nIntentos restantes: ${5 - loginAttempts - 1}`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Login rápido para desarrollo
  const quickLogin = () => {
    setFormData({
      email: 'admin@orpheo.local',
      password: 'admin123'
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
              <Icon name="compass" size={80} color={colors.primary} />
            </View>
            <Text style={styles.title}>ORPHEO</Text>
            <Text style={styles.subtitle}>Sistema de Gestión Masónica</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Icon 
                  name="email-outline" 
                  size={20} 
                  color={colors.textMuted} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    validationErrors.email && styles.inputError
                  ]}
                  placeholder="tu@email.com"
                  placeholderTextColor={colors.placeholder}
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text.trim() }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
              {validationErrors.email && (
                <Text style={styles.errorText}>{validationErrors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <Icon 
                  name="lock-outline" 
                  size={20} 
                  color={colors.textMuted} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    validationErrors.password && styles.inputError
                  ]}
                  placeholder="Tu contraseña"
                  placeholderTextColor={colors.placeholder}
                  value={formData.password}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.password && (
                <Text style={styles.errorText}>{validationErrors.password}</Text>
              )}
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={20} color={colors.error} />
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                (isLoading || loginAttempts >= 5) && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={isLoading || loginAttempts >= 5}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Icon name="loading" size={20} color={colors.background} />
                  <Text style={styles.loginButtonText}>Ingresando...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Icon name="login" size={20} color={colors.background} />
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Quick Login for Development */}
            {__DEV__ && (
              <TouchableOpacity
                style={styles.quickLoginButton}
                onPress={quickLogin}
              >
                <Text style={styles.quickLoginText}>
                  🚀 Login Rápido (admin@orpheo.local)
                </Text>
              </TouchableOpacity>
            )}

            {/* Login Attempts Warning */}
            {loginAttempts > 0 && (
              <View style={styles.warningContainer}>
                <Icon name="alert" size={16} color={colors.warning} />
                <Text style={styles.warningText}>
                  Intentos fallidos: {loginAttempts}/5
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Versión 1.0.0 • Desarrollo
            </Text>
            <Text style={styles.footerText}>
              Sistema de Gestión Masónica
            </Text>
          </View>
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
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.text,
  },
  eyeIcon: {
    padding: 4,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorMessage: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: colors.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 8,
  },
  quickLoginButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.warning + '20',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickLoginText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '500',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 8,
    backgroundColor: colors.warning + '20',
    borderRadius: 6,
  },
  warningText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: 4,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
});

export default LoginScreen;