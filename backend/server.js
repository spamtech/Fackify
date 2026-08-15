import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { pool } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import { notFound } from './middleware/notFoundMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// 1. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/playlists', playlistRoutes);

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW()');
    res.json({ status: 'healthy', timestamp: dbRes.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// 2. Serve Static Frontend Files
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// 3. React SPA Fallback (Express 5+ syntax)
app.get('{/*path}', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Error handling for API routes
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Unified App running at http://localhost:${PORT}`);
});

