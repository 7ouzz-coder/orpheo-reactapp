import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../../styles/colors';

import MiembrosListScreen from '../../screens/miembros/MiembrosListScreen';
import MiembroDetailScreen from '../../screens/miembros/MiembroDetailScreen';
import MiembroFormScreen from '../../screens/miembros/MiembroFormScreen';

const Stack = createNativeStackNavigator();

const MiembrosNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="MiembrosList" 
        component={MiembrosListScreen}
        options={{ title: 'Miembros' }}
      />
      <Stack.Screen 
        name="MiembroDetail" 
        component={MiembroDetailScreen}
        options={{ title: 'Detalle del Miembro' }}
      />
      <Stack.Screen 
        name="MiembroForm" 
        component={MiembroFormScreen}
        options={({ route }) => ({
          title: route.params?.miembro ? 'Editar Miembro' : 'Nuevo Miembro'
        })}
      />
    </Stack.Navigator>
  );
};

export default MiembrosNavigator;