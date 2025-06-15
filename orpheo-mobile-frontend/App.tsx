import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { Loading } from './src/components/common';
import { theme } from './src/utils/theme';
import { initializeApp } from './src/store/slices/authSlice';

export default function App() {
  useEffect(() => {
    // Inicializar la aplicación al cargar
    store.dispatch(initializeApp());
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate 
            loading={<Loading fullScreen text="Cargando aplicación..." />} 
            persistor={persistor}
          >
            <NavigationContainer 
              theme={{
                dark: true,
                colors: {
                  primary: theme.colors.gold,
                  background: theme.colors.background,
                  card: theme.colors.surface,
                  text: theme.colors.grayText,
                  border: theme.colors.grayBorder,
                  notification: theme.colors.error,
                },
              }}
            >
              <StatusBar 
                style="light" 
                backgroundColor={theme.colors.surface} 
                translucent={false}
              />
              <AppNavigator />
              <Toast />
            </NavigationContainer>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}