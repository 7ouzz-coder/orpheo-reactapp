// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../config/api.config';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar token a las requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log para debugging
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Clear stored token
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userInfo');
        
        // Redirect to login (you'll handle this in your auth slice)
        console.log('🔄 Token expired, redirecting to login...');
        
      } catch (tokenError) {
        console.error('Error clearing tokens:', tokenError);
      }
    }

    // Network error handling
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('🌐 Network Error - Check if backend is running');
      error.userMessage = 'Error de conexión. Verifica que el servidor esté activo.';
    }

    return Promise.reject(error);
  }
);

export default api;