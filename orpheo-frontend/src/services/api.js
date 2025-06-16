import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import ENV from '../config/env';

const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('authToken');
    }
    
    if (error.code === 'ECONNABORTED') {
      error.message = 'Tiempo de espera agotado. Verifica tu conexión.';
    } else if (error.message === 'Network Error') {
      error.message = 'Error de conexión. Verifica tu internet.';
    }
    
    return Promise.reject(error);
  }
);

export default api;