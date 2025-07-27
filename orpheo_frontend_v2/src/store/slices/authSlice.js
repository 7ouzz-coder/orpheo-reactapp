import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Estado inicial
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
  loginAttempts: 0,
  lastLoginAttempt: null,
  permissions: [],
  sessionExpiry: null,
};

// ==========================================
// THUNKS ASÍNCRONOS
// ==========================================

/**
 * Login con credenciales reales
 */
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue, getState }) => {
    try {
      // Verificar límite de intentos
      const { auth } = getState();
      const maxAttempts = 5;
      const timeWindow = 15 * 60 * 1000; // 15 minutos
      
      if (
        auth.loginAttempts >= maxAttempts && 
        auth.lastLoginAttempt &&
        Date.now() - new Date(auth.lastLoginAttempt).getTime() < timeWindow
      ) {
        throw new Error('Demasiados intentos fallidos. Intenta más tarde.');
      }

      // Intentar login con el servicio
      const result = await authService.login(email, password);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Error en el login');
      }
    } catch (error) {
      console.error('Login thunk error:', error);
      return rejectWithValue(error.message || 'Error en el login');
    }
  }
);

/**
 * Logout
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.logout();
      return result;
    } catch (error) {
      console.error('Logout thunk error:', error);
      // Aún así limpiar estado local
      return { success: true };
    }
  }
);

/**
 * Verificar estado de autenticación al iniciar la app
 */
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.checkAuthStatus();
      
      if (result.success) {
        return result.data;
      } else {
        // No hay sesión válida, no es necesariamente un error
        return rejectWithValue(result.error || 'No hay sesión activa');
      }
    } catch (error) {
      console.error('Check auth status thunk error:', error);
      return rejectWithValue(error.message || 'Error verificando autenticación');
    }
  }
);

/**
 * Refrescar token de acceso
 */
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.refreshAccessToken();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Error refrescando token');
      }
    } catch (error) {
      console.error('Refresh token thunk error:', error);
      return rejectWithValue(error.message || 'Error refrescando sesión');
    }
  }
);

/**
 * Obtener perfil del usuario actual
 */
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.getCurrentUser();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Error obteniendo perfil');
      }
    } catch (error) {
      console.error('Get current user thunk error:', error);
      return rejectWithValue(error.message || 'Error obteniendo datos del usuario');
    }
  }
);

/**
 * Cambiar contraseña
 */
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || 'Error cambiando contraseña');
      }
    } catch (error) {
      console.error('Change password thunk error:', error);
      return rejectWithValue(error.message || 'Error cambiando contraseña');
    }
  }
);

// Helper para calcular permisos
const getUserPermissions = (user) => {
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
};

