import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuración directa (sin imports externos para evitar errores)
const API_CONFIG = {
  // URLs base según el entorno
  BASE_URL: 'http://191.112.178.230:3001/api',
  
  // Timeouts
  TIMEOUT: {
    request: 30000,    // 30 segundos
    upload: 120000,    // 2 minutos para uploads
  },
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT.request,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Claves para AsyncStorage
const TOKEN_KEY = 'orpheo_access_token';
const REFRESH_TOKEN_KEY = 'orpheo_refresh_token';

// Variable para evitar múltiples refresh simultáneos
let isRefreshing = false;
let failedQueue = [];

// Función para procesar la cola de requests fallidos
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Obtener token de acceso
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      
      // Agregar token al header si existe
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log para debugging (solo en desarrollo)
      if (__DEV__) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      }
      
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

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================
apiClient.interceptors.response.use(
  (response) => {
    // Log para debugging (solo en desarrollo)
    if (__DEV__) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log para debugging (solo en desarrollo)
    if (__DEV__) {
      console.log(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, error.response?.status);
    }
    
    // Si es error 401 (token expirado) y no es request de login/refresh
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      
      // Si ya estamos refrescando, agregar a la cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Intentar refrescar el token
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Hacer request de refresh (sin interceptors para evitar loop)
        const refreshResponse = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: API_CONFIG.DEFAULT_HEADERS,
            timeout: API_CONFIG.TIMEOUT.request,
          }
        );
        
        if (refreshResponse.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
          
          // Guardar nuevos tokens
          await AsyncStorage.setItem(TOKEN_KEY, accessToken);
          if (newRefreshToken) {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          }
          
          // Procesar cola de requests fallidos
          processQueue(null, accessToken);
          
          // Reintentar request original
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Limpiar tokens inválidos
        await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, 'orpheo_user_data']);
        
        // Procesar cola con error
        processQueue(refreshError, null);
        
        // Redirigir a login (esto se puede manejar en el nivel de la app)
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Para otros errores, simplemente rechazar
    return Promise.reject(error);
  }
);

// ==========================================
// MÉTODOS DE UTILIDAD
// ==========================================

/**
 * Cliente para uploads de archivos
 */
export const createUploadClient = () => {
  return axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT.upload, // Timeout más largo para uploads
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Verificar estado de conexión con el servidor
 */
export const checkServerHealth = async () => {
  try {
    // Cambiar de /health a un endpoint que existe
    const response = await axios.get(`${API_CONFIG.BASE_URL}`, {
      timeout: 5000, // Timeout corto para health check
    });
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Server health check failed:', error);
    
    return {
      success: false,
      error: error.message || 'Server unreachable',
    };
  }
};

/**
 * Crear cliente sin interceptors (para casos especiales)
 */
export const createPlainClient = () => {
  return axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT.request,
    headers: API_CONFIG.DEFAULT_HEADERS,
  });
};

/**
 * Helper para manejar errores de API de forma consistente
 */
export const handleApiError = (error) => {
  let errorMessage = 'Error de conexión';
  let errorCode = 'NETWORK_ERROR';
  
  if (error.response) {
    // Error del servidor
    const status = error.response.status;
    const serverMessage = error.response.data?.message;
    errorCode = `HTTP_${status}`;
    
    switch (status) {
      case 400:
        errorMessage = serverMessage || 'Datos inválidos';
        break;
      case 401:
        errorMessage = 'No autorizado';
        errorCode = 'UNAUTHORIZED';
        break;
      case 403:
        errorMessage = 'Sin permisos';
        errorCode = 'FORBIDDEN';
        break;
      case 404:
        errorMessage = 'Recurso no encontrado';
        break;
      case 409:
        errorMessage = serverMessage || 'Conflicto de datos';
        break;
      case 422:
        errorMessage = serverMessage || 'Datos inválidos';
        break;
      case 429:
        errorMessage = 'Demasiadas solicitudes';
        errorCode = 'RATE_LIMIT';
        break;
      case 500:
        errorMessage = 'Error del servidor';
        errorCode = 'SERVER_ERROR';
        break;
      case 503:
        errorMessage = 'Servicio no disponible';
        errorCode = 'SERVICE_UNAVAILABLE';
        break;
      default:
        errorMessage = serverMessage || `Error ${status}`;
    }
  } else if (error.request) {
    // Error de red
    errorMessage = 'Sin conexión a internet';
    errorCode = 'NETWORK_ERROR';
  } else if (error.code === 'ECONNABORTED') {
    // Timeout
    errorMessage = 'Tiempo de espera agotado';
    errorCode = 'TIMEOUT';
  }
  
  return {
    message: errorMessage,
    code: errorCode,
    originalError: error,
  };
};

/**
 * Helper para retry automático de requests
 */
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Solo reintentar en errores de red o servidor
      const shouldRetry = 
        !error.response || 
        error.response.status >= 500 || 
        error.code === 'ECONNABORTED';
      
      if (!shouldRetry) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
};

// Exportar cliente principal
export default apiClient;