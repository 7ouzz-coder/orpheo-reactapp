import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { wp, hp, fontSize, spacing, deviceInfo } from '../utils/dimensions';

export const globalStyles = StyleSheet.create({
  // ===== CONTENEDORES BÁSICOS =====
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // ===== ESPACIADOS RESPONSIVOS =====
  padding: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  paddingHorizontal: {
    paddingHorizontal: spacing.md,
  },
  
  paddingVertical: {
    paddingVertical: spacing.sm,
  },
  
  paddingSmall: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  
  paddingLarge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  
  // ===== MARGINS RESPONSIVOS =====
  marginBottom: {
    marginBottom: spacing.md,
  },
  
  marginTop: {
    marginTop: spacing.md,
  },
  
  marginHorizontal: {
    marginHorizontal: spacing.md,
  },
  
  marginVertical: {
    marginVertical: spacing.md,
  },
  
  // ===== CARDS RESPONSIVAS =====
  card: {
    backgroundColor: colors.surface,
    borderRadius: wp(3),
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  cardLarge: {
    backgroundColor: colors.surface,
    borderRadius: wp(4),
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  
  cardSmall: {
    backgroundColor: colors.surface,
    borderRadius: wp(2),
    padding: spacing.sm,
    marginBottom: spacing.xs,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  
  cardFlat: {
    backgroundColor: colors.surface,
    borderRadius: wp(3),
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.card,
  },
  
  // ===== BOTONES RESPONSIVOS =====
  button: {
    backgroundColor: colors.primary,
    borderRadius: wp(2),
    paddingVertical: spacing.sm + wp(1),
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp(6),
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: wp(2),
    paddingVertical: spacing.sm + wp(1),
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp(6),
    elevation: 1,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: wp(2),
    paddingVertical: spacing.sm + wp(1),
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp(6),
  },
  
  buttonSmall: {
    backgroundColor: colors.primary,
    borderRadius: wp(1.5),
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp(4),
  },
  
  buttonLarge: {
    backgroundColor: colors.primary,
    borderRadius: wp(3),
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp(7),
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  
  buttonDisabled: {
    backgroundColor: colors.textSecondary,
    elevation: 0,
    shadowOpacity: 0,
  },
  
  buttonSuccess: {
    backgroundColor: colors.success,
  },
  
  buttonWarning: {
    backgroundColor: colors.warning,
  },
  
  buttonError: {
    backgroundColor: colors.error,
  },
  
  buttonInfo: {
    backgroundColor: colors.info,
  },
  
  // ===== TEXTOS DE BOTONES =====
  buttonText: {
    color: colors.background,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  
  buttonTextSecondary: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  
  buttonTextOutline: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  
  buttonTextSmall: {
    color: colors.background,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  
  buttonTextLarge: {
    color: colors.background,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  
  buttonTextDisabled: {
    color: colors.textTertiary,
  },
  
  // ===== TÍTULOS Y TEXTOS RESPONSIVOS =====
  title: {
    fontSize: fontSize.title,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: fontSize.title * 1.2,
  },
  
  titleLarge: {
    fontSize: fontSize.header,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    lineHeight: fontSize.header * 1.2,
  },
  
  titleHero: {
    fontSize: fontSize.hero,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    lineHeight: fontSize.hero * 1.1,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: fontSize.lg * 1.3,
  },
  
  text: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: fontSize.md * 1.4,
  },
  
  textSecondary: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: fontSize.sm * 1.4,
  },
  
  textSmall: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: fontSize.xs * 1.4,
  },
  
  textTertiary: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    lineHeight: fontSize.sm * 1.4,
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  textRight: {
    textAlign: 'right',
  },
  
  textBold: {
    fontWeight: 'bold',
  },
  
  textSemiBold: {
    fontWeight: '600',
  },
  
  textLight: {
    fontWeight: '300',
  },
  
  // ===== INPUTS RESPONSIVOS =====
  input: {
    backgroundColor: colors.surface,
    borderRadius: wp(2),
    padding: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.card,
    minHeight: hp(6),
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    elevation: 2,
    shadowOpacity: 0.1,
  },
  
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  
  inputSuccess: {
    borderColor: colors.success,
    borderWidth: 2,
  },
  
  inputContainer: {
    marginBottom: spacing.md,
  },
  
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  inputHelperText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  inputErrorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  
  // ===== BADGES RESPONSIVOS =====
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: wp(1),
    alignSelf: 'flex-start',
    elevation: 1,
  },
  
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  
  badgePrimary: {
    backgroundColor: colors.primary,
  },
  
  badgeSecondary: {
    backgroundColor: colors.textSecondary,
  },
  
  badgeSuccess: {
    backgroundColor: colors.success,
  },
  
  badgeWarning: {
    backgroundColor: colors.warning,
  },
  
  badgeError: {
    backgroundColor: colors.error,
  },
  
  badgeInfo: {
    backgroundColor: colors.info,
  },
  
  badgeAprendiz: {
    backgroundColor: colors.aprendiz,
  },
  
  badgeCompanero: {
    backgroundColor: colors.companero,
  },
  
  badgeMaestro: {
    backgroundColor: colors.maestro,
  },
  
  badgeTextWhite: {
    color: colors.white,
  },
  
  badgeTextDark: {
    color: colors.background,
  },
  
  // ===== LAYOUTS FLEXIBLES =====
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  rowStart: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  
  rowEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  columnCenter: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  columnStart: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  
  columnEnd: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  centerHorizontal: {
    alignItems: 'center',
  },
  
  centerVertical: {
    justifyContent: 'center',
  },
  
  flex1: {
    flex: 1,
  },
  
  flex2: {
    flex: 2,
  },
  
  flex3: {
    flex: 3,
  },
  
  // ===== SOMBRAS =====
  shadow: {
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  shadowLight: {
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  shadowHeavy: {
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  shadowColored: {
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  
  // ===== SEPARADORES =====
  separator: {
    height: 1,
    backgroundColor: colors.card,
    marginVertical: spacing.sm,
  },
  
  separatorThick: {
    height: 2,
    backgroundColor: colors.card,
    marginVertical: spacing.md,
  },
  
  separatorVertical: {
    width: 1,
    backgroundColor: colors.card,
    marginHorizontal: spacing.sm,
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.card,
    marginVertical: spacing.lg,
  },
  
  // ===== ESTADOS DE CARGA Y VACÍO =====
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.md,
    lineHeight: fontSize.md * 1.4,
  },
  
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: fontSize.sm * 1.4,
  },
  
  // ===== ITEMS DE LISTA =====
  listItem: {
    backgroundColor: colors.surface,
    borderRadius: wp(3),
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  
  listItemPressed: {
    backgroundColor: colors.card,
    transform: [{ scale: 0.98 }],
  },
  
  listItemContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  
  listItemTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  
  listItemSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  
  listItemMeta: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  
  // ===== HEADERS PERSONALIZADOS =====
  headerStyle: {
    backgroundColor: colors.surface,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  
  // ===== GRIDS RESPONSIVOS =====
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  
  gridItem2: {
    width: deviceInfo.isSmallScreen ? '100%' : '48%',
    marginBottom: spacing.sm,
  },
  
  gridItem3: {
    width: deviceInfo.isSmallScreen ? '48%' : '31%',
    marginBottom: spacing.sm,
  },
  
  gridItem4: {
    width: deviceInfo.isSmallScreen ? '48%' : '23%',
    marginBottom: spacing.sm,
  },
  
  // ===== OVERLAYS Y MODALES =====
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  overlayDark: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modal: {
    backgroundColor: colors.surface,
    borderRadius: wp(4),
    padding: spacing.lg,
    margin: spacing.lg,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  
  modalContent: {
    flex: 1,
  },
  
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.card,
  },
  
  // ===== AVATARES Y ICONOS =====
  avatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  
  avatarSmall: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
  },
  
  avatarLarge: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
  },
  
  avatarText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  
  iconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  
  // ===== INDICADORES DE ESTADO =====
  statusIndicator: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    backgroundColor: colors.success,
  },
  
  statusIndicatorLarge: {
    width: wp(4),
    height: wp(4),
    borderRadius: wp(2),
  },
  
  // ===== AJUSTES ESPECÍFICOS PARA PANTALLAS PEQUEÑAS =====
  ...(deviceInfo.isSmallScreen && {
    title: {
      fontSize: fontSize.lg,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    
    card: {
      borderRadius: wp(2),
      padding: spacing.sm,
      marginBottom: spacing.xs,
    },
    
    button: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      minHeight: hp(5),
    },
    
    input: {
      padding: spacing.sm - 2,
      minHeight: hp(5),
    },
  }),
  
  // ===== AJUSTES PARA TABLETS =====
  ...(deviceInfo.isTablet && {
    padding: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
    },
    
    card: {
      borderRadius: wp(2),
      padding: spacing.lg,
    },
    
    gridItem2: {
      width: '31%',
    },
    
    gridItem3: {
      width: '23%',
    },
  }),
});

// ===== ESTILOS UTILITARIOS ADICIONALES =====
export const utilityStyles = StyleSheet.create({
  // Margins
  m0: { margin: 0 },
  m1: { margin: spacing.xs },
  m2: { margin: spacing.sm },
  m3: { margin: spacing.md },
  m4: { margin: spacing.lg },
  m5: { margin: spacing.xl },
  
  // Margin Top
  mt0: { marginTop: 0 },
  mt1: { marginTop: spacing.xs },
  mt2: { marginTop: spacing.sm },
  mt3: { marginTop: spacing.md },
  mt4: { marginTop: spacing.lg },
  mt5: { marginTop: spacing.xl },
  
  // Margin Bottom
  mb0: { marginBottom: 0 },
  mb1: { marginBottom: spacing.xs },
  mb2: { marginBottom: spacing.sm },
  mb3: { marginBottom: spacing.md },
  mb4: { marginBottom: spacing.lg },
  mb5: { marginBottom: spacing.xl },
  
  // Paddings
  p0: { padding: 0 },
  p1: { padding: spacing.xs },
  p2: { padding: spacing.sm },
  p3: { padding: spacing.md },
  p4: { padding: spacing.lg },
  p5: { padding: spacing.xl },
  
  // Width
  w100: { width: '100%' },
  w75: { width: '75%' },
  w50: { width: '50%' },
  w25: { width: '25%' },
  
  // Height
  h100: { height: '100%' },
  h75: { height: '75%' },
  h50: { height: '50%' },
  h25: { height: '25%' },
  
  // Opacidad
  opacity50: { opacity: 0.5 },
  opacity75: { opacity: 0.75 },
  opacity25: { opacity: 0.25 },
  
  // Border radius
  rounded: { borderRadius: wp(2) },
  roundedLarge: { borderRadius: wp(4) },
  roundedFull: { borderRadius: wp(50) },
});

export default globalStyles;