export const colors = {
  // Tema masónico oscuro-dorado
  primary: '#D4AF37',        // Dorado masónico
  primaryDark: '#B8860B',    // Dorado más oscuro
  primaryLight: '#F4E4BC',   // Dorado claro
  
  secondary: '#1A1A1A',      // Negro profundo
  secondaryLight: '#2A2A2A', // Gris muy oscuro
  
  background: '#0F0F0F',     // Fondo principal muy oscuro
  surface: '#1E1E1E',        // Fondo de tarjetas/componentes
  surfaceLight: '#2E2E2E',   // Fondo de elementos elevados
  
  text: '#FFFFFF',           // Texto principal blanco
  textSecondary: '#CCCCCC',  // Texto secundario gris claro
  textMuted: '#999999',      // Texto apagado
  
  // Estados
  success: '#4CAF50',        // Verde éxito
  error: '#F44336',          // Rojo error
  warning: '#FF9800',        // Naranja advertencia
  info: '#2196F3',           // Azul información
  
  // Grados masónicos
  aprendiz: '#4CAF50',       // Verde para aprendiz
  companero: '#FF9800',      // Naranja para compañero
  maestro: '#D4AF37',        // Dorado para maestro
  
  // Utilidades
  border: '#333333',         // Bordes
  placeholder: '#666666',    // Placeholder text
  disabled: '#555555',       // Elementos deshabilitados
  overlay: 'rgba(0,0,0,0.5)', // Overlay modal
  
  // Transparencias
  primaryTransparent: 'rgba(212, 175, 55, 0.1)',
  surfaceTransparent: 'rgba(30, 30, 30, 0.9)',
};

// Función para obtener color por grado
export const getGradoColor = (grado) => {
  switch (grado?.toLowerCase()) {
    case 'aprendiz':
      return colors.aprendiz;
    case 'companero':
    case 'compañero':
      return colors.companero;
    case 'maestro':
      return colors.maestro;
    default:
      return colors.textMuted;
  }
};

// Función para obtener color por estado
export const getEstadoColor = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'activo':
      return colors.success;
    case 'inactivo':
      return colors.warning;
    case 'suspendido':
      return colors.error;
    default:
      return colors.textMuted;
  }
};

export default colors;