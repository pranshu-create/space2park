import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pino from 'pino';

// Seed & Database
import { db } from './db/index.js';
import { seedDatabase } from './seed/seed.js';

// Route Handlers
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import spaceRoutes from './routes/spaces.js';
import bookingRoutes from './routes/bookings.js';
import ownerRoutes from './routes/owner.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach io to express app so route handlers can emit events
app.set('io', io);

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

// Seed synthetic Indore data on startup
seedDatabase();

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'SPACE2PARK',
    edition: 'Smart India Hackathon 2026 (Team Syntax Error)',
    mode: process.env.NODE_ENV || 'development',
    demoMode: true,
    totalSpaces: db.getAllSpaces().length,
    totalEvents: db.getAllEvents().length,
    timestamp: new Date().toISOString()
  });
});

// Socket.io Real-Time Connection
io.on('connection', socket => {
  logger.info({ socketId: socket.id }, 'Client connected to real-time telemetry stream');

  socket.on('join:event', eventId => {
    socket.join(`event:${eventId}`);
    logger.info({ socketId: socket.id, eventId }, 'Joined event telemetry room');
  });

  socket.on('join:space', spaceId => {
    socket.join(`space:${spaceId}`);
    logger.info({ socketId: socket.id, spaceId }, 'Joined space slot room');
  });

  socket.on('disconnect', () => {
    logger.info({ socketId: socket.id }, 'Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌌 SPACE2PARK Backend Server Active on port ${PORT}`);
  console.log(`📡 Real-Time Telemetry via Socket.io Enabled`);
  console.log(`🌆 City Edition: Indore, MP (7 Venues, 315+ Spaces)`);
  console.log(`======================================================\n`);
});

export { app, server, io };
