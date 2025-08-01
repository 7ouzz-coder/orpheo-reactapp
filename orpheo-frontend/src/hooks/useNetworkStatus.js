// src/hooks/useNetworkStatus.js
import { useState, useEffect } from 'react';
import { checkConnectivity } from '../services/api';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar conectividad con el servidor
    const checkServerConnection = async () => {
      const connected = await checkConnectivity();
      setIsConnected(connected);
    };

    checkServerConnection();
    const interval = setInterval(checkServerConnection, 30000); // Cada 30 segundos

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { isOnline, isConnected };
};