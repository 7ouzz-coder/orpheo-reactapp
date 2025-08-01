import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { Platform, View, ActivityIndicator } from 'react-native'; // ✅ PLATFORM PRESENTE
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

// Redux
import { 
  checkAuthStatus, 
  selectIsAuthenticated, 
  selectIsLoading 
} from '../../store/slices/authSlice';

// Screens - Auth
import LoginScreen from '../../screens/auth/LoginScreen';

// Screens - Main
import DashboardScreen from '../../screens/dashboard/DashboardScreen';

// Screens - Miembros
import MiembrosListScreen from '../../screens/miembros/MiembrosListScreen';
import MiembroDetailScreen from '../../screens/miembros/MiembroDetailScreen';
import MiembroFormScreen from '../../screens/miembros/MiembroFormScreen';

// Screens - Documentos
import DocumentosListScreen from '../../screens/documentos/DocumentosListScreen';

// Screens - Profile
import ProfileScreen from '../../screens/profile/ProfileScreen';

// Styles
import { colors } from '../../styles/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack Navigator para Miembros
const MiembrosStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: colors.text,
        },
        headerBackTitleVisible: false,
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
          title: route.params?.miembroId ? 'Editar Miembro' : 'Nuevo Miembro',
          presentation: 'modal',
        })}
      />
    </Stack.Navigator>
  );
};

// Tab Navigator Principal
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 70, // ✅ PLATFORM USADO
          paddingBottom: Platform.OS === 'ios' ? 20 : 8, // ✅ PLATFORM USADO
          paddingTop: 8,
          paddingHorizontal: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 4, // ✅ PLATFORM USADO
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, size, focused }) => {
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
              iconName = focused ? 'account-circle' : 'account-circle-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="Miembros" 
        component={MiembrosStackNavigator}
        options={{ title: 'Miembros' }}
      />
      <Tab.Screen 
        name="Documentos" 
        component={DocumentosListScreen}
        options={{ title: 'Documentos' }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

// Navegador Principal de la App
const AppNavigator = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  // Verificar estado de autenticación al iniciar
  useEffect(() => {
    console.log('🔄 AppNavigator: Verificando estado de autenticación');
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
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
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainTabNavigator />
      ) : (
        <LoginScreen />
      )}
      <Toast />
    </NavigationContainer>
  );
};

export default AppNavigator;