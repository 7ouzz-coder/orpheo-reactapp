// Configuración de la API
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  WS_URL: process.env.REACT_APP_WS_BASE_URL || 'ws://localhost:3001',
  TIMEOUT: 30000,
};

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'Orpheo',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de Gestión Masónica',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
};

// Grados masónicos
export const GRADOS = {
  APRENDIZ: 'aprendiz',
  COMPANERO: 'companero',
  MAESTRO: 'maestro',
};

export const GRADOS_DISPLAY = {
  [GRADOS.APRENDIZ]: 'Aprendiz',
  [GRADOS.COMPANERO]: 'Compañero',
  [GRADOS.MAESTRO]: 'Maestro',
};

export const GRADOS_COLORS = {
  [GRADOS.APRENDIZ]: 'text-yellow-500',
  [GRADOS.COMPANERO]: 'text-green-500',
  [GRADOS.MAESTRO]: 'text-blue-500',
};

// Roles de usuario
export const ROLES = {
  GENERAL: 'general',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

export const ROLES_DISPLAY = {
  [ROLES.GENERAL]: 'Usuario General',
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.SUPERADMIN]: 'Super Administrador',
};

// Cargos
export const CARGOS = {
  VENERABLE_MAESTRO: 'venerable_maestro',
  PRIMER_VIGILANTE: 'primer_vigilante',
  SEGUNDO_VIGILANTE: 'segundo_vigilante',
  SECRETARIO: 'secretario',
  TESORERO: 'tesorero',
  ORADOR: 'orador',
  MAESTRO_CEREMONIAS: 'maestro_ceremonias',
  HOSPITALARIO: 'hospitalario',
};

export const CARGOS_DISPLAY = {
  [CARGOS.VENERABLE_MAESTRO]: 'Venerable Maestro',
  [CARGOS.PRIMER_VIGILANTE]: 'Primer Vigilante',
  [CARGOS.SEGUNDO_VIGILANTE]: 'Segundo Vigilante',
  [CARGOS.SECRETARIO]: 'Secretario',
  [CARGOS.TESORERO]: 'Tesorero',
  [CARGOS.ORADOR]: 'Orador',
  [CARGOS.MAESTRO_CEREMONIAS]: 'Maestro de Ceremonias',
  [CARGOS.HOSPITALARIO]: 'Hospitalario',
};

// Rutas de navegación
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MIEMBROS: '/miembros',
  DOCUMENTOS: '/documentos',
  PROGRAMAS: '/programas',
  PERFIL: '/perfil',
  ADMIN: '/admin',
};

// Estados de documentos
export const DOCUMENTO_ESTADOS = {
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado',
};

// Estados de programas
export const PROGRAMA_ESTADOS = {
  PENDIENTE: 'pendiente',
  PROGRAMADO: 'programado',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado',
};

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Configuración de localStorage
export const STORAGE_KEYS = {
  TOKEN: 'orpheo_token',
  USER: 'orpheo_user',
  THEME: 'orpheo_theme',
  PREFERENCES: 'orpheo_preferences',
};

// Permisos por grado
export const PERMISSIONS = {
  [GRADOS.APRENDIZ]: [
    'read_own_profile',
    'read_aprendiz_documents',
    'read_aprendiz_programs',
  ],
  [GRADOS.COMPANERO]: [
    'read_own_profile',
    'read_aprendiz_documents',
    'read_companero_documents',
    'read_aprendiz_programs',
    'read_companero_programs',
  ],
  [GRADOS.MAESTRO]: [
    'read_all_profiles',
    'read_all_documents',
    'read_all_programs',
    'write_documents',
    'manage_attendance',
  ],
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Configuración de validación
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  MAX_FILE_SIZE: APP_CONFIG.MAX_FILE_SIZE,
};