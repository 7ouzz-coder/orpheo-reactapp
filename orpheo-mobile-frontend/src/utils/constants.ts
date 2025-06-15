// Configuración de colores (basado en tu diseño web)
export const Colors = {
  PRIMARY_BLACK: '#0B0B0B',
  PRIMARY_BLACK_SECONDARY: '#121212',
  PRIMARY_GOLD: '#D4AF37',
  PRIMARY_GOLD_SECONDARY: '#B3892B',
  PRIMARY_GOLD_LIGHT: '#E6C275',
  GRAY_BORDER: '#7A6F63',
  GRAY_TEXT: '#A59F99',
  WHITE: '#FFFFFF',
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
} as const;

// Espaciado consistente
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Tipografía
export const Typography = {
  h1: { fontSize: 32, fontWeight: 'bold' as const },
  h2: { fontSize: 24, fontWeight: 'bold' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  h4: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16 },
  bodySmall: { fontSize: 14 },
  caption: { fontSize: 12 },
} as const;

// Configuración de API
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3001/api' 
    : 'https://api.orpheo.com/api',
  TIMEOUT: 30000,
} as const;

// Grados masónicos
export const GRADOS = {
  APRENDIZ: 'aprendiz',
  COMPANERO: 'companero',
  MAESTRO: 'maestro',
} as const;

export const GRADOS_DISPLAY = {
  [GRADOS.APRENDIZ]: 'Aprendiz',
  [GRADOS.COMPANERO]: 'Compañero',
  [GRADOS.MAESTRO]: 'Maestro',
} as const;

export const GRADOS_COLORS = {
  [GRADOS.APRENDIZ]: '#F59E0B',
  [GRADOS.COMPANERO]: '#10B981',
  [GRADOS.MAESTRO]: '#3B82F6',
} as const;

// Roles de usuario
export const ROLES = {
  GENERAL: 'general',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
} as const;

export const ROLES_DISPLAY = {
  [ROLES.GENERAL]: 'Usuario General',
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.SUPERADMIN]: 'Super Administrador',
} as const;

// Cargos masónicos
export const CARGOS = {
  VENERABLE_MAESTRO: 'venerable_maestro',
  PRIMER_VIGILANTE: 'primer_vigilante',
  SEGUNDO_VIGILANTE: 'segundo_vigilante',
  SECRETARIO: 'secretario',
  TESORERO: 'tesorero',
  ORADOR: 'orador',
  MAESTRO_CEREMONIAS: 'maestro_ceremonias',
  HOSPITALARIO: 'hospitalario',
} as const;

export const CARGOS_DISPLAY = {
  [CARGOS.VENERABLE_MAESTRO]: 'Venerable Maestro',
  [CARGOS.PRIMER_VIGILANTE]: 'Primer Vigilante',
  [CARGOS.SEGUNDO_VIGILANTE]: 'Segundo Vigilante',
  [CARGOS.SECRETARIO]: 'Secretario',
  [CARGOS.TESORERO]: 'Tesorero',
  [CARGOS.ORADOR]: 'Orador',
  [CARGOS.MAESTRO_CEREMONIAS]: 'Maestro de Ceremonias',
  [CARGOS.HOSPITALARIO]: 'Hospitalario',
} as const;

// Estados de documentos
export const DOCUMENTO_ESTADOS = {
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado',
  REVISION: 'revision',
} as const;

export const DOCUMENTO_ESTADOS_DISPLAY = {
  [DOCUMENTO_ESTADOS.PENDIENTE]: 'Pendiente',
  [DOCUMENTO_ESTADOS.APROBADO]: 'Aprobado',
  [DOCUMENTO_ESTADOS.RECHAZADO]: 'Rechazado',
  [DOCUMENTO_ESTADOS.REVISION]: 'En Revisión',
} as const;

// Tipos de documentos
export const DOCUMENTO_TIPOS = {
  PLANCHA: 'plancha',
  ACTA: 'acta',
  CIRCULAR: 'circular',
  REGLAMENTO: 'reglamento',
  CARTA: 'carta',
  INFORME: 'informe',
  OTRO: 'otro',
} as const;

export const DOCUMENTO_TIPOS_DISPLAY = {
  [DOCUMENTO_TIPOS.PLANCHA]: 'Plancha',
  [DOCUMENTO_TIPOS.ACTA]: 'Acta',
  [DOCUMENTO_TIPOS.CIRCULAR]: 'Circular',
  [DOCUMENTO_TIPOS.REGLAMENTO]: 'Reglamento',
  [DOCUMENTO_TIPOS.CARTA]: 'Carta',
  [DOCUMENTO_TIPOS.INFORME]: 'Informe',
  [DOCUMENTO_TIPOS.OTRO]: 'Otro',
} as const;

// Estados de programas
export const PROGRAMA_ESTADOS = {
  PROGRAMADO: 'programado',
  EN_CURSO: 'en_curso',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado',
  SUSPENDIDO: 'suspendido',
} as const;

