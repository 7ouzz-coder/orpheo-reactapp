import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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

// Colors - Definidos directamente para evitar errores de import
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

// Dashboard Simple (temporal)
const DashboardScreen = () => (
  <View style={styles.dashboardContainer}>
    <Icon name="temple-buddhist" size={80} color={colors.primary} />
    <View style={styles.welcomeCard}>
      <Icon name="check-circle" size={32} color="#4CAF50" />
      <View style={styles.textContainer}>
        <View style={styles.titleText}>¡App Orpheo Funcionando! 🎉</View>
        <View style={styles.subtitleText}>
          ETAPA 1 completada exitosamente
        </View>
        <View style={styles.nextStepsText}>
          ✅ Redux configurado{'\n'}
          ✅ Navegación funcionando{'\n'}
          ✅ Login operativo{'\n'}
          ✅ Tema aplicado correctamente
        </View>
      </View>
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
        component={DashboardScreen} // Temporal
        options={{
          title: 'Miembros',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Documentos" 
        component={DashboardScreen} // Temporal
        options={{
          title: 'Documentos',
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-document" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={DashboardScreen} // Temporal
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginTop: 32,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    maxWidth: 350,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  nextStepsText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'left',
    lineHeight: 20,
  },
});

export default AppNavigator;