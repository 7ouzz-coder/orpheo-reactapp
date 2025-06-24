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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

import { colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';
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

  // ✅ Efecto para manejar el countdown del bloqueo
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

  // ✅ Verificar estado de bloqueo al cargar
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
            <Icon name="lock" size={16} color={colors.error} />
            <Text style={styles.lockText}>
              Bloqueado por {formatTime(countdown)}
            </Text>
          </View>
        ) : (
          <View style={styles.attemptsWarning}>
            <Icon name="warning" size={16} color={colors.warning} />
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
    >
      <View style={[styles.testUserIcon, { backgroundColor: user.color }]}>
        <Icon name={user.icon} size={24} color={colors.white} />
      </View>
      <View style={styles.testUserInfo}>
        <Text style={styles.testUserTitle}>{user.title}</Text>
        <Text style={styles.testUserDescription}>{user.description}</Text>
        <Text style={styles.testUserCredentials}>
          {user.username} / {user.password}
        </Text>
      </View>
      {selectedUser?.username === user.username && (
        <Icon name="check-circle" size={24} color={colors.success} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Icon name="account-balance" size={60} color={colors.background} />
            </View>
            <Text style={styles.title}>ORPHEO</Text>
            <Text style={styles.subtitle}>Sistema de Gestión Masónica</Text>
          </View>

          {/* ✅ Estado de bloqueo */}
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
              <Icon name="person" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Usuario"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!loading && canLogin}
              />
            </View>

            <View style={[
              styles.inputContainer,
              !canLogin && styles.inputDisabled
            ]}>
              <Icon name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading && canLogin}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={!canLogin}
              >
                <Icon 
                  name={showPassword ? "visibility" : "visibility-off"} 
                  size={20} 
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
                <Icon name="info" size={16} color={colors.info} />
                <Text style={styles.selectedUserText}>
                  Ingresando como: {selectedUser.title}
                </Text>
              </View>
            )}
          </View>

          {/* ✅ Información de debug del sistema de bloqueo */}
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
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // ✅ Estilos del sistema de bloqueo
  lockStatusContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  lockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lockText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  attemptsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  attemptsText: {
    color: colors.warning,
    fontSize: 14,
    marginLeft: 8,
  },
  attemptsCount: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  
  testUsersContainer: {
    marginBottom: 32,
  },
  testUsersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  testUsersSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  testUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 1,
  },
  testUserCardSelected: {
    borderColor: colors.success,
    backgroundColor: colors.card,
  },
  testUserIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  testUserInfo: {
    flex: 1,
  },
  testUserTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  testUserDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  testUserCredentials: {
    fontSize: 11,
    color: colors.textTertiary,
    fontFamily: 'monospace',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.card,
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: colors.card,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.textPrimary,
  },
  eyeButton: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  loginButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
  },
  selectedUserText: {
    color: colors.info,
    fontSize: 14,
    marginLeft: 8,
  },
  
  // ✅ Debug container
  debugContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  debugTitle: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  debugText: {
    color: colors.textTertiary,
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  version: {
    color: colors.textTertiary,
    fontSize: 12,
    textAlign: 'center',
  },
  devMode: {
    color: colors.warning,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default LoginScreen;