export const PROGRAMA_ESTADOS_DISPLAY = {
  [PROGRAMA_ESTADOS.PROGRAMADO]: 'Programado',
  [PROGRAMA_ESTADOS.EN_CURSO]: 'En Curso',
  [PROGRAMA_ESTADOS.FINALIZADO]: 'Finalizado',
  [PROGRAMA_ESTADOS.CANCELADO]: 'Cancelado',
  [PROGRAMA_ESTADOS.SUSPENDIDO]: 'Suspendido',
} as const;

// Tipos de programas
export const PROGRAMA_TIPOS = {
  TENIDA_ORDINARIA: 'tenida_ordinaria',
  TENIDA_EXTRAORDINARIA: 'tenida_extraordinaria',
  GRADO: 'grado',
  REUNION_ADMINISTRATIVA: 'reunion_administrativa',
  EVENTO_SOCIAL: 'evento_social',
  CONFERENCIA: 'conferencia',
  INSTALACION: 'instalacion',
} as const;

export const PROGRAMA_TIPOS_DISPLAY = {
  [PROGRAMA_TIPOS.TENIDA_ORDINARIA]: 'Tenida Ordinaria',
  [PROGRAMA_TIPOS.TENIDA_EXTRAORDINARIA]: 'Tenida Extraordinaria',
  [PROGRAMA_TIPOS.GRADO]: 'Ceremonia de Grado',
  [PROGRAMA_TIPOS.REUNION_ADMINISTRATIVA]: 'Reunión Administrativa',
  [PROGRAMA_TIPOS.EVENTO_SOCIAL]: 'Evento Social',
  [PROGRAMA_TIPOS.CONFERENCIA]: 'Conferencia',
  [PROGRAMA_TIPOS.INSTALACION]: 'Instalación',
} as const;

// Estados de asistencia
export const ASISTENCIA_ESTADOS = {
  CONFIRMADA: 'confirmada',
  PENDIENTE: 'pendiente',
  AUSENTE: 'ausente',
  JUSTIFICADA: 'justificada',
} as const;

export const ASISTENCIA_ESTADOS_DISPLAY = {
  [ASISTENCIA_ESTADOS.CONFIRMADA]: 'Confirmada',
  [ASISTENCIA_ESTADOS.PENDIENTE]: 'Pendiente',
  [ASISTENCIA_ESTADOS.AUSENTE]: 'Ausente',
  [ASISTENCIA_ESTADOS.JUSTIFICADA]: 'Justificada',
} as const;

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50],
  MAX_PAGES_SHOWN: 5,
} as const;

// Validaciones
export const VALIDATIONS = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  RUT_REGEX: /^(\d{1,2}\.)?\d{3}\.\d{3}-[\dkK]$/,
  EMAIL_REGEX: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE_REGEX: /^(\+56)?[\s-]?[2-9]\d{8}$/,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'orpheo_token',
  REFRESH_TOKEN: 'orpheo_refresh_token',
  USER: 'orpheo_user',
  PREFERENCES: 'orpheo_preferences',
  THEME: 'orpheo_theme',
} as const;

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    DOCUMENTS: ['pdf', 'doc', 'docx', 'txt'],
    IMAGES: ['jpg', 'jpeg', 'png'],
  },
} as const;

// Dimensiones de pantalla comunes
export const SCREEN_BREAKPOINTS = {
  SMALL: 320,
  MEDIUM: 768,
  LARGE: 1024,
} as const;

// Iconos para tipos de programas
export const PROGRAMA_TIPOS_ICONS = {
  [PROGRAMA_TIPOS.TENIDA_ORDINARIA]: '🏛️',
  [PROGRAMA_TIPOS.TENIDA_EXTRAORDINARIA]: '⭐',
  [PROGRAMA_TIPOS.GRADO]: '🎓',
  [PROGRAMA_TIPOS.REUNION_ADMINISTRATIVA]: '📋',
  [PROGRAMA_TIPOS.EVENTO_SOCIAL]: '🎉',
  [PROGRAMA_TIPOS.CONFERENCIA]: '🎤',
  [PROGRAMA_TIPOS.INSTALACION]: '👑',
} as const;

// Iconos para tipos de documentos
export const DOCUMENTO_TIPOS_ICONS = {
  [DOCUMENTO_TIPOS.PLANCHA]: '📄',
  [DOCUMENTO_TIPOS.ACTA]: '📋',
  [DOCUMENTO_TIPOS.CIRCULAR]: '📢',
  [DOCUMENTO_TIPOS.REGLAMENTO]: '📜',
  [DOCUMENTO_TIPOS.CARTA]: '✉️',
  [DOCUMENTO_TIPOS.INFORME]: '📊',
  [DOCUMENTO_TIPOS.OTRO]: '📁',
} as const;