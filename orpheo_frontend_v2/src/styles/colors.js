// Tema de colores masónico - Oscuro con dorado
export const colors = {
  // Colores principales  
  primary: '#D4AF37',        // Dorado masónico
  primaryLight: '#E6C968',   // Dorado claro
  primaryDark: '#B8941F',    // Dorado oscuro
  
  // Fondo y superficies
  background: '#0F0F0F',     // Negro profundo
  surface: '#1A1A1A',       // Gris muy oscuro
  surfaceLight: '#2D2D2D',  // Gris oscuro
  
  // Textos
  text: '#FFFFFF',          // Blanco
  textSecondary: '#B0B0B0', // Gris claro
  textMuted: '#808080',     // Gris medio
  textDisabled: '#505050',  // Gris oscuro
  
  // Estados
  success: '#4CAF50',       // Verde
  warning: '#FF9800',       // Naranja
  error: '#F44336',         // Rojo
  info: '#2196F3',          // Azul
  
  // Bordes y separadores
  border: '#333333',        // Gris muy oscuro
  divider: '#404040',       // Gris oscuro
  
  // Grados masónicos
  gradoAprendiz: '#2196F3', // Azul
  gradoCompanero: '#FF9800',// Naranja
  gradoMaestro: '#D4AF37',  // Dorado
  
  // Transparencias
  overlay: 'rgba(0, 0, 0, 0.7)',
  modalOverlay: 'rgba(0, 0, 0, 0.8)',
  
  // Botones
  buttonPrimary: '#D4AF37',
  buttonSecondary: '#333333',
  buttonDisabled: '#505050',
  
  // Inputs
  inputBackground: '#2D2D2D',
  inputBorder: '#555555',
  inputBorderFocus: '#D4AF37',
  
  // Cards
  cardBackground: '#1A1A1A',
  cardBorder: '#333333',
  
  // Tabs
  tabActive: '#D4AF37',
  tabInactive: '#808080',
  tabBackground: '#1A1A1A',
  
  // Status bar
  statusBar: '#000000',
};

// Función para obtener color por grado masónico
export const getGradoColor = (grado) => {
  switch (grado?.toLowerCase()) {
    case 'aprendiz':
      return colors.gradoAprendiz;
    case 'companero':
      return colors.gradoCompanero;
    case 'maestro':
      return colors.gradoMaestro;
    default:
      return colors.textSecondary;
  }
};

// Función para obtener color por estado
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'activo':
      return colors.success;
    case 'inactivo':
      return colors.warning;
    case 'suspendido':
      return colors.error;
    case 'pendiente':
      return colors.info;
    default:
      return colors.textSecondary;
  }
};

// Función para obtener color por tipo de documento
export const getDocumentTypeColor = (tipo) => {
  switch (tipo?.toLowerCase()) {
    case 'plancha':
      return colors.gradoMaestro;
    case 'reglamento':
      return colors.error;
    case 'acta':
      return colors.info;
    case 'documento':
    default:
      return colors.textSecondary;
  }
};

// Opacidades comunes
export const opacity = {
  light: 0.1,
  medium: 0.3,
  strong: 0.7,
  overlay: 0.8,
};

// Gradientes
export const gradients = {
  primary: ['#D4AF37', '#B8941F'],
  background: ['#0F0F0F', '#1A1A1A'],
  card: ['#1A1A1A', '#2D2D2D'],
};