import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import { View, ActivityIndicator } from 'react-native';

import { store, persistor } from '../orpheo-frontend/src/store/store';
import AppNavigator from '../orpheo-frontend/src/components/navigation/AppNavigator';
import { colors } from '../orpheo-frontend/src/styles/colors';

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
        {/* ✅ StatusBar corregido - sin backgroundColor para evitar warning */}
        <StatusBar style="light" />
        <AppNavigator />
        <Toast />
      </PersistGate>
    </Provider>
  );
}