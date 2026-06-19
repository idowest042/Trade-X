import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(serverUrl = ['http://localhost:5000','https://trade-x-4lcn.onrender.com']) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    console.log('Connecting to socket server:', serverUrl);

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully. Socket ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected. Reason:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      console.log('📤 Emitting event:', event, 'with data:', data);
      this.socket.emit(event, data);
    } else {
      console.error('❌ Cannot emit - socket not connected');
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.error('❌ Cannot listen - socket not initialized');
    }
  }

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();