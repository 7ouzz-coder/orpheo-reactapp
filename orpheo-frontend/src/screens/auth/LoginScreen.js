import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

import { colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';
import { wp, hp, fontSize, spacing, deviceInfo } from '../../utils/dimensions';
import { 
  loginUser, 
  clearError, 
  checkLockStatus,
  selectAuth, 
  selectCanLogin,
  selectRemainingLockTime,
  selectLockInfo
} from '../../store/slices/authSlice';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [countdown, setCountdown] = useState(0);
  
  const dispatch = useDispatch();
  const { loading, error } = useSelector(selectAuth);
  const canLogin = useSelector(selectCanLogin);
  const remainingLockTime = useSelector(selectRemainingLockTime);
  const lockInfo = useSelector(selectLockInfo);

  // Usuarios de prueba para desarrollo
  const testUsers = [
    { 
      username: 'admin', 
      password: 'password123', 
      title: 'Super Admin',
      description: 'Acceso completo al sistema',
      icon: 'admin-panel-settings',
      color: colors.error 
    },
    { 
      username: 'venerable', 
      password: 'password123', 
      title: 'Venerable Maestro',
      description: 'Administrador - Máxima autoridad',
      icon: 'star',
      color: colors.primary 
    },
    { 
      username: 'secretario', 
      password: 'password123', 
      title: 'Secretario',
      description: 'Administrador - Gestión de miembros',
      icon: 'description',
      color: colors.info 
    },
    { 
      username: 'maestro1', 
      password: 'password123', 
      title: 'Maestro Masón',
      description: 'Usuario general - Grado Maestro',
      icon: 'school',
      color: colors.maestro 
    },
    { 
      username: 'companero1', 
      password: 'password123', 
      title: 'Compañero Masón',
      description: 'Usuario general - Grado Compañero',
      icon: 'group',
      color: colors.companero 
    },
    { 
      username: 'aprendiz1', 
      password: 'password123', 
      title: 'Aprendiz Masón',
      description: 'Usuario general - Grado Aprendiz',
      icon: 'person',
      color: colors.aprendiz 
    }
  ];

  // Efectos y handlers (mantener los mismos)
  useEffect(() => {
    let interval = null;
    
    if (remainingLockTime > 0) {
      setCountdown(remainingLockTime);
      
      interval = setInterval(() => {
        dispatch(checkLockStatus());
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [remainingLockTime, dispatch]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error de autenticación',
        text2: error,
        position: 'top',
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    dispatch(checkLockStatus());
  }, [dispatch]);

  const handleLogin = () => {
    if (!canLogin) {
      const message = countdown > 0 
        ? `Cuenta bloqueada. Espera ${countdown} segundos.`
        : 'Demasiados intentos fallidos. Contacta al administrador.';
        
      Alert.alert('Acceso bloqueado', message, [{ text: 'OK' }]);
      return;
    }

    if (!username.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campos requeridos',
        text2: 'Por favor ingresa usuario y contraseña',
        position: 'top',
      });
      return;
    }

    dispatch(loginUser({ username: username.trim(), password }));
  };

  const selectTestUser = (user) => {
    setSelectedUser(user);
    setUsername(user.username);
    setPassword(user.password);
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const renderLockStatus = () => {
    if (!lockInfo.isLocked && lockInfo.attempts === 0) return null;

    const attemptsUntilNextLock = 3 - (lockInfo.attempts % 3);
    
    return (
      <View style={styles.lockStatusContainer}>
        {lockInfo.isLocked ? (
          <View style={styles.lockWarning}>
            <Icon name="lock" size={wp(4)} color={colors.error} />
            <Text style={styles.lockText}>
              Bloqueado por {formatTime(countdown)}
            </Text>
          </View>
        ) : (
          <View style={styles.attemptsWarning}>
            <Icon name="warning" size={wp(4)} color={colors.warning} />
            <Text style={styles.attemptsText}>
              {attemptsUntilNextLock} intentos antes del bloqueo 
              {lockInfo.nextLockDuration > 0 && ` (${lockInfo.nextLockDuration}s)`}
            </Text>
          </View>
        )}
        
        {lockInfo.attempts > 0 && (
          <Text style={styles.attemptsCount}>
            Intentos fallidos: {lockInfo.attempts}
          </Text>
        )}
      </View>
    );
  };

  const renderTestUserCard = (user, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.testUserCard,
        selectedUser?.username === user.username && styles.testUserCardSelected
      ]}
      onPress={() => selectTestUser(user)}
      disabled={!canLogin}
      activeOpacity={0.8}
    >
      <View style={[styles.testUserIcon, { backgroundColor: user.color }]}>
        <Icon name={user.icon} size={wp(6)} color={colors.white} />
      </View>
      <View style={styles.testUserInfo}>
        <Text style={styles.testUserTitle}>{user.title}</Text>
        <Text style={styles.testUserDescription}>{user.description}</Text>
        <Text style={styles.testUserCredentials}>
          {user.username} / {user.password}
        </Text>
      </View>
      {selectedUser?.username === user.username && (
        <Icon name="check-circle" size={wp(6)} color={colors.success} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Icon name="account-balance" size={wp(15)} color={colors.background} />
            </View>
            <Text style={styles.title}>ORPHEO</Text>
            <Text style={styles.subtitle}>Sistema de Gestión Masónica</Text>
          </View>

          {/* Estado de bloqueo */}
          {renderLockStatus()}

          {/* Usuarios de prueba en desarrollo */}
          {__DEV__ && (
            <View style={styles.testUsersContainer}>
              <Text style={styles.testUsersTitle}>👥 Usuarios de Prueba</Text>
              <Text style={styles.testUsersSubtitle}>
                Toca una tarjeta para usar esas credenciales
              </Text>
              
              {testUsers.map((user, index) => renderTestUserCard(user, index))}
            </View>
          )}

          {/* Formulario */}
          <View style={styles.form}>
            <View style={[
              styles.inputContainer,
              !canLogin && styles.inputDisabled
            ]}>
              <Icon name="person" size={wp(5)} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Usuario"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!loading && canLogin}
                autoCorrect={false}
                autoComplete="username"
              />
            </View>

            <View style={[
              styles.inputContainer,
              !canLogin && styles.inputDisabled
            ]}>
              <Icon name="lock" size={wp(5)} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading && canLogin}
                autoCorrect={false}
                autoComplete="password"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={!canLogin}
                activeOpacity={0.8}
              >
                <Icon 
                  name={showPassword ? "visibility" : "visibility-off"} 
                  size={wp(5)} 
                  color={canLogin ? colors.textSecondary : colors.textTertiary} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton, 
                (!canLogin || loading) && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={!canLogin || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={styles.loginButtonText}>
                  {lockInfo.isLocked ? `Bloqueado (${formatTime(countdown)})` : 'Iniciar Sesión'}
                </Text>
              )}
            </TouchableOpacity>

            {selectedUser && canLogin && (
              <View style={styles.selectedUserInfo}>
                <Icon name="info" size={wp(4)} color={colors.info} />
                <Text style={styles.selectedUserText}>
                  Ingresando como: {selectedUser.title}
                </Text>
              </View>
            )}
          </View>

          {/* Debug info */}
          {__DEV__ && lockInfo.history.length > 0 && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>🔧 Debug - Historial de Bloqueos</Text>
              {lockInfo.history.slice(-3).map((entry, index) => (
                <Text key={index} style={styles.debugText}>
                  {entry.attempts} intentos → {entry.lockDuration}s de bloqueo
                </Text>
              ))}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.version}>Versión 1.0.0</Text>
            {__DEV__ && (
              <Text style={styles.devMode}>🔧 Modo Desarrollo</Text>
            )}
            <Text style={styles.deviceInfo}>
              {deviceInfo.width}x{deviceInfo.height} - {deviceInfo.platform}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: deviceInfo.isSmallScreen ? spacing.md : spacing.xl,
  },
  logo: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  
  // Estado de bloqueo
  lockStatusContainer: {
    backgroundColor: colors.surface,
    borderRadius: wp(2),
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: wp(1),
    borderLeftColor: colors.warning,
  },
  lockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lockText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  attemptsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  attemptsText: {
    color: colors.warning,
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
    flex: 1,
  },
  attemptsCount: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
  },
  
  // Usuarios de prueba
  testUsersContainer: {
    marginBottom: spacing.xl,
  },
  testUsersTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  testUsersSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: fontSize.sm * 1.4,
  },
  testUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: wp(3),
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  testUserCardSelected: {
    borderColor: colors.success,
    backgroundColor: colors.card,
    elevation: 4,
    shadowOpacity: 0.2,
  },
  testUserIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  testUserInfo: {
    flex: 1,
  },
  testUserTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  testUserDescription: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: fontSize.xs * 1.3,
  },
  testUserCredentials: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  
  // Formulario
  form: {
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: wp(2),
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.card,
    minHeight: hp(7),
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: colors.card,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
  },
  eyeButton: {
    padding: spacing.xs,
    borderRadius: wp(1),
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: wp(2),
    minHeight: hp(7),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loginButtonDisabled: {
    backgroundColor: colors.textSecondary,
    elevation: 1,
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: colors.background,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  selectedUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: wp(2),
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.info,
  },
  selectedUserText: {
    color: colors.info,
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  
  // Debug
  debugContainer: {
    backgroundColor: colors.card,
    borderRadius: wp(2),
    padding: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  debugTitle: {
    color: colors.warning,
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  debugText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs - 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 2,
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
  version: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  devMode: {
    color: colors.warning,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  deviceInfo: {
    color: colors.textTertiary,
    fontSize: fontSize.xs - 1,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default LoginScreen;