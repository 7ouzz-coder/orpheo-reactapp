import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DocumentosStackParamList } from '@/types/navigation';
import { theme } from '@/utils/theme';

// Pantallas de documentos
import DocumentosScreen from '@/screens/documentos/DocumentosScreen';
import DocumentoDetailScreen from '@/screens/documentos/DocumentoDetailScreen';
import DocumentoUploadScreen from '@/screens/documentos/DocumentoUploadScreen';

const Stack = createStackNavigator<DocumentosStackParamList>();

const DocumentosNavigator: React.FC = () => {
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
        // Animación estándar horizontal
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
      }}
      initialRouteName="DocumentosList"
    >
      {/* Lista de documentos */}
      <Stack.Screen
        name="DocumentosList"
        component={DocumentosScreen}
        options={{
          title: 'Documentos',
        }}
      />

      {/* Detalle de documento */}
      <Stack.Screen
        name="DocumentoDetail"
        component={DocumentoDetailScreen}
        options={({ route }) => ({
          title: route.params?.documento?.titulo || 'Detalle del Documento',
          // Animación especial para vista de documento (slide up)
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

      {/* Subir documento */}
      <Stack.Screen
        name="DocumentoUpload"
        component={DocumentoUploadScreen}
        options={{
          title: 'Subir Documento',
          // Modal presentation para upload
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
        }}
      />
    </Stack.Navigator>
  );
};

export default DocumentosNavigator;