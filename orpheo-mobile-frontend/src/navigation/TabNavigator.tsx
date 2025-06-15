import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '@/types/navigation';
import { RootState } from '@/store';
import { theme } from '@/utils/theme';
import { NotificationBadge } from '@/components/common';

// Navegadores de cada sección
import MiembrosNavigator from './MiembrosNavigator';
import DocumentosNavigator from './DocumentosNavigator';
import ProgramasNavigator from './ProgramasNavigator';

// Pantallas individuales
import DashboardScreen from '@/screens/dashboard/DashboardScreen';
import PerfilScreen from '@/screens/perfil/PerfilScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { notificationCount } = useSelector((state: RootState) => state.ui);

  const getTabBarIcon = (
    routeName: keyof MainTabParamList,
    focused: boolean,
    size: number
  ) => {
    const color = focused ? theme.colors.gold : theme.colors.grayBorder;
    
    const icons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
      Dashboard: 'home',
      Miembros: 'people',
      Documentos: 'document-text',
      Programas: 'calendar',
      Perfil: 'person',
    };

    return (
      <Ionicons
        name={focused ? icons[routeName] : `${icons[routeName]}-outline` as any}
        size={size}
        color={color}
      />
    );
  };

  const getTabBarLabel = (routeName: keyof MainTabParamList): string => {
    const labels: Record<keyof MainTabParamList, string> = {
      Dashboard: 'Inicio',
      Miembros: 'Miembros',
      Documentos: 'Documentos',
      Programas: 'Programas',
      Perfil: 'Perfil',
    };

    return labels[routeName];
  };

  // Verificar permisos para mostrar tabs
  const canAccessMiembros = user?.role !== 'general';
  const canAccessDocumentos = true; // Todos pueden ver documentos
  const canAccessProgramas = true; // Todos pueden ver programas

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }) =>
          getTabBarIcon(route.name, focused, size),
        tabBarLabel: getTabBarLabel(route.name),
        tabBarActiveTintColor: theme.colors.gold,
        tabBarInactiveTintColor: theme.colors.grayBorder,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.grayBorder,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        // Animación suave entre tabs
        animationEnabled: true,
        lazy: true, // Carga lazy para mejor performance
      })}
      initialRouteName="Dashboard"
    >
      {/* Dashboard - Pantalla de inicio */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarBadge: notificationCount > 0 ? notificationCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.error,
            color: theme.colors.white,
            fontSize: 10,
            fontWeight: 'bold',
          },
        }}
      />

      {/* Miembros - Solo para admins */}
      {canAccessMiembros && (
        <Tab.Screen
          name="Miembros"
          component={MiembrosNavigator}
          options={{
            // Badge de nuevos miembros pendientes si aplica
            tabBarBadge: undefined, // Se puede agregar lógica aquí
          }}
        />
      )}

      {/* Documentos - Todos pueden acceder */}
      {canAccessDocumentos && (
        <Tab.Screen
          name="Documentos"
          component={DocumentosNavigator}
          options={{
            // Badge de documentos pendientes de revisión
            tabBarBadge: undefined, // Se puede agregar lógica aquí
          }}
        />
      )}

      {/* Programas - Todos pueden acceder */}
      {canAccessProgramas && (
        <Tab.Screen
          name="Programas"
          component={ProgramasNavigator}
          options={{
            // Badge de programas próximos o pendientes de confirmación
            tabBarBadge: undefined, // Se puede agregar lógica aquí
          }}
        />
      )}

      {/* Perfil - Siempre visible */}
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarTestID: 'perfil-tab',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;