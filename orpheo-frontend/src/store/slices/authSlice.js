import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Simulación de servicio de autenticación (será reemplazado por API real)
const mockAuthService = {
  async login(username, password) {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Usuarios de prueba
    const users = {
      'admin': {
        id: 1,
        username: 'admin',
        email: 'admin@orpheo.com',
        role: 'admin',
        grado: 'maestro',
        cargo: 'venerable_maestro',
        memberFullName: 'Administrador del Sistema',
        isActive: true,
        password: 'admin123'
      },
      'maestro': {
        id: 2,
        username: 'maestro',
        email: 'maestro@orpheo.com',
        role: 'general',
        grado: 'maestro',
        cargo: 'primer_vigilante',
        memberFullName: 'Juan Carlos Pérez',
        isActive: true,
        password: 'maestro123'
      },
      'companero': {
        id: 3,
        username: 'companero',
        email: 'companero@orpheo.com',
        role: 'general',
        grado: 'companero',
        cargo: null,
        memberFullName: 'Pedro Martínez Silva',
        isActive: true,
        password: 'companero123'
      },
      'aprendiz': {
        id: 4,
        username: 'aprendiz',
        email: 'aprendiz@orpheo.com',
        role: 'general',
        grado: 'aprendiz',
        cargo: null,
        memberFullName: 'Luis González Torres',
        isActive: true,
        password: 'aprendiz123'
      }
    };

    const user = users[username];
    if (!user || user.password !== password) {
      throw new Error('Credenciales incorrectas');
    }

    if (!user.isActive) {
      throw new Error('Cuenta desactivada');
    }

    // Simular token JWT
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        grado: user.grado,
        cargo: user.cargo,
        memberFullName: user.memberFullName,
        isActive: user.isActive,
      },
      token
    };
  },

  async logout() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  async verifyToken(token) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!token || !token.startsWith('mock-jwt-token')) {
      throw new Error('Token inválido');
    }

    // Simular verificación exitosa
    return { success: true };
  }
};

// Estado inicial
const initialState = {
  user: JSON.parse(localStorage.getItem('orpheo_user') || 'null'),
  token: localStorage.getItem('orpheo_token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lastLoginAttempt: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      
      // Verificar intentos de login (máximo 5 por minuto)
      const now = Date.now();
      const lastAttempt = state.auth.lastLoginAttempt;
      const attempts = state.auth.loginAttempts;
      
      if (lastAttempt && now - lastAttempt < 60000 && attempts >= 5) {
        throw new Error('Demasiados intentos de login. Espere un minuto.');
      }

      const response = await mockAuthService.login(username.trim(), password);
      
      // Guardar en localStorage
      localStorage.setItem('orpheo_token', response.token);
      localStorage.setItem('orpheo_user', JSON.stringify(response.user));
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await mockAuthService.logout();
      
      // Limpiar localStorage
      localStorage.removeItem('orpheo_token');
      localStorage.removeItem('orpheo_user');
      
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      
      if (!token) {
        throw new Error('No hay token');
      }

      await mockAuthService.verifyToken(token);
      
      const user = JSON.parse(localStorage.getItem('orpheo_user') || 'null');
      if (!user) {
        throw new Error('No hay datos de usuario');
      }

      return { user, token };
    } catch (error) {
      // Limpiar datos inválidos
      localStorage.removeItem('orpheo_token');
      localStorage.removeItem('orpheo_user');
      return rejectWithValue(error.message);
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
    
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('orpheo_user', JSON.stringify(state.user));
      }
    },
    
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
    
    // Para testing y desarrollo
    setMockUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.token = `mock-token-${action.payload.id}`;
      localStorage.setItem('orpheo_user', JSON.stringify(action.payload));
      localStorage.setItem('orpheo_token', state.token);
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.loginAttempts += 1;
        state.lastLoginAttempt = Date.now();
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Forzar logout aunque haya error
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // Verify token
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  updateUser, 
  resetLoginAttempts, 
  setMockUser 
} = authSlice.actions;

export default authSlice.reducer;

// Selectores
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserGrado = (state) => state.auth.user?.grado;
export const selectUserCargo = (state) => state.auth.user?.cargo;