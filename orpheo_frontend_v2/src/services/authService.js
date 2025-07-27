import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';

// Endpoints definidos directamente (sin imports externos)
const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/change-password',
};

// Claves para AsyncStorage
const TOKEN_KEY = 'orpheo-jwt-secret-super-seguro-cambiar-en-produccion-2025';
const REFRESH_TOKEN_KEY = 'orpheo-refresh-token-secret-super-seguro-2025';
const USER_KEY = 'orpheo_user_data';

class AuthService {
  
  /**
   * Login con email y contraseña
   */
  async login(email, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
        email: email.toLowerCase().trim(),
        password,
      });

      console.log('🔍 Backend response:', response.data); // Para debugging

      // Manejo flexible de diferentes estructuras de respuesta del backend
      let userData, accessToken, refreshToken;

      if (response.data.success) {
        // Estructura esperada: { success: true, data: { user, token, refreshToken } }
        const data = response.data.data || response.data;
        userData = data.user;
        accessToken = data.token || data.accessToken || data.access_token;
        refreshToken = data.refreshToken || data.refresh_token;
      } else if (response.data.token || response.data.accessToken) {
        // Estructura alternativa: respuesta directa con token
        userData = response.data.user || response.data;
        accessToken = response.data.token || response.data.accessToken || response.data.access_token;
        refreshToken = response.data.refreshToken || response.data.refresh_token;
      } else {
        // Si no hay estructura reconocida, mostrar la respuesta completa
        console.error('❌ Estructura de respuesta no reconocida:', response.data);
        throw new Error('Estructura de respuesta del servidor no válida');
      }

      // Validar que tenemos los datos mínimos necesarios
      if (!accessToken) {
        console.error('❌ No se encontró token en la respuesta:', response.data);
        throw new Error('El servidor no devolvió un token de acceso válido');
      }

      if (!userData) {
        console.error('❌ No se encontraron datos del usuario:', response.data);
        throw new Error('El servidor no devolvió datos del usuario');
      }

      // Asegurar que el token no sea undefined antes de guardar
      const tokenToSave = accessToken || '';
      const refreshTokenToSave = refreshToken || '';

      console.log('✅ Datos extraídos:', {
        user: userData,
        token: tokenToSave ? 'presente' : 'ausente',
        refreshToken: refreshTokenToSave ? 'presente' : 'ausente'
      });
      
      // Guardar datos en AsyncStorage
      await this.saveAuthData(userData, tokenToSave, refreshTokenToSave);
      
      return {
        success: true,
        data: { 
          user: userData, 
          token: tokenToSave, 
          refreshToken: refreshTokenToSave 
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error de conexión';
      
      if (error.message && error.message.includes('estructura') || error.message.includes('token')) {
        // Error de estructura de datos
        errorMessage = error.message;
      } else if (error.response) {
        // Error del servidor
        const status = error.response.status;
        const serverMessage = error.response.data?.message;
        
        switch (status) {
          case 401:
            errorMessage = 'Email o contraseña incorrectos';
            break;
          case 403:
            errorMessage = 'Cuenta bloqueada o sin permisos';
            break;
          case 429:
            errorMessage = 'Demasiados intentos. Intenta más tarde';
            break;
          case 500:
            errorMessage = 'Error del servidor. Intenta más tarde';
            break;
          default:
            errorMessage = serverMessage || 'Error desconocido';
        }
      } else if (error.request) {
        // Error de red
        errorMessage = 'Sin conexión a internet';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Logout - limpiar datos locales y notificar al servidor
   */
  async logout() {
    try {
      const token = await this.getAccessToken();
      
      if (token) {
        // Notificar al servidor (opcional)
        try {
          await apiClient.post(API_ENDPOINTS.LOGOUT);
        } catch (error) {
          console.warn('Error notifying server about logout:', error);
        }
      }
      
      // Limpiar datos locales
      await this.clearAuthData();
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Aún así limpiar datos locales
      await this.clearAuthData();
      return { success: true };
    }
  }

  /**
   * Verificar si hay una sesión válida al iniciar la app
   */
  async checkAuthStatus() {
    try {
      const [user, token, refreshToken] = await Promise.all([
        this.getStoredUser(),
        this.getAccessToken(),
        this.getRefreshToken(),
      ]);

      if (!user || !token) {
        return { success: false, error: 'No hay sesión guardada' };
      }

      // Verificar si el token es válido
      try {
        const response = await apiClient.get(API_ENDPOINTS.PROFILE);
        
        if (response.data.success) {
          // Token válido, actualizar datos del usuario si han cambiado
          const updatedUser = response.data.data;
          await this.saveUserData(updatedUser);
          
          return {
            success: true,
            data: { user: updatedUser, token, refreshToken },
          };
        }
      } catch (error) {
        // Token expirado, intentar refresh
        if (error.response?.status === 401 && refreshToken) {
          const refreshResult = await this.refreshAccessToken();
          
          if (refreshResult.success) {
            return {
              success: true,
              data: {
                user,
                token: refreshResult.data.accessToken,
                refreshToken: refreshResult.data.refreshToken || refreshToken,
              },
            };
          }
        }
        
        // Si llegamos aquí, la sesión no es válida
        await this.clearAuthData();
        return { success: false, error: 'Sesión expirada' };
      }
    } catch (error) {
      console.error('Check auth status error:', error);
      await this.clearAuthData();
      return { success: false, error: 'Error verificando sesión' };
    }
  }

  /**
   * Refrescar token de acceso
   */
  async refreshAccessToken() {
    try {
      const refreshToken = await this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No hay refresh token');
      }

      const response = await apiClient.post(API_ENDPOINTS.REFRESH, {
        refreshToken,
      });

      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Guardar nuevos tokens
        await AsyncStorage.setItem(TOKEN_KEY, accessToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }
        
        return {
          success: true,
          data: {
            accessToken,
            refreshToken: newRefreshToken || refreshToken,
          },
        };
      } else {
        throw new Error(response.data.message || 'Error refrescando token');
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      
      // Si el refresh falla, limpiar datos
      await this.clearAuthData();
      
      return {
        success: false,
        error: 'Sesión expirada. Inicia sesión nuevamente',
      };
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Error cambiando contraseña');
      }
    } catch (error) {
      console.error('Change password error:', error);
      
      let errorMessage = 'Error cambiando contraseña';
      
      if (error.response?.status === 400) {
        errorMessage = 'Contraseña actual incorrecta';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Obtener perfil del usuario actual
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROFILE);
      
      if (response.data.success) {
        const user = response.data.data;
        await this.saveUserData(user);
        return { success: true, data: user };
      } else {
        throw new Error(response.data.message || 'Error obteniendo perfil');
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error: 'Error obteniendo datos del usuario' };
    }
  }

  // ==========================================
  // MÉTODOS DE ALMACENAMIENTO LOCAL
  // ==========================================

  /**
   * Guardar datos de autenticación
   */
  async saveAuthData(user, accessToken, refreshToken) {
    try {
      // Validar que no estamos guardando undefined
      if (!user) {
        throw new Error('Usuario es requerido para guardar');
      }
      if (!accessToken) {
        throw new Error('Token de acceso es requerido para guardar');
      }

      const savePromises = [
        AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
        AsyncStorage.setItem(TOKEN_KEY, accessToken),
      ];

      // Solo guardar refresh token si existe
      if (refreshToken && refreshToken !== '') {
        savePromises.push(AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken));
      }

      await Promise.all(savePromises);
      
      console.log('✅ Datos de autenticación guardados correctamente');
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw new Error('Error guardando datos de sesión');
    }
  }

  /**
   * Guardar solo datos del usuario
   */
  async saveUserData(user) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  /**
   * Obtener token de acceso
   */
  async getAccessToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Obtener refresh token
   */
  async getRefreshToken() {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Obtener datos del usuario guardados
   */
  async getStoredUser() {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  /**
   * Limpiar todos los datos de autenticación
   */
  async clearAuthData() {
    try {
      await Promise.all([
        AsyncStorage.removeItem(USER_KEY),
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  /**
   * Verificar si el usuario está autenticado (verificación rápida local)
   */
  async isAuthenticated() {
    try {
      const [user, token] = await Promise.all([
        this.getStoredUser(),
        this.getAccessToken(),
      ]);
      
      return !!(user && token);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Obtener permisos del usuario basados en su rol y grado
   */
  getUserPermissions(user) {
    if (!user) return [];
    
    const permissions = ['read'];
    
    // Permisos por rol
    if (user.rol === 'admin' || user.rol === 'superadmin') {
      permissions.push('write', 'delete', 'admin');
    } else if (user.rol === 'general') {
      permissions.push('write');
    }
    
    // Permisos por grado masónico
    if (user.grado === 'maestro') {
      permissions.push('maestro_access', 'companero_access', 'aprendiz_access');
    } else if (user.grado === 'companero') {
      permissions.push('companero_access', 'aprendiz_access');
    } else if (user.grado === 'aprendiz') {
      permissions.push('aprendiz_access');
    }
    
    return [...new Set(permissions)]; // Eliminar duplicados
  }
}

// Exportar instancia singleton
const authService = new AuthService();
export default authService;