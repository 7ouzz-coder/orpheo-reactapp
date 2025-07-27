import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

// Redux
import { 
  login, 
  clearError,
  selectIsLoading, 
  selectError,
  selectIsAuthenticated 
} from '../../store/slices/authSlice';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize, wp, hp } from '../../styles/globalStyles';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  
  // Estado local
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Selectores Redux
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // Datos de prueba para desarrollo
  const mockUsers = [
    { email: 'admin@orpheo.cl', password: 'admin123', role: 'admin', grado: 'maestro' },
    { email: 'maestro@orpheo.cl', password: 'maestro123', role: 'general', grado: 'maestro' },
    { email: 'companero@orpheo.cl', password: 'comp123', role: 'general', grado: 'companero' },
    { email: 'aprendiz@orpheo.cl', password: 'apr123', role: 'general', grado: 'aprendiz' },
  ];

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
      });
    }
  }, [error]);

  // Validación del formulario
  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
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
      // Por ahora usar datos mock, luego conectar con backend real
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
        };

        dispatch(login(loginData));
        
        Toast.show({
          type: 'success',
          text1: 'Bienvenido',
          text2: `Sesión iniciada como ${mockUser.grado}`,
          position: 'top',
        });
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Email o contraseña incorrectos',
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" backgroundColor={colors.primary} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="temple-buddhist" size={60} color={colors.primary} />
          </View>
          <Text style={styles.title}>Orpheo</Text>
          <Text style={styles.subtitle}>Sistema de Gestión Masónica</Text>
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

          {/* Botón Login */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <>
                <Icon name="login" size={20} color={colors.background} />
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botones de prueba (solo para desarrollo) */}
          {__DEV__ && (
            <View style={styles.testSection}>
              <Text style={styles.testTitle}>Cuentas de Prueba:</Text>
              <View style={styles.testButtons}>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => fillTestCredentials('aprendiz')}
                >
                  <Text style={styles.testButtonText}>Aprendiz</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => fillTestCredentials('companero')}
                >
                  <Text style={styles.testButtonText}>Compañero</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => fillTestCredentials('maestro')}
                >
                  <Text style={styles.testButtonText}>Maestro</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Versión 1.0.0</Text>
        </View>
      </ScrollView>
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
    paddingLeft: 50, // Espacio para el icono
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
});

export default LoginScreen;