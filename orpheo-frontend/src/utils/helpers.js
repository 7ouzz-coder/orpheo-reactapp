import { format, parseISO, formatDistanceToNow, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  GRADOS_DISPLAY, 
  CARGOS_DISPLAY, 
  VALIDATIONS,
  DATE_FORMATS 
} from './constants';

/**
 * Obtiene las iniciales de un nombre completo
 * @param {string} fullName - Nombre completo
 * @returns {string} Iniciales
 */
export const getInitials = (fullName) => {
  if (!fullName) return 'U';
  
  return fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Formatea un RUT chileno
 * @param {string} rut - RUT sin formato
 * @returns {string} RUT formateado
 */
export const formatRUT = (rut) => {
  if (!rut) return '';
  
  // Remover caracteres no numéricos excepto K
  const cleanRut = rut.toString().replace(/[^0-9kK]/g, '');
  
  if (cleanRut.length <= 1) return cleanRut;
  
  // Separar dígito verificador
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();
  
  // Formatear cuerpo del RUT
  let formattedBody = '';
  for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
    if (j > 0 && j % 3 === 0) {
      formattedBody = '.' + formattedBody;
    }
    formattedBody = body[i] + formattedBody;
  }
  
  return `${formattedBody}-${dv}`;
};

/**
 * Valida un RUT chileno
 * @param {string} rut - RUT a validar
 * @returns {boolean} True si es válido
 */
export const validateRUT = (rut) => {
  if (!rut) return false;
  
  const cleanRut = rut.replace(/[^0-9kK]/g, '');
  
  if (cleanRut.length < 2) return false;
  
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const calculatedDV = remainder < 2 ? remainder.toString() : (11 - remainder === 10 ? 'K' : (11 - remainder).toString());
  
  return dv === calculatedDV;
};

/**
 * Formatea una fecha
 * @param {string|Date} date - Fecha a formatear
 * @param {string} formatType - Tipo de formato (SHORT, LONG, TIME, etc.)
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, formatType = 'SHORT') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) return '';
    
    const formatString = DATE_FORMATS[formatType] || formatType;
    return format(dateObj, formatString, { locale: es });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Obtiene el tiempo relativo (ej: "hace 2 horas")
 * @param {string|Date} date - Fecha
 * @returns {string} Tiempo relativo
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) return '';
    
    return formatDistanceToNow(dateObj, { 
      addSuffix: true, 
      locale: es 
    });
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '';
  }
};

/**
 * Obtiene el nombre de display de un grado
 * @param {string} grado - Grado masónico
 * @returns {string} Nombre de display
 */
export const getGradoDisplayName = (grado) => {
  return GRADOS_DISPLAY[grado] || grado;
};

/**
 * Obtiene el nombre de display de un cargo
 * @param {string} cargo - Cargo
 * @returns {string} Nombre de display
 */
export const getCargoDisplayName = (cargo) => {
  return CARGOS_DISPLAY[cargo] || cargo;
};

/**
 * Capitaliza la primera letra de una cadena
 * @param {string} str - Cadena a capitalizar
 * @returns {string} Cadena capitalizada
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitaliza cada palabra de una cadena
 * @param {string} str - Cadena a capitalizar
 * @returns {string} Cadena con cada palabra capitalizada
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const validateEmail = (email) => {
  if (!email) return false;
  return VALIDATIONS.EMAIL_REGEX.test(email);
};

/**
 * Valida un teléfono chileno
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} True si es válido
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  return VALIDATIONS.PHONE_REGEX.test(phone);
};

/**
 * Formatea un teléfono chileno
 * @param {string} phone - Teléfono a formatear
 * @returns {string} Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 9) {
    return `+56 ${cleanPhone.substring(0, 1)} ${cleanPhone.substring(1, 5)} ${cleanPhone.substring(5)}`;
  }
  
  if (cleanPhone.length === 8) {
    return `+56 ${cleanPhone.substring(0, 1)} ${cleanPhone.substring(1, 4)} ${cleanPhone.substring(4)}`;
  }
  
  return phone;
};

/**
 * Calcula la edad basándose en la fecha de nacimiento
 * @param {string|Date} birthDate - Fecha de nacimiento
 * @returns {number|null} Edad en años
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  
  try {
    const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
    
    if (!isValid(birth)) return null;
    
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
};

/**
 * Formatea un tamaño de archivo
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Genera un color basado en un string
 * @param {string} str - String base
 * @returns {string} Color hexadecimal
 */
