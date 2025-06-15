// Exportar todos los navegadores
export { default as AppNavigator } from './AppNavigator';
export { default as AuthNavigator } from './AuthNavigator';
export { default as TabNavigator } from './TabNavigator';
export { default as MiembrosNavigator } from './MiembrosNavigator';
export { default as DocumentosNavigator } from './DocumentosNavigator';
export { default as ProgramasNavigator } from './ProgramasNavigator';

// Hooks útiles para navegación
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  MiembrosStackParamList,
  DocumentosStackParamList,
  ProgramasStackParamList,
} from '@/types/navigation';

// Hooks tipados para navegación
export const useAppNavigation = () => {
  return useNavigation<StackNavigationProp<RootStackParamList>>();
};

export const useAuthNavigation = () => {
  return useNavigation<StackNavigationProp<AuthStackParamList>>();
};

export const useMainTabNavigation = () => {
  return useNavigation<BottomTabNavigationProp<MainTabParamList>>();
};

export const useMiembrosNavigation = () => {
  return useNavigation<StackNavigationProp<MiembrosStackParamList>>();
};

export const useDocumentosNavigation = () => {
  return useNavigation<StackNavigationProp<DocumentosStackParamList>>();
};

export const useProgramasNavigation = () => {
  return useNavigation<StackNavigationProp<ProgramasStackParamList>>();
};

// Hook genérico para route
export const useAppRoute = <T extends keyof RootStackParamList>() => {
  return useRoute<RouteProp<RootStackParamList, T>>();
};

// Utilidades de navegación
export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

export const navigate = (name: string, params?: any) => {
  navigationRef.current?.navigate(name as never, params as never);
};

export const goBack = () => {
  navigationRef.current?.goBack();
};

export const reset = (routeName: string, params?: any) => {
  navigationRef.current?.reset({
    index: 0,
    routes: [{ name: routeName as never, params: params as never }],
  });
};

// Funciones helper para navegación común
export const navigateToLogin = () => {
  reset('Auth');
};

export const navigateToMain = () => {
  reset('Main');
};

export const navigateToMiembro = (miembro: any) => {
  navigate('MiembroDetail', { miembro });
};

export const navigateToDocumento = (documento: any) => {
  navigate('DocumentoDetail', { documento });
};

export const navigateToPrograma = (programa: any) => {
  navigate('ProgramaDetail', { programa });
};