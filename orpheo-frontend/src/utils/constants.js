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
  REVISION: 'revision',
  ARCHIVADO: 'archivado',
};

export const DOCUMENTO_ESTADOS_DISPLAY = {
  [DOCUMENTO_ESTADOS.PENDIENTE]: 'Pendiente',
  [DOCUMENTO_ESTADOS.APROBADO]: 'Aprobado',
  [DOCUMENTO_ESTADOS.RECHAZADO]: 'Rechazado',
  [DOCUMENTO_ESTADOS.REVISION]: 'En Revisión',
  [DOCUMENTO_ESTADOS.ARCHIVADO]: 'Archivado',
};

// Tipos de documentos
export const DOCUMENTO_TIPOS = {
  PLANCHA: 'plancha',
  ACTA: 'acta',
  CIRCULAR: 'circular',
  REGLAMENTO: 'reglamento',
  CARTA: 'carta',
  INFORME: 'informe',
  OTRO: 'otro',
};

export const DOCUMENTO_TIPOS_DISPLAY = {
  [DOCUMENTO_TIPOS.PLANCHA]: 'Plancha',
  [DOCUMENTO_TIPOS.ACTA]: 'Acta',
  [DOCUMENTO_TIPOS.CIRCULAR]: 'Circular',
  [DOCUMENTO_TIPOS.REGLAMENTO]: 'Reglamento',
  [DOCUMENTO_TIPOS.CARTA]: 'Carta',
  [DOCUMENTO_TIPOS.INFORME]: 'Informe',
  [DOCUMENTO_TIPOS.OTRO]: 'Otro',
};

// Estados de programas/tenidas
export const PROGRAMA_ESTADOS = {
  PROGRAMADO: 'programado',
  EN_CURSO: 'en_curso',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado',
  SUSPENDIDO: 'suspendido',
};

export const PROGRAMA_ESTADOS_DISPLAY = {
  [PROGRAMA_ESTADOS.PROGRAMADO]: 'Programado',
  [PROGRAMA_ESTADOS.EN_CURSO]: 'En Curso',
  [PROGRAMA_ESTADOS.FINALIZADO]: 'Finalizado',
  [PROGRAMA_ESTADOS.CANCELADO]: 'Cancelado',
  [PROGRAMA_ESTADOS.SUSPENDIDO]: 'Suspendido',
};

// Tipos de programas
export const PROGRAMA_TIPOS = {
  TENIDA_ORDINARIA: 'tenida_ordinaria',
  TENIDA_EXTRAORDINARIA: 'tenida_extraordinaria',
  GRADO: 'grado',
  REUNION_ADMINISTRATIVA: 'reunion_administrativa',
  EVENTO_SOCIAL: 'evento_social',
  CONFERENCIA: 'conferencia',
  INSTALACION: 'instalacion',
};

export const PROGRAMA_TIPOS_DISPLAY = {
  [PROGRAMA_TIPOS.TENIDA_ORDINARIA]: 'Tenida Ordinaria',
  [PROGRAMA_TIPOS.TENIDA_EXTRAORDINARIA]: 'Tenida Extraordinaria',
  [PROGRAMA_TIPOS.GRADO]: 'Ceremonia de Grado',
  [PROGRAMA_TIPOS.REUNION_ADMINISTRATIVA]: 'Reunión Administrativa',
  [PROGRAMA_TIPOS.EVENTO_SOCIAL]: 'Evento Social',
  [PROGRAMA_TIPOS.CONFERENCIA]: 'Conferencia',
  [PROGRAMA_TIPOS.INSTALACION]: 'Instalación',
};

// Estados de asistencia
export const ASISTENCIA_ESTADOS = {
  CONFIRMADA: 'confirmada',
  PENDIENTE: 'pendiente',
  AUSENTE: 'ausente',
  JUSTIFICADA: 'justificada',
};

export const ASISTENCIA_ESTADOS_DISPLAY = {
  [ASISTENCIA_ESTADOS.CONFIRMADA]: 'Confirmada',
  [ASISTENCIA_ESTADOS.PENDIENTE]: 'Pendiente',
  [ASISTENCIA_ESTADOS.AUSENTE]: 'Ausente',
  [ASISTENCIA_ESTADOS.JUSTIFICADA]: 'Justificada',
};

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  URGENT: 'urgent',
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGES_SHOWN: 5,
};

// Configuración de fecha y hora
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
  MONTH_YEAR: 'MM/yyyy',
  YEAR: 'yyyy',
};

// Validaciones
export const VALIDATIONS = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  RUT_REGEX: /^(\d{1,2}\.)?\d{3}\.\d{3}-[\dkK]$/,
  EMAIL_REGEX: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE_REGEX: /^(\+56)?[\s-]?[2-9]\d{8}$/,
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es obligatorio',
  INVALID_EMAIL: 'Formato de email inválido',
  INVALID_RUT: 'RUT inválido',
  INVALID_PHONE: 'Formato de teléfono inválido',
  PASSWORD_TOO_SHORT: `La contraseña debe tener al menos ${VALIDATIONS.PASSWORD_MIN_LENGTH} caracteres`,
  USERNAME_TOO_SHORT: `El usuario debe tener al menos ${VALIDATIONS.USERNAME_MIN_LENGTH} caracteres`,
  NETWORK_ERROR: 'Error de conexión',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  NOT_FOUND: 'Recurso no encontrado',
  SERVER_ERROR: 'Error interno del servidor',
};

