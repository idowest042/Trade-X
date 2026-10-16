import { io } from "socket.io-client";

// Vite: DEV is true only under `vite dev`, so the deployed build always uses Render.
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://trade-x-4lcn.onrender.com");

// Change the keys here if your admin login stores the token under a different name
const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("adminToken");

class AdminSocketService {
  constructor() {
    this.socket = null;
    this.eventListeners = new Map();
  }

  connect() {
    // Never create a second socket; Socket.IO reconnects on its own
    if (this.socket) {
      if (!this.socket.connected) this.socket.connect();
      return this.socket;
    }

    console.log("Admin connecting to:", SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 20000, // Render free tier can take 30-60s to wake
      // Function form: the token is re-read on every (re)connect attempt
      auth: (cb) => cb({ token: getToken() }),
    });

    this._setupSocketListeners();
    return this.socket;
  }

  _setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Admin socket connected. ID:", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Admin socket disconnected:", reason);
      if (reason === "io server disconnect") this.socket.connect();
    });

    this.socket.on("connect_error", (error) => {
      // Only log. Do NOT clear the token here: a CORS or cold-start failure
      // looks the same as an auth failure and would log the admin out.
      console.error("❌ Admin socket connection error:", error.message);
    });

    this.socket.on("chat:error", (err) => {
      console.error("❌ Server error:", err?.message || err);
    });

    // Reconnect events live on the manager (socket.io) in Socket.IO v4
    this.socket.io.on("reconnect_attempt", (n) =>
      console.log("🔄 Reconnect attempt:", n)
    );
    this.socket.io.on("reconnect", (n) =>
      console.log("🔄 Reconnected after", n, "attempts")
    );
    this.socket.io.on("reconnect_error", (e) =>
      console.error("❌ Reconnect error:", e.message)
    );
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.eventListeners.clear();
    }
  }

  getSessions() {
    if (this.socket?.connected) {
      this.socket.emit("admin:getSessions");
    } else {
      console.error("❌ Cannot get sessions - socket not connected");
      if (this.socket) this.socket.connect();
    }
  }

  getMessages(visitorId) {
    if (this.socket?.connected) {
      this.socket.emit("admin:getMessages", { visitorId });
    } else {
      console.error("❌ Cannot get messages - socket not connected");
    }
  }

  sendMessage(visitorId, content) {
    if (this.socket?.connected) {
      this.socket.emit("admin:sendMessage", { visitorId, content });
    } else {
      console.error("❌ Cannot send message - socket not connected");
    }
  }

  on(event, callback) {
    if (!this.socket) {
      console.error("❌ Cannot listen - socket not initialized");
      return;
    }
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
      this.eventListeners.get(event)?.delete(callback);
    } else {
      this.socket.off(event);
      this.eventListeners.delete(event);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.eventListeners.clear();
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  getSocketId() {
    return this.socket?.id || null;
  }
}

export default new AdminSocketService();