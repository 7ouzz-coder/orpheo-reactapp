import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';
import { colors } from '../../styles/colors';
import ResetButton from './ResetButton'; // 🔥 Importar botón de reset

const ConnectionTest = () => {
  const [logs, setLogs] = useState([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const clearLogs = () => setLogs([]);

  const testConnection = async () => {
    setTesting(true);
    clearLogs();

    try {
      // Obtener IP automáticamente
      const hostUri = Constants.expoConfig?.hostUri;
      const ip = hostUri ? hostUri.split(':').shift() : 'localhost';
      const API_URL = `http://${ip}:3001/api`;
      
      addLog(`🔍 Probando conexión a: ${API_URL}`, 'info');
      addLog(`📱 Expo Host URI: ${hostUri}`, 'info');

      // 1. Test Health Check
      addLog('1️⃣ Probando health check...', 'info');
      const healthResponse = await axios.get(`http://${ip}:3001/health`, {
        timeout: 5000
      });
      addLog(`✅ Health check OK: ${healthResponse.data.status}`, 'success');

      // 2. Test Login con múltiples usuarios
      const testUsers = [
        { username: 'admin', password: 'password123' },
        { username: 'venerable', password: 'password123' },
        { username: 'secretario', password: 'password123' },
      ];

      for (const testUser of testUsers) {
        try {
          addLog(`2️⃣ Probando login con: ${testUser.username}`, 'info');
          const loginResponse = await axios.post(`${API_URL}/auth/login`, testUser, {
            timeout: 5000,
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (loginResponse.data.success) {
            addLog(`✅ Login exitoso: ${loginResponse.data.user.username} (${loginResponse.data.user.role})`, 'success');
            
            // 3. Test Miembros con Token
            addLog('3️⃣ Probando obtener miembros...', 'info');
            const miembrosResponse = await axios.get(`${API_URL}/miembros`, {
              headers: { Authorization: `Bearer ${loginResponse.data.token}` },
              timeout: 5000
            });
            
            addLog(`✅ Miembros obtenidos: ${miembrosResponse.data.data.length}`, 'success');
            addLog('🎉 ¡Conexión completamente funcional!', 'success');
            break; // Salir del loop si un login es exitoso
          }
        } catch (userError) {
          addLog(`❌ Error con ${testUser.username}: ${userError.response?.data?.message || userError.message}`, 'error');
        }
      }

    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
      if (error.response) {
        addLog(`Status: ${error.response.status}`, 'error');
        addLog(`Data: ${JSON.stringify(error.response.data)}`, 'error');
      } else if (error.request) {
        addLog('❌ No se pudo conectar al servidor', 'error');
        addLog('Verifica que el backend esté corriendo en puerto 3001', 'error');
      }
    } finally {
      setTesting(false);
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
      <Text style={styles.title}>🔧 Test de Conexión</Text>
      
      {/* 🔥 Botón de reset */}
      <ResetButton />
      
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[styles.button, testing && styles.buttonDisabled]} 
          onPress={testConnection}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? 'Probando...' : 'Probar Conexión'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearLogs}
        >
          <Text style={styles.buttonText}>Limpiar Logs</Text>
        </TouchableOpacity>
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
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  clearButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: colors.background,
    fontWeight: 'bold',
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
    fontSize: 10,
    color: colors.textTertiary,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default ConnectionTest;