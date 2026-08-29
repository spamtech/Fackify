import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { pool } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import artistRoutes from './routes/artistRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

import { notFound } from './middleware/notFoundMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ============================================================
   ENVIRONMENT & PROXY
============================================================ */
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Required for secure cookies behind Render's reverse proxy
app.set('trust proxy', 1);

/* ============================================================
   BASIC MIDDLEWARE
============================================================ */
app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

/* ============================================================
   CORS
============================================================ */
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

/* ============================================================
   STATIC MEDIA UPLOADS
============================================================ */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ============================================================
   API ROUTES
============================================================ */
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);

/* ============================================================
   HEALTH CHECK
============================================================ */
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: dbRes.rows[0].now,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('❌ Health check database error:', error);
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: isProduction ? 'Database connection failed' : error.message,
    });
  }
});

/* ============================================================
   FRONTEND STATIC FILES & SPA FALLBACK
============================================================ */
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

/* ============================================================
   ERROR HANDLING
============================================================ */
app.use(notFound);
app.use(errorHandler);

/* ============================================================
   START SERVER
============================================================ */
app.listen(PORT, '0.0.0.0', () => {
  console.log('==========================================');
  console.log('🚀 FACKIFY SERVER STARTED');
  console.log('==========================================');
  console.log(`Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`Port        : ${PORT}`);
  console.log(`Production  : ${isProduction}`);
  console.log(`Frontend    : ${FRONTEND_URL}`);
  console.log('==========================================');
});