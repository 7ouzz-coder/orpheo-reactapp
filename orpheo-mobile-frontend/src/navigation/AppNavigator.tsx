import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootStackParamList } from '@/types/navigation';
import { RootState } from '@/store';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import { Loading } from '@/components/common';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  // Mostrar loading durante la verificación inicial de autenticación
  if (isLoading) {
    return (
      <Loading
        fullScreen
        text="Verificando autenticación..."
        size="large"
      />
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
        animationEnabled: true,
        gestureEnabled: false, // Deshabilitar gestos para evitar salir accidentalmente
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{
            animationTypeForReplace: 'pop',
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;