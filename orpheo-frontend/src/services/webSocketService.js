import { io } from 'socket.io-client';
import ENV from '../config/env';
import { store } from '../store/store';
import { updateAsistenciaInState } from '../store/slices/programasSlice';
import Toast from 'react-native-toast-message';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
    this.eventListeners = new Map();
  }

  // Conectar al WebSocket
  connect(userId) {
    if (this.socket && this.isConnected) {
      console.log('🔌 WebSocket ya está conectado');
      return;
    }

    try {
      console.log('🔌 Conectando a WebSocket...', ENV.WEBSOCKET_URL);
      
      this.socket = io(ENV.WEBSOCKET_URL, {
        transports: ['websocket'],
        timeout: 10000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval,
        reconnectionDelayMax: 5000,
      });

      this.setupEventListeners();
      
      if (userId) {
        this.joinUserRoom(userId);
      }

    } catch (error) {
      console.error('❌ Error conectando WebSocket:', error);
      this.handleConnectionError(error);
    }
  }

  // Configurar listeners de eventos
  setupEventListeners() {
    if (!this.socket) return;

    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      Toast.show({
        type: 'success',
        text1: '🔌 Conectado',
        text2: 'Notificaciones en tiempo real activadas',
        position: 'top',
        visibilityTime: 2000,
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket desconectado:', reason);
      this.isConnected = false;
      this.handleDisconnection(reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error);
      this.handleConnectionError(error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconectado después de ${attemptNumber} intentos`);
      Toast.show({
        type: 'success',
        text1: '🔄 Reconectado',
        text2: 'Conexión restablecida',
        position: 'top',
        visibilityTime: 2000,
      });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Falló la reconexión del WebSocket');
      Toast.show({
        type: 'error',
        text1: '❌ Sin conexión',
        text2: 'No se pudo restablecer la conexión',
        position: 'top',
        visibilityTime: 4000,
      });
    });

    // Eventos específicos de la aplicación
    this.setupAppEventListeners();
  }

  // Configurar listeners específicos de la app
  setupAppEventListeners() {
    if (!this.socket) return;

    // Nuevo miembro
    this.socket.on('new_member', (data) => {
      console.log('👤 Nuevo miembro:', data);
      Toast.show({
        type: 'info',
        text1: '👤 Nuevo Miembro',
        text2: `${data.data.nombre} se ha unido (${data.data.grado})`,
        position: 'top',
        visibilityTime: 4000,
      });
    });

    // Nuevo documento
    this.socket.on('new_document', (data) => {
      console.log('📄 Nuevo documento:', data);
      Toast.show({
        type: 'info',
        text1: '📄 Nuevo Documento',
        text2: `${data.data.nombre} disponible`,
        position: 'top',
        visibilityTime: 4000,
      });
    });

    // Nuevo programa
    this.socket.on('new_program', (data) => {
      console.log('📅 Nuevo programa:', data);
      Toast.show({
        type: 'info',
        text1: '📅 Nuevo Programa',
        text2: `${data.data.tema} programado`,
        position: 'top',
        visibilityTime: 4000,
      });
    });

    // Asistencia actualizada
    this.socket.on('attendance_updated', (data) => {
      console.log('✅ Asistencia actualizada:', data);
      
      // Actualizar estado en Redux
      store.dispatch(updateAsistenciaInState({
        programaId: data.programaId,
        asistenciaData: data.data
      }));

      Toast.show({
        type: 'success',
        text1: '✅ Asistencia',
        text2: `${data.data.nombreMiembro} - ${data.data.asistio ? 'Presente' : 'Ausente'}`,
        position: 'top',
        visibilityTime: 3000,
      });
    });

    // Plancha moderada
    this.socket.on('plancha_moderated', (data) => {
      console.log('📋 Plancha moderada:', data);
      const estado = data.data.estado === 'aprobada' ? '✅ Aprobada' : '❌ Rechazada';
      Toast.show({
        type: data.data.estado === 'aprobada' ? 'success' : 'error',
        text1: '📋 Plancha',
        text2: `${data.data.nombre} - ${estado}`,
        position: 'top',
        visibilityTime: 5000,
      });
    });

    // Recordatorio de programa
    this.socket.on('program_reminder', (data) => {
      console.log('⏰ Recordatorio:', data);
      Toast.show({
        type: 'info',
        text1: '⏰ Recordatorio',
        text2: `${data.data.tema} - ${data.data.tiempo}`,
        position: 'top',
        visibilityTime: 6000,
      });
    });

    // Notificación general
    this.socket.on('notification', (data) => {
      console.log('🔔 Notificación:', data);
      
      const getToastType = (prioridad) => {
        switch (prioridad) {
          case 'urgente': return 'error';
          case 'alta': return 'error';
          case 'normal': return 'info';
          case 'baja': return 'info';
          default: return 'info';
        }
      };

      Toast.show({
        type: getToastType(data.prioridad),
        text1: `🔔 ${data.titulo}`,
        text2: data.mensaje,
        position: 'top',
        visibilityTime: data.prioridad === 'urgente' ? 8000 : 5000,
      });
    });

    // Eventos del sistema
    this.socket.on('system_maintenance', (data) => {
      console.log('🔧 Mantenimiento del sistema:', data);
      Toast.show({
        type: 'warning',
        text1: '🔧 Mantenimiento',
        text2: data.mensaje,
        position: 'top',
        visibilityTime: 8000,
      });
    });

    this.socket.on('user_session_expired', (data) => {
      console.log('⏰ Sesión expirada:', data);
      Toast.show({
        type: 'error',
        text1: '⏰ Sesión Expirada',
        text2: 'Por favor, inicia sesión nuevamente',
        position: 'top',
        visibilityTime: 6000,
      });
    });
  }

  // Unirse a la sala del usuario
  joinUserRoom(userId) {
    if (this.socket && this.isConnected) {
      console.log('🏠 Uniéndose a sala de usuario:', userId);
      this.socket.emit('join', userId);
    }
  }

  // Salir de la sala del usuario
  leaveUserRoom(userId) {
    if (this.socket && this.isConnected) {
      console.log('🚪 Saliendo de sala de usuario:', userId);
      this.socket.emit('leave', userId);
    }
  }

  // Manejar errores de conexión
  handleConnectionError(error) {
    this.isConnected = false;
    this.reconnectAttempts++;

    console.error(`❌ Error WebSocket (intento ${this.reconnectAttempts}):`, error.message);

    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      Toast.show({
        type: 'warning',
        text1: '🔄 Reconectando...',
        text2: `Intento ${this.reconnectAttempts}/${this.maxReconnectAttempts}`,
        position: 'top',
        visibilityTime: 3000,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: '❌ Sin conexión',
        text2: 'No se puede conectar al servidor',
        position: 'top',
        visibilityTime: 5000,
      });
    }
  }

  // Manejar desconexión
  handleDisconnection(reason) {
    this.isConnected = false;

    // Razones que no requieren reconexión automática
    const noReconnectReasons = ['io server disconnect', 'io client disconnect'];
    
    if (!noReconnectReasons.includes(reason)) {
      Toast.show({
        type: 'warning',
        text1: '🔌 Desconectado',
        text2: 'Intentando reconectar...',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  }

  // Enviar evento personalizado
  emit(event, data) {
    if (this.socket && this.isConnected) {
      console.log(`📤 Enviando evento ${event}:`, data);
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ No se puede enviar evento, WebSocket no conectado');
    }
  }

  // Agregar listener personalizado
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Guardar referencia para cleanup
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
      this.eventListeners.get(event).push(callback);
    }
  }

  // Remover listener personalizado
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Limpiar referencia
      if (this.eventListeners.has(event)) {
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  // Confirmar asistencia en tiempo real
  confirmarAsistencia(programaId, miembroId, asistio, justificacion = null) {
    this.emit('confirmar_asistencia', {
      programaId,
      miembroId,
      asistio,
      justificacion,
      timestamp: new Date().toISOString()
    });
  }

  // Marcar como presente/ausente
  marcarAsistencia(programaId, miembroId, asistio, horaLlegada = null) {
    this.emit('marcar_asistencia', {
      programaId,
      miembroId,
      asistio,
      horaLlegada,
      timestamp: new Date().toISOString()
    });
  }

  // Enviar typing indicator para chat
  sendTyping(roomId, isTyping) {
    this.emit('typing', {
      roomId,
      isTyping,
      timestamp: new Date().toISOString()
    });
  }

  // Ping para mantener conexión viva
  ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping', { timestamp: new Date().toISOString() });
    }
  }

  // Obtener estado de conexión
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Desconectar WebSocket
  disconnect() {
    if (this.socket) {
      console.log('🔌 Desconectando WebSocket...');
      
      // Limpiar todos los listeners personalizados
      this.eventListeners.forEach((listeners, event) => {
        listeners.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      this.eventListeners.clear();

      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  // Reconectar manualmente
  reconnect(userId) {
    console.log('🔄 Reconectando manualmente...');
    this.disconnect();
    setTimeout(() => {
      this.connect(userId);
    }, 1000);
  }

  // Debug: obtener información de estado
  getDebugInfo() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      socketConnected: this.socket?.connected,
      reconnectAttempts: this.reconnectAttempts,
      eventListeners: Object.fromEntries(
        Array.from(this.eventListeners.entries()).map(([event, listeners]) => [
          event, 
          listeners.length
        ])
      ),
      transport: this.socket?.io?.engine?.transport?.name,
      lastPing: this.socket?.io?.engine?.lastPing,
      readyState: this.socket?.io?.readyState
    };
  }
}
// Funciones de utilidad para usar en componentes
export const useWebSocket = () => {
  return {
    connect: webSocketService.connect.bind(webSocketService),
    disconnect: webSocketService.disconnect.bind(webSocketService),
    emit: webSocketService.emit.bind(webSocketService),
    on: webSocketService.on.bind(webSocketService),
    off: webSocketService.off.bind(webSocketService),
    getStatus: webSocketService.getConnectionStatus.bind(webSocketService),
    reconnect: webSocketService.reconnect.bind(webSocketService),
    isConnected: () => webSocketService.isConnected,
    
    // Métodos específicos de la app
    confirmarAsistencia: webSocketService.confirmarAsistencia.bind(webSocketService),
    marcarAsistencia: webSocketService.marcarAsistencia.bind(webSocketService),
    sendTyping: webSocketService.sendTyping.bind(webSocketService),
    
    // Debug
    getDebugInfo: webSocketService.getDebugInfo.bind(webSocketService)
  };
};

// Hook para React components
export const useWebSocketEffect = (userId) => {
  React.useEffect(() => {
    if (userId) {
      webSocketService.connect(userId);
    }
    
    return () => {
      webSocketService.disconnect();
    };
  }, [userId]);

  return useWebSocket();
};

// Crear instancia singleton
const webSocketService = new WebSocketService();

// Auto-ping cada 30 segundos para mantener conexión
let pingInterval;
const startPingInterval = () => {
  if (pingInterval) clearInterval(pingInterval);
  
  pingInterval = setInterval(() => {
    if (webSocketService.isConnected) {
      webSocketService.ping();
    }
  }, 30000);
};

const stopPingInterval = () => {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
};

// Configurar ping automático cuando se conecte
webSocketService.on('connect', startPingInterval);
webSocketService.on('disconnect', stopPingInterval);

export default webSocketService;