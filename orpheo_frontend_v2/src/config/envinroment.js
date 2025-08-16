import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Obtener variables de entorno desde EAS
const getEnvVar = (key, defaultValue = null) => {
  // En EAS Build, las variables están en Constants.expoConfig.extra
  return Constants.expoConfig?.extra?.[key] || 
         process.env[key] || 
         defaultValue;
};

// Configuración basada en el entorno
const isDevelopment = __DEV__ || Constants.expoConfig?.extra?.NODE_ENV === 'development';
const isProduction = !isDevelopment;

// Función para detectar IP automáticamente en desarrollo
const getDevServerIP = () => {
  const manifest = Constants.expoConfig || Constants.manifest;
  
  if (manifest?.debuggerHost) {
    return manifest.debuggerHost.split(':')[0];
  }
  
  return '192.168.1.100'; // IP por defecto
};

// Configuración de entornos
export const ENV_CONFIG = {
  development: {
    // Para Expo Go y desarrollo
    API_BASE_URL: isDevelopment ? 
      `http://${getDevServerIP()}:3001/api` : 
      getEnvVar('API_BASE_URL', 'http://192.168.1.100:3001/api'),
    
    WS_URL: isDevelopment ? 
      `ws://${getDevServerIP()}:3001` : 
      getEnvVar('WS_URL', 'ws://192.168.1.100:3001'),
    
    TIMEOUT: 15000,
    DEBUG: true,
  },
  
  production: {
    // Para APK compilada con EAS
    API_BASE_URL: getEnvVar('API_BASE_URL', 'http://192.168.1.100:3001/api'),
    WS_URL: getEnvVar('WS_URL', 'ws://192.168.1.100:3001'),
    TIMEOUT: 10000,
    DEBUG: false,
  }
};

// Configuración actual
export const API_CONFIG = isProduction ? ENV_CONFIG.production : ENV_CONFIG.development;

// Log de configuración (solo en desarrollo)
if (isDevelopment || API_CONFIG.DEBUG) {
  console.log('🌐 Configuración API:', {
    environment: isProduction ? 'PRODUCTION' : 'DEVELOPMENT',
    baseURL: API_CONFIG.API_BASE_URL,
    wsURL: API_CONFIG.WS_URL,
    isDebug: API_CONFIG.DEBUG,
    buildType: Constants.appOwnership || 'unknown',
    expoGo: Constants.appOwnership === 'expo'
  });
}

export default API_CONFIG;