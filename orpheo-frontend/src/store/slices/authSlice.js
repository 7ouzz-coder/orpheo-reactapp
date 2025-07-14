import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../../services/authService';
import Toast from 'react-native-toast-message';

// Estado inicial
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lastLoginAttempt: null,
  sessionExpiry: null,
  permissions: [],
  isRefreshing: false
};

// Thunks asíncronos

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message || 'Error en el login');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error inesperado');
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await authService.logout();
      
      // Limpiar todos los datos relacionados con la autenticación
      dispatch(clearAuthData());
      
      return true;
    } catch (error) {
      // Incluso si falla el logout del servidor, limpiar datos locales
      dispatch(clearAuthData());
      return true;
    }
  }
);

// Refresh token
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      
      // Evitar múltiples refresh simultáneos
      if (auth.isRefreshing) {
        return rejectWithValue('Ya se está renovando el token');
      }

      const result = await authService.refreshToken();
      
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message || 'Error al renovar token');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error inesperado');
    }
  }
);

// Obtener usuario actual
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.getCurrentUser();
      
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message || 'Error al obtener usuario');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error inesperado');
    }
  }
);

// Cambiar contraseña
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const result = await authService.changePassword(passwordData);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Contraseña Cambiada',
          text2: result.message || 'Contraseña actualizada exitosamente',
          visibilityTime: 4000,
        });
        return result;
      } else {
        return rejectWithValue(result.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error inesperado');
    }
  }
);

// Verificar autenticación al iniciar la app
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const [storedUser, accessToken, refreshToken] = await Promise.all([
        authService.getStoredUser(),
        authService.getStoredAccessToken(),
        authService.getStoredRefreshToken()
      ]);

      if (!storedUser || !accessToken || !refreshToken) {
        throw new Error('No hay sesión almacenada');
      }

      // Verificar si el token es válido
      const isAuthenticated = await authService.isAuthenticated();
      
      if (isAuthenticated) {
        // Token válido, restaurar sesión
        return {
          user: storedUser,
          accessToken,
          refreshToken
        };
      } else {
        // Token inválido, intentar refresh
        const refreshResult = await authService.refreshToken();
        
        if (refreshResult.success) {
          return {
            user: storedUser,
            accessToken: refreshResult.data.accessToken,
            refreshToken
          };
        } else {
          throw new Error('Sesión expirada');
        }
      }
    } catch (error) {
      // Limpiar datos si hay error
      await authService.clearLocalData();
      return rejectWithValue(error.message || 'Error al verificar autenticación');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Limpiar datos de autenticación
    clearAuthData: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.sessionExpiry = null;
      state.permissions = [];
      state.isRefreshing = false;
    },

    // Limpiar errores
    clearError: (state) => {
      state.error = null;
    },

    // Actualizar usuario
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
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

    // Actualizar permisos
    updatePermissions: (state) => {
      if (state.user) {
        state.permissions = authService.getUserPermissions(state.user);
      }
    },

    // Actualizar token de acceso
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },

    // Marcar como refrescando
    setRefreshing: (state, action) => {
      state.isRefreshing = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
        state.permissions = authService.getUserPermissions(action.payload.user);
        
        // Calcular expiración de sesión (aproximada)
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 15); // 15 minutos por defecto
        state.sessionExpiry = expiryTime.toISOString();

        Toast.show({
          type: 'success',
          text1: 'Bienvenido',
          text2: `Hola ${action.payload.user.nombres}`,
          visibilityTime: 3000,
        });
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.loginAttempts += 1;
        state.lastLoginAttempt = new Date().toISOString();

        Toast.show({
          type: 'error',
          text1: 'Error de Login',
          text2: action.payload || 'Credenciales inválidas',
          visibilityTime: 4000,
        });
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        return { ...initialState }; // Reset completo del estado
      })
      .addCase(logout.rejected, (state) => {
        return { ...initialState }; // Reset incluso si falla
      });

    // Refresh token
    builder
      .addCase(refreshAccessToken.pending, (state) => {
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.accessToken = action.payload.accessToken;
        
        // Actualizar expiración
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 15);
        state.sessionExpiry = expiryTime.toISOString();
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isRefreshing = false;
        state.error = action.payload;
        
        // Si falla el refresh, hacer logout
        return { ...initialState };
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.permissions = authService.getUserPermissions(action.payload);
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        // Nota: después de cambiar contraseña, el backend invalida los tokens
        // El usuario tendrá que hacer login nuevamente
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Check auth status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.permissions = authService.getUserPermissions(action.payload.user);
        
        // Calcular expiración
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 15);
        state.sessionExpiry = expiryTime.toISOString();
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        return { ...initialState };
      });
  }
});

// Selectores
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;
export const selectPermissions = (state) => state.auth.permissions;
export const selectLoginAttempts = (state) => state.auth.loginAttempts;
export const selectUserRole = (state) => state.auth.user?.rol;
export const selectUserGrade = (state) => state.auth.user?.grado;
export const selectIsRefreshing = (state) => state.auth.isRefreshing;

// Selectores con lógica
export const selectCanManageMembers = (state) => {
  const user = state.auth.user;
  return user && authService.hasPermission(user, 'manage_members');
};

export const selectCanManageDocuments = (state) => {
  const user = state.auth.user;
  return user && authService.hasPermission(user, 'manage_documents');
};

export const selectCanAprovePlanchas = (state) => {
  const user = state.auth.user;
  return user && authService.hasPermission(user, 'approve_planchas');
};

export const selectCanAccessGrade = (targetGrade) => (state) => {
  const user = state.auth.user;
  return user && authService.canAccessGrade(user, targetGrade);
};

export const selectIsAdmin = (state) => {
  const user = state.auth.user;
  return user && ['admin', 'superadmin'].includes(user.rol);
};

export const selectIsSuperAdmin = (state) => {
  const user = state.auth.user;
  return user && user.rol === 'superadmin';
};

export const selectUserDisplayName = (state) => {
  const user = state.auth.user;
  return user ? `${user.nombres} ${user.apellidos}` : '';
};

export const selectIsSessionExpiring = (state) => {
  const expiry = state.auth.sessionExpiry;
  if (!expiry) return false;
  
  const now = new Date();
  const expiryDate = new Date(expiry);
  const timeDiff = expiryDate.getTime() - now.getTime();
  
  // Considerar que expira si quedan menos de 2 minutos
  return timeDiff < 2 * 60 * 1000;
};

// Acciones
export const {
  clearAuthData,
  clearError,
  updateUser,
  incrementLoginAttempts,
  resetLoginAttempts,
  updatePermissions,
  setAccessToken,
  setRefreshing
} = authSlice.actions;

export default authSlice.reducer;