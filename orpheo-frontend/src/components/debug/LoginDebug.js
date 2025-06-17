// src/components/debug/LoginDebug.js
// Componente para debuggear el login específicamente

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Constants from 'expo-constants';
import ENV from '../../config/env';
import authService from '../../services/authService';
import { loginUser, selectAuth } from '../../store/slices/authSlice';
import { colors } from '../../styles/colors';

const LoginDebug = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [logs, setLogs] = useState([]);
  const dispatch = useDispatch();
  const authState = useSelector(selectAuth);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  const clearLogs = () => setLogs([]);

  const debugLogin = async () => {
    clearLogs();
    addLog('🔍 Iniciando debug de login...', 'info');

    try {
      // 1. Verificar configuración
      addLog(`📱 Expo Host URI: ${Constants.expoConfig?.hostUri}`, 'info');
      addLog(`🌐 API URL: ${ENV.API_URL}`, 'info');
      addLog(`📋 Estado Redux actual: ${JSON.stringify(authState, null, 2)}`, 'info');

      // 2. Test directo del servicio
      addLog('2️⃣ Probando authService.login() directamente...', 'info');
      const directResponse = await authService.login({ username, password });
      addLog(`✅ Response directa: ${JSON.stringify(directResponse, null, 2)}`, 'success');

      // 3. Test con Redux
      addLog('3️⃣ Probando con Redux dispatch...', 'info');
      const reduxResult = await dispatch(loginUser({ username, password }));
      addLog(`📦 Redux result: ${JSON.stringify(reduxResult, null, 2)}`, 'info');

      if (reduxResult.type.includes('fulfilled')) {
        addLog('✅ Login con Redux exitoso!', 'success');
      } else {
        addLog(`❌ Login con Redux falló: ${reduxResult.payload}`, 'error');
      }

    } catch (error) {
      addLog(`❌ Error en debug: ${error.message}`, 'error');
      addLog(`Stack: ${error.stack}`, 'error');
      
      if (error.response) {
        addLog(`Response status: ${error.response.status}`, 'error');
        addLog(`Response data: ${JSON.stringify(error.response.data)}`, 'error');
      }
    }
  };

  const testCredentials = [
    { username: 'admin', password: 'password123' },
    { username: 'venerable', password: 'password123' },
    { username: 'secretario', password: 'password123' },
  ];

  const testAllCredentials = async () => {
    clearLogs();
    addLog('🧪 Probando todas las credenciales...', 'info');

    for (const cred of testCredentials) {
      try {
        addLog(`Probando: ${cred.username}/${cred.password}`, 'info');
        const response = await authService.login(cred);
        addLog(`✅ ${cred.username}: ${response.success ? 'OK' : 'FAIL'}`, response.success ? 'success' : 'error');
      } catch (error) {
        addLog(`❌ ${cred.username}: ${error.response?.data?.message || error.message}`, 'error');
      }
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'info': return colors.info;
      default: return colors.textPrimary;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐛 Debug Login</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor={colors.textSecondary}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={debugLogin}>
          <Text style={styles.buttonText}>🔍 Debug Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testAllCredentials}>
          <Text style={styles.buttonText}>🧪 Test All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearLogs}>
          <Text style={styles.buttonText}>🗑️ Clear</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.stateTitle}>Estado Actual:</Text>
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>
          Autenticado: {authState.isAuthenticated ? '✅' : '❌'}
        </Text>
        <Text style={styles.stateText}>
          Loading: {authState.loading ? '⏳' : '✅'}
        </Text>
        <Text style={styles.stateText}>
          Error: {authState.error || '✅ Ninguno'}
        </Text>
        <Text style={styles.stateText}>
          Intentos: {authState.loginAttempts}/{authState.maxLoginAttempts}
        </Text>
      </View>

      <ScrollView style={styles.logsContainer}>
        {logs.map((log, index) => (
          <View key={index} style={styles.logItem}>
            <Text style={styles.timestamp}>{log.timestamp}</Text>
            <Text style={[styles.logText, { color: getLogColor(log.type) }]}>
              {log.message}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  form: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: colors.textPrimary,
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 12,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  stateContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  stateText: {
    color: colors.textPrimary,
    fontSize: 12,
    marginBottom: 4,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 10,
  },
  logItem: {
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 8,
    color: colors.textTertiary,
  },
  logText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
});

export default LoginDebug;