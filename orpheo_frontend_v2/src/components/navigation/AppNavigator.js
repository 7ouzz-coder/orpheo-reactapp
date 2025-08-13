import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { Platform, View, ActivityIndicator } from 'react-native';
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

// Screens - Dashboard
import DashboardScreen from '../../screens/dashboard/DashboardScreen';

// Screens - Miembros
import MiembrosListScreen from '../../screens/miembros/MiembrosListScreen';
import MiembroDetailScreen from '../../screens/miembros/MiembroDetailScreen';
import MiembroFormScreen from '../../screens/miembros/MiembroFormScreen';

// Screens - Documentos
import DocumentosListScreen from '../../screens/documentos/DocumentosListScreen';
import DocumentoDetailScreen from '../../screens/documentos/DocumentoDetailScreen';
import DocumentoUploadScreen from '../../screens/documentos/DocumentoUploadScreen';

// Screens - Profile
import ProfileScreen from '../../screens/profile/ProfileScreen';
import ChangePasswordScreen from '../../screens/profile/ChangePasswordScreen';
import EditProfileScreen from '../../screens/profile/EditProfileScreen';

// Screens - Notificaciones
import NotificacionesScreen from '../../screens/notificaciones/NotificacionesScreen';

// Screens - Configuración
import ConfiguracionScreen from '../../screens/configuracion/ConfiguracionScreen';
import AboutScreen from '../../screens/configuracion/AboutScreen';

// Styles
import { colors } from '../../styles/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ==========================================
// STACK NAVIGATORS POR MÓDULO
// ==========================================

// Stack Navigator para Dashboard
const DashboardStackNavigator = () => {
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
        name="DashboardMain" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
    </Stack.Navigator>
  );
};

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

// Stack Navigator para Documentos
const DocumentosStackNavigator = () => {
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
        options={{ 
          title: 'Nuevo Documento',
          presentation: 'modal' 
        }}
      />
      <Stack.Screen 
        name="DocumentoForm" 
        component={DocumentoUploadScreen}
        options={({ route }) => ({
          title: route.params?.documentoId ? 'Editar Documento' : 'Nuevo Documento',
          presentation: 'modal',
        })}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator para Notificaciones
const NotificacionesStackNavigator = () => {
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
        name="NotificacionesList" 
        component={NotificacionesScreen}
        options={{ title: 'Notificaciones' }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator para Perfil y Configuración
const ProfileStackNavigator = () => {
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
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ title: 'Mi Perfil' }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ 
          title: 'Editar Perfil',
          presentation: 'modal'
        }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{ 
          title: 'Cambiar Contraseña',
          presentation: 'modal'
        }}
      />
      <Stack.Screen 
        name="Configuracion" 
        component={ConfiguracionScreen}
        options={{ title: 'Configuración' }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen}
        options={{ title: 'Acerca de' }}
      />
    </Stack.Navigator>
  );
};

// ==========================================
// TAB NAVIGATOR PRINCIPAL
// ==========================================

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 34 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: -5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Miembros':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'Documentos':
              iconName = focused ? 'file-document-multiple' : 'file-document-multiple-outline';
              break;
            case 'Notificaciones':
              iconName = focused ? 'bell' : 'bell-outline';
              break;
            case 'Perfil':
              iconName = focused ? 'account-circle' : 'account-circle-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return (
            <View style={{ 
              alignItems: 'center', 
              justifyContent: 'center',
              paddingTop: 2 
            }}>
              <Icon name={iconName} size={size || 24} color={color} />
              {/* Badge para notificaciones */}
              {route.name === 'Notificaciones' && (
                <NotificationBadge />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStackNavigator}
        options={{ title: 'Inicio' }}
      />
      
      <Tab.Screen 
        name="Miembros" 
        component={MiembrosStackNavigator}
        options={{ title: 'Miembros' }}
      />
      
      <Tab.Screen 
        name="Documentos" 
        component={DocumentosStackNavigator}
        options={{ title: 'Documentos' }}
      />
      
      <Tab.Screen 
        name="Notificaciones" 
        component={NotificacionesStackNavigator}
        options={{ title: 'Avisos' }}
      />
      
      <Tab.Screen 
        name="Perfil" 
        component={ProfileStackNavigator}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

// ==========================================
// COMPONENTE BADGE DE NOTIFICACIONES
// ==========================================

const NotificationBadge = () => {
  // TODO: Conectar con estado de notificaciones no leídas
  const unreadCount = 0; // Reemplazar con selector de Redux

  if (unreadCount === 0) return null;

  return (
    <View style={{
      position: 'absolute',
      right: -6,
      top: -3,
      backgroundColor: colors.error,
      borderRadius: 10,
      minWidth: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.surface,
    }}>
      <Text style={{
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
      }}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </Text>
    </View>
  );
};

// ==========================================
// STACK NAVIGATOR PARA AUTH
// ==========================================

const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
    </Stack.Navigator>
  );
};

// ==========================================
// NAVEGADOR PRINCIPAL DE LA APP
// ==========================================

const AppNavigator = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  // Verificar estado de autenticación al iniciar
  useEffect(() => {
    console.log('🚀 AppNavigator: Verificando estado de autenticación...');
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Pantalla de carga
  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{
          marginTop: 20,
          fontSize: 16,
          color: colors.textSecondary,
          fontWeight: '500',
        }}>
          Cargando Orpheo...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainTabNavigator />
      ) : (
        <AuthStackNavigator />
      )}
      
      {/* Toast global */}
      <Toast />
    </NavigationContainer>
  );
};

export default AppNavigator;