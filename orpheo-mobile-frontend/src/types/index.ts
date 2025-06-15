// Exportar todos los tipos
export * from './auth';
export * from './miembros';
export * from './documentos';
export * from './programas';
export * from './navigation';

// Tipos comunes de API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Tipos de UI
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Filters {
  search?: string;
  [key: string]: any;
}

// Estados de carga comunes
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Tipos de notificaciones
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Tipos de validación
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [fieldName: string]: string;
}

// Tipos de tema
export interface Theme {
  colors: {
    primary: string;
    primarySecondary: string;
    gold: string;
    goldSecondary: string;
    goldLight: string;
    grayBorder: string;
    grayText: string;
    white: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    background: string;
    surface: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    h1: object;
    h2: object;
    h3: object;
    h4: object;
    body: object;
    bodySmall: object;
    caption: object;
  };
}