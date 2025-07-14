import api, { handleApiError } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  // Login de usuario
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password
      });

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        
        // Guardar tokens en AsyncStorage
        await Promise.all([
          AsyncStorage.setItem('accessToken', accessToken),
          AsyncStorage.setItem('refreshToken', refreshToken),
          AsyncStorage.setItem('user', JSON.stringify(user))
        ]);

        return {
          success: true,
          data: {
            user,
            accessToken,
            refreshToken
          }
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error en el login'
      };

    } catch (error) {
      return handleApiError(error, 'Error al iniciar sesión');
    }
  }

  // Logout de usuario
  async logout() {
    try {
      // Intentar logout en el servidor
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Warning: Server logout failed:', error.message);
    } finally {
      // Limpiar storage local siempre
      await this.clearLocalData();
    }

    return { success: true };
  }

  // Refresh del access token
  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', {
        refreshToken
      });

      if (response.data.success) {
        const { accessToken } = response.data.data;
        
        // Guardar nuevo access token
        await AsyncStorage.setItem('accessToken', accessToken);

        return {
          success: true,
          data: { accessToken }
        };
      }

      throw new Error(response.data.message || 'Failed to refresh token');

    } catch (error) {
      // Si el refresh falla, limpiar todo
      await this.clearLocalData();
      return handleApiError(error, 'Error al renovar sesión');
    }
  }

  // Obtener información del usuario actual
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');

      if (response.data.success) {
        const user = response.data.data;
        
        // Actualizar usuario en storage
        await AsyncStorage.setItem('user', JSON.stringify(user));

        return {
          success: true,
          data: user
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error al obtener usuario'
      };

    } catch (error) {
      return handleApiError(error, 'Error al obtener información del usuario');
    }
  }

  // Cambiar contraseña
  async changePassword(passwordData) {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Contraseña cambiada exitosamente'
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error al cambiar contraseña'
      };

    } catch (error) {
      return handleApiError(error, 'Error al cambiar contraseña');
    }
  }

  // Verificar si el usuario está autenticado
  async isAuthenticated() {
    try {
      const [accessToken, user] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('user')
      ]);

      if (!accessToken || !user) {
        return false;
      }

      // Verificar si el token es válido haciendo una request al servidor
      const response = await api.get('/auth/me');
      return response.data.success;

    } catch (error) {
      console.log('Authentication check failed:', error.message);
      return false;
    }
  }

  // Obtener datos del usuario desde storage local
  async getStoredUser() {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  // Obtener access token desde storage local
  async getStoredAccessToken() {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('Error getting stored access token:', error);
      return null;
    }
  }

  // Obtener refresh token desde storage local
  async getStoredRefreshToken() {
    try {
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      console.error('Error getting stored refresh token:', error);
      return null;
    }
  }

  // Limpiar todos los datos locales
  async clearLocalData() {
    try {
      await Promise.all([
        AsyncStorage.removeItem('accessToken'),
        AsyncStorage.removeItem('refreshToken'),
        AsyncStorage.removeItem('user')
      ]);
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }

  // Validar formato de email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar contraseña
  validatePassword(password) {
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un símbolo
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return password.length >= 8 && passwordRegex.test(password);
  }

  // Validar credenciales de login
  validateLoginCredentials(credentials) {
    const errors = {};

    if (!credentials.email) {
      errors.email = 'El email es requerido';
    } else if (!this.validateEmail(credentials.email)) {
      errors.email = 'El formato del email es inválido';
    }

    if (!credentials.password) {
      errors.password = 'La contraseña es requerida';
    } else if (credentials.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validar datos de cambio de contraseña
  validatePasswordChange(passwordData) {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'La contraseña actual es requerida';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'La nueva contraseña es requerida';
    } else if (!this.validatePassword(passwordData.newPassword)) {
      errors.newPassword = 'La nueva contraseña debe tener al menos 8 caracteres, incluyendo mayúscula, minúscula, número y símbolo especial';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Confirma la nueva contraseña';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Obtener permisos del usuario basado en rol y grado
  getUserPermissions(user) {
    if (!user) return [];

    const permissions = [];

    // Permisos por rol
    switch (user.rol) {
      case 'superadmin':
        permissions.push(
          'manage_users',
          'manage_members',
          'manage_documents',
          'manage_programs',
          'approve_planchas',
          'upload_documents',
          'view_all_members',
          'view_all_documents',
          'system_admin',
          'delete_any'
        );
        break;
      case 'admin':
        permissions.push(
          'manage_members',
          'manage_documents',
          'manage_programs',
          'approve_planchas',
          'upload_documents',
          'view_all_members',
          'view_all_documents'
        );
        break;
      case 'general':
        permissions.push(
          'upload_documents',
          'view_members_same_grade',
          'view_documents_accessible'
        );
        break;
    }

    // Permisos adicionales por grado
    switch (user.grado) {
      case 'maestro':
        permissions.push(
          'approve_planchas',
          'view_all_documents',
          'manage_programs',
          'moderate_content'
        );
        break;
      case 'companero':
        permissions.push(
          'view_companero_content',
          'upload_documents'
        );
        break;
      case 'aprendiz':
        permissions.push(
          'view_aprendiz_content'
        );
        break;
    }

    // Remover duplicados
    return [...new Set(permissions)];
  }

  // Verificar si el usuario tiene un permiso específico
  hasPermission(user, permission) {
    if (!user) return false;
    
    // SuperAdmin tiene todos los permisos
    if (user.rol === 'superadmin') return true;
    
    const userPermissions = this.getUserPermissions(user);
    return userPermissions.includes(permission);
  }

  // Verificar si el usuario puede acceder a contenido de cierto grado
  canAccessGrade(user, targetGrade) {
    if (!user) return false;
    
    // SuperAdmin y Admin pueden acceder a todo
    if (['superadmin', 'admin'].includes(user.rol)) return true;
    
    const gradeHierarchy = { aprendiz: 1, companero: 2, maestro: 3 };
    const userLevel = gradeHierarchy[user.grado] || 0;
    const targetLevel = gradeHierarchy[targetGrade] || 0;
    
    // Puede acceder si su grado es igual o superior
    return userLevel >= targetLevel;
  }
}

export default new AuthService();