import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';

// Pantallas
import LoginScreen from '../../screens/auth/LoginScreen';
import DashboardScreen from '../../screens/dashboard/DashboardScreen';
import MiembrosListScreen from '../../screens/miembros/MiembrosListScreen';
import MiembroDetailScreen from '../../screens/miembros/MiembroDetailScreen';
import MiembroFormScreen from '../../screens/miembros/MiembroFormScreen';
import DocumentosListScreen from '../../screens/documentos/DocumentosListScreen';
import DocumentoDetailScreen from '../../screens/documentos/DocumentoDetailScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';

// Componentes
import LoadingSpinner from '../common/LoadingSpinner';

// Estilos
import { colors } from '../../styles/colors';
import { wp, fontSize } from '../../utils/dimensions';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Configuración común de headers
const defaultScreenOptions = {
  headerStyle: {
    backgroundColor: colors.surface,
    elevation: 4,
    shadowOpacity: 0.3,
  },
  headerTintColor: colors.textPrimary,
  headerTitleStyle: {
    fontWeight: 'bold',
    fontSize: fontSize.lg,
  },
  headerBackTitleVisible: false,
};

// Stack Navigator para Miembros
const MiembrosStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
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
        headerBackTitle: 'Miembros',
      }}
    />
    <Stack.Screen 
      name="MiembroForm" 
      component={MiembroFormScreen}
      options={({ route }) => ({
        title: route.params?.mode === 'edit' ? 'Editar Miembro' : 'Nuevo Miembro',
        headerBackTitle: 'Miembros',
        presentation: 'modal', // Presentación modal para formularios
      })}
    />
  </Stack.Navigator>
);

// Stack Navigator para Documentos
const DocumentosStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
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
        title: 'Detalle del Documento',
        headerBackTitle: 'Documentos',
      }}
    />
  </Stack.Navigator>
);

// Stack Navigator para Dashboard
const DashboardStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen 
      name="DashboardMain" 
      component={DashboardScreen}
      options={{
        title: 'Dashboard',
        headerLargeTitle: true,
      }}
    />
  </Stack.Navigator>
);

// Stack Navigator para Perfil
const ProfileStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{
        title: 'Mi Perfil',
        headerLargeTitle: true,
      }}
    />
  </Stack.Navigator>
);

// Tab Navigator Principal
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false, // Los headers se manejan en los stacks individuales
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
          case 'Perfil':
            iconName = focused ? 'account-circle' : 'account-circle-outline';
            break;
          default:
            iconName = 'help-circle-outline';
        }
        
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarLabelStyle: {
        fontSize: fontSize.sm,
        fontWeight: '500',
      },
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        elevation: 8,
        shadowOpacity: 0.3,
        height: wp(16), // Altura fija para consistencia
        paddingBottom: wp(2),
        paddingTop: wp(2),
      },
      tabBarItemStyle: {
        paddingVertical: wp(1),
      },
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardStack}
      options={{
        tabBarLabel: 'Inicio',
        tabBarBadge: undefined, // Podrías agregar badges dinámicos aquí
      }}
    />
    <Tab.Screen 
      name="Miembros" 
      component={MiembrosStack}
      options={{
        tabBarLabel: 'Miembros',
      }}
    />
    <Tab.Screen 
      name="Documentos" 
      component={DocumentosStack}
      options={{
        tabBarLabel: 'Documentos',
      }}
    />
    <Tab.Screen 
      name="Perfil" 
      component={ProfileStack}
      options={{
        tabBarLabel: 'Perfil',
      }}
    />
  </Tab.Navigator>
);

// Componente de Loading Screen
const LoadingScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: colors.background 
  }}>
    <LoadingSpinner size="large" />
    <Text style={{ 
      marginTop: 16, 
      color: colors.textPrimary,
      fontSize: fontSize.md
    }}>
      Cargando...
    </Text>
  </View>
);

// Navegador Principal de la App
const AppNavigator = () => {
  // Verificar si el usuario está autenticado con valores por defecto seguros
  const authState = useSelector(state => state.auth || {});
  const isAuthenticated = authState.isAuthenticated || false;
  const isLoading = authState.loading?.init || false;

  return (
    <>
      {/* StatusBar Configuration */}
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />
      
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right', // Animación consistente
          }}
        >
          {isLoading ? (
            // Pantalla de splash/loading inicial
            <Stack.Screen 
              name="Loading" 
              component={LoadingScreen}
              options={{ headerShown: false }}
            />
          ) : !isAuthenticated ? (
            // Stack de autenticación
            <Stack.Screen 
              name="Auth" 
              component={LoginScreen}
              options={{ 
                headerShown: false,
                animationTypeForReplace: 'pop', // Animación al hacer logout
              }}
            />
          ) : (
            // Stack principal autenticado
            <Stack.Screen 
              name="Main" 
              component={MainTabNavigator}
              options={{ 
                headerShown: false,
                animationTypeForReplace: 'push', // Animación al hacer login
              }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default AppNavigator;