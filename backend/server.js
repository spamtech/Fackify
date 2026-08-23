import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { pool } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import artistRoutes from './routes/artistRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';

import { notFound } from './middleware/notFoundMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

/* =========================================================
   TRUST PROXY
   Required for secure cookies behind Render's proxy.
========================================================= */

app.set('trust proxy', 1);

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin
      // such as health checks/server tools.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(
        `CORS blocked origin: ${origin}`
      );

      return callback(
        new Error('Not allowed by CORS')
      );
    },

    credentials: true,
  })
);

/* =========================================================
   API ROUTES
========================================================= */

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/songs',
  songRoutes
);

app.use(
  '/api/artists',
  artistRoutes
);

app.use(
  '/api/likes',
  likeRoutes
);

app.use(
  '/api/admin',
  adminRoutes
);

app.use(
  '/api/playlists',
  playlistRoutes
);

app.use(
  '/api/users',
  userRoutes
);

app.use(
  '/api/notifications',
  notificationRoutes
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
  '/api/health',
  async (req, res) => {
    try {
      const dbRes =
        await pool.query(
          'SELECT NOW()'
        );

      res.json({
        status: 'healthy',
        timestamp:
          dbRes.rows[0].now,
      });
    } catch (error) {
      console.error(
        'HEALTH CHECK FAILED:',
        error
      );

      res.status(500).json({
        status: 'unhealthy',
        error: error.message,
      });
    }
  }
);

/* =========================================================
   404
========================================================= */

app.use(notFound);

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(errorHandler);

/* =========================================================
   SERVER
========================================================= */

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `🚀 Fackify backend running on port ${PORT}`
    );
  }
);