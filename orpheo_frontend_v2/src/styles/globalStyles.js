import { StyleSheet, Dimensions, Platform } from 'react-native'; // ✅ PLATFORM AGREGADO

// Dimensiones de pantalla
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Funciones helper para dimensiones responsivas
export const wp = (percentage) => {
  return (screenWidth * percentage) / 100;
};

export const hp = (percentage) => {
  return (screenHeight * percentage) / 100;
};

// Constantes de dimensiones
export const dimensions = {
  screenWidth,
  screenHeight,
  headerHeight: 56,
  tabBarHeight: Platform.OS === 'ios' ? 88 : 70, // ✅ PLATFORM USADO
};

// Espaciado consistente
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Tamaños de fuente
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  huge: 32,
};

// Radios de borde
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  circle: 50,
};

// Colores básicos (evitar imports circulares)
const colors = {
  background: '#0F0F0F',
  surface: '#1A1A1A',
  primary: '#D4AF37',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#808080',
  border: '#333333',
  white: '#FFFFFF',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

// Estilos globales
export const globalStyles = StyleSheet.create({
  // Contenedores
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  // Textos
  heading1: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  heading2: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  
  bodyText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: fontSize.md * 1.4,
  },
  
  // Botones
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  // Safe Area específico para tab bar
  tabSafeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: Platform.OS === 'ios' ? 88 : 70, // ✅ PLATFORM USADO
  },
});

// Utilidades para Safe Area y Tab Bar
export const safeAreaUtils = {
  // Contenedor con safe area automático
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Contenedor de contenido con margen para tab bar
  contentContainer: {
    flex: 1,
    paddingBottom: spacing.xl,
  },
  
  // Padding para listas que evita el tab bar
  listContentPadding: {
    paddingBottom: Platform.OS === 'ios' ? 120 : 100, // ✅ PLATFORM USADO
  },
  
  // Padding para modales
  modalPadding: {
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // ✅ PLATFORM USADO
  },
};

// Función para obtener padding dinámico basado en tab bar
export const getTabBarPadding = (tabBarHeight = Platform.OS === 'ios' ? 88 : 70) => ({ // ✅ PLATFORM USADO
  paddingBottom: tabBarHeight + spacing.md,
});

export default globalStyles;