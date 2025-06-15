import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MiembrosStackParamList } from '@/types/navigation';
import { theme } from '@/utils/theme';

// Pantallas de miembros
import MiembrosScreen from '@/screens/miembros/MiembrosScreen';
import MiembroDetailScreen from '@/screens/miembros/MiembroDetailScreen';
import MiembroFormScreen from '@/screens/miembros/MiembroFormScreen';

const Stack = createStackNavigator<MiembrosStackParamList>();

const MiembrosNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Usaremos nuestro Header personalizado
        cardStyle: { 
          backgroundColor: theme.colors.background 
        },
        animationEnabled: true,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        // Animación personalizada para mejor UX
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
            overlayStyle: {
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          };
        },
      }}
      initialRouteName="MiembrosList"
    >
      {/* Lista de miembros */}
      <Stack.Screen
        name="MiembrosList"
        component={MiembrosScreen}
        options={{
          title: 'Miembros',
        }}
      />

      {/* Detalle de miembro */}
      <Stack.Screen
        name="MiembroDetail"
        component={MiembroDetailScreen}
        options={({ route }) => ({
          title: route.params?.miembro?.nombreCompleto || 'Detalle del Miembro',
          // Animación desde abajo para modales
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateY: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0],
                    }),
                  },
                ],
              },
              overlayStyle: {
                opacity: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            };
          },
        })}
      />

      {/* Formulario de miembro (crear/editar) */}
      <Stack.Screen
        name="MiembroForm"
        component={MiembroFormScreen}
        options={({ route }) => ({
          title: route.params?.miembro ? 'Editar Miembro' : 'Nuevo Miembro',
          // Animación desde la derecha
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        })}
      />
    </Stack.Navigator>
  );
};

export default MiembrosNavigator;