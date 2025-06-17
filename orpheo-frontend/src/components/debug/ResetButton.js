import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { resetLoginAttempts } from '../../store/slices/authSlice';
import { colors } from '../../styles/colors';

const ResetButton = () => {
  const dispatch = useDispatch();

  const resetAll = async () => {
    try {
      // 1. Limpiar Redux state
      dispatch(resetLoginAttempts());
      
      // 2. Limpiar AsyncStorage (Redux persist)
      await AsyncStorage.clear();
      
      // 3. Limpiar SecureStore
      await SecureStore.deleteItemAsync('authToken');
      
      Alert.alert(
        '✅ Estado Reseteado',
        'El estado del frontend ha sido limpiado completamente. La app se reiniciará.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Recargar la app
              require('react-native').DevSettings?.reload();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', `No se pudo resetear: ${error.message}`);
    }
  };

  const confirmReset = () => {
    Alert.alert(
      '🔄 Resetear Estado',
      '¿Estás seguro? Esto limpiará todos los datos guardados y reiniciará la app.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Resetear', onPress: resetAll, style: 'destructive' }
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.resetButton} onPress={confirmReset}>
      <Text style={styles.resetText}>🔄 Resetear Estado</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  resetButton: {
    backgroundColor: colors.warning,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 10,
  },
  resetText: {
    color: colors.background,
    fontWeight: 'bold',
  },
});

export default ResetButton;