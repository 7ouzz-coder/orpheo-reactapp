import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { GRADOS_DISPLAY, ROLES_DISPLAY, CARGOS_DISPLAY } from './constants';

/**
 * Formatear fecha
 */
export const formatDate = (date, pattern = 'dd/MM/yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern, { locale: es });
};

/**
 * Formatear fecha y hora
 */
export const formatDateTime = (date, pattern = 'dd/MM/yyyy HH:mm') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern, { locale: es });
};

/**
 * Tiempo relativo (hace 2 horas, hace 1 día, etc.)
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
};

/**
 * Formatear tamaño de archivo
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Capitalizar primera letra
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Generar iniciales de un nombre
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Obtener nombre de grado para mostrar
 */
export const getGradoDisplayName = (grado) => {
  return GRADOS_DISPLAY[grado] || capitalize(grado);
};

/**
 * Obtener nombre de rol para mostrar
 */
export const getRoleDisplayName = (role) => {
  return ROLES_DISPLAY[role] || capitalize(role);
};

/**
 * Obtener nombre de cargo para mostrar
 */
export const getCargoDisplayName = (cargo) => {
  return CARGOS_DISPLAY[cargo] || capitalize(cargo);
};

/**
 * Validar RUT chileno
 */
export const validateRUT = (rut) => {
  if (!rut) return false;
  
  // Limpiar RUT
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
  const calculatedDV = remainder === 0 ? '0' : remainder === 1 ? 'K' : (11 - remainder).toString();
  
  return dv === calculatedDV;
};

/**
 * Formatear RUT chileno
 */
export const formatRUT = (rut) => {
  if (!rut) return '';
  
  const cleanRut = rut.replace(/[^0-9kK]/g, '');
  if (cleanRut.length < 2) return cleanRut;
  
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  
  // Agregar puntos al cuerpo
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedBody}-${dv}`;
};

/**
 * Validar email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generar color aleatorio para avatar
 */
export const getAvatarColor = (name) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
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
 * Throttle function
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
 * Verificar si un usuario tiene permisos
 */
export const hasPermission = (user, permission) => {
  if (!user || !permission) return false;
  
  // Admin siempre tiene todos los permisos
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }
  
  // Verificar permisos específicos por grado
  const userPermissions = user.permissions || [];
  return userPermissions.includes(permission);
};

/**
 * Verificar si un usuario puede ver contenido de un grado específico
 */
export const canViewGrado = (userGrado, targetGrado) => {
  const gradoHierarchy = ['aprendiz', 'companero', 'maestro'];
  const userLevel = gradoHierarchy.indexOf(userGrado);
  const targetLevel = gradoHierarchy.indexOf(targetGrado);
  
  return userLevel >= targetLevel;
};

/**
 * Generar un ID único
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Truncar texto
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

/**
 * Verificar si es móvil
 */
export const isMobile = () => {
  return window.innerWidth < 768;
};

/**
 * Scroll suave a elemento
 */
export const scrollToElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};