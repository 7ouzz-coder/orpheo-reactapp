import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { API_CONFIG } from '@/utils/constants';
import { storageService } from './storage.service';

// Crear instancia de Axios
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar token de autenticación
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storageService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    
    // Log de requests en desarrollo
    if (__DEV__) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('📤 Request Data:', config.data);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor para manejar errores globales
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log de responses en desarrollo
    if (__DEV__) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      console.log('📥 Response Data:', response.data);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Log de errores en desarrollo
    if (__DEV__) {
      console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`);
      console.error('Error Details:', error.response?.data);
    }
    
    // Manejar error 401 (token expirado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await storageService.getRefreshToken();
        
        if (refreshToken) {
          // Intentar renovar el token
          const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          if (response.data.token) {
            // Guardar nuevo token
            await storageService.saveToken(response.data.token);
            
            // Reintentar la petición original
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Limpiar storage y redirigir a login
        await storageService.clearAuth();
        
        // Emitir evento para que la app maneje el logout
        // En una implementación real, aquí podrías usar un event emitter o store dispatch
        
        return Promise.reject(refreshError);
      }
    }
    
    // Manejar otros tipos de errores
    const errorMessage = getErrorMessage(error);
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      code: error.code,
      originalError: error,
    });
  }
);

// Función para extraer mensaje de error legible
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as any;
    
    // Intentar extraer mensaje del response
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.msg) return data.msg;
    
    // Mensajes por status code
    switch (error.response.status) {
      case 400:
        return 'Datos inválidos. Verifica la información enviada.';
      case 401:
        return 'No autorizado. Verifica tus credenciales.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 409:
        return 'Conflicto. El recurso ya existe.';
      case 422:
        return 'Datos de entrada inválidos.';
      case 429:
        return 'Demasiadas peticiones. Intenta más tarde.';
      case 500:
        return 'Error interno del servidor. Intenta más tarde.';
      case 503:
        return 'Servicio no disponible temporalmente.';
      default:
        return `Error del servidor (${error.response.status})`;
    }
  }
  
  // Errores de red
  if (error.code === 'NETWORK_ERROR') {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }
  
  if (error.code === 'TIMEOUT') {
    return 'La petición tardó demasiado. Verifica tu conexión.';
  }
  
  if (error.code === 'ECONNABORTED') {
    return 'Conexión cancelada. Intenta de nuevo.';
  }
  
  return error.message || 'Error de conexión desconocido';
}

// Funciones helper para diferentes tipos de peticiones
export const apiGet = async <T>(url: string, params?: any): Promise<T> => {
  const response = await api.get(url, { params });
  return response.data;
};

export const apiPost = async <T>(url: string, data?: any): Promise<T> => {
  const response = await api.post(url, data);
  return response.data;
};

export const apiPut = async <T>(url: string, data?: any): Promise<T> => {
  const response = await api.put(url, data);
  return response.data;
};

export const apiPatch = async <T>(url: string, data?: any): Promise<T> => {
  const response = await api.patch(url, data);
  return response.data;
};

export const apiDelete = async <T>(url: string): Promise<T> => {
  const response = await api.delete(url);
  return response.data;
};

// Función para upload de archivos con progress
export const apiUpload = async <T>(
  url: string,
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<T> => {
  const response = await api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
  
  return response.data;
};

// Función para download de archivos
export const apiDownload = async (url: string, filename?: string): Promise<string> => {
  const response = await api.get(url, {
    responseType: 'blob',
  });
  
  // En React Native, manejaremos la descarga diferente que en web
  if (filename) {
    // Aquí implementarías la lógica de descarga específica para React Native
    // usando expo-file-system o similar
    console.log('Download requested:', filename);
  }
  
  return URL.createObjectURL(response.data);
};

// Función para verificar conectividad
export const checkConnectivity = async (): Promise<boolean> => {
  try {
    await api.get('/health', { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
};

// Función para setear token manualmente (útil después del login)
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Función para limpiar headers de auth
export const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

export default api;