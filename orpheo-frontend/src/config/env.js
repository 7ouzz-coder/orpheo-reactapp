const ENV = {
  development: {
    API_URL: '192.168.195.117:3000/api', // ⚠️ CAMBIAR POR TU IP LOCAL
    WEBSOCKET_URL: 'ws://192.168.195.117:3001',
  },
  production: {
    API_URL: 'https://api.orpheo.com/api',
    WEBSOCKET_URL: 'wss://api.orpheo.com',
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
};

export default getEnvVars();