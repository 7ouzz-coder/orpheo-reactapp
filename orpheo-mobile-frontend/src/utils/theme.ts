import { Colors, Spacing, Typography } from './constants';
import { Theme } from '../types';

export const theme: Theme = {
  colors: {
    primary: Colors.PRIMARY_BLACK,
    primarySecondary: Colors.PRIMARY_BLACK_SECONDARY,
    gold: Colors.PRIMARY_GOLD,
    goldSecondary: Colors.PRIMARY_GOLD_SECONDARY,
    goldLight: Colors.PRIMARY_GOLD_LIGHT,
    grayBorder: Colors.GRAY_BORDER,
    grayText: Colors.GRAY_TEXT,
    white: Colors.WHITE,
    success: Colors.SUCCESS,
    error: Colors.ERROR,
    warning: Colors.WARNING,
    info: Colors.INFO,
    background: Colors.PRIMARY_BLACK,
    surface: Colors.PRIMARY_BLACK_SECONDARY,
  },
  spacing: Spacing,
  typography: Typography,
};

// Estilos comunes para componentes
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.grayBorder,
  },
  
  shadow: {
    shadowColor: theme.colors.gold,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  button: {
    backgroundColor: theme.colors.gold,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  buttonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  
  input: {
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.grayBorder,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.grayText,
    fontSize: 16,
  },
  
  inputFocused: {
    borderColor: theme.colors.gold,
  },
  
  text: {
    color: theme.colors.grayText,
    fontSize: 16,
  },
  
  textPrimary: {
    color: theme.colors.grayText,
  },
  
  textSecondary: {
    color: theme.colors.grayBorder,
  },
  
  textGold: {
    color: theme.colors.gold,
  },
  
  textError: {
    color: theme.colors.error,
  },
  
  textSuccess: {
    color: theme.colors.success,
  },
  
  heading1: {
    ...Typography.h1,
    color: theme.colors.gold,
  },
  
  heading2: {
    ...Typography.h2,
    color: theme.colors.gold,
  },
  
  heading3: {
    ...Typography.h3,
    color: theme.colors.grayText,
  },
  
  heading4: {
    ...Typography.h4,
    color: theme.colors.grayText,
  },
  
  body: {
    ...Typography.body,
    color: theme.colors.grayText,
  },
  
  bodySmall: {
    ...Typography.bodySmall,
    color: theme.colors.grayBorder,
  },
  
  caption: {
    ...Typography.caption,
    color: theme.colors.grayBorder,
  },
  
  // Estilos específicos para estados
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start' as const,
  },
  
  gradoBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start' as const,
  },
  
  // Estilos para diferentes tipos de botones
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.gold,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  buttonSecondaryText: {
    color: theme.colors.gold,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  
  buttonDanger: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  buttonDangerText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  
  // Estilos para listas
  listItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.grayBorder,
  },
  
  listItemPressed: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.gold,
  },
  
  // Estilos para modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: theme.spacing.md,
  },
  
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: theme.colors.grayBorder,
  },
  
  // Estilos para headers
  header: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grayBorder,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  
  headerTitle: {
    ...Typography.h3,
    color: theme.colors.gold,
    textAlign: 'center' as const,
  },
  
  // Estilos para tabs
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grayBorder,
    paddingBottom: theme.spacing.sm,
  },
  
  tabBarIcon: {
    width: 24,
    height: 24,
  },
  
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  
  // Estilos para separadores
  separator: {
    height: 1,
    backgroundColor: theme.colors.grayBorder,
    marginVertical: theme.spacing.sm,
  },
  
  // Estilos para badges de notificación
  notificationBadge: {
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    position: 'absolute' as const,
    top: -5,
    right: -5,
  },
  
  notificationBadgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  
  // Estilos para carga/loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background,
  },
  
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.grayText,
    fontSize: 16,
  },
  
  // Estilos para estados vacíos
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: theme.spacing.xl,
  },
  
  emptyStateIcon: {
    width: 64,
    height: 64,
    marginBottom: theme.spacing.md,
  },
  
  emptyStateTitle: {
    ...Typography.h3,
    color: theme.colors.grayText,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  
  emptyStateDescription: {
    ...Typography.body,
    color: theme.colors.grayBorder,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.lg,
  },
};

export default theme;