// Grados masónicos
export const GRADOS = {
  APRENDIZ: 'aprendiz',
  COMPANERO: 'companero', 
  MAESTRO: 'maestro'
};

export const GRADOS_OPCIONES = [
  { value: GRADOS.APRENDIZ, label: 'Aprendiz' },
  { value: GRADOS.COMPANERO, label: 'Compañero' },
  { value: GRADOS.MAESTRO, label: 'Maestro' }
];

// Estados de miembros
export const ESTADOS_MIEMBRO = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  SUSPENDIDO: 'suspendido'
};

export const ESTADOS_OPCIONES = [
  { value: ESTADOS_MIEMBRO.ACTIVO, label: 'Activo' },
  { value: ESTADOS_MIEMBRO.INACTIVO, label: 'Inactivo' },
  { value: ESTADOS_MIEMBRO.SUSPENDIDO, label: 'Suspendido' }
];

// Roles de usuario
export const ROLES = {
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
  GENERAL: 'general'
};

// Tipos de documentos
export const TIPOS_DOCUMENTO = {
  DOCUMENTO: 'documento',
  PLANCHA: 'plancha',
  REGLAMENTO: 'reglamento',
  ACTA: 'acta'
};

export const TIPOS_DOCUMENTO_OPCIONES = [
  { value: TIPOS_DOCUMENTO.DOCUMENTO, label: 'Documento' },
  { value: TIPOS_DOCUMENTO.PLANCHA, label: 'Plancha' },
  { value: TIPOS_DOCUMENTO.REGLAMENTO, label: 'Reglamento' },
  { value: TIPOS_DOCUMENTO.ACTA, label: 'Acta' }
];

// Categorías de documentos
export const CATEGORIAS_DOCUMENTO = {
  GENERAL: 'general',
  APRENDIZ: 'aprendiz',
  COMPANERO: 'companero',
  MAESTRO: 'maestro'
};

export const CATEGORIAS_OPCIONES = [
  { value: CATEGORIAS_DOCUMENTO.GENERAL, label: 'General' },
  { value: CATEGORIAS_DOCUMENTO.APRENDIZ, label: 'Aprendiz' },
  { value: CATEGORIAS_DOCUMENTO.COMPANERO, label: 'Compañero' },
  { value: CATEGORIAS_DOCUMENTO.MAESTRO, label: 'Maestro' }
];

// Configuración de la app
export const APP_CONFIG = {
  NAME: 'Orpheo',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de Gestión Masónica',
  AUTHOR: 'Orpheo Project'
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif'
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif']
};

// Mensajes de validación
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es requerido',
  EMAIL_INVALID: 'Email inválido',
  RUT_INVALID: 'RUT inválido',
  PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 6 caracteres',
  FILE_TOO_LARGE: 'El archivo es demasiado grande',
  FILE_TYPE_NOT_ALLOWED: 'Tipo de archivo no permitido'
};

// Tiempo de espera para requests
export const TIMEOUTS = {
  DEFAULT: 30000, // 30 segundos
  UPLOAD: 120000, // 2 minutos
  LOGIN: 15000 // 15 segundos
};

export default {
  GRADOS,
  GRADOS_OPCIONES,
  ESTADOS_MIEMBRO,
  ESTADOS_OPCIONES,
  ROLES,
  TIPOS_DOCUMENTO,
  TIPOS_DOCUMENTO_OPCIONES,
  CATEGORIAS_DOCUMENTO,
  CATEGORIAS_OPCIONES,
  APP_CONFIG,
  PAGINATION,
  FILE_CONFIG,
  VALIDATION_MESSAGES,
  TIMEOUTS
};