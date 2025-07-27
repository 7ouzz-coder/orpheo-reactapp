/**
 * Formatear fecha a string legible en español
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'No especificada';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Date(dateString).toLocaleDateString('es-CL', defaultOptions);
};

/**
 * Formatear fecha corta
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-CL');
};

/**
 * Formatear tamaño de archivo
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return 'Tamaño desconocido';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Capitalizar primera letra
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Formatear nombre completo
 */
export const formatFullName = (nombres, apellidos) => {
  const n = nombres?.trim() || '';
  const a = apellidos?.trim() || '';
  return `${n} ${a}`.trim() || 'Sin nombre';
};

/**
 * Validar email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar RUT chileno básico
 */
export const isValidRUT = (rut) => {
  if (!rut) return false;
  
  // Remover puntos y guión
  const cleanRUT = rut.replace(/[.-]/g, '');
  
  // Verificar formato básico
  if (cleanRUT.length < 8 || cleanRUT.length > 9) return false;
  
  const body = cleanRUT.slice(0, -1);
  const dv = cleanRUT.slice(-1).toLowerCase();
  
  // Verificar que el cuerpo sean solo números
  if (!/^\d+$/.test(body)) return false;
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const calculatedDV = remainder === 0 ? '0' : remainder === 1 ? 'k' : (11 - remainder).toString();
  
  return dv === calculatedDV;
};

/**
 * Formatear RUT
 */
export const formatRUT = (rut) => {
  if (!rut) return '';
  
  // Remover caracteres no válidos
  const clean = rut.replace(/[^0-9kK]/g, '');
  
  if (clean.length <= 1) return clean;
  
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  
  // Agregar puntos cada 3 dígitos desde la derecha
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formatted}-${dv}`;
};

/**
 * Formatear teléfono
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remover caracteres no numéricos excepto +
  const clean = phone.replace(/[^\d+]/g, '');
  
  if (clean.startsWith('+56')) {
    // Formato chileno: +56 9 1234 5678
    const number = clean.substring(3);
    if (number.length === 9 && number.startsWith('9')) {
      return `+56 ${number.substring(0, 1)} ${number.substring(1, 5)} ${number.substring(5)}`;
    }
  }
  
  return clean;
};

/**
 * Truncar texto
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generar color aleatorio
 */
export const getRandomColor = () => {
  const colors = [
    '#D4AF37', '#4CAF50', '#FF9800', '#2196F3', 
    '#9C27B0', '#F44336', '#795548', '#607D8B'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Obtener iniciales
 */
export const getInitials = (nombres, apellidos) => {
  const n = nombres?.trim()?.charAt(0)?.toUpperCase() || '';
  const a = apellidos?.trim()?.charAt(0)?.toUpperCase() || '';
  return `${n}${a}` || '??';
};

/**
 * Verificar si es imagen
 */
export const isImageFile = (fileName) => {
  if (!fileName) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return imageExtensions.includes(extension);
};

/**
 * Verificar si es PDF
 */
export const isPDFFile = (fileName) => {
  if (!fileName) return false;
  return fileName.toLowerCase().endsWith('.pdf');
};

/**
 * Obtener extensión de archivo
 */
export const getFileExtension = (fileName) => {
  if (!fileName) return '';
  return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
};

/**
 * Generar ID único simple
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export default {
  formatDate,
  formatDateShort,
  formatFileSize,
  capitalize,
  formatFullName,
  isValidEmail,
  isValidRUT,
  formatRUT,
  formatPhone,
  truncateText,
  getRandomColor,
  debounce,
  getInitials,
  isImageFile,
  isPDFFile,
  getFileExtension,
  generateId
};