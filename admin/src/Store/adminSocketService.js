import { io } from 'socket.io-client';

class AdminSocketService {
  constructor() {
    this.socket = null;
  }

  connect(serverUrl = 'http://localhost:5000') {
    if (this.socket?.connected) {
      console.log('Admin socket already connected');
      return this.socket;
    }

    console.log('Admin connecting to:', serverUrl);

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.socket.on('connect', () => {
      console.log('✅ Admin socket connected. Socket ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Admin socket disconnected. Reason:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Admin socket connection error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting admin socket...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Admin-specific socket events
  getSessions() {
    if (this.socket?.connected) {
      console.log('📤 Requesting all sessions');
      this.socket.emit('admin:getSessions');
    } else {
      console.error('❌ Cannot get sessions - socket not connected');
    }
  }

  getMessages(visitorId) {
    if (this.socket?.connected) {
      console.log('📤 Requesting messages for:', visitorId);
      this.socket.emit('admin:getMessages', { visitorId });
    } else {
      console.error('❌ Cannot get messages - socket not connected');
    }
  }

  sendMessage(visitorId, content) {
    if (this.socket?.connected) {
      console.log('📤 Sending admin message to:', visitorId);
      this.socket.emit('admin:sendMessage', { visitorId, content });
    } else {
      console.error('❌ Cannot send message - socket not connected');
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

export default new AdminSocketService();