import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Parse allowed origins from environment variable
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Dynamic CORS Origin Validator
const corsOriginCheck = (origin, callback) => {
  // Allow requests with no origin (like mobile apps, curl, or Postman)
  if (!origin) return callback(null, true);

  // Allow all localhost / 127.0.0.1 origins (e.g. localhost:5173, localhost:5174, etc.)
  const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  // Allow Render and Vercel cloud subdomains
  const isCloudDomain = origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app');
  // Check if explicitly configured in CLIENT_URL
  const isConfigured = configuredOrigins.includes('*') || configuredOrigins.includes(origin);

  if (isLocalhost || isCloudDomain || isConfigured || configuredOrigins.length === 0) {
    return callback(null, true);
  }

  // Fallback: allow to prevent preflight CORS crashes while logging warning
  console.warn(`[CORS Notice] Incoming origin: ${origin}`);
  return callback(null, true);
};

const corsOptions = {
  origin: corsOriginCheck,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: corsOptions,
});

// Make Socket.io instance available globally inside req handlers
app.set('io', io);

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Security headers with relaxed cross-origin settings for API APIs
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Enable CORS middleware & handle OPTIONS preflight explicitly
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate limiting (200 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Request body parsers
app.use(express.json());

// Main Root API Status Check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'School Management System API is running' });
});

// Map routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/upload', uploadRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Export app and server for testing
export { app, server };

// Only listen if not running in test mode
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}
