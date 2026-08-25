import express from 'express';

import {
  getArtists,
  getArtistById,
  createArtist,
  updateArtist,
  toggleArtistPremium,
  toggleFavoriteArtist,
  deleteArtist,
} from '../controllers/artistController.js';

import {
  protect,
  adminOnly,
  optionalAuth,
} from '../middleware/authMiddleware.js';

const router = express.Router();


// ============================================================
// GET ALL ARTISTS
// PUBLIC / USER (Optional Auth to identify user's favorites)
// ============================================================

router.get(
  '/',
  optionalAuth,
  getArtists
);


// ============================================================
// TOGGLE BEST / FAVORITE ARTIST
// LOGGED IN USERS
// ============================================================

router.post(
  '/:id/favorite',
  protect,
  toggleFavoriteArtist
);


// ============================================================
// GET SINGLE ARTIST
// PUBLIC / USER
// ============================================================

router.get(
  '/:id',
  optionalAuth,
  getArtistById
);


// ============================================================
// CREATE ARTIST
// ADMIN ONLY
// ============================================================

router.post(
  '/',
  protect,
  adminOnly,
  createArtist
);


// ============================================================
// UPDATE ARTIST
// ADMIN ONLY
// ============================================================

router.put(
  '/:id',
  protect,
  adminOnly,
  updateArtist
);


// ============================================================
// TOGGLE PREMIUM
// ADMIN ONLY
// ============================================================

router.put(
  '/:id/premium',
  protect,
  adminOnly,
  toggleArtistPremium
);


// ============================================================
// DELETE ARTIST
// ADMIN ONLY
// ============================================================

router.delete(
  '/:id',
  protect,
  adminOnly,
  deleteArtist
);


export default router;