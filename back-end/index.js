import express from "express";
import cors from "cors";
import marketRoute from "./Routes/Market.routes.js";
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { setupSocketHandlers } from './Lib/ChatHandler.js';
import { connectdb } from "./Config/db.js";
import chatRoutes from './Routes/Chatroutes.js';
import kycRoutes from "./Routes/Kycroutes.js";
import authRoutes from "./Routes/authRoutes.js";
import depositRoutes from "./Routes/Depositroutes.js";
import withdrawalRoutes from "./Routes/Withdrawalroutes.js";
import investmentRoutes  from "./Routes/Investmentroutes.js"
import transactionRoutes from "./Routes/TransactionRoutes.js";
import adminRoutes       from "./Routes/Adminroutes.js";
import swapRoutes        from "./Routes/Swaproutes.js";
import transferRoutes    from "./Routes/Transferroutes.js";
import referralRoutes    from "./Routes/Referralroutes.js";
import tradeRoutes       from "./Routes/tradeRoutes.js";
 
import { startMarketEngine } from "./marketEngine.js";
import { setTradeSocket }    from "./Controllers/tradeController.js";

connectdb();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174','https://www.tradexfi.com','https://trade-admin-sigma.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
 


// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174','https://www.tradexfi.com','https://trade-admin-sigma.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup Socket.IO
setupSocketHandlers(io);

// Routes
app.use("/api/market", marketRoute);
app.use('/api/chat', chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/deposits", depositRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/investments",  investmentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/swap",         swapRoutes);
app.use("/api/transfer",     transferRoutes);
app.use("/api/referral",     referralRoutes);
app.use("/api/trades",       tradeRoutes);


app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TradeX Server Running',
    socketIO: 'enabled'
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'TradeX API',
    version: '1.0.0',
    status: 'running'
  });
});

// ✅ CRITICAL FIX: Use httpServer.listen NOT app.listen
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 TradeX Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
});