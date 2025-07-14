// Paleta de colores del tema Orpheo - Dorado y Oscuro
export const colors = {
  // Colores primarios
  primary: '#D4AF37',        // Dorado principal
  primaryDark: '#B8941F',    // Dorado oscuro
  primaryLight: '#E8C547',   // Dorado claro
  primaryMuted: '#F5E6A8',   // Dorado muy claro

  // Colores de fondo
  background: '#0F0F0F',     // Negro muy oscuro
  surface: '#1A1A1A',       // Gris muy oscuro
  surfaceVariant: '#2A2A2A', // Gris oscuro
  card: '#1E1E1E',          // Fondo de tarjetas

  // Colores de texto
  text: '#FFFFFF',          // Blanco para texto principal
  textSecondary: '#B0B0B0', // Gris claro para texto secundario
  textMuted: '#808080',     // Gris medio para texto deshabilitado
  textOnPrimary: '#000000', // Negro para texto sobre dorado

  // Colores de estado
  success: '#10B981',       // Verde
  error: '#EF4444',         // Rojo
  warning: '#F59E0B',       // Amarillo/Naranja
  info: '#3B82F6',          // Azul

  // Variantes claras de estados (para fondos)
  successLight: '#064E3B',
  errorLight: '#7F1D1D',
  warningLight: '#78350F',
  infoLight: '#1E3A8A',

  // Colores de elementos UI
  border: '#333333',        // Bordes
  divider: '#404040',       // Divisores
  shadow: '#000000',        // Sombras
  overlay: 'rgba(0, 0, 0, 0.7)', // Overlays/modales

  // Colores neutros
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Grados masónicos
  gradoAprendiz: '#10B981',   // Verde
  gradoCompanero: '#F59E0B',  // Amarillo/Dorado
  gradoMaestro: '#8B5CF6',    // Púrpura

  // Estados de documentos
  documentoPendiente: '#F59E0B',
  documentoAprobado: '#10B981',
  documentoRechazado: '#EF4444',

  // Estados de miembros
  miembroActivo: '#10B981',
  miembroInactivo: '#6B7280',
  miembroSuspendido: '#EF4444',

  // Colores de navegación
  tabActive: '#D4AF37',
  tabInactive: '#B0B0B0',

  // Colores de input
  inputBackground: '#1A1A1A',
  inputBorder: '#333333',
  inputFocus: '#D4AF37',
  inputError: '#EF4444',
  inputSuccess: '#10B981',

  // Colores de botones
  buttonPrimary: '#D4AF37',
  buttonSecondary: '#2A2A2A',
  buttonDanger: '#EF4444',
  buttonSuccess: '#10B981',
  buttonWarning: '#F59E0B',
  buttonInfo: '#3B82F6',

  // Colores de progreso
  progressBackground: '#2A2A2A',
  progressFill: '#D4AF37',

  // Colores específicos de la aplicación
  headerBackground: '#1A1A1A',
  sidebarBackground: '#0F0F0F',
  cardHover: '#2A2A2A',
  
  // Gradientes
  gradientPrimary: ['#D4AF37', '#B8941F'],
  gradientDark: ['#1A1A1A', '#0F0F0F'],
  gradientOverlay: ['transparent', 'rgba(0, 0, 0, 0.8)'],
};

// Variantes de opacidad para colores principales
export const colorOpacity = {
  primary10: 'rgba(212, 175, 55, 0.1)',
  primary20: 'rgba(212, 175, 55, 0.2)',
  primary30: 'rgba(212, 175, 55, 0.3)',
  primary40: 'rgba(212, 175, 55, 0.4)',
  primary50: 'rgba(212, 175, 55, 0.5)',
  primary60: 'rgba(212, 175, 55, 0.6)',
  primary70: 'rgba(212, 175, 55, 0.7)',
  primary80: 'rgba(212, 175, 55, 0.8)',
  primary90: 'rgba(212, 175, 55, 0.9)',
  
  white10: 'rgba(255, 255, 255, 0.1)',
  white20: 'rgba(255, 255, 255, 0.2)',
  white30: 'rgba(255, 255, 255, 0.3)',
  white40: 'rgba(255, 255, 255, 0.4)',
  white50: 'rgba(255, 255, 255, 0.5)',
  
  black10: 'rgba(0, 0, 0, 0.1)',
  black20: 'rgba(0, 0, 0, 0.2)',
  black30: 'rgba(0, 0, 0, 0.3)',
  black40: 'rgba(0, 0, 0, 0.4)',
  black50: 'rgba(0, 0, 0, 0.5)',
  black60: 'rgba(0, 0, 0, 0.6)',
  black70: 'rgba(0, 0, 0, 0.7)',
  black80: 'rgba(0, 0, 0, 0.8)',
  black90: 'rgba(0, 0, 0, 0.9)',
};

// Función helper para obtener color con opacidad
export const withOpacity = (color, opacity) => {
  if (color.includes('rgba')) return color;
  if (color.includes('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  // Para colores hex
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Función para obtener color según el grado
export const getGradoColor = (grado) => {
  const gradoColors = {
    aprendiz: colors.gradoAprendiz,
    companero: colors.gradoCompanero,
    maestro: colors.gradoMaestro,
  };
  return gradoColors[grado] || colors.textSecondary;
};

// Función para obtener color según el estado
export const getEstadoColor = (estado) => {
  const estadoColors = {
    activo: colors.miembroActivo,
    inactivo: colors.miembroInactivo,
    suspendido: colors.miembroSuspendido,
    pendiente: colors.documentoPendiente,
    aprobado: colors.documentoAprobado,
    rechazado: colors.documentoRechazado,
  };
  return estadoColors[estado] || colors.textSecondary;
};

// Función para obtener color de contraste
export const getContrastColor = (backgroundColor) => {
  // Lista de colores oscuros que necesitan texto claro
  const darkColors = [
    colors.background,
    colors.surface,
    colors.surfaceVariant,
    colors.card,
    colors.black,
    colors.primary, // El dorado es lo suficientemente oscuro
  ];
  
  if (darkColors.includes(backgroundColor)) {
    return colors.white;
  }
  
  return colors.black;
};

export default colors;