// Configuración de localStorage
export const STORAGE_KEYS = {
  TOKEN: 'orpheo_token',
  REFRESH_TOKEN: 'orpheo_refresh_token', // ✅ AGREGAR ESTA LÍNEA
  USER: 'orpheo_user',
  PREFERENCES: 'orpheo_preferences',
  THEME: 'orpheo_theme',
  LANGUAGE: 'orpheo_language',
};

// Configuración de animaciones
export const ANIMATIONS = {
  DURATION: {
    FAST: 0.2,
    NORMAL: 0.3,
    SLOW: 0.5,
  },
  EASING: {
    EASE_IN_OUT: [0.4, 0, 0.2, 1],
    EASE_OUT: [0, 0, 0.2, 1],
    EASE_IN: [0.4, 0, 1, 1],
  },
};

// Configuración de tema
export const THEME = {
  COLORS: {
    PRIMARY: {
      BLACK: '#0B0B0B',
      BLACK_SECONDARY: '#121212',
      GOLD: '#D4AF37',
      GOLD_SECONDARY: '#B3892B',
      GOLD_LIGHT: '#E6C275',
    },
    GRAY: {
      BORDER: '#7A6F63',
      TEXT: '#A59F99',
    },
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
};

// Estados de miembros
export const MIEMBRO_ESTADOS = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  SUSPENDIDO: 'suspendido',
  EXONERADO: 'exonerado',
};

export const MIEMBRO_ESTADOS_DISPLAY = {
  [MIEMBRO_ESTADOS.ACTIVO]: 'Activo',
  [MIEMBRO_ESTADOS.INACTIVO]: 'Inactivo',
  [MIEMBRO_ESTADOS.SUSPENDIDO]: 'Suspendido',
  [MIEMBRO_ESTADOS.EXONERADO]: 'Exonerado',
};

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    DOCUMENTS: ['pdf', 'doc', 'docx', 'txt'],
    IMAGES: ['jpg', 'jpeg', 'png', 'gif'],
    EXCEL: ['xls', 'xlsx', 'csv'],
  },
  UPLOAD_CHUNK_SIZE: 1024 * 1024, // 1MB chunks
};

// Configuración de WebSocket
export const WS_CONFIG = {
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 5,
  HEARTBEAT_INTERVAL: 30000,
};

// Eventos de WebSocket
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  NOTIFICATION: 'notification',
  MEMBER_UPDATE: 'member_update',
  DOCUMENT_UPDATE: 'document_update',
  PROGRAM_UPDATE: 'program_update',
  ATTENDANCE_UPDATE: 'attendance_update',
  SYSTEM_MESSAGE: 'system_message',
};

// Configuración de caché
export const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutos
  MAX_SIZE: 100, // 100 items
  STORAGE_KEY: 'orpheo_cache',
};

// Configuración de logs
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

// Permisos por grado
export const PERMISOS_POR_GRADO = {
  [GRADOS.APRENDIZ]: {
    ver_miembros: true,
    ver_documentos_publicos: true,
    subir_planchas: true,
    ver_programas: true,
    confirmar_asistencia: true,
  },
  [GRADOS.COMPANERO]: {
    ver_miembros: true,
    ver_documentos_publicos: true,
    ver_documentos_companero: true,
    subir_planchas: true,
    comentar_planchas: true,
    ver_programas: true,
    confirmar_asistencia: true,
  },
  [GRADOS.MAESTRO]: {
    ver_miembros: true,
    editar_miembros: true,
    ver_todos_documentos: true,
    aprobar_planchas: true,
    crear_programas: true,
    gestionar_asistencia: true,
    ver_estadisticas: true,
  },
};

// Permisos por cargo
export const PERMISOS_POR_CARGO = {
  [CARGOS.VENERABLE_MAESTRO]: {
    admin_total: true,
    aprobar_documentos: true,
    gestionar_miembros: true,
    crear_usuarios: true,
    ver_todos_reportes: true,
  },
  [CARGOS.SECRETARIO]: {
    gestionar_miembros: true,
    gestionar_documentos: true,
    gestionar_programas: true,
    ver_reportes: true,
  },
  [CARGOS.TESORERO]: {
    ver_finanzas: true,
    gestionar_pagos: true,
    ver_reportes_financieros: true,
  },
  [CARGOS.HOSPITALARIO]: {
    ver_info_salud: true,
    gestionar_contactos_emergencia: true,
  },
};

export default {
  API_CONFIG,
  APP_CONFIG,
  GRADOS,
  GRADOS_DISPLAY,
  ROLES,
  ROLES_DISPLAY,
  CARGOS,
  CARGOS_DISPLAY,
  ROUTES,
  VALIDATIONS,
  ERROR_MESSAGES,
  STORAGE_KEYS,
  THEME,
  PERMISOS_POR_GRADO,
  PERMISOS_POR_CARGO,
};