import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginCredentials, LoginResponse } from '@/types/auth';
import { authService } from '@/services/auth.service';
import { storageService } from '@/services/storage.service';

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lastLoginAttempt: null,
};

// Thunks asíncronos
export const initializeApp = createAsyncThunk(
  'auth/initializeApp',
  async (_, { rejectWithValue }) => {
    try {
      // Verificar si hay token guardado
      const token = await storageService.getToken();
      const user = await storageService.getUser();
      
      if (token && user) {
        // Verificar si el token es válido
        const isValid = await authService.verifyToken(token);
        
        if (isValid) {
          return { user, token, isAuthenticated: true };
        } else {
          // Token inválido, limpiar storage
          await storageService.clearAuth();
          return { user: null, token: null, isAuthenticated: false };
        }
      }
      
      return { user: null, token: null, isAuthenticated: false };
    } catch (error) {
      console.error('Error initializing app:', error);
      return rejectWithValue('Error al inicializar la aplicación');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      
      // Verificar intentos de login (rate limiting básico)
      if (state.auth.loginAttempts >= 5) {
        const lastAttempt = state.auth.lastLoginAttempt;
        if (lastAttempt) {
          const timeSinceLastAttempt = Date.now() - new Date(lastAttempt).getTime();
          const waitTime = 15 * 60 * 1000; // 15 minutos
          
          if (timeSinceLastAttempt < waitTime) {
            const remainingTime = Math.ceil((waitTime - timeSinceLastAttempt) / 60000);
            return rejectWithValue(`Demasiados intentos. Intenta de nuevo en ${remainingTime} minutos.`);
          }
        }
      }

      const response = await authService.login(credentials);
      
      if (response.success && response.user && response.token) {
        // Guardar en storage
        await storageService.saveAuth(response.user, response.token, response.refreshToken);
        
        return {
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
        };
      } else {
        return rejectWithValue(response.message || 'Error en el login');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return rejectWithValue(error.message || 'Error de conexión');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      
      if (state.auth.token) {
        // Notificar al servidor sobre el logout
        await authService.logout(state.auth.token);
      }
      
      // Limpiar storage
      await storageService.clearAuth();
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Aunque falle la comunicación con el servidor, limpiamos local
      await storageService.clearAuth();
      return true;
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      
      if (!state.auth.refreshToken) {
        return rejectWithValue('No hay refresh token');
      }

      const response = await authService.refreshToken(state.auth.refreshToken);
      
      if (response.token && response.user) {
        // Actualizar storage
        await storageService.saveAuth(response.user, response.token, response.refreshToken);
        
        return {
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
        };
      } else {
        return rejectWithValue('Error al renovar token');
      }
    } catch (error: any) {
      console.error('Refresh token error:', error);
      return rejectWithValue(error.message || 'Error al renovar sesión');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      
      if (!state.auth.token || !state.auth.user) {
        return rejectWithValue('No hay sesión activa');
      }

      const updatedUser = await authService.updateProfile(userData, state.auth.token);
      
      // Actualizar storage
      await storageService.saveUser(updatedUser);
      
      return updatedUser;
    } catch (error: any) {
      console.error('Update profile error:', error);
      return rejectWithValue(error.message || 'Error al actualizar perfil');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { auth: AuthState };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      await authService.changePassword({
        currentPassword,
        newPassword,
      }, state.auth.token);
      
      return true;
    } catch (error: any) {
      console.error('Change password error:', error);
      return rejectWithValue(error.message || 'Error al cambiar contraseña');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
  },
  extraReducers: (builder) => {
    // Initialize App
    builder
      .addCase(initializeApp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = action.payload.isAuthenticated;
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.loginAttempts += 1;
        state.lastLoginAttempt = new Date().toISOString();
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      })
      .addCase(logout.rejected, (state) => {
        // Aunque falle, limpiamos el estado
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state) => {
        // Token inválido, cerrar sesión
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // Update Profile
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Change Password
    builder
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetLoginAttempts, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;