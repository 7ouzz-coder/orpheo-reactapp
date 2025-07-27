import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Redux - USAR SOLO LOS SELECTORES QUE SABEMOS QUE EXISTEN
import { 
  selectIsAuthenticated, 
  selectIsLoading,
  checkAuthStatus
} from '../../store/slices/authSlice';

// Screens - IMPORTAR SOLO LOS QUE NO CAUSAN PROBLEMAS
import LoginScreen from '../../screens/auth/LoginScreen';
import DashboardScreen from '../../screens/dashboard/DashboardScreen';

// NO IMPORTAR ESTOS POR AHORA (pueden tener imports problemáticos):
// import MiembrosListScreen from '../../screens/miembros/MiembrosListScreen';
// import DocumentosListScreen from '../../screens/documentos/DocumentosListScreen';
// import ProfileScreen from '../../screens/profile/ProfileScreen';

// Colors - DEFINIR LOCALMENTE PARA EVITAR ERRORES
const colors = {
  background: '#0F0F0F',
  surface: '#1A1A1A',
  primary: '#D4AF37',
  text: '#FFFFFF',
  textMuted: '#808080',
  border: '#333333',
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Componente temporal para todas las pestañas que no están listas
const PlaceholderScreen = ({ route }) => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  }}>
    <Icon name="construction" size={60} color={colors.primary} />
    <Text style={{ 
      color: colors.text, 
      fontSize: 18, 
      marginTop: 16,
      fontWeight: '600',
      textAlign: 'center',
    }}>
      {route.name} - En Desarrollo
    </Text>
    <Text style={{ 
      color: colors.textMuted, 
      fontSize: 14, 
      marginTop: 8,
      textAlign: 'center',
      paddingHorizontal: 20,
      lineHeight: 20,
    }}>
      Esta sección estará disponible próximamente.{'\n'}
      Estamos trabajando en implementar todas las funcionalidades.
    </Text>
    <View style={{
      marginTop: 20,
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      <Text style={{
        color: colors.text,
        fontSize: 12,
        textAlign: 'center',
      }}>
        ✅ Login funcionando{'\n'}
        ✅ Navegación operativa{'\n'}
        ✅ Redux configurado{'\n'}
        🔄 Módulos en desarrollo
      </Text>
    </View>
  </View>
);

// Navegador principal con tabs
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Miembros" 
        component={PlaceholderScreen}
        options={{
          title: 'Miembros',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Documentos" 
        component={PlaceholderScreen}
        options={{
          title: 'Documentos',
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-document" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PlaceholderScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Navegador principal
const AppNavigator = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  useEffect(() => {
    // Verificar estado de autenticación al iniciar
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{
          color: colors.text,
          marginTop: 16,
          fontSize: 16,
        }}>
          Cargando Orpheo...
        </Text>
      </View>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;