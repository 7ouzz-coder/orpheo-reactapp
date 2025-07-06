import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ===== SISTEMA UNIVERSAL DE DIMENSIONES =====
// Se adapta automáticamente a cualquier dispositivo Android/iOS

// Calcular factor de escala basado en el ancho de pantalla
const widthBaseScale = SCREEN_WIDTH / 375; // Referencia: iPhone X
const heightBaseScale = SCREEN_HEIGHT / 812;

// Función para normalizar tamaños
const normalize = (size) => {
  const newSize = size * widthBaseScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Función para normalizar alturas
const normalizeHeight = (size) => {
  const newSize = size * heightBaseScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// ===== FUNCIONES PRINCIPALES =====

// Ancho responsivo (Width Percentage)
export const wp = (percentage) => {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

// Alto responsivo (Height Percentage)
export const hp = (percentage) => {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

// Función de tamaño responsivo para elementos generales
export const rs = (size) => {
  return normalize(size);
};

// Función de fuente responsiva
export const fs = (size) => {
  // Factor más conservador para fuentes
  const scale = Math.min(widthBaseScale, 1.2);
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// ===== DETECCIÓN DE DISPOSITIVO =====
const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;

export const deviceInfo = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  aspectRatio,
  isTablet: SCREEN_WIDTH >= 768,
  isSmallScreen: SCREEN_WIDTH < 360,
  isMediumScreen: SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 414,
  isLargeScreen: SCREEN_WIDTH >= 414,
  isVeryLargeScreen: SCREEN_WIDTH >= 500,
  platform: Platform.OS,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  pixelRatio: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
};

// ===== ESPACIADOS UNIVERSALES =====
export const spacing = {
  xs: rs(4),    // 4px base
  sm: rs(8),    // 8px base
  md: rs(16),   // 16px base
  lg: rs(24),   // 24px base
  xl: rs(32),   // 32px base
  xxl: rs(48),  // 48px base
};

// ===== TAMAÑOS DE FUENTE UNIVERSALES =====
export const fontSize = {
  xs: fs(10),
  sm: fs(12),
  md: fs(14),
  lg: fs(16),
  xl: fs(18),
  xxl: fs(20),
  title: fs(22),
  header: fs(26),
  hero: fs(30),
};

// ===== DIMENSIONES ESPECÍFICAS =====

// Altura mínima de elementos tocables (44px en iOS, 48px en Android)
export const touchableHeight = Platform.OS === 'ios' ? rs(44) : rs(48);

// Bordes redondeados adaptativos
export const borderRadius = {
  xs: rs(2),
  sm: rs(4),
  md: rs(8),
  lg: rs(12),
  xl: rs(16),
  round: rs(50), // Para elementos circulares
};

// Elevaciones para sombras (más apropiadas para cada plataforma)
export const elevation = {
  light: Platform.OS === 'ios' ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  } : { elevation: 2 },
  
  medium: Platform.OS === 'ios' ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  } : { elevation: 4 },
  
  heavy: Platform.OS === 'ios' ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  } : { elevation: 8 },
};

// ===== HELPERS ADICIONALES =====

// Función para obtener width específico para grids
export const getGridItemWidth = (columns, margin = spacing.md) => {
  const totalMargin = margin * (columns + 1);
  return (SCREEN_WIDTH - totalMargin) / columns;
};

// Función para elementos cuadrados responsivos
export const getSquareSize = (percentage) => {
  const size = wp(percentage);
  return { width: size, height: size };
};

// Función para aspect ratio responsivo
export const getAspectRatioSize = (width, aspectRatio) => {
  const w = wp(width);
  const h = w / aspectRatio;
  return { width: w, height: h };
};

// ===== CONSTANTES ÚTILES =====
export const isIPhoneX = () => {
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (SCREEN_HEIGHT >= 812 || SCREEN_WIDTH >= 812)
  );
};

export const getStatusBarHeight = () => {
  if (Platform.OS === 'ios') {
    return isIPhoneX() ? 44 : 20;
  } else {
    return 0; // Android maneja esto automáticamente con SafeAreaView
  }
};

export const getBottomSpace = () => {
  return isIPhoneX() ? 34 : 0;
};

// ===== UTILIDADES DE LAYOUT =====
export const layout = {
  // Contenedor principal con padding responsivo
  containerPadding: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  // Card estándar
  cardStyle: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...elevation.light,
  },
  
  // Botón estándar
  buttonStyle: {
    height: touchableHeight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.light,
  },
  
  // Input estándar
  inputStyle: {
    height: touchableHeight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    borderWidth: 1,
  },
};

// ===== LOG DE DEBUG (solo en desarrollo) =====
if (__DEV__) {
  console.log('📱 Dimensiones Universales - Device Info:', {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    aspectRatio: aspectRatio.toFixed(2),
    type: deviceInfo.isTablet ? 'Tablet' : 'Phone',
    size: deviceInfo.isSmallScreen ? 'Small' : 
          deviceInfo.isMediumScreen ? 'Medium' : 
          deviceInfo.isLargeScreen ? 'Large' : 'Very Large',
    platform: deviceInfo.platform,
    pixelRatio: deviceInfo.pixelRatio,
    fontScale: deviceInfo.fontScale,
  });
  
  console.log('📏 Spacing calculado:', spacing);
  console.log('🔤 FontSize calculado:', fontSize);
}

// ===== EXPORTACIONES =====
export {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  normalize,
  normalizeHeight,
};

export default {
  wp,
  hp,
  rs,
  fs,
  spacing,
  fontSize,
  borderRadius,
  elevation,
  layout,
  deviceInfo,
  touchableHeight,
  getGridItemWidth,
  getSquareSize,
  getAspectRatioSize,
  isIPhoneX,
  getStatusBarHeight,
  getBottomSpace,
};