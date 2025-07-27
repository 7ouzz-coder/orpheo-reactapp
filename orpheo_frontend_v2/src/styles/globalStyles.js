import { StyleSheet, Dimensions } from 'react-native';
import { colors } from './colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const globalStyles = StyleSheet.create({
  // Contenedores principales
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  
  // Tarjetas y superficies
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  cardElevated: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Botones
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  
  buttonDisabled: {
    backgroundColor: colors.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  
  buttonTextSecondary: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Inputs
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  
  inputFocused: {
    borderColor: colors.primary,
  },
  
  inputError: {
    borderColor: colors.error,
  },
  
  // Labels y texto
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  
  subtitle: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  
  text: {
    color: colors.text,
    fontSize: 16,
  },
  
  textSecondary: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  
  textMuted: {
    color: colors.textMuted,
    fontSize: 12,
  },
  
  textBold: {
    fontWeight: 'bold',
  },
  
  // Headers
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  
  // Estados y badges
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  
  badgeSuccess: {
    backgroundColor: colors.success + '20',
  },
  
  badgeWarning: {
    backgroundColor: colors.warning + '20',
  },
  
  badgeError: {
    backgroundColor: colors.error + '20',
  },
  
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  badgeTextSuccess: {
    color: colors.success,
  },
  
  badgeTextWarning: {
    color: colors.warning,
  },
  
  badgeTextError: {
    color: colors.error,
  },
  
  // Layout utilities
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  flex1: {
    flex: 1,
  },
  
  // Márgenes y padding
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
  mb24: { marginBottom: 24 },
  ml8: { marginLeft: 8 },
  mr8: { marginRight: 8 },
  
  p8: { padding: 8 },
  p16: { padding: 16 },
  p24: { padding: 24 },
  px8: { paddingHorizontal: 8 },
  px16: { paddingHorizontal: 16 },
  py8: { paddingVertical: 8 },
  py16: { paddingVertical: 16 },
  
  // Separadores
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  
  // Error states
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

// Dimensiones responsive
export const dimensions = {
  screenWidth,
  screenHeight,
  isSmallScreen: screenWidth < 375,
  isLargeScreen: screenWidth > 414,
  cardWidth: screenWidth - 32,
  halfCardWidth: (screenWidth - 48) / 2,
};

// Función para responsive font size
export const responsiveFontSize = (size) => {
  const scale = screenWidth / 375; // Base width iPhone X
  const newSize = size * scale;
  
  if (newSize < size * 0.85) return size * 0.85;
  if (newSize > size * 1.15) return size * 1.15;
  
  return newSize;
};

export default globalStyles;