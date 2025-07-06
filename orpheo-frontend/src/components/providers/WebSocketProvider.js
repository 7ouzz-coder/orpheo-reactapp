import React, { useEffect, createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import webSocketService from '../../services/webSocketService';

// Crear contexto para WebSocket
const WebSocketContext = createContext();

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

const WebSocketProvider = ({ children }) => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    console.log('🔌 WebSocketProvider - Estado de auth:', { isAuthenticated, userId: user?.id });

    if (isAuthenticated && user?.id) {
      // Conectar WebSocket cuando el usuario esté autenticado
      console.log('🔌 Conectando WebSocket para usuario:', user.id);
      webSocketService.connect(user.id);
    } else {
      // Desconectar WebSocket cuando no esté autenticado
      console.log('🔌 Desconectando WebSocket - usuario no autenticado');
      webSocketService.disconnect();
    }

    // Cleanup al desmontar
    return () => {
      webSocketService.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  // Escuchar cambios de conexión para debug
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleConnect = () => {
      console.log('✅ WebSocket conectado exitosamente');
    };

    const handleDisconnect = (reason) => {
      console.log('🔌 WebSocket desconectado:', reason);
    };

    const handleError = (error) => {
      console.error('❌ Error WebSocket:', error);
    };

    // Agregar listeners
    webSocketService.on('connect', handleConnect);
    webSocketService.on('disconnect', handleDisconnect);
    webSocketService.on('connect_error', handleError);

    // Cleanup
    return () => {
      webSocketService.off('connect', handleConnect);
      webSocketService.off('disconnect', handleDisconnect);
      webSocketService.off('connect_error', handleError);
    };
  }, [isAuthenticated]);

  // Valores del contexto
  const contextValue = {
    webSocket: webSocketService,
    isConnected: webSocketService.isConnected,
    user,
    
    // Métodos útiles
    emit: webSocketService.emit.bind(webSocketService),
    on: webSocketService.on.bind(webSocketService),
    off: webSocketService.off.bind(webSocketService),
    
    // Métodos específicos de la app
    confirmarAsistencia: webSocketService.confirmarAsistencia.bind(webSocketService),
    marcarAsistencia: webSocketService.marcarAsistencia.bind(webSocketService),
    
    // Debug info
    getDebugInfo: webSocketService.getDebugInfo.bind(webSocketService),
    getConnectionStatus: webSocketService.getConnectionStatus.bind(webSocketService),
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;