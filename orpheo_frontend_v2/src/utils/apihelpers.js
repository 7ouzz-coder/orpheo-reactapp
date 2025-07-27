import { Platform } from 'react-native';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatear respuesta de API de forma consistente
 */
export const formatApiResponse = (response, defaultData = null) => {
  if (!response || !response.data) {
    return {
      success: false,
      data: defaultData,
      error: 'Respuesta inválida del servidor',
    };
  }

  return {
    success: response.data.success || false,
    data: response.data.data || defaultData,
    error: response.data.message || null,
    meta: response.data.meta || null,
  };
};

/**
 * Formatear errores de API de forma consistente
 */
export const formatApiError = (error) => {
  let errorMessage = 'Error de conexión';
  let errorCode = 'UNKNOWN_ERROR';
  let details = null;

  if (error.response) {
    // Error del servidor
    const { status, data } = error.response;
    errorCode = `HTTP_${status}`;
    
    switch (status) {
      case 400:
        errorMessage = data?.message || 'Datos inválidos';
        details = data?.errors || null;
        break;
      case 401:
        errorMessage = 'Sesión expirada. Inicia sesión nuevamente';
        errorCode = 'UNAUTHORIZED';
        break;
      case 403:
        errorMessage = 'No tienes permisos para realizar esta acción';
        errorCode = 'FORBIDDEN';
        break;
      case 404:
        errorMessage = 'Recurso no encontrado';
        break;
      case 409:
        errorMessage = data?.message || 'Conflicto con datos existentes';
        break;
      case 422:
        errorMessage = 'Datos de entrada inválidos';
        details = data?.errors || null;
        break;
      case 429:
        errorMessage = 'Demasiadas solicitudes. Intenta más tarde';
        errorCode = 'RATE_LIMIT';
        break;
      case 500:
        errorMessage = 'Error interno del servidor';
        errorCode = 'SERVER_ERROR';
        break;
      case 503:
        errorMessage = 'Servicio temporalmente no disponible';
        errorCode = 'SERVICE_UNAVAILABLE';
        break;
      default:
        errorMessage = data?.message || `Error del servidor (${status})`;
    }
  } else if (error.request) {
    // Error de red
    errorMessage = 'Sin conexión a internet';
    errorCode = 'NETWORK_ERROR';
  } else if (error.code === 'ECONNABORTED') {
    // Timeout
    errorMessage = 'Tiempo de espera agotado';
    errorCode = 'TIMEOUT';
  } else {
    // Otros errores
    errorMessage = error.message || 'Error desconocido';
  }

  return {
    success: false,
    error: errorMessage,
    code: errorCode,
    details,
  };
};

// ==========================================
// VALIDACIONES
// ==========================================

/**
 * Validar email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar RUT chileno
 */
export const validateRUT = (rut) => {
  if (!rut || typeof rut !== 'string') return false;
  
  // Limpiar RUT (remover puntos y guión)
  const cleanRUT = rut.replace(/[.-]/g, '');
  
  if (cleanRUT.length < 8 || cleanRUT.length > 9) return false;
  
  const body = cleanRUT.slice(0, -1);
  const checkDigit = cleanRUT.slice(-1).toUpperCase();
  
  if (!/^\d+$/.test(body)) return false;
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const calculatedDigit = remainder === 0 ? '0' : remainder === 1 ? 'K' : (11 - remainder).toString();
  
  return calculatedDigit === checkDigit;
};

/**
 * Validar teléfono chileno
 */
export const validateChileanPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Limpiar teléfono (remover espacios, guiones, paréntesis)
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Formatos válidos para Chile:
  // +56912345678 (celular con código país)
  // 56912345678 (celular con código país sin +)
  // 912345678 (celular sin código país)
  // +56221234567 (fijo con código país)
  // 56221234567 (fijo con código país sin +)
  // 221234567 (fijo sin código país)
  
  const patterns = [
    /^\+56[2-9]\d{8}$/, // Fijo con +56
    /^56[2-9]\d{8}$/,   // Fijo con 56
    /^[2-9]\d{8}$/,     // Fijo sin código
    /^\+569\d{8}$/,     // Celular con +56
    /^569\d{8}$/,       // Celular con 56
    /^9\d{8}$/,         // Celular sin código
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone));
};

/**
 * Validar contraseña
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['La contraseña es requerida'] };
  }
  
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe tener al menos una mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe tener al menos una minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Debe tener al menos un número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Debe tener al menos un carácter especial');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// ==========================================
// FORMATEO DE DATOS
// ==========================================

/**
 * Formatear RUT chileno
 */
