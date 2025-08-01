import React from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';

// Redux
import { store, persistor } from './src/store/store';

// Navigation
import AppNavigator from './src/components/navigation/Appnavigator';

// Components
import LoadingSpinner from './src/components/common/LoadingSpinner';

// Styles
import { colors } from './src/styles/colors';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner text="Iniciando Orpheo..." />} persistor={persistor}>
        <SafeAreaProvider>
          {/* StatusBar configuración */}
          <StatusBar 
            style="light" 
            backgroundColor="transparent"
            translucent={true}
          />
          
          {/* View para el fondo del StatusBar */}
          <View style={styles.statusBarBackground} />
          
          {/* Navegación principal*/}
          <AppNavigator />
          
          {/* Toast global */}
          <Toast />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  statusBarBackground: {
    height: Platform.OS === 'ios' ? 44 : 24, // Altura del status bar
    backgroundColor: colors.background,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
});