export const stringToColor = (str) => {
  if (!str) return '#D4AF37';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
};

/**
 * Debounce function
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @param {boolean} immediate - Ejecutar inmediatamente
 * @returns {Function} Función con debounce
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
};

/**
 * Throttle function
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite de tiempo en ms
 * @returns {Function} Función con throttle
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Escapa caracteres HTML
 * @param {string} text - Texto a escapar
 * @returns {string} Texto escapado
 */
export const escapeHtml = (text) => {
  if (!text) return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Trunca un texto
 * @param {string} text - Texto a truncar
 * @param {number} length - Longitud máxima
 * @param {string} suffix - Sufijo (por defecto '...')
 * @returns {string} Texto truncado
 */
export const truncateText = (text, length, suffix = '...') => {
  if (!text) return '';
  
  if (text.length <= length) return text;
  
  return text.substring(0, length - suffix.length) + suffix;
};

/**
 * Convierte un string a slug
 * @param {string} text - Texto a convertir
 * @returns {string} Slug
 */
export const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

/**
 * Genera un ID único
 * @param {string} prefix - Prefijo opcional
 * @returns {string} ID único
 */
export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const randomNum = Math.random().toString(36).substring(2);
  return prefix + timestamp + randomNum;
};

/**
 * Verifica si un valor está vacío
 * @param {any} value - Valor a verificar
 * @returns {boolean} True si está vacío
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Copia texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} True si fue exitoso
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores más antiguos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * Convierte un objeto a query string
 * @param {Object} obj - Objeto a convertir
 * @returns {string} Query string
 */
export const objectToQueryString = (obj) => {
  const params = new URLSearchParams();
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  return params.toString();
};

/**
 * Convierte query string a objeto
 * @param {string} queryString - Query string
 * @returns {Object} Objeto
 */
export const queryStringToObject = (queryString) => {
  const params = new URLSearchParams(queryString);
  const obj = {};
  
  params.forEach((value, key) => {
    obj[key] = value;
  });
  
  return obj;
};

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {Object} Resultado de validación
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    errors: [],
    strength: 0
  };
  
  if (!password) {
    result.errors.push('La contraseña es requerida');
    return result;
  }
  
  if (password.length < VALIDATIONS.PASSWORD_MIN_LENGTH) {
    result.errors.push(`La contraseña debe tener al menos ${VALIDATIONS.PASSWORD_MIN_LENGTH} caracteres`);
  }
  
  if (!/[a-z]/.test(password)) {
    result.errors.push('La contraseña debe contener al menos una letra minúscula');
  } else {
    result.strength += 1;
  }
  
  if (!/[A-Z]/.test(password)) {
    result.errors.push('La contraseña debe contener al menos una letra mayúscula');
  } else {
    result.strength += 1;
  }
  
  if (!/\d/.test(password)) {
    result.errors.push('La contraseña debe contener al menos un número');
  } else {
    result.strength += 1;
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.errors.push('La contraseña debe contener al menos un carácter especial');
  } else {
    result.strength += 1;
  }
  
  result.isValid = result.errors.length === 0;
  
  return result;
};

export default {
  getInitials,
  formatRUT,
  validateRUT,
  formatDate,
  getRelativeTime,
  getGradoDisplayName,
  getCargoDisplayName,
  capitalize,
  capitalizeWords,
  validateEmail,
  validatePhone,
  formatPhone,
  calculateAge,
  formatFileSize,
  stringToColor,
  debounce,
  throttle,
  escapeHtml,
  truncateText,
  slugify,
  generateId,
  isEmpty,
  copyToClipboard,
  objectToQueryString,
  queryStringToObject,
  validatePassword,
};