import { io } from 'socket.io-client';

class AdminSocketService {
  constructor() {
    this.socket = null;
    this.eventListeners = new Map(); // Track listeners for cleanup
  }

  connect(serverUrl = null) {
    // Use environment variable or default to localhost
    const url = serverUrl || 
                process.env.REACT_APP_SOCKET_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://trade-x-4lcn.onrender.com' 
                  : 'http://localhost:5000');

    if (this.socket?.connected) {
      console.log('Admin socket already connected');
      return this.socket;
    }

    console.log('Admin connecting to:', url); // ✅ Fixed: use 'url'

    // ✅ Get token for authentication
    const token = localStorage.getItem('token');

    this.socket = io(url, { // ✅ Fixed: use 'url' not 'serverUrl'
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      // ✅ Add authentication
      auth: {
        token: token,
        role: 'admin' // Explicitly identify as admin
      },
      // ✅ Add extra headers
      extraHeaders: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });

    // Set up listeners
    this._setupSocketListeners();

    return this.socket;
  }

  // ✅ Private method for setting up listeners
  _setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Admin socket connected. Socket ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Admin socket disconnected. Reason:', reason);
      
      // Handle specific disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Admin socket connection error:', error.message);
      
      // If auth fails, clear token and redirect
      if (error.message === 'Authentication error' || error.message === 'Unauthorized') {
        localStorage.removeItem('token');
        // Optional: redirect to login
        // window.location.href = '/login';
      }
    });

    this.socket.on('error', (error) => {
      console.error('❌ Admin socket error:', error);
    });

    // ✅ Handle reconnection events
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Admin socket reconnected after', attemptNumber, 'attempts');
      // ✅ Re-authenticate after reconnection
      const token = localStorage.getItem('token');
      if (token) {
        this.socket.emit('admin:authenticate', { token });
      }
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Admin socket reconnection attempt:', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Admin socket reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Admin socket reconnection failed');
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting admin socket...');
      this.socket.disconnect();
      this.socket = null;
      this.eventListeners.clear();
    }
  }

  // Admin-specific socket events
  getSessions() {
    if (this.socket?.connected) {
      console.log('📤 Requesting all sessions');
      this.socket.emit('admin:getSessions');
    } else {
      console.error('❌ Cannot get sessions - socket not connected');
      // ✅ Optionally try to reconnect
      if (this.socket) {
        this.socket.connect();
      }
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

  // ✅ Improved on method with tracking
  on(event, callback) {
    if (!this.socket) {
      console.error('❌ Cannot listen - socket not initialized');
      return;
    }

    // Store callback reference for cleanup
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);

    this.socket.on(event, callback);
  }

  // ✅ Improved off method
  off(event, callback) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
      // Remove from tracking
      if (this.eventListeners.has(event)) {
        this.eventListeners.get(event).delete(callback);
      }
    } else {
      this.socket.off(event);
      this.eventListeners.delete(event);
    }
  }

  // ✅ Clean up all event listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.eventListeners.clear();
    }
  }

  // ✅ Re-authenticate admin
  reauthenticate() {
    const token = localStorage.getItem('token');
    if (this.socket?.connected && token) {
      this.socket.emit('admin:authenticate', { token });
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  // ✅ Get socket ID
  getSocketId() {
    return this.socket?.id || null;
  }
}

export default new AdminSocketService();