import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Redux
import { 
  selectIsAuthenticated, 
  selectIsLoading,
  checkAuthStatus 
} from '../../store/slices/authSlice';

// Screens
import LoginScreen from '../../screens/auth/LoginScreen';
import DashboardScreen from '../../screens/dashboard/DashboardScreen';
import MiembrosListScreen from '../../screens/miembros/MiembrosListScreen';
import MiembroDetailScreen from '../../screens/miembros/MiembroDetailScreen';
import MiembroFormScreen from '../../screens/miembros/MiembroFormScreen';
import DocumentosListScreen from '../../screens/documentos/DocumentosListScreen';
import DocumentoDetailScreen from '../../screens/documentos/DocumentoDetailScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';

// Styles
import { colors } from '../../styles/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navegador de Miembros
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
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="MiembrosList" 
        component={MiembrosListScreen}
        options={{ 
          title: 'Miembros',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen 
        name="MiembroDetail" 
        component={MiembroDetailScreen}
        options={{ 
          title: 'Detalle del Miembro',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="MiembroForm" 
        component={MiembroFormScreen}
        options={({ route }) => ({
          title: route.params?.miembro ? 'Editar Miembro' : 'Nuevo Miembro',
          presentation: 'modal',
        })}
      />
    </Stack.Navigator>
  );
};

// Navegador de Documentos
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
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="DocumentosList" 
        component={DocumentosListScreen}
        options={{ 
          title: 'Documentos',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen 
        name="DocumentoDetail" 
        component={DocumentoDetailScreen}
        options={{ 
          title: 'Documento',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

// Navegador con Tabs principales
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'MiembrosTab':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'DocumentosTab':
              iconName = focused ? 'file-document' : 'file-document-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Inicio',
        }}
      />
      <Tab.Screen 
        name="MiembrosTab" 
        component={MiembrosNavigator}
        options={{
          title: 'Miembros',
        }}
      />
      <Tab.Screen 
        name="DocumentosTab" 
        component={DocumentosNavigator}
        options={{
          title: 'Documentos',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

// Navegador de autenticación
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
    </Stack.Navigator>
  );
};

// Loading Screen
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

// Navegador principal
const AppNavigator = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  // Verificar autenticación al iniciar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(checkAuthStatus()).unwrap();
      } catch (error) {
        console.log('No hay sesión previa:', error);
      }
    };

    checkAuth();
  }, [dispatch]);

  // Mostrar loading mientras se verifica autenticación
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Navegación condicional basada en autenticación
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {isAuthenticated ? (
        // Usuario autenticado - mostrar app principal
        <Stack.Screen 
          name="MainApp" 
          component={TabNavigator}
        />
      ) : (
        // Usuario no autenticado - mostrar login
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;