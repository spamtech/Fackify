import express from 'express';

import {
  getUserProfile,
  getUserProfileSummary,
  updateUserProfile,
  changePassword,
  updateListeningTime,
} from '../controllers/userController.js';

import {
  protect,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================
// ALL USER ROUTES REQUIRE LOGIN
// ============================================================

router.use(protect);

// ============================================================
// PROFILE & STATS
// ============================================================

router.get(
  '/profile/summary',
  getUserProfileSummary
);

router.get(
  '/profile',
  getUserProfile
);

router.put(
  '/profile',
  updateUserProfile
);

// Listening time updater
router.post(
  '/listening-time',
  updateListeningTime
);

// ============================================================
// PASSWORD
// ============================================================

router.put(
  '/change-password',
  changePassword
);

export default router;