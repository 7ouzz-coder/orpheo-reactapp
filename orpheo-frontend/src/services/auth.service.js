import api from './api';
import { STORAGE_KEYS } from '../utils/constants';
import { ErrorReporting } from '../utils/errorReporting';

export const authService = {
  // Login con API real
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { 
        username: username.trim(), 
        password 
      });
      
      if (response.success) {
        // Guardar token y user en localStorage
        if (response.token) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        }
        if (response.refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        }
        if (response.user) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
        }
        
        return response;
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'auth_service_login',
        username: username.trim(),
      });
      
      // Manejar diferentes tipos de errores del backend
      if (error.response?.status === 401) {
        throw new Error('Credenciales incorrectas');
      } else if (error.response?.status === 403) {
        throw new Error('Cuenta desactivada o sin permisos');
      } else if (error.response?.status === 423) {
        throw new Error('Cuenta temporalmente bloqueada por múltiples intentos fallidos');
      } else if (error.response?.status >= 500) {
        throw new Error('Error del servidor. Intente más tarde');
      } else if (!navigator.onLine) {
        throw new Error('Sin conexión a internet');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Error al iniciar sesión');
      }
    }
  },

  // Logout con limpieza completa
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Log del error pero no bloquear el logout
      ErrorReporting.captureException(error, {
        context: 'auth_service_logout',
      });
    } finally {
      // Limpiar storage siempre
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    }
    
    return { success: true };
  },

  // Registro de nuevos usuarios
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'auth_service_register',
        userData: { ...userData, password: '[HIDDEN]' },
      });
      
      // Manejar errores específicos de registro
      if (error.response?.status === 409) {
        throw new Error('El usuario ya existe');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Datos de entrada inválidos');
      }
      
      throw new Error(error.response?.data?.message || 'Error al registrar usuario');
    }
  },

  // Verificar token válido
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      
      if (response.success && response.user) {
        // Actualizar información del usuario en localStorage
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
        return response;
      } else {
        throw new Error('Token inválido');
      }
    } catch (error) {
      // Token inválido, limpiar storage
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      
      ErrorReporting.captureException(error, {
        context: 'auth_service_verify_token',
      });
      
      throw error;
    }
  },

  // Refresh token automático
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      
      if (response.success) {
        // Actualizar tokens
        if (response.token) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        }
        if (response.refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        }
        
        return response;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      // Refresh falló, limpiar storage
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      
      ErrorReporting.captureException(error, {
        context: 'auth_service_refresh_token',
      });
      
      throw error;
    }
  },

  // Cambiar contraseña
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'auth_service_change_password',
      });
      
      if (error.response?.status === 400) {
        throw new Error('Contraseña actual incorrecta');
      } else if (error.response?.status === 422) {
        throw new Error('La nueva contraseña no cumple los requisitos');
      }
      
      throw new Error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  },

  // Solicitar reset de contraseña
  async requestPasswordReset(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'auth_service_forgot_password',
        email,
      });
      
      if (error.response?.status === 404) {
        throw new Error('Email no encontrado en el sistema');
      }
      
      throw new Error(error.response?.data?.message || 'Error al solicitar reset de contraseña');
    }
  },

  // Método auxiliar para obtener el usuario actual del localStorage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'auth_service_get_current_user',
      });
      return null;
    }
  },

  // Método auxiliar para verificar si el usuario está autenticado
  isAuthenticated() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const user = this.getCurrentUser();
    return !!(token && user);
  },

  // Método auxiliar para obtener el token actual
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // Método auxiliar para verificar permisos del usuario
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Super admin tiene todos los permisos
    if (user.role === 'superadmin') return true;
    
    // Lógica de permisos según el grado y cargo del usuario
    // Esto debe coincidir con la lógica del backend
    return true; // Implementar lógica específica según necesidades
  },

  // Método auxiliar para verificar si puede ver contenido de un grado
  canViewGrado(targetGrado) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const gradoHierarchy = ['aprendiz', 'companero', 'maestro'];
    const userLevel = gradoHierarchy.indexOf(user.grado);
    const targetLevel = gradoHierarchy.indexOf(targetGrado);
    
    return userLevel >= targetLevel;
  }
};