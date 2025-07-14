import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store/store';
import { logout, refreshAccessToken } from '../store/slices/authSlice';
import Toast from 'react-native-toast-message';

// Configuración de la API base
const getBaseURL = () => {
  if (__DEV__) {
    // Desarrollo - Detectar plataforma
    if (Platform.OS === 'ios') {
      return 'http://localhost:3001/api';
    } else if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001/api'; // Android emulator
    } else {
      return 'http://localhost:3001/api'; // Web/otros
    }
  } else {
    // Producción
    return process.env.EXPO_PUBLIC_API_URL || 'https://api.orpheo.com/api';
  }
};

// Crear instancia de axios
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Variable para evitar múltiples intentos de refresh
let isRefreshing = false;
let refreshSubscribers = [];

// Función para suscribirse al refresh
const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

// Función para notificar a los suscriptores
const onRefreshed = (token) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

// Interceptor de Request - Agregar token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log de request en desarrollo
      if (__DEV__) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        if (config.data) {
          console.log('📤 Request Data:', config.data);
        }
      }

      return config;
    } catch (error) {
      console.error('❌ Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de Response - Manejar errores y refresh token
api.interceptors.response.use(
  (response) => {
    // Log de response exitosa en desarrollo
    if (__DEV__) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log de error en desarrollo
    if (__DEV__) {
      console.log(`❌ API Error: ${error.response?.status} ${originalRequest?.url}`);
      console.log('Error details:', error.response?.data);
    }

    // Si no hay respuesta (error de red)
    if (!error.response) {
      Toast.show({
        type: 'error',
        text1: 'Error de Conexión',
        text2: 'Verifica tu conexión a internet',
        visibilityTime: 4000,
      });
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Manejar diferentes tipos de errores
    switch (status) {
      case 401:
        // Token expirado o inválido
        if (data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
          originalRequest._retry = true;

          if (!isRefreshing) {
            isRefreshing = true;

            try {
              // Intentar refresh del token
              const refreshToken = await AsyncStorage.getItem('refreshToken');
              
              if (!refreshToken) {
                throw new Error('No refresh token available');
              }

              const response = await axios.post(`${getBaseURL()}/auth/refresh`, {
                refreshToken: refreshToken
              });

              const { accessToken } = response.data.data;
              
              // Guardar nuevo token
              await AsyncStorage.setItem('accessToken', accessToken);
              
              // Actualizar token en el store
              store.dispatch(refreshAccessToken(accessToken));

              // Notificar a requests pendientes
              onRefreshed(accessToken);
              
              isRefreshing = false;

              // Reintentar request original
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return api(originalRequest);

            } catch (refreshError) {
              isRefreshing = false;
              
              // Refresh falló - logout
              console.log('🔴 Refresh token failed, logging out...');
              store.dispatch(logout());
              
              Toast.show({
                type: 'error',
                text1: 'Sesión Expirada',
                text2: 'Por favor, inicia sesión nuevamente',
                visibilityTime: 4000,
              });

              return Promise.reject(refreshError);
            }
          } else {
            // Ya se está refrescando, esperar
            return new Promise((resolve) => {
              subscribeTokenRefresh((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(api(originalRequest));
              });
            });
          }
        } else {
          // Error de autenticación diferente
          store.dispatch(logout());
          Toast.show({
            type: 'error',
            text1: 'Error de Autenticación',
            text2: data?.message || 'Credenciales inválidas',
            visibilityTime: 4000,
          });
        }
        break;

      case 403:
        Toast.show({
          type: 'error',
          text1: 'Acceso Denegado',
          text2: data?.message || 'No tienes permisos para esta acción',
          visibilityTime: 4000,
        });
        break;

      case 404:
        Toast.show({
          type: 'error',
          text1: 'No Encontrado',
          text2: data?.message || 'El recurso solicitado no existe',
          visibilityTime: 3000,
        });
        break;

      case 422:
        // Errores de validación - no mostrar toast, dejar que el componente los maneje
        break;

      case 429:
        Toast.show({
          type: 'error',
          text1: 'Demasiadas Solicitudes',
          text2: 'Espera un momento antes de intentar nuevamente',
          visibilityTime: 4000,
        });
        break;

      case 500:
        Toast.show({
          type: 'error',
          text1: 'Error del Servidor',
          text2: 'Ocurrió un error interno. Intenta nuevamente.',
          visibilityTime: 4000,
        });
        break;

      default:
        Toast.show({
          type: 'error',
          text1: 'Error Inesperado',
          text2: data?.message || 'Algo salió mal',
          visibilityTime: 4000,
        });
    }

    return Promise.reject(error);
  }
);

// Función helper para manejar errores de API
export const handleApiError = (error, customMessage = null) => {
  const message = customMessage || 
    error.response?.data?.message || 
    error.message || 
    'Ocurrió un error inesperado';

  console.error('API Error:', {
    url: error.config?.url,
    method: error.config?.method,
    status: error.response?.status,
    message: message,
    data: error.response?.data
  });

  return {
    success: false,
    message,
    errors: error.response?.data?.errors || [],
    status: error.response?.status
  };
};

// Función helper para requests con archivos
export const createFormData = (data, fileKey = 'file') => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (key === fileKey && data[key]) {
      // Manejar archivo
      formData.append(fileKey, {
        uri: data[key].uri,
        type: data[key].type || 'application/octet-stream',
        name: data[key].name || 'file'
      });
    } else if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  
  return formData;
};

// Función helper para requests con timeout personalizado
export const apiWithTimeout = (timeout = 60000) => {
  return axios.create({
    ...api.defaults,
    timeout
  });
};

// Headers para multipart/form-data
export const getMultipartHeaders = () => ({
  'Content-Type': 'multipart/form-data',
});

// Función para verificar conectividad
export const checkConnectivity = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

export default api;