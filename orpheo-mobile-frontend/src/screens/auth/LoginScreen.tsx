import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Loading } from '@/components/common';
import { theme } from '@/utils/theme';
import { validateLoginForm } from '@/utils/validators';
import { LoginCredentials } from '@/types/auth';

interface LoginFormData {
  username: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const { login, isLoading, error, canRetryLogin, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Limpiar error cuando el usuario empiece a escribir
  useEffect(() => {
    if (error && (watchedValues.username || watchedValues.password)) {
      clearError();
    }
  }, [watchedValues, error, clearError]);

  const onSubmit = async (data: LoginFormData) => {
    // Validar formulario
    const validation = validateLoginForm(data);
    if (!validation.isValid) {
      Alert.alert('Error de validación', Object.values(validation.errors)[0]);
      return;
    }

    try {
      const result = await login(data);
      
      if (!result.success) {
        Alert.alert(
          'Error de autenticación',
          result.error || 'Error desconocido',
          [{ text: 'OK' }]
        );
      }
      // Si es exitoso, la navegación se maneja automáticamente por el AppNavigator
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Error inesperado al iniciar sesión',
        [{ text: 'OK' }]
      );
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar contraseña',
      'Contacta con el administrador del sistema para recuperar tu contraseña.',
      [{ text: 'Entendido' }]
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoading) {
    return (
      <Loading
        fullScreen
        text="Iniciando sesión..."
        size="large"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header con logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons
                name="business"
                size={80}
                color={theme.colors.gold}
              />
            </View>
            <Text style={styles.title}>Orpheo Mobile</Text>
            <Text style={styles.subtitle}>
              Sistema de Gestión Masónica
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            {/* Campo username */}
            <Controller
              control={control}
              name="username"
              rules={{
                required: 'El usuario es obligatorio',
                minLength: {
                  value: 3,
                  message: 'El usuario debe tener al menos 3 caracteres',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Usuario"
                  placeholder="Ingresa tu nombre de usuario"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.username?.message}
                  leftIcon="person"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="username"
                  returnKeyType="next"
                  required
                />
              )}
            />

            {/* Campo password */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'La contraseña es obligatoria',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Contraseña"
                  placeholder="Ingresa tu contraseña"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  leftIcon="lock-closed"
                  secureTextEntry={!showPassword}
                  showPasswordToggle
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  required
                />
              )}
            />

            {/* Error general */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={theme.colors.error}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Información de intentos */}
            {!canRetryLogin && (
              <View style={styles.warningContainer}>
                <Ionicons
                  name="warning"
                  size={20}
                  color={theme.colors.warning}
                />
                <Text style={styles.warningText}>
                  Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.
                </Text>
              </View>
            )}

            {/* Botón de login */}
            <Button
              title="Iniciar Sesión"
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading || !canRetryLogin}
              loading={isLoading}
              style={styles.loginButton}
              fullWidth
            />

            {/* Olvidé mi contraseña */}
            <Button
              title="¿Olvidaste tu contraseña?"
              onPress={handleForgotPassword}
              variant="ghost"
              size="small"
              style={styles.forgotPasswordButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 Orpheo Mobile
            </Text>
            <Text style={styles.footerSubtext}>
              Versión 1.0.0
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
    backgroundColor: theme.colors.background,
  },
  
  keyboardAvoidingView: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${theme.colors.gold}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.gold,
  },
  
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.gold,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 16,
    color: theme.colors.grayText,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.error}20`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  
  errorText: {
    flex: 1,
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
  
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.warning}20`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  
  warningText: {
    flex: 1,
    color: theme.colors.warning,
    fontSize: 14,
    fontWeight: '500',
  },
  
  loginButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  
  forgotPasswordButton: {
    alignSelf: 'center',
  },
  
  footer: {
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grayBorder,
  },
  
  footerText: {
    color: theme.colors.grayBorder,
    fontSize: 12,
    marginBottom: 4,
  },
  
  footerSubtext: {
    color: theme.colors.grayBorder,
    fontSize: 10,
  },
});

export default LoginScreen;