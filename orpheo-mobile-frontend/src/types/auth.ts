// Tipos para autenticación
export interface User {
  id: string;
  username: string;
  email?: string;
  memberFullName?: string;
  nombres?: string;
  apellidos?: string;
  rut?: string;
  grado: 'aprendiz' | 'companero' | 'maestro';
  cargo?: string;
  role: 'general' | 'admin' | 'superadmin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  refreshToken?: string;
  message?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken?: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginAttempts: number;
  lastLoginAttempt: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface TokenResponse {
  token: string;
  refreshToken?: string;
  user?: User;
}