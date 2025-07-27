import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import api from '../../services/api';

// Estado inicial
const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lastLoginAttempt: null,
  permissions: [],
};

// Thunks asíncronos

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('🔐 Iniciando login...', credentials.email);
      
      const response = await api.post('/auth/login', credentials);
      
      if (response.data && response.data.success) {
        const { user, token } = response.data.data;
        
        // Guardar token en AsyncStorage
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(user));
        
        console.log('✅ Login exitoso:', user.email);
        
        Toast.show({
          type: 'success',
          text1: '¡Bienvenido!',
          text2: `Hola ${user.nombres} ${user.apellidos}`,
          visibilityTime: 3000,
        });
        
        return { user, token };
      } else {
        throw new Error(response.data?.message || 'Error en el login');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Error de conexión';
      
      Toast.show({
        type: 'error',
        text1: 'Error de Login',
        text2: errorMessage,
        visibilityTime: 4000,
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      // Limpiar datos locales
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userInfo');
      
      console.log('🔓 Logout exitoso');
      
      Toast.show({
        type: 'info',
        text1: 'Sesión Cerrada',
        text2: 'Has cerrado sesión correctamente',
        visibilityTime: 2000,
      });
      
      return true;
    } catch (error) {
      console.error('Error en logout:', error);
      // Incluso si falla, limpiar datos locales
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userInfo');
      return true;
    }
  }
);

// Verificar autenticación al iniciar la app
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('userInfo')
      ]);

      if (!storedToken || !storedUser) {
        throw new Error('No hay sesión almacenada');
      }

      const user = JSON.parse(storedUser);
      
      console.log('🔍 Verificando sesión almacenada:', user.email);
      
      // TODO: Verificar si el token sigue siendo válido con el backend
      // Por ahora, simplemente restauramos la sesión
      
      return { user, token: storedToken };
    } catch (error) {
      // Limpiar datos si hay error
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userInfo');
      return rejectWithValue('No hay sesión válida');
    }
  }
);

// Slice
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
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
        state.isAuthenticated = true;
        state.loginAttempts = 0;
        state.error = null;
        
        // Calcular permisos basados en el usuario
        state.permissions = getUserPermissions(action.payload.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.loginAttempts += 1;
      });

    // Logout cases
    builder
      .addCase(logout.fulfilled, (state) => {
        return { ...initialState };
      });

    // Check auth status cases
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
        state.isAuthenticated = true;
        state.permissions = getUserPermissions(action.payload.user);
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });
  },
});

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
    permissions.push('maestro_access');
  } else if (user.grado === 'companero') {
    permissions.push('companero_access');
  } else if (user.grado === 'aprendiz') {
    permissions.push('aprendiz_access');
  }
  
  return [...new Set(permissions)]; // Eliminar duplicados
};

// Actions
export const { 
  clearError, 
  updateUser, 
  incrementLoginAttempts, 
  resetLoginAttempts,
  clearAuthData 
} = authSlice.actions;

// Selectores
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;
export const selectPermissions = (state) => state.auth.permissions;
export const selectUserRole = (state) => state.auth.user?.rol;
export const selectUserGrade = (state) => state.auth.user?.grado;
export const selectUserDisplayName = (state) => {
  const user = state.auth.user;
  return user ? `${user.nombres} ${user.apellidos}` : '';
};

// Función para verificar permisos
export const hasPermission = (state, permission) => {
  return state.auth.permissions.includes(permission);
};

export default authSlice.reducer;