export const formatRUT = (rut) => {
  if (!rut) return '';
  
  // Limpiar RUT
  const cleanRUT = rut.replace(/[.-]/g, '');
  
  if (cleanRUT.length < 2) return cleanRUT;
  
  const body = cleanRUT.slice(0, -1);
  const checkDigit = cleanRUT.slice(-1);
  
  // Agregar puntos cada 3 dígitos desde la derecha
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedBody}-${checkDigit}`;
};

/**
 * Formatear teléfono chileno
 */
export const formatChileanPhone = (phone) => {
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Si tiene código de país, mantenerlo
  if (cleanPhone.startsWith('+56')) {
    const number = cleanPhone.slice(3);
    if (number.length === 9 && number.startsWith('9')) {
      // Celular: +56 9 1234 5678
      return `+56 9 ${number.slice(1, 5)} ${number.slice(5)}`;
    } else if (number.length === 9) {
      // Fijo: +56 22 123 4567
      return `+56 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
    }
  } else if (cleanPhone.startsWith('56')) {
    const number = cleanPhone.slice(2);
    if (number.length === 9 && number.startsWith('9')) {
      return `+56 9 ${number.slice(1, 5)} ${number.slice(5)}`;
    } else if (number.length === 9) {
      return `+56 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
    }
  } else {
    // Sin código de país
    if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) {
      // Celular: 9 1234 5678
      return `9 ${cleanPhone.slice(1, 5)} ${cleanPhone.slice(5)}`;
    } else if (cleanPhone.length === 9) {
      // Fijo: 22 123 4567
      return `${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 5)} ${cleanPhone.slice(5)}`;
    }
  }
  
  return phone; // Devolver original si no se puede formatear
};

/**
 * Formatear fecha
 */
export const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, formatString, { locale: es });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formatear fecha y hora
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

/**
 * Formatear fecha relativa (hace 2 horas, ayer, etc.)
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInMs = now - dateObj;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) {
      return 'Ahora';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else {
      return formatDate(dateObj);
    }
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return formatDate(date);
  }
};

/**
 * Formatear tamaño de archivo
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// ==========================================
// UTILIDADES DE DATOS
// ==========================================

/**
 * Limpiar datos antes de enviar a la API
 */
export const sanitizeData = (data) => {
  const sanitized = { ...data };
  
  // Limpiar strings
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim();
      // Convertir strings vacíos a null
      if (sanitized[key] === '') {
        sanitized[key] = null;
      }
    }
  });
  
  return sanitized;
};

/**
 * Crear objeto FormData para uploads
 */
export const createFormData = (data, fileField = 'file') => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (key === fileField && value) {
      // Manejar archivos
      formData.append(key, {
        uri: Platform.OS === 'ios' ? value.uri.replace('file://', '') : value.uri,
        type: value.type || 'application/octet-stream',
        name: value.name || 'file',
      });
    } else if (value !== null && value !== undefined) {
      // Manejar otros campos
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
    }
  });
  
  return formData;
};

/**
 * Debounce para búsquedas
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle para eventos frecuentes
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ==========================================
// UTILIDADES DE GRADO MASÓNICO
// ==========================================

/**
 * Verificar si un usuario puede acceder a contenido de cierto grado
 */
export const canAccessGrade = (userGrade, contentGrade) => {
  const gradeHierarchy = {
    aprendiz: 1,
    companero: 2,
    maestro: 3,
  };
  
  const userLevel = gradeHierarchy[userGrade?.toLowerCase()] || 0;
  const contentLevel = gradeHierarchy[contentGrade?.toLowerCase()] || 0;
  
  return userLevel >= contentLevel;
};

/**
 * Obtener color por grado
 */
export const getGradeColor = (grade) => {
  const colors = {
    aprendiz: '#2196F3',
    companero: '#FF9800',
    maestro: '#D4AF37',
  };
  
  return colors[grade?.toLowerCase()] || '#808080';
};

/**
 * Obtener icono por grado
 */
export const getGradeIcon = (grade) => {
  const icons = {
    aprendiz: 'school',
    companero: 'account-supervisor',
    maestro: 'crown',
  };
  
  return icons[grade?.toLowerCase()] || 'account';
};

// ==========================================
// UTILIDADES DE CONEXIÓN
// ==========================================

/**
 * Verificar estado de la conexión
 */
export const checkConnectivity = async () => {
  try {
    // Esto se puede mejorar con @react-native-community/netinfo
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      timeout: 5000,
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Retry con backoff exponencial
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};