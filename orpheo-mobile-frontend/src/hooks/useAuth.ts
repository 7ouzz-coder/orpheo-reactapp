import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  login, 
  logout, 
  refreshToken, 
  updateProfile, 
  changePassword,
  clearAuthError,
  resetLoginAttempts 
} from '@/store/slices/authSlice';
import { LoginCredentials, User, ChangePasswordRequest } from '@/types/auth';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(state => state.auth);

  // LOGIN
  const loginUser = useCallback(async (credentials: LoginCredentials) => {
    try {
      const result = await dispatch(login(credentials));
      
      if (login.fulfilled.match(result)) {
        return { success: true, user: result.payload.user };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Error en el login' 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Error inesperado en el login' 
      };
    }
  }, [dispatch]);

  // LOGOUT
  const logoutUser = useCallback(async () => {
    try {
      await dispatch(logout());
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Error al cerrar sesión' 
      };
    }
  }, [dispatch]);

  // REFRESH TOKEN
  const refreshUserToken = useCallback(async () => {
    try {
      const result = await dispatch(refreshToken());
      
      if (refreshToken.fulfilled.match(result)) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Error al renovar sesión' 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Error inesperado al renovar sesión' 
      };
    }
  }, [dispatch]);

  // UPDATE PROFILE
  const updateUserProfile = useCallback(async (userData: Partial<User>) => {
    try {
      const result = await dispatch(updateProfile(userData));
      
      if (updateProfile.fulfilled.match(result)) {
        return { success: true, user: result.payload };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Error al actualizar perfil' 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Error inesperado al actualizar perfil' 
      };
    }
  }, [dispatch]);

  // CHANGE PASSWORD
  const changeUserPassword = useCallback(async (passwordData: ChangePasswordRequest) => {
    try {
      const result = await dispatch(changePassword(passwordData));
      
      if (changePassword.fulfilled.match(result)) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Error al cambiar contraseña' 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Error inesperado al cambiar contraseña' 
      };
    }
  }, [dispatch]);

  // CLEAR ERROR
  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // RESET LOGIN ATTEMPTS
  const resetAttempts = useCallback(() => {
    dispatch(resetLoginAttempts());
  }, [dispatch]);

  // HELPERS
  const hasPermission = useCallback((permission: string): boolean => {
    if (!authState.user) return false;
    
    // Superadmin tiene todos los permisos
    if (authState.user.role === 'superadmin') return true;
    
    // Mapeo de permisos básicos por rol
    const permissions = {
      general: ['read_programs', 'read_documents', 'update_own_profile'],
      admin: [
        'read_programs', 'read_documents', 'update_own_profile',
        'create_programs', 'update_programs', 'delete_programs',
        'create_documents', 'update_documents', 'approve_documents',
        'read_members', 'create_members', 'update_members'
      ],
      superadmin: ['*'] // Todos los permisos
    };
    
    const userPermissions = permissions[authState.user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }, [authState.user]);

  const canAccessMiembros = useCallback((): boolean => {
    return hasPermission('read_members');
  }, [hasPermission]);

  const canCreateMiembro = useCallback((): boolean => {
    return hasPermission('create_members');
  }, [hasPermission]);

  const canEditMiembro = useCallback((): boolean => {
    return hasPermission('update_members');
  }, [hasPermission]);

  const canDeleteMiembro = useCallback((): boolean => {
    return hasPermission('delete_members');
  }, [hasPermission]);

  const canCreatePrograma = useCallback((): boolean => {
    return hasPermission('create_programs');
  }, [hasPermission]);

  const canEditPrograma = useCallback((): boolean => {
    return hasPermission('update_programs');
  }, [hasPermission]);

  const canDeletePrograma = useCallback((): boolean => {
    return hasPermission('delete_programs');
  }, [hasPermission]);

  const canApproveDocuments = useCallback((): boolean => {
    return hasPermission('approve_documents');
  }, [hasPermission]);

  const canCreateDocuments = useCallback((): boolean => {
    return hasPermission('create_documents');
  }, [hasPermission]);

  const isAdmin = useCallback((): boolean => {
    return authState.user?.role === 'admin' || authState.user?.role === 'superadmin';
  }, [authState.user]);

  const isSuperAdmin = useCallback((): boolean => {
    return authState.user?.role === 'superadmin';
  }, [authState.user]);

  // Información de usuario formateada
  const userDisplayName = useCallback((): string => {
    if (!authState.user) return '';
    
    if (authState.user.memberFullName) {
      return authState.user.memberFullName;
    }
    
    if (authState.user.nombres && authState.user.apellidos) {
      return `${authState.user.nombres} ${authState.user.apellidos}`;
    }
    
    return authState.user.username;
  }, [authState.user]);

  const userInitials = useCallback((): string => {
    const displayName = userDisplayName();
    if (!displayName) return 'U';
    
    return displayName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }, [userDisplayName]);

  // Estado de sesión
  const shouldRefreshToken = useCallback((): boolean => {
    if (!authState.token || !authState.user) return false;
    
    // Aquí podrías implementar lógica para verificar si el token está cerca de expirar
    // Por ejemplo, decodificar el JWT y verificar el timestamp
    
    return false; // Por ahora, no implementamos auto-refresh
  }, [authState.token, authState.user]);

  // Auto-refresh token si es necesario
  useEffect(() => {
    if (authState.isAuthenticated && shouldRefreshToken()) {
      refreshUserToken();
    }
  }, [authState.isAuthenticated, shouldRefreshToken, refreshUserToken]);

  // Auto-clear error después de un tiempo
  useEffect(() => {
    if (authState.error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000); // Limpiar error después de 5 segundos

      return () => clearTimeout(timer);
    }
  }, [authState.error, clearError]);

  return {
    // Estado
    ...authState,
    
    // Acciones
    login: loginUser,
    logout: logoutUser,
    refreshToken: refreshUserToken,
    updateProfile: updateUserProfile,
    changePassword: changeUserPassword,
    clearError,
    resetLoginAttempts: resetAttempts,
    
    // Helpers de permisos
    hasPermission,
    canAccessMiembros,
    canCreateMiembro,
    canEditMiembro,
    canDeleteMiembro,
    canCreatePrograma,
    canEditPrograma,
    canDeletePrograma,
    canApproveDocuments,
    canCreateDocuments,
    isAdmin,
    isSuperAdmin,
    
    // Helpers de usuario
    userDisplayName: userDisplayName(),
    userInitials: userInitials(),
    
    // Estados computados
    isLoggedIn: authState.isAuthenticated && !!authState.user,
    isLoggingIn: authState.isLoading,
    hasError: !!authState.error,
    canRetryLogin: authState.loginAttempts < 5,
  };
};