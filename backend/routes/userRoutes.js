import express from 'express';

import {
  getUserProfile,
  getUserProfileSummary,
  updateUserProfile,
  changePassword,
  updateListeningTime,
  uploadUserCover,
} from '../controllers/userController.js';

import { protect } from '../middleware/authMiddleware.js';
import { uploadCover } from '../middleware/uploadMiddleware.js';

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

// Laptop Cover photo upload route
router.post(
  '/profile/cover',
  uploadCover.single('cover'),
  uploadUserCover
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