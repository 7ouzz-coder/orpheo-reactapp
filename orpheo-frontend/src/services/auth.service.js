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
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Error en el login');
      }
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'auth_service_login',
        username: username.trim(),
      });
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 401) {
        throw new Error('Credenciales incorrectas');
      } else if (error.response?.status === 403) {
        throw new Error('Cuenta desactivada o sin permisos');
      } else if (error.response?.status >= 500) {
        throw new Error('Error del servidor. Intente más tarde');
      } else if (!navigator.onLine) {
        throw new Error('Sin conexión a internet');
      } else {
        throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
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
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    }
    
    return { success: true };
  },

  // Registro de nuevos usuarios
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'auth_service_register',
        userData: { ...userData, password: '[HIDDEN]' },
      });
      throw error;
    }
  },

  // Verificar token válido
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      // Token inválido, limpiar storage
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      throw error;
    }
  },

  // Refresh token automático
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh');
      if (response.data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      }
      return response.data;
    } catch (error) {
      // Refresh falló, limpiar storage
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
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
      return response.data;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'auth_service_change_password',
      });
      throw error;
    }
  },

  // Solicitar reset de contraseña
  async requestPasswordReset(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'auth_service_forgot_password',
        email,
      });
      throw error;
    }
  },
};