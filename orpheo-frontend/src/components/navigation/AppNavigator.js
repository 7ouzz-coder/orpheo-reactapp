import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { View, ActivityIndicator } from 'react-native';

import { colors } from '../../styles/colors';
import { 
  selectIsAuthenticated, 
  selectAuthLoading, 
  getCurrentUser,
  checkLockStatus 
} from '../../store/slices/authSlice';
import LoginScreen from '../../screens/auth/LoginScreen';
import DashboardScreen from '../../screens/dashboard/DashboardScreen';
import MiembrosNavigator from './MiembrosNavigator';
import PerfilScreen from '../../screens/perfil/PerfilScreen';
import ConnectionTest from '../debug/ConnectionTest';
import LoginDebug from '../debug/LoginDebug';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ Función para obtener el icono de manera segura
const getTabIcon = (routeName, focused, color, size) => {
  let iconName = 'help'; // Icono por defecto
  
  try {
    switch (routeName) {
      case 'Dashboard':
        iconName = 'dashboard';
        break;
      case 'Miembros':
        iconName = 'people';
        break;
      case 'Documentos':
        iconName = 'description';
        break;
      case 'Programas':
        iconName = 'calendar-today';
        break;
      case 'ConnectionTest':
        iconName = 'bug-report';
        break;
      case 'LoginDebug':
        iconName = 'code';
        break;
      case 'Perfil':
        iconName = 'person';
        break;
      default:
        iconName = 'help';
    }
  } catch (error) {
    console.warn('Error getting tab icon:', error);
    iconName = 'help';
  }
  
  return <Icon name={iconName} size={size} color={color} />;
};

// Tab Navigator para usuarios autenticados
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => getTabIcon(route.name, focused, color, size),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.card,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        // ✅ Prevenir errores de rendering
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ 
          title: 'Dashboard',
          headerShown: true,
        }}
      />
      <Tab.Screen 
        name="Miembros" 
        component={MiembrosNavigator}
        options={{ 
          title: 'Miembros', 
          headerShown: false 
        }}
      />
      
      {/* ✅ Tabs de debug solo en desarrollo */}
      {__DEV__ && (
        <>
          <Tab.Screen 
            name="ConnectionTest" 
            component={ConnectionTest}
            options={{ title: 'Test API' }}
          />
          <Tab.Screen 
            name="LoginDebug" 
            component={LoginDebug}
            options={{ title: 'Debug' }}
          />
        </>
      )}
      
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

// ✅ Componente de Loading mejorado
const LoadingScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.background 
  }}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

// Stack principal de la aplicación
const AppNavigator = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);

  useEffect(() => {
    // ✅ Verificar token guardado al iniciar la app
    const initializeAuth = async () => {
      try {
        // Verificar estado de bloqueo
        dispatch(checkLockStatus());
        
        // Verificar si hay token guardado
        await dispatch(getCurrentUser()).unwrap();
      } catch (error) {
        // Si no hay token o es inválido, no hacer nada
        // El usuario será dirigido al login automáticamente
        console.log('No hay sesión activa:', error.message || error);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // ✅ Mostrar loading mientras se verifica autenticación
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <NavigationContainer
      onStateChange={(state) => {
        // ✅ Log seguro del estado de navegación en desarrollo
        if (__DEV__ && state) {
          console.log('Navigation state changed:', state.routeNames || 'No routes');
        }
      }}
      onError={(error) => {
        // ✅ Manejo de errores de navegación
        console.error('Navigation error:', error);
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          // ✅ Animaciones suaves
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ 
              headerShown: false,
              // ✅ Prevenir navegación hacia atrás desde login
              gestureEnabled: false,
            }}
          />
        ) : (
          <Stack.Screen 
            name="Main" 
            component={MainTabNavigator}
            options={{ 
              headerShown: false,
              // ✅ Prevenir navegación hacia atrás desde main
              gestureEnabled: false,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;