// ==========================================
// SLICE
// ==========================================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Limpiar errores
    clearError: (state) => {
      state.error = null;
    },
    
    // Actualizar usuario
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        state.permissions = getUserPermissions(state.user);
      }
    },
    
    // Incrementar intentos de login
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
      state.lastLoginAttempt = new Date().toISOString();
    },
    
    // Reset intentos de login
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
    
    // Limpiar datos de autenticación
    clearAuthData: (state) => {
      return { ...initialState };
    },
    
    // Actualizar token de acceso (para refresh automático)
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    
    // Marcar como refrescando
    setRefreshing: (state, action) => {
      state.isRefreshing = action.payload;
    },
    
    // Actualizar permisos
    updatePermissions: (state) => {
      if (state.user) {
        state.permissions = getUserPermissions(state.user);
      }
    },
  },
  extraReducers: (builder) => {
    // ==========================================
    // LOGIN CASES
    // ==========================================
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
        state.error = null;
        
        // Calcular permisos y expiración
        state.permissions = getUserPermissions(action.payload.user);
        
        // Calcular tiempo de expiración (por defecto 1 hora)
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + 1);
        state.sessionExpiry = expiryTime.toISOString();
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.loginAttempts += 1;
        state.lastLoginAttempt = new Date().toISOString();
      });

    // ==========================================
    // LOGOUT CASES
    // ==========================================
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        return { ...initialState };
      })
      .addCase(logout.rejected, (state) => {
        // Aún así limpiar estado local
        return { ...initialState };
      });

    // ==========================================
    // CHECK AUTH STATUS CASES
    // ==========================================
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.permissions = getUserPermissions(action.payload.user);
        state.error = null;
        
        // Actualizar tiempo de expiración
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + 1);
        state.sessionExpiry = expiryTime.toISOString();
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.permissions = [];
        // No mostrar error para verificación de auth fallida
        state.error = null;
      });

    // ==========================================
    // REFRESH TOKEN CASES
    // ==========================================
    builder
      .addCase(refreshAccessToken.pending, (state) => {
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.accessToken = action.payload.accessToken;
        
        // Actualizar refresh token si viene uno nuevo
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
        
        // Actualizar expiración
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + 1);
        state.sessionExpiry = expiryTime.toISOString();
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isRefreshing = false;
        state.error = action.payload;
        
        // Si falla el refresh, hacer logout
        return { ...initialState };
      });

    // ==========================================
    // GET CURRENT USER CASES
    // ==========================================
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.permissions = getUserPermissions(action.payload);
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // CHANGE PASSWORD CASES
    // ==========================================
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        // Nota: después de cambiar contraseña, el backend puede invalidar los tokens
        // El usuario tendrá que hacer login nuevamente
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// ==========================================
// ACTIONS
// ==========================================
export const { 
  clearError, 
  updateUser, 
  incrementLoginAttempts, 
  resetLoginAttempts,
  clearAuthData,
  setAccessToken,
  setRefreshing,
  updatePermissions
} = authSlice.actions;

// ==========================================
// SELECTORES
// ==========================================
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectIsRefreshing = (state) => state.auth.isRefreshing;
export const selectError = (state) => state.auth.error;
export const selectPermissions = (state) => state.auth.permissions;
export const selectUserRole = (state) => state.auth.user?.rol;
export const selectUserGrade = (state) => state.auth.user?.grado;
export const selectLoginAttempts = (state) => state.auth.loginAttempts;
export const selectSessionExpiry = (state) => state.auth.sessionExpiry;

export const selectUserDisplayName = (state) => {
  const user = state.auth.user;
  if (!user) return '';
  
  if (user.nombres && user.apellidos) {
    return `${user.nombres} ${user.apellidos}`;
  } else if (user.nombre) {
    return user.nombre;
  } else if (user.email) {
    return user.email;
  }
  
  return 'Usuario';
};

export const selectUserInitials = (state) => {
  const user = state.auth.user;
  if (!user) return '';
  
  if (user.nombres && user.apellidos) {
    return `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();
  } else if (user.nombre) {
    const names = user.nombre.split(' ');
    return names.length > 1 
      ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
      : user.nombre.charAt(0).toUpperCase();
  } else if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  
  return 'U';
};

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

/**
 * Verificar si el usuario tiene un permiso específico
 */
export const hasPermission = (state, permission) => {
  return state.auth.permissions.includes(permission);
};

/**
 * Verificar si el usuario puede acceder a contenido de cierto grado
 */
export const canAccessGrade = (state, requiredGrade) => {
  const userGrade = state.auth.user?.grado;
  
  if (!userGrade || !requiredGrade) return false;
  
  const gradeHierarchy = {
    aprendiz: 1,
    companero: 2,
    maestro: 3,
  };
  
  const userLevel = gradeHierarchy[userGrade.toLowerCase()] || 0;
  const requiredLevel = gradeHierarchy[requiredGrade.toLowerCase()] || 0;
  
  return userLevel >= requiredLevel;
};

/**
 * Verificar si la sesión está cerca de expirar
 */
export const isSessionExpiringSoon = (state, minutesThreshold = 10) => {
  const expiry = state.auth.sessionExpiry;
  if (!expiry) return false;
  
  const expiryTime = new Date(expiry);
  const now = new Date();
  const diffInMinutes = (expiryTime - now) / (1000 * 60);
  
  return diffInMinutes <= minutesThreshold;
};

export default authSlice.reducer;