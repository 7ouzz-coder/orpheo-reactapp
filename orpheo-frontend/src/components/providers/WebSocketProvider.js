import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Platform } from 'react-native';
import io from 'socket.io-client';
import Toast from 'react-native-toast-message';
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import { fetchMiembros, fetchEstadisticas as fetchMiembrosStats } from '../../store/slices/miembrosSlice';
import { fetchDocumentos, fetchEstadisticas as fetchDocumentosStats } from '../../store/slices/documentosSlice';

// Contexto del WebSocket
const WebSocketContext = createContext(null);

// Hook para usar el WebSocket
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket debe ser usado dentro de WebSocketProvider');
  }
  return context;
};

// Obtener URL del WebSocket
const getWebSocketURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'ios') {
      return 'ws://localhost:3001';
    } else if (Platform.OS === 'android') {
      return 'ws://10.0.2.2:3001';
    } else {
      return 'ws://localhost:3001';
    }
  } else {
    return process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'wss://api.orpheo.com';
  }
};

const WebSocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 5000; // 5 segundos

  // Función para conectar
  const connect = () => {
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      console.log('🔌 Conectando WebSocket...');
      
      const newSocket = io(getWebSocketURL(), {
        transports: ['websocket'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: true,
        query: {
          userId: user.id,
          grado: user.grado,
          rol: user.rol
        }
      });

      socketRef.current = newSocket;

      // Eventos de conexión
      newSocket.on('connect', () => {
        console.log('✅ WebSocket conectado');
        setIsConnected(true);
        setReconnectAttempts(0);
        
        // Unirse a la sala personal del usuario
        newSocket.emit('join', user.id);
        
        // Unirse a salas por grado si es necesario
        if (user.grado) {
          newSocket.emit('join_grade', user.grado);
        }
        
        // Unirse a sala de administradores si corresponde
        if (['admin', 'superadmin'].includes(user.rol)) {
          newSocket.emit('join_admin');
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ WebSocket desconectado:', reason);
        setIsConnected(false);
        
        // Intentar reconectar automáticamente si no fue intencional
        if (reason !== 'io client disconnect' && reconnectAttempts < maxReconnectAttempts) {
          scheduleReconnect();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Error de conexión WebSocket:', error);
        setIsConnected(false);
        
        if (reconnectAttempts < maxReconnectAttempts) {
          scheduleReconnect();
        }
      });

      // Eventos de la aplicación
      setupEventListeners(newSocket);

      setSocket(newSocket);

    } catch (error) {
      console.error('❌ Error al crear conexión WebSocket:', error);
    }
  };

  // Función para desconectar
  const disconnect = () => {
    if (socketRef.current) {
      console.log('🔌 Desconectando WebSocket...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  // Programar reconexión
  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const attempts = reconnectAttempts + 1;
    setReconnectAttempts(attempts);

    const delay = reconnectDelay * Math.pow(2, Math.min(attempts - 1, 3)); // Backoff exponencial

    console.log(`🔄 Programando reconexión en ${delay}ms (intento ${attempts}/${maxReconnectAttempts})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      if (isAuthenticated && user) {
        connect();
      }
    }, delay);
  };

  // Configurar listeners de eventos
  const setupEventListeners = (socket) => {
    // Notificación de nuevo miembro
    socket.on('nuevo_miembro', (data) => {
      Toast.show({
        type: 'info',
        text1: 'Nuevo Miembro',
        text2: `${data.nombre} se ha unido a la logia`,
        visibilityTime: 4000,
      });
      
      // Refrescar datos de miembros
      dispatch(fetchMiembros());
      dispatch(fetchMiembrosStats());
    });

    // Notificación de miembro actualizado
    socket.on('miembro_actualizado', (data) => {
      Toast.show({
        type: 'info',
        text1: 'Miembro Actualizado',
        text2: `Información de ${data.nombre} actualizada`,
        visibilityTime: 3000,
      });
      
      dispatch(fetchMiembros());
      dispatch(fetchMiembrosStats());
    });

    // Notificación de nuevo documento
    socket.on('nuevo_documento', (data) => {
      Toast.show({
        type: 'info',
        text1: 'Nuevo Documento',
        text2: `${data.nombre} ha sido subido`,
        visibilityTime: 4000,
      });
      
      dispatch(fetchDocumentos());
      dispatch(fetchDocumentosStats());
    });

    // Notificación de nueva plancha pendiente (solo para moderadores)
    socket.on('nueva_plancha_pendiente', (data) => {
      if (['admin', 'superadmin'].includes(user.rol) || user.grado === 'maestro') {
        Toast.show({
          type: 'warning',
          text1: 'Nueva Plancha Pendiente',
          text2: `"${data.nombre}" por ${data.autor}`,
          visibilityTime: 5000,
        });
        
        dispatch(fetchDocumentos());
        dispatch(fetchDocumentosStats());
      }
    });

    // Notificación de plancha moderada
    socket.on('plancha_moderada', (data) => {
      const tipo = data.estado === 'aprobada' ? 'success' : 'error';
      const titulo = data.estado === 'aprobada' ? 'Plancha Aprobada' : 'Plancha Rechazada';
      
      Toast.show({
        type: tipo,
        text1: titulo,
        text2: `"${data.nombre}" ha sido ${data.estado}`,
        visibilityTime: 4000,
      });
      
      dispatch(fetchDocumentos());
      dispatch(fetchDocumentosStats());
    });

    // Notificación de documento eliminado
    socket.on('documento_eliminado', (data) => {
      Toast.show({
        type: 'info',
        text1: 'Documento Eliminado',
        text2: `"${data.nombre}" ha sido eliminado`,
        visibilityTime: 3000,
      });
      
      dispatch(fetchDocumentos());
      dispatch(fetchDocumentosStats());
    });

    // Notificación de programa nuevo
    socket.on('nuevo_programa', (data) => {
      Toast.show({
        type: 'info',
        text1: 'Nuevo Programa',
        text2: `${data.titulo} - ${data.fecha}`,
        visibilityTime: 4000,
      });
    });

    // Notificación de programa cancelado
    socket.on('programa_cancelado', (data) => {
      Toast.show({
        type: 'warning',
        text1: 'Programa Cancelado',
        text2: `${data.titulo} ha sido cancelado`,
        visibilityTime: 4000,
      });
    });

    // Notificación de recordatorio de programa
    socket.on('recordatorio_programa', (data) => {
      Toast.show({
        type: 'info',
        text1: 'Recordatorio',
        text2: `${data.titulo} es en ${data.tiempoRestante}`,
        visibilityTime: 5000,
      });
    });

    // Notificación de mensaje directo
    socket.on('mensaje_directo', (data) => {
      Toast.show({
        type: 'info',
        text1: `Mensaje de ${data.remitente}`,
        text2: data.mensaje,
        visibilityTime: 6000,
      });
    });

    // Notificación general del sistema
    socket.on('notificacion_sistema', (data) => {
      Toast.show({
        type: data.tipo || 'info',
        text1: data.titulo || 'Notificación del Sistema',
        text2: data.mensaje,
        visibilityTime: data.duracion || 4000,
      });
    });

    // Evento de fuerza de actualización
    socket.on('force_refresh', (data) => {
      console.log('🔄 Forzando actualización de datos:', data.modules);
      
      if (data.modules.includes('miembros')) {
        dispatch(fetchMiembros());
        dispatch(fetchMiembrosStats());
      }
      
      if (data.modules.includes('documentos')) {
        dispatch(fetchDocumentos());
        dispatch(fetchDocumentosStats());
      }
    });

    // Evento de mantenimiento
    socket.on('maintenance_mode', (data) => {
      Toast.show({
        type: 'warning',
        text1: 'Modo Mantenimiento',
        text2: data.mensaje || 'El sistema entrará en mantenimiento pronto',
        visibilityTime: 8000,
      });
    });

    // Heartbeat para mantener conexión activa
    socket.on('ping', () => {
      socket.emit('pong');
    });
  };

  // Función para enviar evento
  const emit = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
      return true;
    } else {
      console.warn('❌ No se puede enviar evento, WebSocket no conectado');
      return false;
    }
  };

  // Función para suscribirse a un evento
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => {};
  };

  // Función para desuscribirse de un evento
  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  // Efectos
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user?.id]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  // Reconectar cuando la app vuelve a primer plano
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && isAuthenticated && user && !isConnected) {
        console.log('📱 App activa, reconectando WebSocket...');
        connect();
      }
    };

    // En React Native, necesitarías AppState
    // AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      // AppState.removeEventListener('change', handleAppStateChange);
    };
  }, [isAuthenticated, user, isConnected]);

  // Valor del contexto
  const contextValue = {
    socket,
    isConnected,
    reconnectAttempts,
    maxReconnectAttempts,
    emit,
    on,
    off,
    connect: () => {
      if (!isConnected) {
        connect();
      }
    },
    disconnect
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;