import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Redux
import { 
  login, 
  clearError,
  selectIsLoading, 
  selectError,
  selectIsAuthenticated,
  selectLoginAttempts 
} from '../../store/slices/authSlice';

// Components
import { LoadingOverlay } from '../../components/common/LoadingSpinner';

// Utils - función definida directamente para evitar imports problemáticos
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

import { checkServerHealth } from '../../services/apiClient';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize, wp, hp } from '../../styles/globalStyles';

const LoginScreen = ({ navigation }) => {
    
  const dispatch = useDispatch();
  
  // Estado local
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [useRealAPI, setUseRealAPI] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [serverStatus, setServerStatus] = useState(null);
  
  // Selectores Redux
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loginAttempts = useSelector(selectLoginAttempts);

  // Datos de prueba para desarrollo
  const mockUsers = [
    { email: 'admin@orpheo.cl', password: 'admin123', role: 'admin', grado: 'maestro' },
    { email: 'maestro@orpheo.cl', password: 'maestro123', role: 'general', grado: 'maestro' },
    { email: 'companero@orpheo.cl', password: 'comp123', role: 'general', grado: 'companero' },
    { email: 'aprendiz@orpheo.cl', password: 'apr123', role: 'general', grado: 'aprendiz' },
  ];

  // Verificar estado del servidor al cargar
  useEffect(() => {
    checkServerStatus();
  }, []);

  // Limpiar errores al montar el componente
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Mostrar error si existe
  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error de Autenticación',
        text2: error,
        position: 'top',
        visibilityTime: 4000,
      });
    }
  }, [error]);

  // Verificar estado del servidor
  const checkServerStatus = async () => {
    try {
      const result = await checkServerHealth();
      setServerStatus(result);
      
      if (result.success) {
        setUseRealAPI(true);
        Toast.show({
          type: 'success',
          text1: 'Backend Conectado',
          text2: 'Servidor 191.112.178.230 disponible',
          position: 'top',
          visibilityTime: 2000,
        });
      } else {
        setUseRealAPI(false);
        Toast.show({
          type: 'info',
          text1: 'Backend No Disponible',
          text2: 'Verificar conexión a 191.112.178.230:3001',
          position: 'top',
          visibilityTime: 4000,
        });
      }
    } catch (error) {
      console.log('Server health check failed:', error);
      setServerStatus({ success: false, error: error.message });
      setUseRealAPI(false);
      Toast.show({
        type: 'error',
        text1: 'Error de Conexión',
        text2: 'Revisar endpoint /api/health en backend',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  // Validación del formulario
  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!validateEmail(email)) {
      errors.email = 'Email inválido';
    }
    
    if (!password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar login
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (useRealAPI && serverStatus?.success) {
        // Usar API real
        const resultAction = await dispatch(login({ email, password }));
        
        if (login.fulfilled.match(resultAction)) {
          Toast.show({
            type: 'success',
            text1: 'Bienvenido',
            text2: 'Sesión iniciada con backend real',
            position: 'top',
          });
        }
      } else {
        // Usar datos mock
        const mockUser = mockUsers.find(
          user => user.email === email && user.password === password
        );

        if (mockUser) {
          // Simular datos del backend
          const loginData = {
            user: {
              id: Date.now(),
              email: mockUser.email,
              nombres: 'Usuario',
              apellidos: 'Demo',
              rol: mockUser.role,
              grado: mockUser.grado,
              logia: 'Logia Demo',
              numero_miembro: '001',
            },
            token: 'mock-jwt-token-' + Date.now(),
            refreshToken: 'mock-refresh-token-' + Date.now(),
          };

          const resultAction = await dispatch(login(loginData));
          
          if (login.fulfilled.match(resultAction)) {
            Toast.show({
              type: 'success',
              text1: 'Bienvenido (Modo Demo)',
              text2: `Sesión iniciada como ${mockUser.grado}`,
              position: 'top',
            });
          }
        } else {
          throw new Error('Credenciales inválidas');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Error al iniciar sesión',
        position: 'top',
      });
    }
  };

  // Auto-completar para pruebas
  const fillTestCredentials = (userType) => {
    const user = mockUsers.find(u => u.grado === userType);
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
    }
  };

  // Retry conexión con servidor
  const retryServerConnection = () => {
    checkServerStatus();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="domain" size={60} color={colors.primary} />
          </View>
          <Text style={styles.title}>Orpheo</Text>
          <Text style={styles.subtitle}>Sistema de Gestión Masónica</Text>
          
          {/* Estado del servidor */}
          <View style={styles.serverStatus}>
            <Icon 
              name={serverStatus?.success ? "cloud-check" : "cloud-alert"} 
              size={16} 
              color={serverStatus?.success ? colors.success : colors.warning} 
            />
            <Text style={[
              styles.serverStatusText,
              { color: serverStatus?.success ? colors.success : colors.warning }
            ]}>
              {serverStatus?.success ? 'Backend Conectado' : 'Backend No Disponible'}
            </Text>
            {!serverStatus?.success && (
              <TouchableOpacity onPress={retryServerConnection} style={styles.retryButton}>
                <Icon name="refresh" size={14} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          {/* Campo Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Icon name="email" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.textInput,
                  formErrors.email && styles.inputError
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {formErrors.email && (
              <Text style={styles.errorText}>{formErrors.email}</Text>
            )}
          </View>

          {/* Campo Contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.textInput,
                  formErrors.password && styles.inputError
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Tu contraseña"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
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
            {formErrors.password && (
              <Text style={styles.errorText}>{formErrors.password}</Text>
            )}
          </View>

          {/* Recordar sesión */}
          <View style={styles.rememberContainer}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: colors.inputBorder, true: colors.primary }}
              thumbColor={rememberMe ? colors.background : colors.textMuted}
            />
            <Text style={styles.rememberText}>Recordar mi sesión</Text>
          </View>

          {/* Información de intentos */}
          {loginAttempts > 0 && (
            <View style={styles.attemptsContainer}>
              <Icon name="alert" size={16} color={colors.warning} />
              <Text style={styles.attemptsText}>
                Intentos fallidos: {loginAttempts}/5
              </Text>
            </View>
          )}

          {/* Botón Login */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Icon name="login" size={20} color={colors.background} />
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          {/* Toggle API Mode */}
          {__DEV__ && (
            <View style={styles.apiModeContainer}>
              <Text style={styles.apiModeLabel}>Modo API:</Text>
              <Switch
                value={useRealAPI}
                onValueChange={setUseRealAPI}
                trackColor={{ false: colors.inputBorder, true: colors.success }}
                thumbColor={useRealAPI ? colors.background : colors.textMuted}
                disabled={!serverStatus?.success}
              />
              <Text style={styles.apiModeText}>
                {useRealAPI ? 'Real' : 'Mock'}
              </Text>
            </View>
          )}

          {/* Botones de prueba (solo para desarrollo) */}
          {__DEV__ && !useRealAPI && (
            <View style={styles.testSection}>
              <Text style={styles.testTitle}>Cuentas de Prueba:</Text>
              <View style={styles.testButtons}>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => fillTestCredentials('aprendiz')}
                  disabled={isLoading}
                >
                  <Text style={styles.testButtonText}>Aprendiz</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => fillTestCredentials('companero')}
                  disabled={isLoading}
                >
                  <Text style={styles.testButtonText}>Compañero</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => fillTestCredentials('maestro')}
                  disabled={isLoading}
                >
                  <Text style={styles.testButtonText}>Maestro</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Versión 2.0.0</Text>
          <Text style={styles.statusText}>
            {useRealAPI ? '🌐 Conectado al servidor' : '📱 Modo offline'}
          </Text>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay 
        visible={isLoading} 
        text={useRealAPI ? "Autenticando con servidor..." : "Iniciando sesión..."} 
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: hp(8),
    paddingBottom: hp(4),
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  title: {
    fontSize: fontSize.huge,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  serverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serverStatusText: {
    fontSize: fontSize.sm,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  retryButton: {
    marginLeft: spacing.xs,
    padding: spacing.xs,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingLeft: 50,
    fontSize: fontSize.md,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: spacing.md,
    padding: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  rememberText: {
    fontSize: fontSize.md,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  attemptsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  attemptsText: {
    fontSize: fontSize.sm,
    color: colors.warning,
    marginLeft: spacing.xs,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  loginButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  loginButtonText: {
    color: colors.background,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  apiModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  apiModeLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  apiModeText: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  testSection: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  testTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  testButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  testButton: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  testButtonText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  versionText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  statusText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default LoginScreen;