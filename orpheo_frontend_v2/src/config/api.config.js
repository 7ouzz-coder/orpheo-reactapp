import { Platform } from 'react-native';

// Configuración de URLs del backend
const API_CONFIG = {
  // URLs base según el entorno
  BASE_URL: {
    development: {
      // Para desarrollo local
      android: 'http://191.112.178.230:3001/api', // Emulador Android
      ios: 'http://191.112.178.230:3001/api',     // Simulador iOS
      web: 'http://191.112.178.230:3001/api',     // Web
      default: 'http://191.112.178.230:3001/api', // IP local
    },
    production: {
      default: '191.112.178.230:3001/api', // URL de producción
    },
  },
  
  // Configuración de timeouts
  TIMEOUT: {
    request: 30000,    // 30 segundos
    upload: 120000,    // 2 minutos para uploads
  },
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Headers para archivos
  UPLOAD_HEADERS: {
    'Content-Type': 'multipart/form-data',
  },
  
  // Códigos de respuesta
  STATUS_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
  },
};

// Función para obtener la URL base según el entorno y plataforma
export const getBaseURL = () => {
  const environment = __DEV__ ? 'development' : 'production';
  const config = API_CONFIG.BASE_URL[environment];
  
  if (environment === 'development') {
    // En desarrollo, elegir URL según plataforma
    if (Platform.OS === 'android') {
      return config.android;
    } else if (Platform.OS === 'ios') {
      return config.ios;
    } else if (Platform.OS === 'web') {
      return config.web;
    } else {
      return config.default;
    }
  } else {
    // En producción, usar URL por defecto
    return config.default;
  }
};

// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Usuarios
  USERS: {
    LIST: '/users',
    DETAIL: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    PERMISSIONS: (id) => `/users/${id}/permissions`,
  },
  
  // Miembros
  MIEMBROS: {
    LIST: '/miembros',
    DETAIL: (id) => `/miembros/${id}`,
    CREATE: '/miembros',
    UPDATE: (id) => `/miembros/${id}`,
    DELETE: (id) => `/miembros/${id}`,
    SEARCH: '/miembros/search',
    STATS: '/miembros/estadisticas',
    EXPORT: '/miembros/export',
    IMPORT: '/miembros/import',
  },
  
  // Documentos
  DOCUMENTOS: {
    LIST: '/documentos',
    DETAIL: (id) => `/documentos/${id}`,
    CREATE: '/documentos',
    UPDATE: (id) => `/documentos/${id}`,
    DELETE: (id) => `/documentos/${id}`,
    UPLOAD: '/documentos/upload',
    DOWNLOAD: (id) => `/documentos/${id}/download`,
    STATS: '/documentos/estadisticas',
    COMMENTS: (id) => `/documentos/${id}/comentarios`,
    VERSIONS: (id) => `/documentos/${id}/versiones`,
  },
  
  // Programas
  PROGRAMAS: {
    LIST: '/programas',
    DETAIL: (id) => `/programas/${id}`,
    CREATE: '/programas',
    UPDATE: (id) => `/programas/${id}`,
    DELETE: (id) => `/programas/${id}`,
    ASISTENCIA: (id) => `/programas/${id}/asistencia`,
    CONFIRMAR: (id) => `/programas/${id}/confirmar`,
    STATS: '/programas/estadisticas',
  },
  
  // Asistencia
  ASISTENCIA: {
    LIST: '/asistencia',
    MARCAR: '/asistencia/marcar',
    JUSTIFICAR: '/asistencia/justificar',
    REPORTES: '/asistencia/reportes',
    MIEMBRO: (miembroId) => `/asistencia/miembro/${miembroId}`,
  },
  
  // Notificaciones
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    SETTINGS: '/notifications/settings',
  },
  
  // Sistema
  SYSTEM: {
    HEALTH: '/health',
    VERSION: '/version',
    STATS: '/stats',
  },
};

// Configuración de retry para requests fallidos
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 segundo
  retryOn: [408, 429, 500, 502, 503, 504], // Códigos que permiten retry
};

// Configuración de caché
export const CACHE_CONFIG = {
  ttl: 5 * 60 * 1000, // 5 minutos
  maxEntries: 100,
  excludeEndpoints: [
    API_ENDPOINTS.AUTH.LOGIN,
    API_ENDPOINTS.AUTH.LOGOUT,
    API_ENDPOINTS.AUTH.REFRESH,
  ],
};

// Configuración WebSocket (para futuro)
export const WEBSOCKET_CONFIG = {
  url: getBaseURL().replace('http', 'ws').replace('/api', '/ws'),
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
};

// Exportar configuración completa
export default {
  ...API_CONFIG,
  BASE_URL: getBaseURL(),
  ENDPOINTS: API_ENDPOINTS,
  RETRY: RETRY_CONFIG,
  CACHE: CACHE_CONFIG,
  WEBSOCKET: WEBSOCKET_CONFIG,
};

// Helper para construir URLs completas
export const buildURL = (endpoint, params = {}) => {
  let url = getBaseURL() + endpoint;
  
  // Reemplazar parámetros en la URL
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

// Helper para agregar query parameters
export const addQueryParams = (url, params = {}) => {
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
    
  return queryString ? `${url}?${queryString}` : url;
};