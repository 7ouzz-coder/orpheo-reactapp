import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import { View, ActivityIndicator } from 'react-native';

import { store, persistor } from './src/store/store';
import AppNavigator from './src/components/navigation/AppNavigator';
import { colors } from './src/styles/colors';
import WebSocketProvider from './src/components/providers/WebSocketProvider';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = React.useState(true); // Simplificado por ahora

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        } 
        persistor={persistor}
      >
        <WebSocketProvider>
          <StatusBar style="light" />
          <AppNavigator />
          <Toast />
        </WebSocketProvider>
      </PersistGate>
    </Provider>
  );
}