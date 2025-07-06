import Constants from 'expo-constants';

// ✅ Tu IP configurada
const YOUR_IP = '192.168.195.117';

// ✅ Función para obtener la IP del host automáticamente
const getHostIP = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.split(':').shift();
  }
  
  // Fallback a tu IP específica
  return YOUR_IP;
};

const ENV = {
  // Para desarrollo local
  API_URL: 'http://192.168.195.117:3001/api',
  WEBSOCKET_URL: 'http://192.168.195.117:3001',

  development: {
    API_URL: __DEV__ 
      ? `http://${getHostIP()}:3001/api`
      : `http://${YOUR_IP}:3001/api`,
    WEBSOCKET_URL: __DEV__ 
      ? `ws://${getHostIP()}:3001`
      : `ws://${YOUR_IP}:3001`,
    BASE_URL: __DEV__ 
      ? `http://${getHostIP()}:3001`
      : `http://${YOUR_IP}:3001`,
  },
  production: {
    API_URL: 'https://api.orpheo.com/api',
    WEBSOCKET_URL: 'wss://api.orpheo.com',
    BASE_URL: 'https://api.orpheo.com',
  },
};

function getEnvVars() {
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
}

// ✅ Para debug - verificar configuración
const config = getEnvVars();
console.log('📱 Expo Host URI:', Constants.expoConfig?.hostUri);
console.log('🌐 IP detectada:', getHostIP());
console.log('🔗 API URL final:', config.API_URL);
console.log('🏠 Base URL:', config.BASE_URL);

export default getEnvVars();