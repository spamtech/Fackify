import express from 'express';

import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateActivity,
  googleLogin,
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ============================================================
   AUTH ROUTES
============================================================ */

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post('/register', registerUser);

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', loginUser);

/**
 * Logout user
 * POST /api/auth/logout
 */
router.post('/logout', logoutUser);
/**
 * Google Login / Signup
 * POST /api/auth/google
 */
router.post('/google', googleLogin);
/**
 * Get currently authenticated user
 * GET /api/auth/me
 */
router.get('/me', protect, getMe);

/**
 * User activity heartbeat
 * POST /api/auth/heartbeat
 *
 * Updates users.last_active_at
 * Used by Admin Panel to determine online/offline status.
 */
router.post('/heartbeat', protect, updateActivity);

export default router;