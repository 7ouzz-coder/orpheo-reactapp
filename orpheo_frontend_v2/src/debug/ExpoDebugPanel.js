import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import Constants from 'expo-constants';
import { testExpoConnection, updateAPIConfig } from '../../services/apiClient';
import { colors } from '../../styles/colors';

const ExpoDebugPanel = ({ visible = false, onClose }) => {
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [currentIP, setCurrentIP] = useState('');
  const [newIP, setNewIP] = useState('');

  useEffect(() => {
    // Obtener IP actual de la configuración
    const currentURL = API_CONFIG.API_BASE_URL;
    const ipMatch = currentURL.match(/http:\/\/(.+):3001/);
    if (ipMatch) {
      setCurrentIP(ipMatch[1]);
      setNewIP(ipMatch[1]);
    }
  }, []);

  const testConnection = async () => {
    setConnectionStatus('testing');
    const result = await testExpoConnection();
    setConnectionStatus(result.success ? 'connected' : 'error');
    
    if (!result.success) {
      Alert.alert('Error de Conexión', result.error + '\n\nSugerencias:\n' + result.suggestions.join('\n'));
    }
  };

  const updateIP = () => {
    if (newIP && newIP !== currentIP) {
      updateAPIConfig(newIP);
      setCurrentIP(newIP);
      Alert.alert('IP Actualizada', `Nueva IP configurada: ${newIP}`);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <Text style={styles.title}>🔧 Debug Panel - Expo Go</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Info del Dispositivo</Text>
          <Text style={styles.info}>Expo Go: {Constants.appOwnership === 'expo' ? 'Sí' : 'No'}</Text>
          <Text style={styles.info}>Plataforma: {Platform.OS}</Text>
          <Text style={styles.info}>Versión Expo: {Constants.expoVersion}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Configuración API</Text>
          <Text style={styles.info}>IP Actual: {currentIP}</Text>
          <Text style={styles.info}>URL: {API_CONFIG.API_BASE_URL}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nueva IP:</Text>
            <TextInput
              style={styles.input}
              value={newIP}
              onChangeText={setNewIP}
              placeholder="192.168.1.14"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={styles.button} onPress={updateIP}>
              <Text style={styles.buttonText}>Actualizar IP</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Test de Conexión</Text>
          <TouchableOpacity style={styles.button} onPress={testConnection}>
            <Text style={styles.buttonText}>
              {connectionStatus === 'testing' ? 'Probando...' : 'Probar Conexión'}
            </Text>
          </TouchableOpacity>
          
          <Text style={[
            styles.status,
            { color: connectionStatus === 'connected' ? colors.success : 
                     connectionStatus === 'error' ? colors.error : colors.textMuted }
          ]}>
            Estado: {connectionStatus === 'connected' ? '✅ Conectado' :
                     connectionStatus === 'error' ? '❌ Error' :
                     connectionStatus === 'testing' ? '🔄 Probando...' : '⚪ Sin probar'}
          </Text>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxWidth: 350,
    width: '90%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 5,
  },
  inputGroup: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    marginBottom: 10,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ExpoDebugPanel;