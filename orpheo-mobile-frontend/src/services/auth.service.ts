import { LoginCredentials, LoginResponse, User, ChangePasswordRequest, TokenResponse } from '@/types/auth';
import { apiPost, apiGet, apiPut, setAuthToken, clearAuthToken } from './api';

class AuthService {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiPost<LoginResponse>('/auth/login', credentials);
      
      if (response.success && response.token) {
        // Configurar token en headers de axios
        setAuthToken(response.token);
      }
      
      return response;
    } catch (error: any) {
      console.error('Login service error:', error);
      throw new Error(error.message || 'Error en el inicio de sesión');
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(token: string): Promise<void> {
    try {
      await apiPost('/auth/logout', { token });
    } catch (error) {
      console.error('Logout service error:', error);
      // No lanzamos error porque el logout local debe funcionar aunque falle el servidor
    } finally {
      // Siempre limpiar token local
      clearAuthToken();
    }
  }

  /**
   * Renovar token de acceso
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response = await apiPost<TokenResponse>('/auth/refresh', {
        refreshToken,
      });

      if (response.token) {
        setAuthToken(response.token);
      }

      return response;
    } catch (error: any) {
      console.error('Refresh token service error:', error);
      clearAuthToken();
      throw new Error(error.message || 'Error al renovar la sesión');
    }
  }

  /**
   * Verificar si un token es válido
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      setAuthToken(token);
      await apiGet('/auth/verify');
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      clearAuthToken();
      return false;
    }
  }

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(token: string): Promise<User> {
    try {
      setAuthToken(token);
      const user = await apiGet<User>('/auth/me');
      return user;
    } catch (error: any) {
      console.error('Get current user error:', error);
      throw new Error(error.message || 'Error al obtener información del usuario');
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(userData: Partial<User>, token: string): Promise<User> {
    try {
      setAuthToken(token);
      const updatedUser = await apiPut<User>('/auth/profile', userData);
      return updatedUser;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Error al actualizar el perfil');
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(data: ChangePasswordRequest, token: string): Promise<void> {
    try {
      setAuthToken(token);
      await apiPut('/auth/change-password', data);
    } catch (error: any) {
      console.error('Change password error:', error);
      throw new Error(error.message || 'Error al cambiar la contraseña');
    }
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiPost('/auth/forgot-password', { email });
    } catch (error: any) {
      console.error('Request password reset error:', error);
      throw new Error(error.message || 'Error al solicitar recuperación de contraseña');
    }
  }

  /**
   * Restablecer contraseña con token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiPost('/auth/reset-password', {
        token,
        password: newPassword,
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Error al restablecer la contraseña');
    }
  }

  /**
   * Validar token de recuperación
   */
  async validateResetToken(token: string): Promise<boolean> {
    try {
      await apiGet(`/auth/validate-reset-token/${token}`);
      return true;
    } catch (error) {
      console.error('Validate reset token error:', error);
      return false;
    }
  }

  /**
   * Obtener configuración de seguridad del usuario
   */
  async getSecuritySettings(token: string): Promise<any> {
    try {
      setAuthToken(token);
      const settings = await apiGet('/auth/security-settings');
      return settings;
    } catch (error: any) {
      console.error('Get security settings error:', error);
      throw new Error(error.message || 'Error al obtener configuración de seguridad');
    }
  }

  /**
   * Actualizar configuración de seguridad
   */
  async updateSecuritySettings(settings: any, token: string): Promise<void> {
    try {
      setAuthToken(token);
      await apiPut('/auth/security-settings', settings);
    } catch (error: any) {
      console.error('Update security settings error:', error);
      throw new Error(error.message || 'Error al actualizar configuración de seguridad');
    }
  }

  /**
   * Habilitar autenticación de dos factores
   */
  async enableTwoFactor(token: string): Promise<{ qrCode: string; secret: string }> {
    try {
      setAuthToken(token);
      const response = await apiPost('/auth/enable-2fa');
      return response;
    } catch (error: any) {
      console.error('Enable 2FA error:', error);
      throw new Error(error.message || 'Error al habilitar autenticación de dos factores');
    }
  }

  /**
   * Confirmar autenticación de dos factores
   */
  async confirmTwoFactor(code: string, token: string): Promise<void> {
    try {
      setAuthToken(token);
      await apiPost('/auth/confirm-2fa', { code });
    } catch (error: any) {
      console.error('Confirm 2FA error:', error);
      throw new Error(error.message || 'Error al confirmar autenticación de dos factores');
    }
  }

  /**
   * Deshabilitar autenticación de dos factores
   */
  async disableTwoFactor(code: string, token: string): Promise<void> {
    try {
      setAuthToken(token);
      await apiPost('/auth/disable-2fa', { code });
    } catch (error: any) {
      console.error('Disable 2FA error:', error);
      throw new Error(error.message || 'Error al deshabilitar autenticación de dos factores');
    }
  }

  /**
   * Obtener sesiones activas
   */
  async getActiveSessions(token: string): Promise<any[]> {
    try {
      setAuthToken(token);
      const sessions = await apiGet('/auth/sessions');
      return sessions;
    } catch (error: any) {
      console.error('Get active sessions error:', error);
      throw new Error(error.message || 'Error al obtener sesiones activas');
    }
  }

  /**
   * Revocar sesión específica
   */
  async revokeSession(sessionId: string, token: string): Promise<void> {
    try {
      setAuthToken(token);
      await apiPost(`/auth/revoke-session/${sessionId}`);
    } catch (error: any) {
      console.error('Revoke session error:', error);
      throw new Error(error.message || 'Error al revocar sesión');
    }
  }

  /**
   * Revocar todas las sesiones excepto la actual
   */
  async revokeAllSessions(token: string): Promise<void> {
    try {
      setAuthToken(token);
      await apiPost('/auth/revoke-all-sessions');
    } catch (error: any) {
      console.error('Revoke all sessions error:', error);
      throw new Error(error.message || 'Error al revocar todas las sesiones');
    }
  }

  /**
   * Obtener log de actividad de seguridad
   */
  async getSecurityLog(token: string, limit: number = 50): Promise<any[]> {
    try {
      setAuthToken(token);
      const log = await apiGet(`/auth/security-log?limit=${limit}`);
      return log;
    } catch (error: any) {
      console.error('Get security log error:', error);
      throw new Error(error.message || 'Error al obtener log de seguridad');
    }
  }

  /**
   * Verificar permisos del usuario
   */
  async checkPermissions(permissions: string[], token: string): Promise<Record<string, boolean>> {
    try {
      setAuthToken(token);
      const result = await apiPost('/auth/check-permissions', { permissions });
      return result;
    } catch (error: any) {
      console.error('Check permissions error:', error);
      throw new Error(error.message || 'Error al verificar permisos');
    }
  }

  /**
   * Actualizar último acceso
   */
  async updateLastAccess(token: string): Promise<void> {
    try {
      setAuthToken(token);
      await apiPost('/auth/update-last-access');
    } catch (error: any) {
      console.error('Update last access error:', error);
      // No lanzamos error porque esto es opcional
    }
  }

  /**
   * Verificar estado de la cuenta
   */
  async checkAccountStatus(token: string): Promise<{
    isActive: boolean;
    isBlocked: boolean;
    expirationDate?: string;
    warnings?: string[];
  }> {
    try {
      setAuthToken(token);
      const status = await apiGet('/auth/account-status');
      return status;
    } catch (error: any) {
      console.error('Check account status error:', error);
      throw new Error(error.message || 'Error al verificar estado de la cuenta');
    }
  }

  /**
   * Solicitar verificación de email
   */
  async requestEmailVerification(token: string): Promise<void> {
    try {
      setAuthToken(token);
      await apiPost('/auth/request-email-verification');
    } catch (error: any) {
      console.error('Request email verification error:', error);
      throw new Error(error.message || 'Error al solicitar verificación de email');
    }
  }

  /**
   * Verificar email con token
   */
  async verifyEmail(verificationToken: string): Promise<void> {
    try {
      await apiPost('/auth/verify-email', { token: verificationToken });
    } catch (error: any) {
      console.error('Verify email error:', error);
      throw new Error(error.message || 'Error al verificar email');
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService();
export default authService;