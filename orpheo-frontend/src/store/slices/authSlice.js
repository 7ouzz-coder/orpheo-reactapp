import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import authService from '../../services/authService';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue, getState }) => {
    try {
      // Verificar si está bloqueado antes de intentar
      const { auth } = getState();
      if (auth.isLocked && auth.lockUntil && new Date() < new Date(auth.lockUntil)) {
        const remainingTime = Math.ceil((new Date(auth.lockUntil) - new Date()) / 1000);
        throw new Error(`Cuenta bloqueada. Inténtalo en ${remainingTime} segundos.`);
      }

      const response = await authService.login(credentials);
      
      // Guardar token en SecureStore (máxima seguridad)
      if (response.token) {
        await SecureStore.setItemAsync('authToken', response.token);
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al iniciar sesión'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignorar errores del servidor
    }
    await SecureStore.deleteItemAsync('authToken');
    return null;
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await authService.getCurrentUser();
      return response;
    } catch (error) {
      await SecureStore.deleteItemAsync('authToken');
      return rejectWithValue('Token inválido');
    }
  }
);

// ✅ Función para calcular tiempo de bloqueo progresivo
const calculateLockTime = (attempts) => {
  if (attempts < 3) return 0;
  if (attempts < 6) return 30; // 30 segundos después de 3 intentos
  if (attempts < 9) return 45; // 45 segundos después de 6 intentos
  return 60; // 60 segundos después de 9 intentos (máximo)
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    
    // ✅ Sistema de bloqueo mejorado
    loginAttempts: 0,
    maxLoginAttempts: 999, // Sin límite máximo, solo bloqueos temporales
    isLocked: false,
    lockUntil: null,
    lockDuration: 0, // en segundos
    
    // Historial para debug - ✅ inicializado como array
    attemptHistory: [],
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.isLocked = false;
      state.lockUntil = null;
      state.lockDuration = 0;
      state.attemptHistory = [];
    },
    
    // ✅ Verificar si el bloqueo ha expirado
    checkLockStatus: (state) => {
      if (state.isLocked && state.lockUntil) {
        const now = new Date();
        const lockUntil = new Date(state.lockUntil);
        
        if (now >= lockUntil) {
          // El bloqueo ha expirado
          state.isLocked = false;
          state.lockUntil = null;
          state.lockDuration = 0;
          // NO resetear loginAttempts para mantener el progreso del bloqueo
        }
      }
    },
    
    // ✅ Aplicar bloqueo temporal
    applyTemporaryLock: (state) => {
      const lockSeconds = calculateLockTime(state.loginAttempts);
      
      if (lockSeconds > 0) {
        state.isLocked = true;
        state.lockDuration = lockSeconds;
        state.lockUntil = new Date(Date.now() + lockSeconds * 1000).toISOString();
        
        // Asegurar que attemptHistory existe
        if (!state.attemptHistory) {
          state.attemptHistory = [];
        }
        
        // Agregar al historial
        state.attemptHistory.push({
          timestamp: new Date().toISOString(),
          attempts: state.loginAttempts,
          lockDuration: lockSeconds
        });
        
        console.log(`🔒 Cuenta bloqueada por ${lockSeconds} segundos después de ${state.loginAttempts} intentos`);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        
        // ✅ Reset completo al login exitoso
        state.loginAttempts = 0;
        state.isLocked = false;
        state.lockUntil = null;
        state.lockDuration = 0;
        state.attemptHistory = [];
        
        console.log('✅ Login exitoso - Bloqueos reseteados');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        
        // ✅ Solo incrementar si no está bloqueado actualmente
        if (!state.isLocked) {
          state.loginAttempts += 1;
          
          // Aplicar bloqueo si es necesario
          if (state.loginAttempts % 3 === 0) {
            const lockSeconds = calculateLockTime(state.loginAttempts);
            if (lockSeconds > 0) {
              state.isLocked = true;
              state.lockDuration = lockSeconds;
              state.lockUntil = new Date(Date.now() + lockSeconds * 1000).toISOString();
              
              // Asegurar que attemptHistory existe
              if (!state.attemptHistory) {
                state.attemptHistory = [];
              }
              
              state.attemptHistory.push({
                timestamp: new Date().toISOString(),
                attempts: state.loginAttempts,
                lockDuration: lockSeconds
              });
              
              console.log(`🔒 Bloqueo aplicado: ${lockSeconds}s después de ${state.loginAttempts} intentos`);
            }
          }
        }
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        // NO resetear loginAttempts en logout para mantener el historial de intentos
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { 
  clearError, 
  resetLoginAttempts, 
  checkLockStatus, 
  applyTemporaryLock 
} = authSlice.actions;

export default authSlice.reducer;

// ✅ Selectores básicos
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

// ✅ Selectores memoizados para evitar re-renders innecesarios
export const selectCanLogin = createSelector(
  [selectAuth],
  (auth) => {
    const { isLocked, lockUntil } = auth;
    
    if (!isLocked) return true;
    if (!lockUntil) return true;
    
    const now = new Date();
    const lockExpires = new Date(lockUntil);
    
    return now >= lockExpires;
  }
);

export const selectRemainingLockTime = createSelector(
  [selectAuth],
  (auth) => {
    const { isLocked, lockUntil } = auth;
    
    if (!isLocked || !lockUntil) return 0;
    
    const now = new Date();
    const lockExpires = new Date(lockUntil);
    const remaining = Math.max(0, Math.ceil((lockExpires - now) / 1000));
    
    return remaining;
  }
);

// ✅ Selector memoizado para información de bloqueo
export const selectLockInfo = createSelector(
  [selectAuth, selectRemainingLockTime, selectCanLogin],
  (auth, remainingTime, canLogin) => {
    const { loginAttempts, isLocked, lockDuration, attemptHistory = [] } = auth;
    
    return {
      attempts: loginAttempts,
      isLocked: isLocked || false,
      lockDuration: lockDuration || 0,
      remainingTime,
      canLogin,
      history: attemptHistory,
      nextLockDuration: calculateLockTime(loginAttempts + (loginAttempts % 3 === 2 ? 1 : 0))
    };
  }
);