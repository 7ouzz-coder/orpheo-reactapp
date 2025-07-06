import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../../styles/colors';
import { selectIsAuthenticated, selectAuthLoading, getCurrentUser } from '../../store/slices/authSlice';
import LoginScreen from '../../screens/auth/LoginScreen';
import DashboardScreen from '../../screens/dashboard/DashboardScreen';
import MiembrosNavigator from './MiembrosNavigator';
import ProgramasNavigator from './ProgramasNavigator';
import DocumentosNavigator from './DocumentosNavigator';
import PerfilScreen from '../../screens/perfil/PerfilScreen';
import ConnectionTest from '../debug/ConnectionTest';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator para usuarios autenticados
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          switch (route.name) {
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
              iconName = 'developer-mode';
              break;
            case 'Perfil':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.card,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Miembros" 
        component={MiembrosNavigator}
        options={{ title: 'Miembros', headerShown: false }}
      />
      <Tab.Screen 
        name="Documentos" 
        component={DocumentosNavigator}
        options={{ title: 'Documentos', headerShown: false }}
      />
      <Tab.Screen 
        name="Programas" 
        component={ProgramasNavigator}
        options={{ title: 'Programas', headerShown: false }}
      />
      {/* Tabs temporales para testing */}
      {__DEV__ && (
        <>
          <Tab.Screen 
            name="ConnectionTest" 
            component={ConnectionTest}
            options={{ title: 'Test' }}
          />
          <Tab.Screen 
            name="LoginDebug" 
            component={require('../debug/LoginDebug').default}
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