import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Text } from 'react-native';
import Toast from 'react-native-toast-message';

// Store
import { store, persistor } from './src/store/store';

// Navigation
import AppNavigator from './src/components/navigation/AppNavigator';

// Styles
import { colors } from './src/styles/colors';

// Loading component
const LoadingScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.background 
  }}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={{ 
      marginTop: 16, 
      color: colors.text, 
      fontSize: 16,
      fontWeight: '500' 
    }}>
      Cargando Orpheo...
    </Text>
  </View>
);

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={<LoadingScreen />} 
        persistor={persistor}
      >
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor={colors.primary} />
            <AppNavigator />
            <Toast />
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}