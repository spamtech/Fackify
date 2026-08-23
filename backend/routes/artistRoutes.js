import express from 'express';

import {
  getArtists,
  getArtistById,
  createArtist,
  updateArtist,
  toggleArtistPremium,
  deleteArtist,
} from '../controllers/artistController.js';

import {
  protect,
  adminOnly,
} from '../middleware/authMiddleware.js';

const router = express.Router();


// ============================================================
// GET ALL ARTISTS
// USER + ADMIN
// ============================================================

router.get(
  '/',
  protect,
  getArtists
);


// ============================================================
// GET SINGLE ARTIST
// USER + ADMIN
// ============================================================

router.get(
  '/:id',
  protect,
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