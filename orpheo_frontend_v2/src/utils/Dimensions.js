import { Dimensions, PixelRatio, Platform } from 'react-native';

// Obtener dimensiones de la pantalla
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Dimensiones base para el diseño (basado en iPhone 11)
const baseWidth = 375;
const baseHeight = 812;

/**
 * Función para escalar ancho basado en el ancho de la pantalla
 * @param {number} size - Tamaño en píxeles basado en el diseño base
 * @returns {number} - Tamaño escalado
 */
export const wp = (size) => {
  const percentage = (size / baseWidth) * 100;
  return PixelRatio.roundToNearestPixel((screenWidth * percentage) / 100);
};

/**
 * Función para escalar alto basado en la altura de la pantalla
 * @param {number} size - Tamaño en píxeles basado en el diseño base
 * @returns {number} - Tamaño escalado
 */
export const hp = (size) => {
  const percentage = (size / baseHeight) * 100;
  return PixelRatio.roundToNearestPixel((screenHeight * percentage) / 100);
};

/**
 * Escalado para fuentes
 * @param {number} size - Tamaño de fuente base
 * @returns {number} - Tamaño de fuente escalado
 */
export const scale = (size) => {
  const newSize = (size * screenWidth) / baseWidth;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Escalado moderado para fuentes (menos agresivo)
 * @param {number} size - Tamaño de fuente base
 * @param {number} factor - Factor de escalado (default: 0.5)
 * @returns {number} - Tamaño de fuente escalado moderadamente
 */
export const moderateScale = (size, factor = 0.5) => {
  const newSize = size + (scale(size) - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Información del dispositivo
export const deviceInfo = {
  width: screenWidth,
  height: screenHeight,
  isSmallScreen: screenWidth < 375,
  isTablet: screenWidth >= 768,
  isLandscape: screenWidth > screenHeight,
  pixelRatio: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
};

// Tamaños de fuente escalados
export const fontSize = {
  xs: moderateScale(10),
  sm: moderateScale(12),
  md: moderateScale(14),
  lg: moderateScale(16),
  xl: moderateScale(18),
  xxl: moderateScale(20),
  xxxl: moderateScale(24),
  h1: moderateScale(32),
  h2: moderateScale(28),
  h3: moderateScale(24),
  h4: moderateScale(20),
  h5: moderateScale(18),
  h6: moderateScale(16),
};

// Espaciado escalado
export const spacing = {
  xs: wp(4),
  sm: wp(8),
  md: wp(12),
  lg: wp(16),
  xl: wp(20),
  xxl: wp(24),
  xxxl: wp(32),
};

// Radios de borde escalados
export const borderRadius = {
  xs: wp(2),
  sm: wp(4),
  md: wp(6),
  lg: wp(8),
  xl: wp(12),
  round: wp(50), // Para elementos circulares
};

// Tamaños de iconos escalados
export const iconSize = {
  xs: wp(12),
  sm: wp(16),
  md: wp(20),
  lg: wp(24),
  xl: wp(28),
  xxl: wp(32),
};

// Alturas comunes escaladas
export const heights = {
  statusBar: hp(6), // Aproximado para la barra de estado
  header: hp(8),
  tabBar: hp(12),
  button: hp(6),
  input: hp(6),
  listItem: hp(10),
  card: hp(15),
};

// Anchos comunes escalados
export const widths = {
  full: screenWidth,
  half: screenWidth / 2,
  third: screenWidth / 3,
  quarter: screenWidth / 4,
  button: wp(40),
  icon: wp(6),
  avatar: wp(12),
};

// Funciones utilitarias adicionales
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

/**
 * Obtener dimensiones seguras considerando notches y barras
 * @returns {Object} - Dimensiones seguras
 */
export const getSafeAreaDimensions = () => {
  // En un proyecto real, usarías react-native-safe-area-context
  const safeAreaTop = isIOS ? (deviceInfo.height >= 812 ? 44 : 20) : 0;
  const safeAreaBottom = isIOS ? (deviceInfo.height >= 812 ? 34 : 0) : 0;
  
  return {
    top: safeAreaTop,
    bottom: safeAreaBottom,
    height: screenHeight - safeAreaTop - safeAreaBottom,
    width: screenWidth,
  };
};

/**
 * Calcular dimensiones para modales y overlays
 * @param {number} widthPercentage - Porcentaje del ancho de pantalla
 * @param {number} heightPercentage - Porcentaje de la altura de pantalla
 * @returns {Object} - Dimensiones del modal
 */
export const getModalDimensions = (widthPercentage = 90, heightPercentage = 80) => {
  return {
    width: (screenWidth * widthPercentage) / 100,
    height: (screenHeight * heightPercentage) / 100,
  };
};

/**
 * Verificar si es una pantalla pequeña
 * @returns {boolean}
 */
export const isSmallScreen = () => screenWidth < 375 || screenHeight < 667;

/**
 * Verificar si es tablet
 * @returns {boolean}
 */
export const isTablet = () => screenWidth >= 768;

/**
 * Obtener orientación actual
 * @returns {string} - 'portrait' o 'landscape'
 */
export const getOrientation = () => {
  return screenWidth > screenHeight ? 'landscape' : 'portrait';
};

// Breakpoints para responsive design
export const breakpoints = {
  xs: 0,
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/**
 * Obtener breakpoint actual
 * @returns {string} - Breakpoint actual
 */
export const getCurrentBreakpoint = () => {
  if (screenWidth >= breakpoints.xl) return 'xl';
  if (screenWidth >= breakpoints.lg) return 'lg';
  if (screenWidth >= breakpoints.md) return 'md';
  if (screenWidth >= breakpoints.sm) return 'sm';
  return 'xs';
};

// Exportaciones adicionales para compatibilidad
export const screenDimensions = {
  width: screenWidth,
  height: screenHeight,
};

export const guidelineBaseWidth = baseWidth;
export const guidelineBaseHeight = baseHeight;

export default {
  wp,
  hp,
  scale,
  moderateScale,
  fontSize,
  spacing,
  borderRadius,
  iconSize,
  heights,
  widths,
  deviceInfo,
  screenDimensions,
  isSmallScreen,
  isTablet,
  getOrientation,
  getSafeAreaDimensions,
  getModalDimensions,
  getCurrentBreakpoint,
};