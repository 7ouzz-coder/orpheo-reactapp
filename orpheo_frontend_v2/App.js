import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

// Store
import { store, persistor } from './src/store/store';

// Navigation
import AppNavigator from './src/components/navigation/Appnavigator';

// Colors
import { colors } from './src/styles/colors';

// Simple Loading Component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.loadingText}>Cargando Orpheo...</Text>
  </View>
);

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor={colors.background} />
          <AppNavigator />
          <Toast />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text,
    fontSize: 16,
  },
});