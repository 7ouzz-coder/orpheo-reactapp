import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../../styles/colors';

// Import screens - usando tus archivos existentes
import ProgramasListScreen from '../../screens/programas/ProgramasListScreen';
import ProgramaDetailScreen from '../../screens/programas/ProgramaDetailScreen';
import ProgramaFormScreen from '../../screens/programas/ProgramaFormScreen';
import AsistenciaScreen from '../../screens/programas/AsistenciaScreen';

const Stack = createNativeStackNavigator();

const ProgramasNavigator = () => {
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
        name="ProgramasList" 
        component={ProgramasListScreen}
        options={{ title: 'Programas' }}
      />
      <Stack.Screen 
        name="ProgramaDetail" 
        component={ProgramaDetailScreen}
        options={{ title: 'Detalle del Programa' }}
      />
      <Stack.Screen 
        name="ProgramaForm" 
        component={ProgramaFormScreen}
        options={({ route }) => ({
          title: route.params?.programa ? 'Editar Programa' : 'Nuevo Programa'
        })}
      />
      <Stack.Screen 
        name="AsistenciaScreen" 
        component={AsistenciaScreen}
        options={{ title: 'Gestionar Asistencia' }}
      />
    </Stack.Navigator>
  );
};

export default ProgramasNavigator;