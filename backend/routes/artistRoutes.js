import express from 'express';

import {
  getAllArtists,
  getArtistById,
  createArtist,
  updateArtist,
  toggleArtistPremium,
  toggleFavoriteArtist,
  deleteArtist,
  getMyPremiumArtistsCount, // <-- 1. Import new controller
} from '../controllers/artistController.js';

import {
  protect,
  adminOnly,
  optionalAuth,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================
// GET ALL ARTISTS (Favorites pinned to top)
// ============================================================
router.get('/', optionalAuth, getAllArtists);

// ============================================================
// GET USER'S FAVORITED PREMIUM ARTISTS COUNT
// LOGGED IN USERS ONLY (Must be placed above /:id)
// ============================================================
router.get('/my-premium-count', protect, getMyPremiumArtistsCount);

// ============================================================
// TOGGLE BEST / FAVORITE ARTIST
// LOGGED IN USERS
// ============================================================
router.post('/:id/favorite', protect, toggleFavoriteArtist);

// ============================================================
// GET SINGLE ARTIST
// ============================================================
router.get('/:id', optionalAuth, getArtistById);

// ============================================================
// ADMIN ROUTES
// ============================================================
router.post('/', protect, adminOnly, createArtist);
router.put('/:id', protect, adminOnly, updateArtist);
router.put('/:id/premium', protect, adminOnly, toggleArtistPremium);
router.delete('/:id', protect, adminOnly, deleteArtist);

export default router;