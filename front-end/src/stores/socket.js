import { io } from "socket.io-client";

// ─── Single shared Socket.IO connection ───────────────────────────────────────
// KEY FIX: We never recreate the socket once it exists — even if disconnected.
// Socket.IO's built-in reconnection will keep retrying automatically.
// Recreating it on every getSocket() call was causing duplicate connections
// and making the chart freeze until a manual refresh.
//
// RENDER FREE TIER FIX: Render spins down after inactivity. The socket will
// fail initially while the server wakes up, but reconnection: true with
// Infinity attempts means it will automatically reconnect once the server
// is alive — no page refresh needed.

let socket = null;

export function getSocket(token) {
  // If socket already exists (connected OR reconnecting), return it.
  // Never recreate — let Socket.IO handle reconnection internally.
  if (socket) return socket;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  socket = io(API_URL, {
    auth:                 { token },
    transports:           ["websocket", "polling"], // fallback to polling if WS fails (helps with Render cold start)
    reconnection:         true,
    reconnectionAttempts: Infinity,
    reconnectionDelay:    2000,
    reconnectionDelayMax: 10000,
    timeout:              20000, // give Render time to wake up (can take 10-15s)
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.log("🔄 Socket reconnecting... (server may be waking up):", err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}