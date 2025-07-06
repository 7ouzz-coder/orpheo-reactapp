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

  // Unirse a sala personal del usuario
  joinUserRoom(userId) {
    if (this.socket && this.isConnected) {
      console.log(`🏠 Uniéndose a sala del usuario: ${userId}`);
      this.socket.emit('join', userId);
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

    // Listener para actualizaciones de asistencia
    this.socket.on('asistencia_actualizada', (data) => {
      console.log('📝 Asistencia actualizada:', data);
      
      // Actualizar el store de Redux
      store.dispatch(updateAsistenciaInState(data));
      
      Toast.show({
        type: 'info',
        text1: '📝 Asistencia actualizada',
        text2: `${data.miembro} marcó asistencia`,
        position: 'top',
        visibilityTime: 3000,
      });
    });

    // Listener para nuevos programas
    this.socket.on('nuevo_programa', (data) => {
      console.log('🆕 Nuevo programa creado:', data);
      
      Toast.show({
        type: 'success',
        text1: '🆕 Nuevo programa',
        text2: data.titulo,
        position: 'top',
        visibilityTime: 3000,
      });
    });

    // Listener para notificaciones generales
    this.socket.on('notificacion', (data) => {
      console.log('🔔 Nueva notificación:', data);
      
      Toast.show({
        type: data.tipo || 'info',
        text1: data.titulo,
        text2: data.mensaje,
        position: 'top',
        visibilityTime: 4000,
      });
    });

    // Listener para respuesta de ping
    this.socket.on('pong', (data) => {
      console.log('🏓 Pong recibido:', data);
    });
  }

  // Manejar errores de conexión
  handleConnectionError(error) {
    this.reconnectAttempts++;
    
    console.error(`❌ Error de conexión (intento ${this.reconnectAttempts}):`, error);
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      Toast.show({
        type: 'error',
        text1: '❌ Error de conexión',
        text2: 'No se pudo conectar al servidor',
        position: 'top',
        visibilityTime: 5000,
      });
    }
  }

  // Manejar desconexión
  handleDisconnection(reason) {
    // Algunas desconexiones no requieren reconexión automática
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