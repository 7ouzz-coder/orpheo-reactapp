import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Slices
import { checkAuthStatus, selectIsAuthenticated, selectIsLoading } from '../../store/slices/authSlice';

// Screens
import LoginScreen from '../../screens/auth/LoginScreen';
import DashboardScreen from '../../screens/dashboard/DashboardScreen';
import MiembrosScreen from '../../screens/miembros/MiembrosScreen';
import MiembroDetailScreen from '../../screens/miembros/MiembroDetailScreen';
import MiembroFormScreen from '../../screens/miembros/MiembroFormScreen';
import DocumentosScreen from '../../screens/documentos/DocumentosScreen';
import DocumentoDetailScreen from '../../screens/documentos/DocumentoDetailScreen';
import DocumentoUploadScreen from '../../screens/documentos/DocumentoUploadScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import ChangePasswordScreen from '../../screens/profile/ChangePasswordScreen';

// Colores del tema
import { colors } from '../../styles/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navegador de Miembros
const MiembrosNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.primaryLight,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MiembrosList" 
        component={MiembrosScreen}
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

// Navegador de Documentos
const DocumentosNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.primaryLight,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="DocumentosList" 
        component={DocumentosScreen}
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
    </Stack.Navigator>
  );
};

// Navegador de Perfil
const ProfileNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.primaryLight,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ title: 'Mi Perfil' }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{ title: 'Cambiar Contraseña' }}
      />
    </Stack.Navigator>
  );
};

// Navegador Principal con Tabs
const MainTabNavigator = () => {
  const user = useSelector(state => state.auth.user);

  // Función para obtener el icono del tab
  const getTabIcon = (route, focused, color, size) => {
    let iconName;

    switch (route.name) {
      case 'Dashboard':
        iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
        break;
      case 'Miembros':
        iconName = focused ? 'account-group' : 'account-group-outline';
        break;
      case 'Documentos':
        iconName = focused ? 'file-document' : 'file-document-outline';
        break;
      case 'Perfil':
        iconName = focused ? 'account' : 'account-outline';
        break;
      default:
        iconName = 'circle';
    }

    return <Icon name={iconName} size={size} color={color} />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => getTabIcon(route, focused, color, size),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
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
          tabBarLabel: 'Inicio',
        }}
      />
      
      <Tab.Screen 
        name="Miembros" 
        component={MiembrosNavigator}
        options={{
          tabBarLabel: 'Miembros',
        }}
      />
      
      <Tab.Screen 
        name="Documentos" 
        component={DocumentosNavigator}
        options={{
          tabBarLabel: 'Documentos',
        }}
      />
      
      <Tab.Screen 
        name="Perfil" 
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

// Navegador de Autenticación
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

// Componente de Loading
const LoadingScreen = () => {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

// Navegador Principal de la App
const AppNavigator = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  // Verificar estado de autenticación al iniciar
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;