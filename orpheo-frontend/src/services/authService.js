import api from './api';

const authService = {
  // Login - compatible con tu endpoint POST /api/auth/login
  login: async (credentials) => {
    const response = await api.post('/auth/login', {
      username: credentials.username,
      password: credentials.password,
    });
    return response.data; // Tu backend devuelve { success: true, token: "...", user: {...} }
  },

  // Logout - compatible con tu endpoint POST /api/auth/logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user - compatible con tu endpoint GET /api/auth/me
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Verificar token
  verifyToken: async (token) => {
    const response = await api.post('/auth/verify', { token });
    return response.data;
  },
};

export default authService;