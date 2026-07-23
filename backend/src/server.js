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
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Dynamic CORS Origin Validator for Production Deployment
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

const corsOriginCheck = (origin, callback) => {
  // Allow requests with no origin (like mobile apps, curl, or Postman)
  if (!origin) return callback(null, true);
  
  if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*') || origin.endsWith('.vercel.app')) {
    return callback(null, true);
  }
  
  return callback(new Error(`CORS policy does not allow access from origin: ${origin}`), false);
};

// Configure Socket.io with production CORS
const io = new Server(server, {
  cors: {
    origin: corsOriginCheck,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
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

// Security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: corsOriginCheck,
    credentials: true,
  })
);

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
