// Paleta de colores principal para el tema masónico
export const colors = {
  // Colores principales del tema masónico
  primary: '#D4AF37', // Dorado masónico
  primaryLight: '#E6C55A',
  primaryDark: '#B8941F',
  
  // Colores de fondo
  background: '#121212', // Negro profundo
  surface: '#1E1E1E', // Gris muy oscuro
  card: '#2A2A2A',
  
  // Colores de texto
  textPrimary: '#FFFFFF', // Blanco
  textSecondary: '#B0B0B0', // Gris claro
  textDisabled: '#666666',
  
  // Colores del sistema
  success: '#10B981', // Verde
  warning: '#F59E0B', // Amarillo/Naranja
  error: '#EF4444', // Rojo
  info: '#3B82F6', // Azul
  
  // Variantes más claras para backgrounds
  successLight: 'rgba(16, 185, 129, 0.1)',
  warningLight: 'rgba(245, 158, 11, 0.1)',
  errorLight: 'rgba(239, 68, 68, 0.1)',
  infoLight: 'rgba(59, 130, 246, 0.1)',
  
  // Colores de borde y divisores
  border: '#333333',
  divider: '#2A2A2A',
  shadow: '#000000',
  
  // Colores para inputs
  inputBackground: '#1A1A1A',
  inputBorder: '#333333',
  inputFocus: '#D4AF37',
  inputError: '#EF4444',
  
  // Colores específicos de miembros
  miembroAprendiz: '#3B82F6',
  miembroCompanero: '#F59E0B',
  miembroMaestro: '#10B981',
  miembroActivo: '#10B981',
  miembroInactivo: '#6B7280',
  miembroSuspendido: '#EF4444',
  
  // Colores de navegación
  tabActive: '#D4AF37',
  tabInactive: '#B0B0B0',
  
  // Otros colores útiles
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Variantes de opacidad para colores principales
export const colorOpacity = {
  // Primary opacity variants
  primary10: 'rgba(212, 175, 55, 0.1)',
  primary20: 'rgba(212, 175, 55, 0.2)',
  primary30: 'rgba(212, 175, 55, 0.3)',
  primary40: 'rgba(212, 175, 55, 0.4)',
  primary50: 'rgba(212, 175, 55, 0.5)',
  primary60: 'rgba(212, 175, 55, 0.6)',
  primary70: 'rgba(212, 175, 55, 0.7)',
  primary80: 'rgba(212, 175, 55, 0.8)',
  primary90: 'rgba(212, 175, 55, 0.9)',
  
  // White opacity variants
  white10: 'rgba(255, 255, 255, 0.1)',
  white20: 'rgba(255, 255, 255, 0.2)',
  white30: 'rgba(255, 255, 255, 0.3)',
  white40: 'rgba(255, 255, 255, 0.4)',
  white50: 'rgba(255, 255, 255, 0.5)',
  white60: 'rgba(255, 255, 255, 0.6)',
  white70: 'rgba(255, 255, 255, 0.7)',
  white80: 'rgba(255, 255, 255, 0.8)',
  white90: 'rgba(255, 255, 255, 0.9)',
  
  // Black opacity variants
  black10: 'rgba(0, 0, 0, 0.1)',
  black20: 'rgba(0, 0, 0, 0.2)',
  black30: 'rgba(0, 0, 0, 0.3)',
  black40: 'rgba(0, 0, 0, 0.4)',
  black50: 'rgba(0, 0, 0, 0.5)',
  black60: 'rgba(0, 0, 0, 0.6)',
  black70: 'rgba(0, 0, 0, 0.7)',
  black80: 'rgba(0, 0, 0, 0.8)',
  black90: 'rgba(0, 0, 0, 0.9)',
  
  // Success opacity variants
  success10: 'rgba(16, 185, 129, 0.1)',
  success20: 'rgba(16, 185, 129, 0.2)',
  success30: 'rgba(16, 185, 129, 0.3)',
  success50: 'rgba(16, 185, 129, 0.5)',
  
  // Error opacity variants
  error10: 'rgba(239, 68, 68, 0.1)',
  error20: 'rgba(239, 68, 68, 0.2)',
  error30: 'rgba(239, 68, 68, 0.3)',
  error50: 'rgba(239, 68, 68, 0.5)',
  
  // Warning opacity variants
  warning10: 'rgba(245, 158, 11, 0.1)',
  warning20: 'rgba(245, 158, 11, 0.2)',
  warning30: 'rgba(245, 158, 11, 0.3)',
  warning50: 'rgba(245, 158, 11, 0.5)',
  
  // Info opacity variants
  info10: 'rgba(59, 130, 246, 0.1)',
  info20: 'rgba(59, 130, 246, 0.2)',
  info30: 'rgba(59, 130, 246, 0.3)',
  info50: 'rgba(59, 130, 246, 0.5)',
};

// Gradientes para uso avanzado
export const gradients = {
  primary: ['#D4AF37', '#B8941F'],
  dark: ['#1A1A1A', '#0F0F0F'],
  overlay: ['transparent', 'rgba(0, 0, 0, 0.8)'],
  success: ['#10B981', '#059669'],
  error: ['#EF4444', '#DC2626'],
  warning: ['#F59E0B', '#D97706'],
  info: ['#3B82F6', '#2563EB'],
};

// Función helper para crear variantes de opacidad dinámicamente
export const createOpacity = (color, opacity) => {
  // Si el color ya tiene rgba, extraer los valores RGB
  if (color.startsWith('rgba')) {
    const values = color.match(/\d+/g);
    if (values && values.length >= 3) {
      return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${opacity})`;
    }
  }
  
  // Si es un color hex, convertir a rgba
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Si es un color nombrado o rgb, retornar tal como está
  return color;
};

// Esquemas de color predefenidos para diferentes secciones
export const colorSchemes = {
  miembros: {
    background: colors.surface,
    primary: colors.primary,
    aprendiz: colors.info,
    companero: colors.warning,
    maestro: colors.success,
  },
  documentos: {
    background: colors.surface,
    primary: colors.primary,
    pdf: colors.error,
    image: colors.info,
    text: colors.warning,
  },
  eventos: {
    background: colors.surface,
    primary: colors.primary,
    upcoming: colors.info,
    ongoing: colors.success,
    finished: colors.textSecondary,
  },
};

// Función para obtener color según el grado
export const getGradoColor = (grado) => {
  switch (grado?.toLowerCase()) {
    case 'aprendiz':
      return colors.info;
    case 'companero':
    case 'compañero':
      return colors.warning;
    case 'maestro':
      return colors.success;
    default:
      return colors.textSecondary;
  }
};

// Función para obtener color según el estado
export const getEstadoColor = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'activo':
      return colors.success;
    case 'inactivo':
      return colors.warning;
    case 'suspendido':
      return colors.error;
    default:
      return colors.textSecondary;
  }
};

export default colors;