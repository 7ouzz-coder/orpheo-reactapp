import Constants from 'expo-constants';

const ENV = {
  development: {
    // 🔥 CORREGIDO: Asegurarse de que la URL esté bien formada
    API_URL: __DEV__ && Constants.expoConfig?.hostUri
      ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:3001/api`
      : 'http://192.168.195.117:3001/api',
    WEBSOCKET_URL: __DEV__ && Constants.expoConfig?.hostUri
      ? `ws://${Constants.expoConfig.hostUri.split(':').shift()}:3001`
      : 'ws://192.168.195.117:3001',
  },
  production: {
    API_URL: 'https://api.orpheo.com/api',
    WEBSOCKET_URL: 'wss://api.orpheo.com',
  },
};

// 🔥 Para debug - ver qué IP está usando
const config = getEnvVars();
console.log('📱 Expo Host URI:', Constants.expoConfig?.hostUri);
console.log('🌐 API URL que se usará:', config.API_URL);

function getEnvVars() {
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
}

export default getEnvVars();