import { io } from 'socket.io-client';
import { socketConfig } from './api';

class SocketService {
  socket = null;

  connect() {
    if (!this.socket) {
      this.socket = io(socketConfig.url, socketConfig.options);
      
      this.socket.on('connect', () => {
        console.log('🔌 Socket conectado:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket desconectado:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('🔌 Socket error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
}

export default new SocketService();