import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../../styles/colors';

// Import screens - usando tus archivos existentes
import DocumentosListScreen from '../../screens/documentos/DocumentosListScreen';
import DocumentoDetailScreen from '../../screens/documentos/DocumentoDetailScreen';
import DocumentoUploadScreen from '../../screens/documentos/DocumentoUploadScreen';
import DocumentoViewer from '../../components/documentos/DocumentoViewer';

const Stack = createNativeStackNavigator();

const DocumentosNavigator = () => {
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
        name="DocumentosList" 
        component={DocumentosListScreen}
        options={{ title: 'Documentos' }}
      />
      <Stack.Screen 
        name="DocumentoDetail" 
        component={DocumentoDetailScreen}
        options={{ title: 'Detalle del Documento' }}
      />
      <Stack.Screen 
        name="DocumentoUpload" 
        component={DocumentoUploadScreen}
        options={{ title: 'Subir Documento' }}
      />
      <Stack.Screen 
        name="DocumentoViewer" 
        component={DocumentoViewer}
        options={{ 
          title: 'Visor de Documento',
          presentation: 'modal'
        }}
      />
    </Stack.Navigator>
  );
};

export default DocumentosNavigator;